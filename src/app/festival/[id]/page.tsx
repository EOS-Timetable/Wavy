import { supabase } from "@/lib/supabase";
import { Calendar, MapPin, Ticket, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import FestivalMap from "@/components/festival/festivalMap";

interface PageProps {
  params: Promise<{ id: string }>;
}

// 1. 서버 컴포넌트: DB에서 직접 데이터를 가져옵니다.
export default async function FestivalDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Supabase에서 페스티벌 정보 조회
  const { data: festival, error } = await supabase
    .from("festivals")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !festival) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>페스티벌 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  // 날짜 포맷팅 (YYYY.MM.DD)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, "0")}. ${String(date.getDate()).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      {/* --- [1. Hero Section] 그라데이션 배경과 타이틀 --- */}
      <div className="relative w-full h-[40vh] min-h-[300px] flex flex-col justify-end p-6 overflow-hidden">
        {/* 배경 효과 (추후 실제 포스터 이미지로 교체 가능) */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-slate-950/80 to-slate-950 z-0" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 blur-sm z-[-1]" />

        <div className="relative z-10 max-w-2xl mx-auto w-full">
          <span className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-bold mb-3 backdrop-blur-md">
            Upcoming Festival
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            {festival.name}
          </h1>
          <div className="flex items-center text-gray-300 text-sm md:text-base gap-2 mt-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>
              {formatDate(festival.start_date)} ~ {formatDate(festival.end_date)}
            </span>
          </div>
        </div>
      </div>

      {/* --- [2. Action Buttons] 핵심 기능 바로가기 --- */}
      <div className="max-w-2xl mx-auto px-6 -mt-6 relative z-20">
        <Link 
          href={`/festival/${id}/timetable`}
          className="group w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white p-5 rounded-2xl shadow-lg shadow-blue-900/30 flex items-center justify-between transition-all transform hover:scale-[1.02]"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-lg">타임테이블 보기</span>
              <span className="text-blue-100 text-xs font-light">나만의 스케줄을 확인하세요</span>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-white/50 group-hover:text-white transition-colors" />
        </Link>
      </div>

      {/* --- [3. Info & Map Section] 상세 정보 --- */}
      <div className="max-w-2xl mx-auto px-6 mt-10 space-y-8">
        
        {/* 장소 정보 */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold">오시는 길</h2>
          </div>
          
          <div className="bg-[#161b29] border border-white/5 rounded-2xl overflow-hidden p-5 shadow-xl">
            <p className="font-bold text-lg mb-1">{festival.place_name}</p>
            <p className="text-gray-400 text-sm mb-4">{festival.address}</p>
            
            {/* 🗺️ 아까 만든 지도 컴포넌트 재사용! */}
            <div className="rounded-xl overflow-hidden border border-white/10">
              <FestivalMap 
                lat={festival.latitude} 
                lng={festival.longitude} 
                placeName={festival.place_name} 
              />
            </div>
          </div>
        </section>

        {/* 티켓 정보 (더미 데이터 예시) */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Ticket className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-bold">티켓 정보</h2>
          </div>
          <div className="bg-[#161b29] border border-white/5 rounded-2xl p-5 text-sm text-gray-400 leading-relaxed">
            현재 예매가 진행 중입니다. 공식 예매처를 통해 티켓을 구매하실 수 있습니다.<br/>
            현장 수령 및 모바일 티켓 입장이 가능합니다.
          </div>
        </section>

      </div>
    </div>
  );
}