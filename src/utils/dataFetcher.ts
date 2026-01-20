import { supabase } from "@/lib/supabase";

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
  name: string;
  imageUrl?: string;
  spotifyId?: string;
  description?: string;
  tags?: string[];
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
}

export interface festival_contents {
  id: string;
  festival_id: string;
  category: string;
  title: string;
  image_url: string;
  link_url: string;
  priority: number;
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
  device_id: string;
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

// --- Helper Functions (Async로 변경) ---

// 1. 페스티벌 정보 가져오기
export const getFestival = async (id: string): Promise<Festival | null> => {
  const { data, error } = await supabase
    .from("festivals")
    // 스키마 변경(컬럼 추가/삭제)에 안전하도록 *로 조회하고, 필요한 필드만 매핑합니다.
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;

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

// 2. 스테이지 목록 가져오기
export const getStages = async (festivalId: string): Promise<Stage[]> => {
  const { data, error } = await supabase
    .from("stages")
    .select("*")
    .eq("festival_id", festivalId)
    .order("position", { ascending: true });

  if (error || !data) return [];

  return data.map((item) => ({
    id: item.id,
    festivalId: item.festival_id,
    name: item.name,
    color: item.color,
    position: item.position ?? undefined,
  }));
};

// 3. 날짜 목록 계산하기
export const getFestivalDates = async (
  festivalId: string
): Promise<string[]> => {
  const festival = await getFestival(festivalId);
  if (!festival) return [];

  const start = new Date(festival.startDate);
  const end = new Date(festival.endDate);
  const dates: string[] = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
  }

  return dates;
};

// 4. 특정 날짜의 공연 데이터 가져오기 (핵심 조인)
export const getPerformancesByDay = async (
  festivalId: string,
  dayNumber: number
): Promise<PerformanceJoined[]> => {
  const { data, error } = await supabase
    .from("performances")
    .select(
      `
      *,
      stage:stages ( * ),
      artist:artists ( * )
    `
    )
    .eq("festival_id", festivalId)
    .eq("day_number", dayNumber) // ✅ 핵심: DB에 적힌 '일차'로만 가져옴 (시간 계산 X)
    .order("start_time");

  if (error || !data) {
    console.error("Error fetching performances:", error);
    return [];
  }

  // 데이터 매핑
  return data.map((p: any) => ({
    id: p.id,
    stageId: p.stage_id,
    startTime: p.start_time,
    endTime: p.end_time,
    artist: {
      id: p.artist.id,
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
    dayNumber: p.day_number,
  }));
};

// 5. 페스티벌의 모든 아티스트 라인업 가져오기 (중복 제거)
export const getFestivalArtists = async (
  festivalId: string
): Promise<Artist[]> => {
  const { data, error } = await supabase
    .from("performances")
    .select(
      `
      artist:artists ( id, name, image_url, spotify_id )
    `
    )
    .eq("festival_id", festivalId);

  if (error || !data) {
    console.error("Error fetching artists:", error);
    return [];
  }

  // 중복 제거 (같은 아티스트가 여러 날 공연할 수 있음)
  const uniqueArtists = new Map<string, Artist>();

  data.forEach((p: any) => {
    if (p.artist && !uniqueArtists.has(p.artist.id)) {
      uniqueArtists.set(p.artist.id, {
        id: p.artist.id,
        name: p.artist.name,
        imageUrl: p.artist.image_url,
        spotifyId: p.artist.spotify_id || undefined,
      });
    }
  });

  return Array.from(uniqueArtists.values());
};

// 6. 아티스트 정보 가져오기
export const getArtistById = async (id: string): Promise<Artist | null> => {
  const { data, error } = await supabase
    .from("artists")
    .select("id, name, image_url, spotify_id, description, tags")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    imageUrl: data.image_url || undefined,
    spotifyId: data.spotify_id || undefined,
    description: data.description || undefined,
    tags: data.tags || undefined,
  };
};

// 7. 아티스트가 참여한 페스티벌 목록 (최근순)
export const getArtistRecentFestivals = async (
  artistId: string
): Promise<ArtistFestivalSummary[]> => {
  // festivals -> performances(FK: performances.festival_id) 역방향 inner join
  const { data, error } = await supabase
    .from("festivals")
    .select(
      `
      id,
      name,
      start_date,
      end_date,
      poster_url,
      place_name,
      performances!inner(artist_id)
    `
    )
    .eq("performances.artist_id", artistId);

  if (error || !data) {
    let raw: string | undefined;
    try {
      raw = JSON.stringify(error);
    } catch {
      raw = String(error);
    }

    console.error("Error fetching artist festivals:", {
      message: (error as any)?.message,
      details: (error as any)?.details,
      hint: (error as any)?.hint,
      code: (error as any)?.code,
      raw,
    });
    return [];
  }

  const byId = new Map<string, ArtistFestivalSummary>();
  (data as any[]).forEach((f: any) => {
    if (!f?.id || byId.has(f.id)) return;
    byId.set(f.id, {
      id: f.id,
      name: f.name,
      startDate: f.start_date,
      endDate: f.end_date,
      location: f.place_name || undefined,
      posterUrl: f.poster_url || undefined,
    });
  });

  // 최근순: 종료일 기준 내림차순
  return Array.from(byId.values()).sort((a, b) => {
    const ea = new Date(a.endDate).getTime();
    const eb = new Date(b.endDate).getTime();
    return eb - ea;
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
    .filter((f): f is Festival => f !== null);
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

// 7. 검색 기록 관리
export const getRecentSearches = async (
  deviceId: string,
  limit: number = 5
): Promise<search_history[]> => {
  const { data, error } = await supabase
    .from("search_history")
    .select("*")
    .eq("device_id", deviceId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching recent searches:", error);
    return [];
  }

  return (data || []) as search_history[];
};

export const saveSearchHistory = async (
  deviceId: string,
  query: string,
  userId?: string | null
): Promise<void> => {
  const { error } = await supabase.from("search_history").insert({
    device_id: deviceId,
    user_id: userId || null,
    query: query.trim(),
  });

  if (error) {
    console.error("Error saving search history:", error);
  }
};
