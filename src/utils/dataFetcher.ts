import { createClient } from "@/lib/supabase";

const supabase = createClient();

// --- Types ---
// --- Types (DB ID는 UUID이므로 string으로 변경!) ---
export interface profiles {
  id: string;
  nickname: string;
  avatar_url: string;
  vibe_type: string;
  updated_at: string;
}

export interface Artist {
  id: string;
  createdAt: string;
  name: string;
  imageUrl?: string;
  spotifyId?: string;
  description?: string;
  tags?: string[];
  top_tracks?: string[];
  sns_links?: string[];
}

export interface ArtistFestivalSummary {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location?: string;
  posterUrl?: string;
}

export interface Stage {
  id: string;
  festivalId: string;
  name: string;
  color: string;
  position?: number;
}

// festivals.booking_info (json/jsonb) 구조
export interface FestivalBookingInfoItem {
  tier: string; // 얼리버드 / 1차 예매 등
  date: string; // YYYY-MM-DD (권장) 또는 ISO
  is_open?: boolean;
  url: string;
  price?: string;
}

// festivals.official_links (json/jsonb) 구조
export interface FestivalOfficialLinks {
  homepage?: string;
  instagram?: string;
  youtube?: string;
  twitter?: string;
  facebook?: string;
}

export interface Festival {
  id: string;
  createdAt?: string;
  name: string;
  startDate: string;
  endDate: string;
  posterUrl?: string;
  placeName?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  bookingInfo?: FestivalBookingInfoItem[];
  officialLinks?: FestivalOfficialLinks;
  saveCount?: number;
}

export interface Performance {
  id: string;
  festivalId: string;
  stageId: string;
  artistId: string;
  startTime: string; // ISO String
  endTime: string; // ISO String
  day_number: number;
  save_count: number;
}

export interface PerformanceJoined {
  id: string;
  stageId: string;
  startTime: string;
  endTime: string;
  artist: Artist;
  stage: Stage;
  dayNumber: number;
  congestionLevel?: string;
}

export interface festival_contents {
  id: string;
  festival_id: string;
  category: string;
  title: string;
  image_url: string;
  link_url: string;
  priority: number;
  created_at?: string;
}

// setlists.tracks의 JSONB 구조
export interface SetlistTrack {
  order: number;
  title: string;
  spotify_id?: string;
}

export interface setlists {
  id: string;
  artist_id: string;
  festival_id: string;
  tracks: SetlistTrack[]; // JSONB 배열
  updated_at: string;
}

export interface performance_videos {
  id: string;
  artist_id: string;
  festival_id: string;
  title: string;
  video_url: string;
  thumbnail_url: string;
}

export interface user_interested_festival {
  user_id: string;
  festival_id: string;
  is_home_display: boolean;
}

export interface user_saved_performance {
  id: string;
  user_id: string;
  performance_id: string;
  festival_id: string;
}

// user_wallpaper_settings.config의 JSONB 구조
export interface WallpaperConfig {
  primary_color?: string;
  background_type?: "dark" | "light" | "gradient";
  font_family?: string;
  show_artist_img?: boolean;
  show_timestamp?: boolean;
  layout_spacing?: "normal" | "compact" | "wide";
}

export interface user_wallpaper_settings {
  id: string;
  user_id: string;
  festival_id: string;
  template_id: string;
  config: WallpaperConfig; // JSONB 객체
}

// wallpaper_templates.layout_config의 JSONB 구조
export interface WallpaperLayoutConfig {
  canvas_size?: { w: number; h: number };
  header_pos?: { x: number; y: number };
  list_area?: { top: number; bottom: number };
  default_font_size?: number;
  theme_variant?: string;
}

export interface wallpaper_templates {
  id: string;
  name: string;
  thumbnail_url: string;
  layout_config: WallpaperLayoutConfig; // JSONB 객체
  is_active: boolean;
}

export interface search_history {
  id: string;
  user_id: string;
  query: string;
  created_at: string;
}

