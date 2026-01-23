import { chromium } from 'playwright-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import axios from 'axios';
import * as dotenv from 'dotenv';
import path from 'path';
import { Page, BrowserContext } from 'playwright';
import * as readline from 'readline';

chromium.use(stealthPlugin());
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const BUCKET_NAME = 'timetables';

const COLORS = {
  green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m',
  cyan: '\x1b[36m', reset: '\x1b[0m', bold: '\x1b[1m',
  magenta: '\x1b[35m', gray: '\x1b[90m'
};

// ========================================
// [Configuration] 성능 및 안전 설정
// ========================================
const CONFIG = {
  // 예매처 상세 수집 시 동시에 띄울 탭 개수 (너무 높으면 IP 차단됨)
  CONCURRENCY_LIMIT: 1, 
  // 인스타그램 수집 시 대기 시간 (너무 빠르면 계정 잠김)
  INSTAGRAM_DELAY: { min: 1000, max: 2000 },
  // 리소스 차단 여부 (이미지/폰트 안 받으면 빨라짐)
  BLOCK_RESOURCES: true
};

// ========================================
// [Schema] 확정된 Raw Data 타입 정의
// ========================================

// 1. FESTIVAL_BASE (예매처)
interface RawFestivalBase {
  title: string;          
  poster_url: string;     
  location: string;       
  date_range: string;     
  start_date?: string;    // ISO "2024-05-01"
  end_date?: string;      
  venue_detail?: string;  
  booking_info: Array<{
    site_name: string;    
    url: string;          
  }>;
  step: number;           // 1: 목록, 2: 상세
  is_priority?: boolean;
}

// 3. OFFICIAL_LINEUP (인스타)
interface RawOfficialLineup {
  festival_name: string;  
  source_url: string;     
  image_url: string;      
  caption: string;        
  posted_at: string;      
  artists: string[];      // 추출된 아티스트 (없으면 빈배열)
  items?: any[];
}

// 4. OFFICIAL_TIMETABLE (인스타)
interface RawOfficialTimetable {
  festival_name: string;
  source_url: string;
  image_url: string;
  caption: string;
  posted_at: string;
  // 타임테이블 상세 데이터는 복잡하므로 Admin 수기 입력 권장 (빈 배열 초기화)
  items?: any[]; 
}

// 5. OFFICIAL_NOTICE (인스타)
interface RawOfficialNotice {
  festival_name: string;
  source_url: string;
  image_url: string;
  caption: string;
  posted_at: string;
  type: 'TICKET' | 'MD' | 'EVENT' | 'GUIDELINE' | 'NOTICE' | 'MAP'; 
  title?: string;         
}

// 카테고리 타입 정의(staged_contents.category)
export type StagingCategory = 
  | 'FESTIVAL_BASE'
  | 'ARTIST_BASE'
  | 'OFFICIAL_LINEUP'
  | 'OFFICIAL_TIMETABLE'
  | 'OFFICIAL_NOTICE'
  | 'EXTERNAL_CONTENT'
  | 'ARCHIVE_DATA';

// ========================================
// 공통 유틸리티
// ========================================

/**
 * 불필요한 리소스 차단 (속도 향상 및 트래픽 절약)
 * 예매처 상세 페이지에서 폰트, 스타일시트 등을 막습니다.
 */
async function blockResources(page: Page) {
  if (!CONFIG.BLOCK_RESOURCES) return;
  await page.route('**/*', (route) => {
    const resourceType = route.request().resourceType();
    if (['font', 'media', 'websocket', 'manifest'].includes(resourceType)) {
      route.abort();
    } else {
      route.continue();
    }
  });
}

/**
 * 날짜 문자열 파싱 (YYYY.MM.DD ~ YYYY.MM.DD)
 */
function parseDateRange(dateStr: string): { start?: string, end?: string } {
  if (!dateStr) return {};
  try {
    const dates = dateStr.split('~').map(d => d.trim().replace(/\./g, '-'));
    return {
      start: dates[0] ? new Date(dates[0]).toISOString().split('T')[0] : undefined,
      end: dates[1] ? new Date(dates[1]).toISOString().split('T')[0] : (dates[0] ? new Date(dates[0]).toISOString().split('T')[0] : undefined)
    };
  } catch (e) {
    return {};
  }
}

/**
 * 인스타그램 전용 무한 스크롤 함수
 */
