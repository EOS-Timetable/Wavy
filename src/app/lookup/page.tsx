import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, ArrowRight } from "lucide-react";

export const revalidate = 0; // 페이지를 캐싱하지 않고 매번 최신 데이터 로드 (실시간성)

export default async function LookupPage() {
  // 1. Supabase에서 페스티벌 목록 가져오기 (날짜순 정렬)
  const { data: festivals, error } = await supabase
    .from("festivals")
    .select("*")
    .order("start_date", { ascending: true });

  if (error) {
    console.error("Error fetching festivals:", error);
    return <div className="text-white p-10">데이터를 불러올 수 없습니다.</div>;
  }

  // 날짜 포맷팅 함수 (2025. 08. 01)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, "0")}. ${String(date.getDate()).padStart(2, "0")}`;
  };

  // D-Day 계산 함수
  const getDDay = (startDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const diff = start.getTime() - today.getTime();
    const dDay = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (dDay === 0) return "D-Day";
    if (dDay < 0) return "End";
    return `D-${dDay}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 pb-24">
      
      {/* --- [1] Header Area --- */}
      <div className="max-w-5xl mx-auto mb-10 mt-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
          Festival Lookup
        </h1>
        <p className="text-gray-400">
          Wavy와 함께 이번 시즌 가장 핫한 페스티벌을 찾아보세요.
        </p>
      </div>

      {/* --- [2] Grid List Area --- */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {festivals?.map((festival) => {
          const dDay = getDDay(festival.start_date);
          const isEnded = dDay === "End";

          return (
            <Link 
              key={festival.id} 
              href={`/festival/${festival.id}`}
              className={`
                group relative bg-[#161b29] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/20
                ${isEnded ? 'opacity-60 grayscale' : ''}
              `}
            >
              {/* 카드 상단: 이미지 영역 (이미지가 없으니 그라데이션 패턴으로 대체) */}
              <div className="h-40 w-full relative overflow-hidden bg-slate-900">
                {/* ✅ 배경 이미지 넣기 */}
                <Image
                    src="/images/festival-card-bg-lemon.jpeg" // 아까 저장한 이미지 경로 (public은 생략)
                    alt="Festival cover"
                    fill // 부모 div에 가득 차게 설정
                    className="object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300" // 평소엔 약간 어둡게, 마우스 올리면 밝게
                />
                {/* D-Day 배지 */}
                <div className={`
                  absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md
                  ${isEnded 
                    ? 'bg-gray-800/50 border-gray-600 text-gray-400' 
                    : 'bg-blue-600/30 border-blue-400/50 text-blue-200'}
                `}>
                  {dDay}
                </div>
              </div>

              {/* 카드 하단: 텍스트 정보 */}
              <div className="p-5">
                <h2 className="text-xl font-bold mb-3 truncate group-hover:text-blue-400 transition-colors">
                  {festival.name}
                </h2>
                
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{formatDate(festival.start_date)} ~ {formatDate(festival.end_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="truncate">{festival.place_name}</span>
                  </div>
                </div>

                {/* 바로가기 화살표 (Hover시 이동 효과) */}
                <div className="mt-6 flex justify-end">
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-500 group-hover:text-white transition-colors">
                    상세보기 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        {/* 데이터가 없을 경우 */}
        {(!festivals || festivals.length === 0) && (
          <div className="col-span-full py-20 text-center text-gray-500 bg-[#161b29] rounded-2xl border border-white/5">
            등록된 페스티벌이 없습니다.
          </div>
        )}

      </div>
    </div>
  );
}