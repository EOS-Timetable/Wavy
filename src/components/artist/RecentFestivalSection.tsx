import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";

interface MockFestival {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location?: string;
  posterUrl?: string;
}

interface RecentFestivalSectionProps {
  festivals: MockFestival[];
  formatDate: (dateString: string) => string;
  artistId: string;
}

export default function RecentFestivalSection({
  festivals,
  formatDate,
  artistId,
}: RecentFestivalSectionProps) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-5">
        <Calendar className="w-5 h-5 text-purple-400" />
        <h2 className="text-xl font-bold">Recent Festival</h2>
      </div>

      {festivals.length > 0 ? (
        <div className="flex flex-wrap justify-start gap-5">
          {festivals.map((festival) => (
            <Link
              key={festival.id}
              href={`/artist/${artistId}/festival/${festival.id}`}
              className="group relative bg-[#161b29]/60 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-white/10 w-[calc((100%-1.25rem-2rem)/2)] md:w-[calc((100%-3.75rem)/4)] h-40 md:h-48 flex flex-col"
            >
              {/* 카드 상단: 이미지 영역 */}
              <div className="h-20 md:h-24 w-full relative overflow-hidden bg-slate-900">
                {festival.posterUrl ? (
                  <Image
                    src={festival.posterUrl}
                    alt={festival.name}
                    fill
                    className="object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20" />
                )}
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
                        {formatDate(festival.startDate)} ~ {formatDate(festival.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 md:w-3 md:h-3 text-purple-400" />
                      <span className="line-clamp-1 truncate">{festival.location || "장소 정보 없음"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-[#161b29] border border-white/10 rounded-lg p-8 text-center text-gray-400">
          참여한 페스티벌이 없습니다.
        </div>
      )}
    </section>
  );
}