// staged_contents.raw_data의 JSONB 구조 (예시)
export interface StagedContentRawData {
  source?: string;
  name?: string;
  raw_html?: string;
  parsed_info?: Record<string, any>;
  [key: string]: any; // 크롤링 데이터는 구조가 다양할 수 있음
}

export interface staged_contents {
  id: string;
  category: string;
  source_url: string;
  raw_data: StagedContentRawData; // JSONB 객체
  status: string;
  inspector_id: string; // FK: 관리자 ID
  source_name: string;
  last_crawled_at: string;
}

export interface festival_lineups {
  festival_id: string;
  artist_id: string;
  is_headliner: boolean;
  created_at: string;
}

// --- Helper Functions (Async로 변경) ---

// 1. 페스티벌 정보 가져오기
export const getFestival = async (id: string): Promise<Festival | null> => {
  const { data, error } = await supabase
    .from("festivals")
    // 스키마 변경(컬럼 추가/삭제)에 안전하도록 *로 조회하고, 필요한 필드만 매핑합니다.
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  // booking_info / official_links는 json/jsonb 또는 string(json)일 수 있으므로 방어적으로 파싱
  const parseJsonMaybe = <T,>(value: unknown): T | undefined => {
    if (!value) return undefined;
    if (typeof value === "string") {
      try {
        return JSON.parse(value) as T;
      } catch {
        return undefined;
      }
    }
    return value as T;
  };

  // DB의 snake_case -> UI의 camelCase 매핑
  return {
    id: data.id,
    createdAt: data.created_at,
    name: data.name,
    startDate: data.start_date,
    endDate: data.end_date,
    posterUrl: data.poster_url || undefined,
    placeName: data.place_name || undefined,
    address: data.address || undefined,
    latitude: data.latitude ?? undefined,
    longitude: data.longitude ?? undefined,
    bookingInfo: parseJsonMaybe<FestivalBookingInfoItem[]>(data.booking_info),
    officialLinks: parseJsonMaybe<FestivalOfficialLinks>(data.official_links),
    saveCount: data.save_count ?? undefined,
  };
};

// 2. 전체 라인업 조회 (festival_lineups 테이블 사용)
export const getFestivalArtists = async (festivalId: string): Promise<Artist[]> => {
  const { data, error } = await supabase
    .from("festival_lineups")
    .select(`
      artist_id,
      is_headliner,
      artist:artists ( id, created_at, name, image_url, description, tags, spotify_id )
    `)
    .eq("festival_id", festivalId);

  if (error || !data) {
    if (error) {
      console.error("Error fetching festival lineups:", error);
    }
    return [];
  }

  // 헤드라이너를 먼저 정렬하고, 그 다음 일반 아티스트 정렬
  const sortedData = [...data].sort((a: any, b: any) => {
    // 헤드라이너가 먼저 오도록
    if (a.is_headliner && !b.is_headliner) return -1;
    if (!a.is_headliner && b.is_headliner) return 1;
    // 둘 다 헤드라이너이거나 둘 다 아닌 경우, 이름으로 정렬
    const nameA = a.artist?.name || "";
    const nameB = b.artist?.name || "";
    return nameA.localeCompare(nameB);
  });

  return sortedData
    .map((item: any) => {
      if (!item.artist) return null;
      return {
        id: item.artist.id,
        createdAt: item.artist.created_at || new Date().toISOString(),
        name: item.artist.name,
        imageUrl: item.artist.image_url || undefined,
        description: item.artist.description || undefined,
        tags: item.artist.tags || undefined,
        spotifyId: item.artist.spotify_id || undefined,
      } as Artist;
    })
    .filter((artist: Artist | null): artist is Artist => artist !== null);
};

// 3. 스테이지 목록 조회
export const getStages = async (festivalId: string): Promise<Stage[]> => {
  const { data, error } = await supabase
    .from("stages")
    .select("*")
    .eq("festival_id", festivalId)
    .order("position");

  if (error || !data) return [];

  return data.map((item: { id: any; festival_id: any; name: any; color: any; position: any; }) => ({
    id: item.id,
    festivalId: item.festival_id,
    name: item.name,
    color: item.color,
    position: item.position ?? undefined,
  }));
};

