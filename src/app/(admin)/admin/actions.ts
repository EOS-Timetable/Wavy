'use server'

import { createClient } from '@/lib/supabase'

// --- [Utility] Helper Functions ---
const parseDate = (dateStr: string | undefined | null) => {
  if (!dateStr) return null;
  // 2024.05.01, 2024/05/01, 2024-05-01 등 처리
  const cleaned = dateStr.replace(/[\.\/]/g, '-').split('~')[0].split('(')[0].trim();
  const date = new Date(cleaned);
  return isNaN(date.getTime()) ? null : date.toISOString();
};

const combineDateTime = (dateStr: string, timeStr: string) => {
  if (!dateStr || !timeStr) return null;
  const datePart = dateStr.split('T')[0];
  const timePart = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
  return new Date(`${datePart}T${timePart}`).toISOString();
};

async function findFestival(supabase: any, name: string) {
  if (!name) return null;
  // 정확도 높이기 위해 공백 제거 후 비교 등 로직 추가 가능
  const { data } = await supabase
    .from('festivals')
    .select('id, start_date')
    .ilike('name', `%${name}%`)
    .limit(1)
    .single();
  return data;
}

async function findOrCreateArtist(supabase: any, name: string) {
  if (!name) return null;
  const { data: existing } = await supabase.from('artists').select('id').ilike('name', name).single();
  if (existing) return existing;

  // 아티스트가 없으면 '이름'만으로 뼈대 생성 (추후 ARTIST_BASE 크롤러가 채워줌)
  const { data: newArtist, error } = await supabase
    .from('artists')
    .insert({ name })
    .select('id')
    .single();
  
  if (error) console.error(`아티스트 생성 실패: ${name}`, error);
  return newArtist;
}

// --- [Processors] Phase 1~6 ---

// Phase 1. FESTIVAL_BASE (기본 정보)
async function processFestivalBase(supabase: any, raw: any) {
  const payload = {
    name: raw.name || raw.title,
    poster_url: raw.poster_url || raw.image_url,
    start_date: parseDate(raw.start_date),
    end_date: parseDate(raw.end_date),
    place_name: raw.place_name || raw.location,
    address: raw.address,
    latitude: raw.latitude ? parseFloat(raw.latitude) : 0,
    longitude: raw.longitude ? parseFloat(raw.longitude) : 0,
    booking_info: raw.booking_info || [],
    official_links: raw.official_links || {},
  };

  const { data, error } = await supabase
    .from('festivals')
    .upsert(payload, { onConflict: 'name' })
    .select()
    .single();

  if (error) throw new Error(`페스티벌 등록 실패: ${error.message}`);
  return data;
}

// Phase 2. OFFICIAL_LINEUP (라인업 발표)
async function processOfficialLineup(supabase: any, raw: any) {
  const festival = await findFestival(supabase, raw.festival_name);
  if (!festival) throw new Error(`'${raw.festival_name}' 페스티벌을 찾을 수 없습니다.`);

  // 1. View용 카드 (festival_contents)
  await supabase.from('festival_contents').insert({
    festival_id: festival.id,
    category: 'LINEUP',
    title: raw.title || '라인업 공개',
    image_url: raw.image_url,
    link_url: raw.link_url || raw.source_url,
    priority: 10 // 라인업은 중요하니까 우선순위 높게
  });

  // 2. Data 매핑 (festival_lineups)
  const artists = raw.artists || []; // ["ZICO", "Crush"]
  for (const artistName of artists) {
    const artist = await findOrCreateArtist(supabase, artistName);
    if (artist) {
      await supabase
        .from('festival_lineups')
        .upsert({ festival_id: festival.id, artist_id: artist.id }, { onConflict: 'festival_id, artist_id' });
    }
  }
}

// Phase 3. OFFICIAL_TIMETABLE (타임테이블)
async function processOfficialTimetable(supabase: any, raw: any) {
  const festival = await findFestival(supabase, raw.festival_name);
  if (!festival) throw new Error(`'${raw.festival_name}' 페스티벌을 찾을 수 없습니다.`);

  // 1. View용 카드
  await supabase.from('festival_contents').insert({
    festival_id: festival.id,
    category: 'TIMETABLE',
    title: raw.title || '타임테이블 안내',
    image_url: raw.image_url,
    link_url: raw.link_url,
    priority: 20 // 타임테이블도 중요
  });

  // 2. Data 매핑 (performances) - raw_data에 파싱된 items가 있다면
  if (raw.items && Array.isArray(raw.items)) {
    const stageName = raw.stage_name || 'Main Stage';
    
    // 스테이지 찾기/생성
    let { data: stage } = await supabase.from('stages').select('id').eq('festival_id', festival.id).eq('name', stageName).single();
    if (!stage) {
      const { data: newStage } = await supabase.from('stages').insert({ festival_id: festival.id, name: stageName }).select('id').single();
      stage = newStage;
    }

    for (const item of raw.items) {
      const artist = await findOrCreateArtist(supabase, item.artist_name);
      const startAt = combineDateTime(raw.date, item.start_time);
      const endAt = combineDateTime(raw.date, item.end_time);

      if (artist && startAt && endAt) {
        await supabase.from('performances').insert({
          festival_id: festival.id,
          stage_id: stage.id,
          artist_id: artist.id,
          start_time: startAt,
          end_time: endAt,
        });
      }
    }
  }
}

