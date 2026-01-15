import { supabase } from "@/lib/supabase";

export interface MyTimetable {
  id: string;
  festival_id: string;
  festival_name: string;
  title: string;
  device_id: string;
  selected_ids: string[]; // DB에서는 jsonb지만 여기선 string[]으로 받음
  created_at: string;
  updated_at: string;
  position: number;
  festival_date: string;
}

// 저장하기 (Upsert)
export const saveMyTimetable = async (
  festivalId: string,
  festivalName: string,
  title: string,
  deviceId: string,
  selectedIds: string[]
) => {
  const { data, error } = await supabase
    .from("my_timetables")
    .upsert(
      {
        device_id: deviceId,
        festival_id: festivalId,
        festival_name: festivalName,
        title: title,
        selected_ids: selectedIds,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "device_id, festival_id, title" } // 아까 만든 유니크 인덱스 기준
    )
    .select();

  return { data, error };
};

// ID를 기준으로 확실하게 수정하기 (이름 변경 시 사용)
export const updateMyTimetableById = async (
  id: string,          // DB의 고유 ID (PK)
  newTitle: string,    // 바꿀 이름
  selectedIds: string[] // 바꿀 내용
) => {
  const { data, error } = await supabase
    .from("my_timetables")
    .update({
      title: newTitle,
      selected_ids: selectedIds,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id) // ⚡ 여기가 핵심: ID가 일치하는 녀석만 수정함
    .select();

  return { data, error };
};

// 목록 불러오기
export const getMyTimetables = async (deviceId: string) => {
  const { data, error } = await supabase
    .from("my_timetables")
    .select("*")
    .eq("device_id", deviceId)
    .order("position", { ascending: true })
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching my timetables:", error);
    return [];
  }
  return data as MyTimetable[];
};

// [신규] 순서 일괄 업데이트
export const updateTimetableOrder = async (updates: MyTimetable[]) => {
  const { error } = await supabase
    .from("my_timetables")
    .upsert(updates, { onConflict: 'id' }); // ID가 같으면 덮어쓰기

  if (error) console.error("Order update failed:", error);
  return { error };
};

export const deleteMyTimetable = async (id: string) => {
  const { error } = await supabase
    .from("my_timetables")
    .delete()
    .eq("id", id);

  return { error };
};