async function instagramScroll(page: Page, maxCount: number): Promise<string[]> {
  console.log(`${COLORS.cyan}    ⬇ 인스타그램 스크롤 시작 (목표: ${maxCount}개)...${COLORS.reset}`);
  
  const collectedLinks = new Set<string>();
  let previousHeight = 0;
  let noNewDataCount = 0;

  for (let i = 0; i < 50; i++) {
    const links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a[href*="/p/"]'));
      return anchors.map(a => (a as HTMLAnchorElement).href);
    });

    links.forEach(link => collectedLinks.add(link));
    process.stdout.write(`\r${COLORS.gray}    🔄 스크롤 ${i + 1}: 현재 ${collectedLinks.size}개 발견${COLORS.reset}`);

    if (collectedLinks.size >= maxCount) {
      console.log(`\n${COLORS.green}    ✅ 목표 수량 도달${COLORS.reset}`);
      break;
    }

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000 + Math.random() * 500);

    const currentHeight = await page.evaluate(() => document.body.scrollHeight);
    if (currentHeight === previousHeight) {
      noNewDataCount++;
      if (noNewDataCount >= 3) {
        console.log(`\n${COLORS.yellow}    ✋ 더 이상 게시물이 없습니다.${COLORS.reset}`);
        break;
      }
    } else {
      noNewDataCount = 0;
    }
    previousHeight = currentHeight;
  }

  return Array.from(collectedLinks).slice(0, maxCount);
}

// 일반 예매처용 스크롤
async function smartScrollBatch(page: Page, batchCallback: (items: any[]) => Promise<void>) {
  console.log(`${COLORS.cyan}    ⬇ 가상 스크롤 배치 수집 시작 (ID 기반)...${COLORS.reset}`);
  
  let lastHeight = 0;
  let noNewDataCount = 0;
  const collectedIds = new Set<string>();
  const MAX_SCROLLS = 100;
  
  for (let i = 0; i < MAX_SCROLLS; i++) {
    const items = await page.evaluate(() => {
      const results: any[] = [];
      const itemElements = document.querySelectorAll('a[class*="TicketItem_ticketItem"]');
      
      itemElements.forEach((el) => {
        const titleEl = el.querySelector('[class*="TicketItem_goodsName"]');
        const locationEl = el.querySelector('[class*="TicketItem_placeName"]');
        const dateEl = el.querySelector('[class*="TicketItem_playDate"]');
        const imgEl = el.querySelector('img[class*="TicketItem_image"]');
        
        const title = titleEl?.textContent?.trim() || '';
        const location = locationEl?.textContent?.trim() || '';
        const date_range = dateEl?.textContent?.trim() || '';
        const poster_url = imgEl?.getAttribute('src') || '';
        
        let source_url = '';
        let id = '';
        
        if (poster_url) {
          const match = poster_url.match(/\/(\d+)_p\.gif/);
          if (match && match[1]) {
            id = match[1];
            source_url = `https://tickets.interpark.com/goods/${id}`;
          }
        }
        if (title && source_url) {
          results.push({ id, title, location, date_range, poster_url, source_url });
        }
      });
      return results;
    });
    
    const newItems = items.filter(item => !collectedIds.has(item.id));
    
    if (newItems.length > 0) {
      newItems.forEach(item => collectedIds.add(item.id));
      console.log(`${COLORS.green}    ✓ 스크롤 ${i}: ${newItems.length}개 추가 (누적 ${collectedIds.size}개)${COLORS.reset}`);
      const itemsToSave = newItems.map(({ id, ...rest }) => rest);
      await batchCallback(itemsToSave);
      noNewDataCount = 0;
    } else {
      noNewDataCount++;
    }

    const currentHeight = await page.evaluate(() => document.body.scrollHeight);
    if (noNewDataCount >= 5) {
      console.log(`${COLORS.cyan}    ✓ 5회 연속 새 데이터 없음. 수집 종료.${COLORS.reset}`);
      break;
    }

    await page.evaluate(() => window.scrollBy(0, 1500));
    await page.waitForTimeout(1000);
    lastHeight = currentHeight;
  }
  console.log(`${COLORS.green}    ✅ 배치 수집 완료: 총 ${collectedIds.size}개${COLORS.reset}`);
}

const checkFestivalStatus = (title: string) => {
  const keywords = ['페스티벌', 'FESTIVAL', '뮤직', '파크', 'PICNIC', '워터밤', 'WET'];
  const excludes = ['단독', '팬미팅', '투어', '내한', 'TOUR', '콘서트', '독주회', 'FANMEETING'];
  const upperTitle = title.toUpperCase();
  const foundExclude = excludes.find(e => upperTitle.includes(e));
  if (foundExclude) return { status: 'SKIP', reason: foundExclude };
  const foundKeyword = keywords.find(k => upperTitle.includes(k));
  if (foundKeyword) return { status: 'PRIORITY', reason: foundKeyword };
  return { status: 'NORMAL', reason: null };
};