// 4. 일차별 공연 목록 조회 (혼잡도 뷰 활용)
export const getPerformancesByDay = async (festivalId: string, dayNumber: number): Promise<PerformanceJoined[]> => {
  const { data, error } = await supabase
    .from("performance_congestion_view")
    .select(`
      *,
      artist:artists (*),
      stage:stages (*)
    `)
    .eq("festival_id", festivalId)
    .eq("day_number", dayNumber)
    .order("start_time");

  if (error || !data) {
    console.error("공연 목록 조회 에러:", error?.message);
    return [];
  }

  return data.map((p: any) => ({
    id: p.performance_id || p.id,
    stageId: p.stage_id,
    startTime: p.start_time,
    endTime: p.end_time,
    dayNumber: p.day_number,
    artist: {
      id: p.artist.id,
      createdAt: p.artist.created_at || new Date().toISOString(),
      name: p.artist.name,
      imageUrl: p.artist.image_url,
      spotifyId: p.artist.spotify_id || undefined,
      description: p.artist.description || undefined,
      tags: p.artist.tags || undefined,
    },
    stage: {
      id: p.stage.id,
      festivalId: p.stage.festival_id,
      name: p.stage.name,
      color: p.stage.color,
      position: p.stage.position ?? undefined,
    },
    congestionLevel: p.congestion_level || '정보없음'
  }));
};

// 5. 전체 인기도 통합 동기화 (userId 전용으로 수정)
export const syncUnifiedPopularity = async (
  festivalId: string,
  userId: string 
) => {
  console.log(`[Sync] Target: Festival(${festivalId}), User(${userId})`);
  // 1. 해당 사용자의 모든 타임테이블 조회
  const { data: allTimetables, error: fetchError } = await supabase
    .from("my_timetables")
    .select("selected_ids")
    .eq("festival_id", festivalId)
    .eq("user_id", userId);

  if (fetchError) {
    console.error("[Sync] Fetch Error:", fetchError);
    throw fetchError;
  }
  console.log(`[Sync] Found Timetables: ${allTimetables?.length}`);

  // 2. 중복 없는 합집합 생성
  const unifiedIds = new Set<string>();
  allTimetables?.forEach((t: { selected_ids: string[] | null }) => {
    (t.selected_ids || []).forEach((id: string) => unifiedIds.add(id));
  });

  // 3. 기존 내역 삭제
  await supabase
    .from("user_saved_performances")
    .delete()
    .eq("festival_id", festivalId)
    .eq("user_id", userId);

  // 4. 일괄 삽입
  if (unifiedIds.size > 0) {
    const insertData = Array.from(unifiedIds).map(id => ({
      performance_id: id,
      festival_id: festivalId,
      user_id: userId,
    }));

    const { error: insertError } = await supabase
      .from("user_saved_performances")
      .insert(insertData);

    if (insertError) throw insertError;
  }
};
// 6. 페스티벌 날짜 배열 생성 (타임테이블 날짜 탭 생성용)
export const getFestivalDates = async (festivalId: string): Promise<string[]> => {
  // 1. 딱 필요한 날짜 컬럼만 조회 (성능 최적화)
  const { data, error } = await supabase
    .from("festivals")
    .select("start_date, end_date")
    .eq("id", festivalId)
    .single();

  if (error || !data) return [];

  const start = new Date(data.start_date);
  const end = new Date(data.end_date);
  const dates: string[] = [];

  // 2. 타임존에 안전한 루프 및 포맷팅
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
  }

  return dates;
};

