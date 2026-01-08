import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, ArrowRight } from "lucide-react";

interface Festival {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  place_name: string;
  poster_url?: string;
}

interface FestivalCardProps {
  festival: Festival;
  formatDate: (dateString: string) => string;
  getDDay: (startDate: string) => string;
}

export default function FestivalCard({
  festival,
  formatDate,
  getDDay,
}: FestivalCardProps) {
  const dDay = getDDay(festival.start_date);
  const isEnded = dDay === "End";

  return (
    <Link
      href={`/festival/${festival.id}`}
      className="group relative bg-[#161b29]/80 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-white/10"
    >
      {/* 카드 상단: 이미지 영역 */}
      <div className="h-40 w-full relative overflow-hidden bg-slate-900">
        {festival.poster_url ? (
          <Image
            src={festival.poster_url}
            alt={festival.name}
            fill
            className="object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20" />
        )}
        {/* D-Day 배지 */}
        <div
          className={`
            absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md
            ${
              isEnded
                ? "bg-gray-800/50 border-gray-600 text-gray-400"
                : "bg-purple-600/30 border-purple-400/50 text-purple-200"
            }
          `}
        >
          {dDay}
        </div>
      </div>

      {/* 카드 하단: 텍스트 정보 */}
      <div className="p-5">
        <h2 className="text-xl font-bold mb-3 text-white line-clamp-2 break-words">
          {festival.name}
        </h2>

        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>
              {formatDate(festival.start_date)} ~{" "}
              {formatDate(festival.end_date)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-purple-400" />
            <span className="truncate">{festival.place_name}</span>
          </div>
        </div>

        {/* 바로가기 화살표 */}
        <div className="mt-6 flex justify-end">
          <div className="flex items-center gap-1 text-sm font-medium text-gray-500">
            상세보기{" "}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
