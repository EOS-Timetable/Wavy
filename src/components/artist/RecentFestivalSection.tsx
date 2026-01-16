import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";

interface MockFestival {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  posterUrl: string;
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
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-purple-400" />
        <h2 className="text-xl font-bold">Recent Festival</h2>
      </div>

      {festivals.length > 0 ? (
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto scrollbar-responsive pb-2 scroll-smooth -mx-4 px-4">
            {festivals.map((festival) => (
              <Link
                key={festival.id}
                href={`/artist/${artistId}/festival/${festival.id}`}
                className="group relative flex-shrink-0 w-[calc(100vw-3rem)] md:w-[calc((100%-1rem)/2)] bg-[#161b29]/80 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-white/10"
              >
                {/* 카드 상단: 이미지 영역 */}
                <div className="h-40 w-full relative overflow-hidden bg-slate-900">
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
                <div className="p-5">
                  <h2 className="text-xl font-bold mb-3 text-white line-clamp-2 break-words">
                    {festival.name}
                  </h2>

                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      <span>
                        {formatDate(festival.startDate)} ~{" "}
                        {formatDate(festival.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-400" />
                      <span className="truncate">{festival.location}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-[#161b29] border border-white/10 rounded-lg p-8 text-center text-gray-400">
          참여한 페스티벌이 없습니다.
        </div>
      )}
    </section>
  );
}