// 6. 아티스트 정보 가져오기
// UUID 형식 검증 함수
const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// 5. 전체 아티스트 목록 가져오기 (lookup 페이지용)
export const getAllArtists = async (): Promise<Array<{ id: string; name: string }>> => {
  // 디버깅: Supabase 연결 정보 확인
  console.log(`[getAllArtists] Supabase URL:`, process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log(`[getAllArtists] Querying artists table...`);

  const { data, error } = await supabase
    .from("artists")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.error("[getAllArtists] Error fetching all artists:", error);
    console.error("[getAllArtists] Error details:", JSON.stringify(error, null, 2));
    return [];
  }

  if (!data) {
    console.warn("[getAllArtists] No artists found in database");
    return [];
  }

  console.log(`[getAllArtists] Fetched ${data.length} artists from database`);
  console.log(`[getAllArtists] Artist names:`, data.map((a: { id: string; name: string }) => a.name));
  console.log(`[getAllArtists] First 5 artist IDs:`, data.slice(0, 5).map((a: { id: string; name: string }) => ({ id: a.id, name: a.name })));

  // 리도어 관련 아티스트 디버깅
  const redoorArtists = data.filter((a: { id: string; name: string }) => 
    a.name.toLowerCase().includes('redoor') || a.name.toLowerCase().includes('리도어')
  );
  if (redoorArtists.length > 0) {
    console.log(`[getAllArtists] Redoor artists found:`, redoorArtists.map((a: { id: string; name: string }) => ({
      id: a.id,
      name: a.name
    })));
  }

  // 중복 제거: 같은 이름의 아티스트가 여러 개 있을 때 처리
  // 이름을 키로 사용하여 중복 제거
  // "Redoor"와 "리도어 (Redoor)"는 다른 이름이므로 여기서는 필터링되지 않음
  // 하지만 정확히 같은 이름이 여러 개 있을 경우 첫 번째 것만 유지
  const uniqueArtists = new Map<string, { id: string; name: string }>();
  for (const artist of data) {
    const nameKey = artist.name.toLowerCase().trim();
    if (!uniqueArtists.has(nameKey)) {
      uniqueArtists.set(nameKey, artist);
    } else {
      console.log(`[getAllArtists] Duplicate artist name found: "${artist.name}" (keeping first occurrence)`);
    }
  }

  const result = Array.from(uniqueArtists.values());
  if (result.length < data.length) {
    console.log(`[getAllArtists] Removed ${data.length - result.length} duplicate artists`);
  }

  return result.map((artist: { id: string; name: string }) => ({
    id: artist.id,
    name: artist.name,
  }));
};

export const getArtistById = async (id: string): Promise<Artist | null> => {
  // UUID 형식이 아닌 경우 (예: mock 데이터의 숫자 ID) null 반환
  if (!isValidUUID(id)) {
    console.warn(`[getArtistById] Invalid UUID format for artistId: ${id}. Returning null.`);
    return null;
  }

  console.log(`[getArtistById] Querying artist with id: ${id}`);
  console.log(`[getArtistById] Supabase URL:`, process.env.NEXT_PUBLIC_SUPABASE_URL);

  const { data, error } = await supabase
    .from("artists")
    .select("id, created_at, name, image_url, spotify_id, description, tags, top_tracks")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`[getArtistById] Error fetching artist by id ${id}:`, error);
    return null;
  }

  if (!data) {
    console.warn(`[getArtistById] No artist found with id: ${id}`);
    return null;
  }

  console.log(`[getArtistById] Raw data from DB for ${id}:`, JSON.stringify({
    id: data.id,
    name: data.name,
    image_url: data.image_url,
    spotify_id: data.spotify_id,
    description: data.description,
    tags: data.tags,
    created_at: data.created_at,
  }, null, 2));

  return {
    id: data.id,
    createdAt: data.created_at || new Date().toISOString(),
    name: data.name,
    imageUrl: data.image_url || undefined,
    spotifyId: data.spotify_id || undefined,
    description: data.description || undefined,
    tags: data.tags || undefined,
    top_tracks: data.top_tracks || undefined,
  };
};