/**
 * 인스타 임시 URL을 받아서 Supabase에 저장 후 영구 URL 반환
 */
async function uploadToSupabaseAndGetUrl(tempUrl: string): Promise<string | null> {
  try {
    // A. 이미지 다운로드 (ArrayBuffer로 받아야 함)
    const response = await axios.get(tempUrl, {
      responseType: 'arraybuffer'
    });
    
    // Node.js 환경에서는 Buffer로 변환 필요
    const fileBuffer = Buffer.from(response.data);

    // B. 파일명 생성 (겹치지 않게 타임스탬프 사용)
    const fileName = `timetable_${Date.now()}.jpg`;
    const filePath = `instagram_images/${fileName}`;

    // C. Supabase Storage에 업로드
    const { data, error } = await supabaseAdmin
      .storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (error) {
      console.error('Supabase Upload Error:', error.message);
      return null;
    }

    // D. 공개 URL(Public URL) 가져오기
    const { data: publicData } = supabaseAdmin
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return publicData.publicUrl;

  } catch (error) {
    console.error('Image Process Error:', error);
    return null;
  }
}

// ========================================
// Step 1: FESTIVAL_BASE 크롤링 (예매처)
// ========================================

const TICKETING_SITES = [
  {
    name: 'Interpark',
    url: 'https://tickets.interpark.com/contents/genre/concert',
    action: async (page: Page) => {
      console.log(`${COLORS.cyan}    👆 페스티벌 탭 클릭 중...${COLORS.reset}`);
      const btnSelector = 'button[aria-label="페스티벌"]';
      try {
        await page.waitForSelector(btnSelector, { timeout: 5000 });
        await page.click(btnSelector);
      } catch (e) {
        console.log(`${COLORS.yellow}    ⚠️ 페스티벌 탭 찾기 실패, URL 확인 필요${COLORS.reset}`);
      }
      await page.waitForTimeout(2000);
      await page.waitForSelector('div[aria-label="상품 리스트"]', { timeout: 10000 });
      console.log(`${COLORS.green}    ✅ 페스티벌 탭 로드 완료${COLORS.reset}`);
    },
    extractData: async (page: Page) => {
      const allItems: any[] = [];
      await smartScrollBatch(page, async (newItems) => {
        allItems.push(...newItems);
      });
      return allItems;
    }
  },
  {
    name: 'YES24_FESTIVAL',
    url: 'https://ticket.yes24.com/New/Genre/GenreList.aspx?genretype=2&genre=15464',
    extractData: async (page: Page) => {
      try { await page.waitForSelector('.list-sec', { timeout: 10000 }); } catch {}
      const items = await page.evaluate(() => {
        const results: any[] = [];
        const linkElements = document.querySelectorAll('.ms-list-imgs > a[onclick*="jsf_base_GoToPerfDetail"]');
        linkElements.forEach((el) => {
          const onclick = el.getAttribute('onclick') || '';
          const match = onclick.match(/jsf_base_GoToPerfDetail\((\d+)\)/);
          const perfId = match ? match[1] : null;
          if (!perfId) return;
          const txtContainer = el.querySelector('.list-bigger-txt');
          if (!txtContainer) return;
          const titleEl = txtContainer.querySelector('.list-b-tit1');
          const tit2Elements = txtContainer.querySelectorAll('.list-b-tit2');
          const imgEl = el.querySelector('img');
          const title = titleEl?.textContent?.trim() || '';
          const date_range = tit2Elements[0]?.textContent?.trim() || '';
          const location = tit2Elements[1]?.textContent?.trim() || '';
          let poster_url = imgEl?.getAttribute('src') || '';
          if (poster_url && poster_url.startsWith('//')) {
            poster_url = 'https:' + poster_url;
          }
          if (title && perfId) {
            results.push({
              title, location, date_range, poster_url,
              source_url: `https://ticket.yes24.com/Perf/${perfId}`
            });
          }
        });
        return results;
      });
      return items;
    }
  }
];

