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
      className="group relative bg-[#161b29]/60 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-white/10 w-[calc((100%-1.25rem-2rem)/2)] md:w-[calc((100%-3.75rem)/4)] h-40 md:h-48 flex flex-col"
    >
      {/* 카드 상단: 이미지 영역 */}
      <div className="h-20 md:h-24 w-full relative overflow-hidden bg-slate-900">
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
            absolute top-1.5 right-1.5 md:top-2 md:right-2 px-1.5 py-0.5 md:px-2 rounded-full text-[10px] md:text-xs font-bold border backdrop-blur-md
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
      <div className="p-2 md:p-3 flex-1 flex flex-col justify-between">
        <div>
          <h2 className="text-xs md:text-sm font-bold mb-1 text-white line-clamp-2 break-words">
            {festival.name}
          </h2>
          <div className="space-y-0.5 md:space-y-1 text-[10px] md:text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5 md:w-3 md:h-3 text-blue-400" />
              <span className="line-clamp-1">
                {formatDate(festival.start_date)} ~ {formatDate(festival.end_date)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 md:w-3 md:h-3 text-purple-400" />
              <span className="line-clamp-1 truncate">{festival.place_name}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