// 7. 아티스트가 참여한 페스티벌 목록 (최근순)
export const getArtistRecentFestivals = async (
  artistId: string
): Promise<ArtistFestivalSummary[]> => {
  // UUID 형식이 아닌 경우 (예: mock 데이터의 숫자 ID) 빈 배열 반환
  if (!isValidUUID(artistId)) {
    console.warn(`Invalid UUID format for artistId: ${artistId}. Returning empty array.`);
    return [];
  }

  const { data, error } = await supabase
    .from("performances")
    .select(`
      festival_id,
      festivals (
        id,
        name,
        start_date,
        end_date,
        poster_url,
        place_name
      )
    `)
    .eq("artist_id", artistId);

  if (error) {
    // ⚡ 로그에서 실제 메시지를 볼 수 있도록 수정
    console.error("Error fetching artist festivals:", error.message, error.details);
    return [];
  }

  if (!data) return [];

  // 2. 중복 제거 (한 아티스트가 한 페스티벌에서 여러 번 공연할 수 있음)
  const byId = new Map<string, ArtistFestivalSummary>();
  
  data.forEach((item: any) => {
    const f = item.festivals;
    if (!f || byId.has(f.id)) return;

    byId.set(f.id, {
      id: f.id,
      name: f.name,
      startDate: f.start_date,
      endDate: f.end_date,
      location: f.place_name || undefined,
      posterUrl: f.poster_url || undefined,
    });
  });

  // 3. 최근순 정렬 (종료일 기준 내림차순)
  return Array.from(byId.values()).sort((a, b) => {
    return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
  });
};

// 6. 관심 페스티벌 저장/삭제
export const saveInterestedFestival = async (
  userId: string,
  festivalId: string,
  isHomeDisplay: boolean = true
) => {
  const { data, error } = await supabase
    .from("user_interested_festivals")
    .upsert(
      {
        user_id: userId,
        festival_id: festivalId,
        is_home_display: isHomeDisplay,
      },
      { onConflict: "user_id,festival_id" }
    )
    .select()
    .single();

  return { data, error };
};

export const removeInterestedFestival = async (
  userId: string,
  festivalId: string
) => {
  const { error } = await supabase
    .from("user_interested_festivals")
    .delete()
    .eq("user_id", userId)
    .eq("festival_id", festivalId);

  return { error };
};

// 7. 사용자의 관심 페스티벌 목록 가져오기
export const getInterestedFestivals = async (
  userId: string
): Promise<Festival[]> => {
  const { data, error } = await supabase
    .from("user_interested_festivals")
    .select(
      `
      festival_id,
      festivals (
        id,
        name,
        start_date,
        end_date,
        poster_url
      )
    `
    )
    .eq("user_id", userId);

  if (error || !data) {
    console.error("Error fetching interested festivals:", error);
    return [];
  }

  return data
    .map((item: any) => {
      const f = item.festivals;
      if (!f) return null;
      return {
        id: f.id,
        name: f.name,
        startDate: f.start_date,
        endDate: f.end_date,
        posterUrl: f.poster_url || undefined,
      } as Festival;
    })
    .filter((f: Festival | null): f is Festival => f !== null);
};

// 8. 특정 페스티벌이 관심 목록에 있는지 확인
export const isFestivalInterested = async (
  userId: string,
  festivalId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from("user_interested_festivals")
    .select("festival_id")
    .eq("user_id", userId)
    .eq("festival_id", festivalId)
    .single();

  if (error || !data) return false;
  return true;
};

// 9. 아티스트 팔로우 관리
export const followArtist = async (
  userId: string,
  artistId: string
): Promise<{ data: any; error: any }> => {
  const { data, error } = await supabase
    .from("user_followed_artists")
    .upsert(
      {
        user_id: userId,
        artist_id: artistId,
      },
      { onConflict: "user_id,artist_id" }
    )
    .select()
    .single();

  return { data, error };
};

export const unfollowArtist = async (
  userId: string,
  artistId: string
): Promise<{ error: any }> => {
  const { error } = await supabase
    .from("user_followed_artists")
    .delete()
    .eq("user_id", userId)
    .eq("artist_id", artistId);

  return { error };
};

export const isArtistFollowed = async (
  userId: string,
  artistId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from("user_followed_artists")
    .select("artist_id")
    .eq("user_id", userId)
    .eq("artist_id", artistId)
    .single();

  if (error || !data) return false;
  return true;
};

