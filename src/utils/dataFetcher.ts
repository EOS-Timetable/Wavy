import { createClient } from "@/lib/supabase";

const supabase = createClient();

// --- Types ---
export interface Artist {
  id: string;
  name: string;
  imageUrl?: string;
  spotifyId?: string;
  description?: string;
  tags?: string[];
}

export interface Festival {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  posterUrl?: string;
  placeName: string;
  address?: string;
  latitude: number;
  longitude: number;
  bookingInfo?: any[];
  officialLinks?: any;
  saveCount?: number;
}

export interface Stage {
  id: string;
  festivalId: string;
  name: string;
  color: string;
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

// --- Fetcher Functions ---

// 1. 페스티벌 정보 조회
export const getFestival = async (id: string): Promise<Festival | null> => {
  const { data, error } = await supabase
    .from("festivals")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  return {
    ...data,
    startDate: data.start_date,
    endDate: data.end_date,
    posterUrl: data.poster_url,
    placeName: data.place_name,
    bookingInfo: data.booking_info,
    officialLinks: data.official_links,
    saveCount: data.save_count,
  };
};

// 2. 전체 라인업 조회 (중복 제거)
export const getFestivalArtists = async (festivalId: string): Promise<Artist[]> => {
  const { data, error } = await supabase
    .from("performances")
    .select(`
      artist:artists ( id, name, image_url, description, tags, spotify_id )
    `)
    .eq("festival_id", festivalId);

  if (error || !data) return [];

  const artistsMap = new Map();
  data.forEach((p: any) => {
    if (p.artist) {
      artistsMap.set(p.artist.id, {
        id: p.artist.id,
        name: p.artist.name,
        imageUrl: p.artist.image_url,
        description: p.artist.description,
        tags: p.artist.tags,
        spotifyId: p.artist.spotify_id,
      });
    }
  });

  return Array.from(artistsMap.values());
};

// 3. 스테이지 목록 조회
export const getStages = async (festivalId: string): Promise<Stage[]> => {
  const { data, error } = await supabase
    .from("stages")
    .select("*")
    .eq("festival_id", festivalId)
    .order("position");

  if (error || !data) return [];

  return data.map((s: any) => ({
    id: s.id,
    festivalId: s.festival_id,
    name: s.name,
    color: s.color,
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
    id: p.id,
    stageId: p.stage_id,
    startTime: p.start_time,
    endTime: p.end_time,
    dayNumber: p.day_number,
    artist: {
      id: p.artist.id,
      name: p.artist.name,
      imageUrl: p.artist.image_url,
      description: p.artist.description,
      tags: p.artist.tags,
      spotifyId: p.artist.spotify_id,
    },
    stage: {
      id: p.stage.id,
      festivalId: p.stage.festival_id,
      name: p.stage.name,
      color: p.stage.color,
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

// 6. 페스티벌 날짜 배열 생성
export const getFestivalDates = async (festivalId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from("festivals")
    .select("start_date, end_date")
    .eq("id", festivalId)
    .single();

  if (error || !data) return [];

  const start = new Date(data.start_date);
  const end = new Date(data.end_date);
  const dates: string[] = [];

  const current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
};