// Phase 4. OFFICIAL_NOTICE (공지사항)
async function processOfficialNotice(supabase: any, raw: any) {
  const festival = await findFestival(supabase, raw.festival_name);
  if (!festival) throw new Error(`'${raw.festival_name}' 페스티벌을 찾을 수 없습니다.`);

  // category: TICKET, MD, EVENT, GUIDELINE, NOTICE
  const category = ['TICKET', 'MD', 'EVENT', 'GUIDELINE'].includes(raw.type) ? raw.type : 'NOTICE';

  await supabase.from('festival_contents').insert({
    festival_id: festival.id,
    category: category,
    title: raw.title || '공지사항',
    image_url: raw.image_url,
    link_url: raw.link_url,
    priority: 0
  });
}

// Phase 5. EXTERNAL_CONTENT (관련글/후기)
async function processExternalContent(supabase: any, raw: any) {
  let festivalId = null;
  // 1. 크롤링된 이름으로 찾기
  if (raw.festival_name) {
    const f = await findFestival(supabase, raw.festival_name);
    if (f) festivalId = f.id;
  }
  // 2. Admin이 수동 주입한 ID (manual_festival_id)
  if (raw.manual_festival_id) {
    festivalId = raw.manual_festival_id;
  }

  await supabase.from('external_contents').insert({
    festival_id: festivalId,
    source_type: raw.source_type || 'YOUTUBE', // YOUTUBE, INSTAGRAM, BLOG
    title: raw.title,
    thumbnail_url: raw.thumbnail_url || raw.image_url,
    link_url: raw.url || raw.link_url,
    author_name: raw.author_name
  });
}

// Phase 6. ARCHIVE_DATA (영상/셋리스트)
async function processArchiveData(supabase: any, raw: any) {
  // 페스티벌 찾기
  let festivalId = null;
  if (raw.festival_name) {
    const f = await findFestival(supabase, raw.festival_name);
    if (f) festivalId = f.id;
  } else if (raw.manual_festival_id) {
    festivalId = raw.manual_festival_id;
  }

  // 아티스트 찾기
  let artistId = null;
  if (raw.artist_name) {
    const a = await findOrCreateArtist(supabase, raw.artist_name);
    if (a) artistId = a.id;
  }

  if (raw.type === 'SETLIST') {
    await supabase.from('setlists').insert({
      festival_id: festivalId,
      artist_id: artistId,
      tracks: raw.tracks // JSON array
    });
  } else {
    // VIDEO
    await supabase.from('performance_videos').insert({
      festival_id: festivalId,
      artist_id: artistId,
      title: raw.title,
      video_url: raw.video_url,
      thumbnail_url: raw.thumbnail_url
    });
  }
}

// --- [Main Entry] 통합 승인 함수 ---
export async function approveStagedContent(stagedId: string, manualOverride?: any) {
  const supabase = createClient();

  const { data: staged } = await supabase
    .from('staged_contents')
    .select('*')
    .eq('id', stagedId)
    .single();

  if (!staged) throw new Error('데이터 없음');
  
  // 수동 입력 데이터 병합 (Admin UI에서 페스티벌 선택 시 사용)
  const raw = { ...staged.raw_data, ...manualOverride };

  try {
    switch (staged.category) {
      case 'FESTIVAL_BASE': await processFestivalBase(supabase, raw); break;
      case 'OFFICIAL_LINEUP': await processOfficialLineup(supabase, raw); break;
      case 'OFFICIAL_TIMETABLE': await processOfficialTimetable(supabase, raw); break;
      case 'OFFICIAL_NOTICE': await processOfficialNotice(supabase, raw); break;
      case 'EXTERNAL_CONTENT': await processExternalContent(supabase, raw); break;
      case 'ARCHIVE_DATA': await processArchiveData(supabase, raw); break;
      default: throw new Error(`Unknown Category: ${staged.category}`);
    }

    // 상태 업데이트
    await supabase
      .from('staged_contents')
      .update({ status: 'ALLOWED', updated_at: new Date().toISOString() })
      .eq('id', stagedId);

    return { success: true };

  } catch (error: any) {
    console.error(`Approval Error [${staged.category}]:`, error);
    throw error;
  }
}