export const getArtistFollowerCount = async (
  artistId: string
): Promise<number> => {
  const { count, error } = await supabase
    .from("user_followed_artists")
    .select("*", { count: "exact", head: true })
    .eq("artist_id", artistId);

  if (error) {
    console.error("Error fetching follower count:", error);
    return 0;
  }

  return count || 0;
};

// 10. 사용자가 팔로우한 아티스트 목록 가져오기
export const getFollowedArtists = async (
  userId: string
): Promise<Artist[]> => {
  const { data, error } = await supabase
    .from("user_followed_artists")
    .select(
      `
      artist_id,
      artists (
        id,
        created_at,
        name,
        image_url
      )
    `
    )
    .eq("user_id", userId);

  if (error || !data) {
    console.error("Error fetching followed artists:", error);
    return [];
  }

  return data
    .map((item: any) => {
      const artist = item.artists;
      if (!artist) return null;
      return {
        id: artist.id,
        createdAt: artist.created_at || new Date().toISOString(),
        name: artist.name,
        imageUrl: artist.image_url || undefined,
      } as Artist;
    })
    .filter((a: Artist | null): a is Artist => a !== null);
};

// 11. 페스티벌 콘텐츠 가져오기 (ThisYear/Legacy용)
export const getFestivalContents = async (
  festivalId: string,
  type: "this_year" | "legacy" = "this_year"
): Promise<any[]> => {
  // ThisYear 카테고리: 라인업, 티켓, MD, 이벤트, 현장안내, 관련글
  // Legacy 카테고리: 라인업, MD, 후기글, Recap
  // 영문 카테고리도 지원: LINEUP, TICKET, MD, EVENT, GUIDE, RELATED
  const thisYearCategories = ["라인업", "티켓", "MD", "이벤트", "현장안내", "관련글", "LINEUP", "TICKET", "EVENT", "GUIDE", "RELATED"];
  const legacyCategories = ["라인업", "MD", "후기글", "Recap", "LINEUP", "REVIEW"];
  
  const categories = type === "this_year" ? thisYearCategories : legacyCategories;
  
  // 영문 카테고리를 한글로 매핑하는 함수
  const mapCategoryToKorean = (category: string): string => {
    const categoryMap: Record<string, string> = {
      "LINEUP": "라인업",
      "TICKET": "티켓",
      "EVENT": "이벤트",
      "GUIDE": "현장안내",
      "RELATED": "관련글",
      "REVIEW": "후기글",
    };
    return categoryMap[category] || category;
  };

  console.log(`[getFestivalContents] Fetching contents for festival: ${festivalId}, type: ${type}`);
  console.log(`[getFestivalContents] Categories filter:`, categories);

  // 먼저 해당 festival_id로 모든 데이터를 조회해보기 (디버깅용)
  const { data: allData, error: allError } = await supabase
    .from("festival_contents")
    .select("id, category, title, image_url, link_url, priority, festival_id")
    .eq("festival_id", festivalId);

  console.log(`[getFestivalContents] All contents for festival_id ${festivalId}:`, allData);
  console.log(`[getFestivalContents] Total contents (no category filter):`, allData?.length || 0);
  if (allData && allData.length > 0) {
    console.log(`[getFestivalContents] Actual category values in DB:`, allData.map((item: any) => ({
      id: item.id,
      category: item.category,
      categoryType: typeof item.category,
      categoryLength: item.category?.length,
      categoryCharCodes: item.category ? Array.from(item.category).map((c: string) => c.charCodeAt(0)) : null
    })));
  }
  if (allError) {
    console.error("[getFestivalContents] Error fetching all contents:", allError);
  }

  // 카테고리 필터 적용
  const { data, error } = await supabase
    .from("festival_contents")
    .select("id, category, title, image_url, link_url, priority")
    .eq("festival_id", festivalId)
    .in("category", categories)
    .order("priority", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("[getFestivalContents] Error fetching festival contents:", error);
    return [];
  }

  console.log(`[getFestivalContents] Raw data from DB (with category filter):`, data);
  console.log(`[getFestivalContents] Total items found:`, data?.length || 0);

  if (!data) return [];

  // ThisYear 형식으로 변환
  if (type === "this_year") {
    return data.map((item: any) => ({
      id: item.id,
      category: mapCategoryToKorean(item.category) as "라인업" | "티켓" | "MD" | "이벤트" | "현장안내" | "관련글",
      title: item.title,
      date: "", // DB에 date 필드가 없으면 빈 문자열
      linkUrl: item.link_url || "",
      imageUrl: item.image_url || undefined,
      isNew: false,
    }));
  }

  // Legacy 형식으로 변환
  return data.map((item: any) => ({
    id: item.id,
    category: mapCategoryToKorean(item.category) as "라인업" | "MD" | "후기글" | "Recap",
    title: item.title,
    year: "", // DB에 year 필드가 없으면 빈 문자열
    linkUrl: item.link_url || undefined,
    source: undefined,
    thumbnailUrl: item.image_url || undefined,
  }));
};

