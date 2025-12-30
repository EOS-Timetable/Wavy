// src/app/lookup/page.tsx

import { supabase } from "@/lib/supabase";
import FestivalMap from "@/components/festival/festivalMap";

// DB에서 가져올 데이터 타입 정의
interface FestivalData {
  id: string;
  name: string;
  place_name: string;
  latitude: number;
  longitude: number;
}

export default async function LookupPage() {
  // 1. Supabase에서 페스티벌 데이터 가져오기 (비동기)
  const { data: festivals, error } = await supabase
    .from("festivals")
    .select("id, name, place_name, latitude, longitude")
    .limit(1) // 테스트용으로 1개만 가져옴
    .single(); // 객체 1개만 반환하도록 설정

  if (error) {
    console.error("DB Error:", error);
    return <div>데이터를 불러오는데 실패했습니다.</div>;
  }

  if (!festivals) {
    return <div>등록된 페스티벌이 없습니다.</div>;
  }

  return (
    <div className="w-full min-h-screen bg-[#0a0e17] text-white p-5 pb-24">
      <h1 className="text-2xl font-bold mb-6">Festival Lookup</h1>
      
      <div className="bg-[#161b29] p-5 rounded-2xl border border-white/5">
        <h2 className="text-xl font-bold mb-2">{festivals.name}</h2>
        <p className="text-gray-400 text-sm mb-4">📍 {festivals.place_name}</p>
        
        {/* ✨ DB에서 가져온 좌표를 지도에 주입! */}
        <FestivalMap 
          lat={festivals.latitude} 
          lng={festivals.longitude} 
          placeName={festivals.place_name} 
        />
      </div>
    </div>
  );
}