import { supabase } from "@/lib/supabase";

// --- Types (DB ID는 UUID이므로 string으로 변경!) ---
export interface Artist {
  id: string;
  name: string;
  imageUrl?: string;
  spotifyId?: string;
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
  startTime: string; // ISO String
  endTime: string;   // ISO String
  artist: Artist;
  stage: Stage;
}

// --- Helper Functions (Async로 변경) ---

// 1. 페스티벌 정보 가져오기
export const getFestival = async (id: string) => {
  const { data, error } = await supabase
    .from("festivals")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;

  // DB의 snake_case -> UI의 camelCase 매핑
  return {
    ...data,
    startDate: data.start_date,
    endDate: data.end_date,
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
  }));
};

// 3. 날짜 목록 계산하기
export const getFestivalDates = async (festivalId: string): Promise<string[]> => {
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
  dateString: string
): Promise<PerformanceJoined[]> => {
  // 해당 날짜의 00:00 ~ 24:00+alpha 범위 설정
  // (새벽 4시 공연도 해당 날짜로 쳐주기 위해 넉넉하게 다음날 06:00까지 가져옵니다)
  const targetDate = new Date(dateString);
  const nextDate = new Date(targetDate);
  nextDate.setDate(nextDate.getDate() + 1);
  nextDate.setHours(6, 0, 0, 0); // 다음날 새벽 6시까지

  const startTimeStr = `${dateString}T00:00:00`;
  const endTimeStr = nextDate.toISOString();

  const { data, error } = await supabase
    .from("performances")
    .select(`
      id, start_time, end_time, stage_id,
      stage:stages ( id, name, color, festival_id ),
      artist:artists ( id, name, image_url )
    `)
    .eq("festival_id", festivalId)
    .gte("start_time", startTimeStr) // 시작 시간 >= 오늘 00:00
    .lt("start_time", endTimeStr)    // 시작 시간 < 다음날 06:00
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
    },
    stage: {
      id: p.stage.id,
      festivalId: p.stage.festival_id,
      name: p.stage.name,
      color: p.stage.color,
    },
  }));
};