// 12. 셋리스트 트랙 ID 가져오기 (artist-festival 페이지용)
// - 테이블명이 setlists / setlist 등으로 다를 수 있어 fallback 지원
// - 컬럼 구조가 tracks(JSONB, [{spotify_id,...}]) 또는 track_ids(text[]/json) 등으로 다를 수 있어 방어적으로 파싱
export const getSetlistTrackIds = async (
  artistId: string,
  festivalId: string
): Promise<string[]> => {
  const tableCandidates = ["setlists", "setlist"] as const;

  for (const tableName of tableCandidates) {
    const { data, error } = await supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from(tableName as any)
      .select("*")
      .eq("artist_id", artistId)
      .eq("festival_id", festivalId)
      .maybeSingle();

    if (error) {
      const msg = (error as any)?.message || String(error);
      // 테이블이 없으면 다음 후보로 시도
      if (
        msg.includes("relation") &&
        msg.includes(tableName) &&
        msg.includes("does not exist")
      ) {
        continue;
      }
      console.error(
        `[getSetlistTrackIds] Error fetching setlist from ${tableName}:`,
        error
      );
      return [];
    }

    if (!data) return [];

    // 1) tracks: JSONB 배열 [{ spotify_id, order, title, ... }]
    // Supabase에서 JSONB는 자동으로 파싱되지만, 문자열로 올 수도 있음
    let tracks = (data as any).tracks;
    
    // JSONB가 문자열로 온 경우 파싱
    if (typeof tracks === "string") {
      try {
        tracks = JSON.parse(tracks);
      } catch (e) {
        console.error(`[getSetlistTrackIds] Failed to parse tracks JSONB string:`, e);
        continue; // 다음 테이블 후보로 시도
      }
    }
    
    // tracks가 배열인 경우 spotify_id 추출
    if (Array.isArray(tracks)) {
      return tracks
        .map((t: any) => t?.spotify_id || t?.spotifyId || t)
        .filter(Boolean);
    }

    // 2) track_ids: string[]
    if (Array.isArray((data as any).track_ids)) {
      return ((data as any).track_ids as any[]).filter(Boolean);
    }

    // 3) trackIds: string[] (camelCase로 들어온 경우)
    if (Array.isArray((data as any).trackIds)) {
      return ((data as any).trackIds as any[]).filter(Boolean);
    }

    // 4) track_ids가 string(JSON)로 들어온 경우
    if (typeof (data as any).track_ids === "string") {
      try {
        const parsed = JSON.parse((data as any).track_ids);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch {
        // ignore
      }
    }

    return [];
  }

  return [];
};

// 7. 검색 기록 관리
export const getRecentSearches = async (
  userId: string,
  limit: number = 5
): Promise<search_history[]> => {
  const { data, error } = await supabase
    .from("search_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent searches:", error);
    return [];
  }

  return (data || []) as search_history[];
};

export const saveSearchHistory = async (
  userId: string,
  query: string,
): Promise<void> => {
  const { error } = await supabase.from("search_history").insert({
    user_id: userId,
    query: query.trim(),
  });

  if (error) {
    console.error("Error saving search history:", error);
  }
};