async function crawlFestivalBase(context: BrowserContext) {
  console.log(`\n${COLORS.bold}${COLORS.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}`);
  console.log(`${COLORS.bold}[FESTIVAL_BASE] 예매처 크롤링 시작${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}\n`);
  
  for (const config of TICKETING_SITES) {
    const page = await context.newPage();
    // [최적화] 리소스 차단 적용
    await blockResources(page);
    try {
      console.log(`\n${COLORS.bold}📌 ${config.name} 목록 수집 시작...${COLORS.reset}`);
      console.log(`${COLORS.cyan}    🌐 URL: ${config.url}${COLORS.reset}`);
      await page.goto(config.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(2000);
      if (config.action) await config.action(page);
      
      const items = await config.extractData(page);
      const validItems = items.filter(i => {
        if (!i.title || i.title.trim() === '') return false;
        if (!i.source_url || i.source_url.includes('null') || i.source_url.trim() === '') return false;
        return true;
      });
      
      console.log(`    총 ${COLORS.bold}${items.length}${COLORS.reset}개 수집, ${COLORS.bold}${validItems.length}${COLORS.reset}개 유효`);
      for (const item of validItems) {
        await saveFestivalBase(config.name, item);
      }
      console.log(`${COLORS.green}    ✅ ${config.name} 수집 완료${COLORS.reset}`);
    } catch (err: any) {
      console.error(`${COLORS.red}    ❌ [${config.name}] 에러: ${err.message}${COLORS.reset}`);
    } finally { 
      await page.close(); 
    }
  }
}

async function saveFestivalBase(sourceName: string, item: any) {
  const decision = checkFestivalStatus(item.title);
  if (decision.status === 'SKIP') {
    console.log(`${COLORS.red}[반려]${COLORS.reset} ${item.title.padEnd(45)} ${COLORS.yellow}(${decision.reason})${COLORS.reset}`);
    return;
  }
  // 날짜 파싱
  const dates = parseDateRange(item.date_range);

  // RawFestivalBase 스키마 준수
  const rawData: RawFestivalBase = {
    title: item.title,
    location: item.location || '',
    date_range: item.date_range || '',
    poster_url: item.poster_url || '',
    start_date: dates.start,
    end_date: dates.end,
    booking_info: [{ site_name: sourceName, url: item.source_url }],
    step: 1,
    is_priority: decision.status === 'PRIORITY'
  };
  const { error } = await supabaseAdmin.from('staged_contents').upsert({
    category: 'FESTIVAL_BASE',
    source_name: sourceName,
    source_url: item.source_url,
    status: 'PENDING',
    raw_data: rawData,
    last_crawled_at: new Date().toISOString()
  }, { onConflict: 'source_url', ignoreDuplicates: false });

  if (!error) {
    const keywordInfo = decision.status === 'PRIORITY' ? `${COLORS.yellow}(${decision.reason})${COLORS.reset}` : '';
    console.log(`${COLORS.green}[저장]${COLORS.reset} ${item.title.padEnd(45)} ${keywordInfo}`);
  } else {
    console.error(`${COLORS.red}[DB 에러]${COLORS.reset} ${item.title}: ${error.message}`);
  }
}

// [최적화] 상세 정보 수집 - 병렬 처리
async function enrichFestivalBase(context: BrowserContext) {
  console.log(`\n${COLORS.bold}${COLORS.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}`);
  console.log(`${COLORS.bold}[FESTIVAL_BASE] 상세 정보 수집 (Step 2) (병렬 모드: ${CONFIG.CONCURRENCY_LIMIT}탭)${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}\n`);
  
  const { data: stagedItems } = await supabaseAdmin
    .from('staged_contents')
    .select('*')
    .eq('status', 'PENDING')
    .eq('category', 'FESTIVAL_BASE')
    .eq('raw_data->step', 1)
    .limit(30);

  if (!stagedItems || stagedItems.length === 0) {
    console.log(`${COLORS.yellow}    수집할 상세 페이지가 없습니다.${COLORS.reset}`);
    return;
  }
  console.log(`    총 ${COLORS.bold}${stagedItems.length}${COLORS.reset}개 상세 페이지 수집 예정`);
  // 청크 단위로 나누어 병렬 처리
  const chunkedItems = [];
  for (let i = 0; i < stagedItems.length; i += CONFIG.CONCURRENCY_LIMIT) {
    chunkedItems.push(stagedItems.slice(i, i + CONFIG.CONCURRENCY_LIMIT));
  }
  for (const chunk of chunkedItems) {
    const promises = chunk.map(async (item: { raw_data: RawFestivalBase; source_url: string; source_name: string | string[]; id: any; }) => {
      const page = await context.newPage();
      await blockResources(page); // 리소스 차단으로 속도 향상

      const raw = item.raw_data as RawFestivalBase;
      try {
        console.log(`${COLORS.cyan}    🔍 수집중:${COLORS.reset} ${raw.title.slice(0, 20)}...`);
        
        // Timeout 30초로 단축
        await page.goto(item.source_url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        let details: any = {};
        
        if (item.source_name.includes('Yes24')) {
          // waitForSelector로 요소가 뜰 때까지만 대기 (고정 시간 대기 X)
          try { await page.waitForSelector('.rn-product-nwrp', { timeout: 5000 }); } catch {}
          
          details = await page.evaluate(() => {
            const infoArea = document.querySelector('.rn-product-nwrp');
            const dateStr = infoArea?.querySelector('.rn-product-infowrp li:nth-child(1)')?.textContent?.trim().replace('공연일시', '').trim();
            const venueStr = infoArea?.querySelector('.rn-product-infowrp li:nth-child(2)')?.textContent?.trim().replace('공연장소', '').trim();
            return { date_str: dateStr, venue_detail: venueStr };
          });
        } else if (item.source_name.includes('Interpark')) {
          try { await page.waitForSelector('.detailInfoWrap', { timeout: 5000 }); } catch {}

          details = await page.evaluate(() => {
            const infoArea = document.querySelector('.detailInfoWrap');
            const dateStr = infoArea?.querySelector('.infoItem:nth-child(1) .infoText')?.textContent?.trim();
            const venueStr = infoArea?.querySelector('.infoItem:nth-child(2) .infoText')?.textContent?.trim();
            return { date_str: dateStr, venue_detail: venueStr };
          });
        }

        const dates = parseDateRange(details.date_str || raw.date_range);
        const updatedRawData: RawFestivalBase = {
          ...raw,
          start_date: dates.start || raw.start_date,
          end_date: dates.end || raw.end_date,
          venue_detail: details.venue_detail || raw.location,
          step: 2
        };

        await supabaseAdmin.from('staged_contents').update({
          raw_data: updatedRawData,
          last_crawled_at: new Date().toISOString()
        }).eq('id', item.id);
        
      } catch (err: any) {
        console.error(`${COLORS.red}    ❌ [${raw.title.slice(0,10)}] 실패: ${err.message}${COLORS.reset}`);
      } finally { 
        await page.close(); 
      }
    });

    await Promise.all(promises); // 3개씩 동시 실행
  }
}

// ========================================
// Step 2: Instagram 피드 크롤링
// ========================================

interface InstagramCrawlConfig {
  festival_account: string;
  target_categories: Array<StagingCategory>;
  max_posts?: number;
}

// 인스타그램 캡션 분석 및 카테고리/상세타입 결정
function analyzeInstagramPost(caption: string, hashtags: string[]): { 
  category: StagingCategory | null, 
  noticeType?: RawOfficialNotice['type'] 
} {
  const text = (caption + ' ' + hashtags.join(' ')).toLowerCase().replace(/\s/g, '');

  // 1. Lineup
  if (text.includes('라인업') || text.includes('lineup') || text.includes('출연') || text.includes('whoisnext')) {
    return { category: 'OFFICIAL_LINEUP' };
  }

  // 2. Timetable
  if (text.includes('타임테이블') || text.includes('timetable') || text.includes('시간표') || text.includes('스케줄')) {
    return { category: 'OFFICIAL_TIMETABLE' };
  }

  // 3. Notice (상세 타입 분류)
  let noticeType: RawOfficialNotice['type'] | null = null;
  if (text.includes('티켓') || text.includes('예매') || text.includes('오픈')) noticeType = 'TICKET';
  else if (text.includes('md') || text.includes('굿즈') || text.includes('상품')) noticeType = 'MD';
  else if (text.includes('지도') || text.includes('map') || text.includes('안내도') || text.includes('오시는길')) noticeType = 'MAP';
  else if (text.includes('셔틀') || text.includes('입장') || text.includes('반입') || text.includes('가이드')) noticeType = 'GUIDELINE';
  else if (text.includes('이벤트')) noticeType = 'EVENT';
  else noticeType = 'NOTICE'; // 기본값

  return { category: 'OFFICIAL_NOTICE', noticeType };
}

async function crawlInstagramFeeds(context: BrowserContext, config: InstagramCrawlConfig) {
  console.log(`\n${COLORS.bold}${COLORS.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}`);
  console.log(`${COLORS.bold}[INSTAGRAM] @${config.festival_account} 피드 크롤링${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS.reset}\n`);

  // [중요] 인스타는 동시성을 높이면 바로 계정이 잠김. 무조건 단일 탭 사용.
  const pages = context.pages();
  const page = pages.length > 0 ? pages[0] : await context.newPage();

  try {
    const profileUrl = `https://www.instagram.com/${config.festival_account}/`;
    console.log(`${COLORS.cyan}    🌐 프로필 접속: ${profileUrl}${COLORS.reset}`);
    await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // 게시물이 뜰 때까지 명시적으로 대기 (최대 15초)
    console.log(`${COLORS.gray}    ⏳ 페이지 로딩 및 게시물 대기 중...${COLORS.reset}`);
    try {
        await page.waitForSelector('a[href*="/p/"]', { timeout: 10000 });
    } catch (e) {
        console.log(`${COLORS.yellow}    ⚠️ 게시물 요소를 찾는데 시간이 걸리거나 실패했습니다. 계속 진행합니다.${COLORS.reset}`);
    }

    const postUrls = await instagramScroll(page, config.max_posts || 20);
    console.log(`\n${COLORS.green}    ✓ 총 ${postUrls.length}개 게시물 링크 확보${COLORS.reset}`);

    for (let i = 0; i < postUrls.length; i++) {
      const postUrl = postUrls[i];
      console.log(`\n${COLORS.cyan}    [${i + 1}/${postUrls.length}] 게시물 분석: ${postUrl}${COLORS.reset}`);
      
      const postPage = await context.newPage();
      
      try {
        await postPage.goto(postUrl, { waitUntil: 'domcontentloaded', timeout: 40000 });
        // 상세 페이지에서도 내용이 뜰 때까지 대기
        await postPage.waitForTimeout(1000); 

        // ==========================================
        // [Step 1] 텍스트 데이터 추출 (meta 태그 활용)
        // ==========================================
        const textData = await postPage.evaluate(() => {
          let caption = '';
          
          // 1. h1 태그 탐색 (보통 첫 번째 h1이 본문 내용일 확률 높음)
          const h1s = document.querySelectorAll('h1');
          for (const h1 of Array.from(h1s)) {
             if (h1.textContent && h1.textContent.length > 10) { // 10자 이상이면 캡션으로 간주
                caption = h1.textContent;
                break;
             }
          }

          // 2. 실패 시 meta 태그 (가장 확실한 방법)
          if (!caption) {
            const metaDesc = document.querySelector('meta[property="og:description"]');
            if (metaDesc) {
                // "content" 속성에서 캡션 부분만 발췌하는 로직 필요할 수 있음
                caption = metaDesc.getAttribute('content') || '';
            }
          }

          const timeElement = document.querySelector('time');
          const posted_at = timeElement?.getAttribute('datetime') || new Date().toISOString();
          
          return { caption: caption.trim(), posted_at };
        });

        const hashtags = Array.from(textData.caption.matchAll(/#(\w+)/g)).map(m => m[1]);

        // ==========================================
        // [Step 2] 카테고리 분석 (SKIP 여부 결정)
        // ==========================================
        const analysis = analyzeInstagramPost(textData.caption, hashtags);
        
        const preview = textData.caption.length > 30 ? textData.caption.slice(0, 30) + '...' : textData.caption;
        console.log(`${COLORS.gray}      📝 캡션 분석: "${preview}"${COLORS.reset}`);

        if (!analysis.category || !config.target_categories.includes(analysis.category)) {
          console.log(`${COLORS.yellow}      ⏭️  Skipped (Category: ${analysis.category || 'Unknown'})${COLORS.reset}`);
          await postPage.close();
          continue;
        }

        // ==========================================
        // [Step 3] 이미지 수집 (구조 기반 + 크기 기반)
        // ==========================================
        console.log(`${COLORS.cyan}      📸 이미지 수집 시작 (카테고리: ${analysis.category})...${COLORS.reset}`);
        
        const collectedImageSet = new Set<string>();
        let hasNextButton = true;
        let loopCount = 0;

        while (hasNextButton && loopCount < 15) {
          loopCount++;
          
          // 현재 페이지의 이미지 긁어오기
          const newImages = await postPage.evaluate(() => {
            // [핵심 전략] document 전체에서 찾되, 강력한 필터를 건다.
            const allImages = Array.from(document.querySelectorAll('img')) as HTMLImageElement[];

            return allImages
              .filter(img => {
                if (!img.src) return false;
                
                // 1. [구조적 필터] 캐러셀 이미지는 보통 <ul> > <li> 안에 존재함
                // closest('li')가 null이면 리스트 안에 없는 이미지(즉, 단순 아이콘이나 프로필일 확률 높음)
                const insideList = img.closest('li');
                const insideButton = img.closest('button'); // 버튼 안의 이미지는 제외
                
                if (!insideList) return false; 
                if (insideButton) return false;

                // 2. [크기 필터] 가장 강력한 조건
                // 피드 이미지는 PC에서 무조건 300px 이상임. (프로필은 커봤자 150px)
                const width = img.clientWidth; 
                if (width < 300) return false;

                // 3. [텍스트 필터] 안전장치
                const altText = (img.alt || '').toLowerCase();
                const srcText = img.src.toLowerCase();
                if (altText.includes('프로필') || altText.includes('profile')) return false;
                if (srcText.includes('s150x150') || srcText.includes('p150x150')) return false;

                return true;
              })
              .map(img => img.src);
          });

          newImages.forEach(url => collectedImageSet.add(url));

          // [다음 버튼 클릭]
          // aria-label은 접근성 표준이라 클래스명보다 훨씬 덜 변함
          const nextBtn = await postPage.$('button[aria-label="다음"], button[aria-label="Next"]');
          
          if (nextBtn) {
            try {
              await nextBtn.click();
              // 슬라이드 애니메이션 대기 (인스타는 반응형이라 살짝 김)
              await postPage.waitForTimeout(1500); 
            } catch (e) {
              hasNextButton = false;
            }
          } else {
            hasNextButton = false;
          }
        }

        const uniqueImages = Array.from(collectedImageSet);
        console.log(`${COLORS.green}      ✅ 총 ${uniqueImages.length}장 수집 완료${COLORS.reset}`);

        // 기존 변수명(feedData)으로 통합
        const feedData = {
            caption: textData.caption,
            posted_at: textData.posted_at,
            images: uniqueImages,
            hashtags: hashtags
        };

        // 이미지 URL 영구 저장소로 변환
        let permanentMainImageUrl = '';
        let allPermanentImages: string[] = [];

        if (feedData.images.length > 0) {
            console.log(`${COLORS.gray}      ☁️ 이미지 Supabase 업로드 중...${COLORS.reset}`);
            
            // 1. 모든 이미지를 병렬로 Supabase에 업로드
            // (Promise.all을 사용하여 속도 저하 최소화)
            const uploadPromises = feedData.images.map(async (tempUrl) => {
                return await uploadToSupabaseAndGetUrl(tempUrl);
            });

            const results = await Promise.all(uploadPromises);

            // 2. 성공한 URL만 필터링
            allPermanentImages = results.filter((url): url is string => url !== null);

            if (allPermanentImages.length > 0) {
                permanentMainImageUrl = allPermanentImages[0]; // 첫 번째 장을 대표 이미지로 사용
                console.log(`${COLORS.green}      ✅  ${allPermanentImages.length}장 업로드 완료${COLORS.reset}`);
            } else {
                console.log(`${COLORS.red}      ❌  이미지 업로드 모두 실패${COLORS.reset}`);
            }
        }

        let rawPayload: any = {};
        const baseData = {
          festival_name: config.festival_account,
          source_url: postUrl,
          image_url: permanentMainImageUrl, // ✅ 대표 이미지 (Supabase URL)
          caption: feedData.caption,
          posted_at: feedData.posted_at,
        };

        if (analysis.category === 'OFFICIAL_NOTICE') {
          const noticeData: RawOfficialNotice = {
            ...baseData,
            type: analysis.noticeType || 'NOTICE',
            title: feedData.caption.split('\n')[0].slice(0, 50) // 첫 줄을 제목으로
          };
          rawPayload = noticeData;
        } else if (analysis.category === 'OFFICIAL_LINEUP') {
          const lineupData: RawOfficialLineup = {
            ...baseData,
            artists: [], // 추출 로직이 없으므로 빈 배열 (OCR 예정)
            items: allPermanentImages.map(url => ({ type: 'image', url: url }))
          };
          rawPayload = lineupData;
        } else if (analysis.category === 'OFFICIAL_TIMETABLE') {
          const timetableData: RawOfficialTimetable = {
            ...baseData,
            items: allPermanentImages.map(url => ({ type: 'image', url: url }))
          };
          rawPayload = timetableData;
        }

        // DB 저장
        const { error } = await supabaseAdmin.from('staged_contents').upsert({
          category: analysis.category,
          source_name: `Instagram_@${config.festival_account}`,
          source_url: postUrl,
          status: 'PENDING',
          ocr_status: null,
          raw_data: rawPayload,
          last_crawled_at: new Date().toISOString()
        }, { onConflict: 'source_url' });

        if (error) {
          console.error(`${COLORS.red}[DB Error] ${error.message}${COLORS.reset}`);
        } else {
          console.log(`${COLORS.green}      ✅ Staged: ${analysis.category} ${analysis.noticeType ? `(${analysis.noticeType})` : ''}${COLORS.reset}`);
        }

      } catch (err: any) {
        console.error(`${COLORS.red}      ❌ Error: ${err.message}${COLORS.reset}`);
      } finally {
        await postPage.close();
      }
      // [최적화] 딜레이 약간 줄임 (난수 범위 축소)
      await page.waitForTimeout(CONFIG.INSTAGRAM_DELAY.min + Math.random() * (CONFIG.INSTAGRAM_DELAY.max - CONFIG.INSTAGRAM_DELAY.min));
    }
  } catch (err: any) {
    console.error(`${COLORS.red}❌ Instagram 크롤링 에러: ${err.message}${COLORS.reset}`);
  } finally {
    // context 닫기는 상위에서 처리
  }
}

// ========================================
// 메인 실행 함수
// ========================================

async function getBrowserContext(headless = false) {
  const userDataDir = path.join(process.cwd(), 'browser_data');
  return await chromium.launchPersistentContext(userDataDir, {
    headless: headless,
    args: ['--disable-blink-features=AutomationControlled'],
    viewport: { width: 1280, height: 800 }
  });
}

export async function crawlTicketingSites() {
  const context = await getBrowserContext(false);
  try {
    await crawlFestivalBase(context);
    await enrichFestivalBase(context);
  } finally {
    await context.close();
  }
}

export async function crawlInstagram(accounts: string[], categories: StagingCategory[], maxPosts = 30) {
  const context = await getBrowserContext(false);
  const accountList = Array.isArray(accounts) ? accounts : [accounts];

  const pages = context.pages();
  const loginPage = pages.length > 0 ? pages[0] : await context.newPage();
  
  // 로그인 체크 (이미 로그인되어 있다면 바로 메인으로 리다이렉트됨)
  await loginPage.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'domcontentloaded' });
  await loginPage.waitForTimeout(2000);

  // 현재 URL이 로그인 페이지인지 확인
  if (loginPage.url().includes('login')) {
    console.log(`\n${COLORS.bold}${COLORS.yellow}🔐 [인스타그램 로그인 대기]${COLORS.reset}`);
    console.log(`${COLORS.yellow}    1. 브라우저에서 로그인하세요.${COLORS.reset}`);
    console.log(`${COLORS.yellow}    2. 완료되면 콘솔에 'y' 입력.${COLORS.reset}`);

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    await new Promise<void>((resolve) => rl.question(`    완료? (y): `, () => { rl.close(); resolve(); }));
  } else {
    console.log(`${COLORS.green}    🔓 이미 로그인되어 있습니다. 바로 진행합니다.${COLORS.reset}`);
  }


  try {
    for (const account of accountList) {
      await crawlInstagramFeeds(context, {
        festival_account: account,
        target_categories: categories,
        max_posts: maxPosts
      });
    }
  } finally {
    await context.close();
  }
}

async function runCrawler() {
  console.log(`${COLORS.bold}${COLORS.cyan}🚀 Wavy 크롤러 시작 (통합 모드)${COLORS.reset}\n`);
  
  try {
    // Task 1: 예매처 크롤링 (필요시 주석 해제)
    //await crawlTicketingSites();

    // Task 2: 인스타그램 피드 크롤링
    await crawlInstagram(
      [
        //'peak_festa', 
        // 'seouljazzfestival', 
        'pentaportrf',
        // 'lovesom_official',
        // 'beautifulmintlife_',
        // 'busanrockfest',
        // 'countdownfantasy',
      ], // 타겟 계정
    //   ['OFFICIAL_LINEUP', 'OFFICIAL_TIMETABLE', 'OFFICIAL_NOTICE'], // 타겟 카테고리
      [
        'OFFICIAL_LINEUP',
        'OFFICIAL_TIMETABLE',
      ],
      5 // 수집할 게시물 수
    );
    
  } catch (err: any) {
    console.error(`${COLORS.red}💥 전체 프로세스 중 오류 발생: ${err.message}${COLORS.reset}`);
  }
  
  console.log(`\n${COLORS.bold}${COLORS.green}🏁 모든 작업이 완료되었습니다.${COLORS.reset}`);
}
// CLI 실행
if (require.main === module) {
  runCrawler();
}