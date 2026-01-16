import { Music } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Artist } from "@/utils/dataFetcher";

interface LineupSectionProps {
  artists: Artist[];
}

export default function LineupSection({ artists }: LineupSectionProps) {
  if (artists.length === 0) return null;

  return (
    <div className="bg-[#161b29]/80 backdrop-blur-sm border border-white/10 rounded-lg p-3.5">
      <div className="flex items-center gap-2 mb-2.5">
        <Music className="w-4 h-4 text-blue-400" />
        <h2 className="text-base font-bold">Lineup</h2>
      </div>

      {/* 아티스트 프로필 리스트 (5개만 보이고 나머지는 스크롤) */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2.5 w-max">
          {artists.map((artist) => (
            <div
              key={artist.id}
              className="flex flex-col items-center gap-1.5 flex-shrink-0"
              style={{ width: "70px" }}
            >
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src={artist.imageUrl || "https://github.com/shadcn.png"}
                  alt={artist.name}
                />
                <AvatarFallback className="bg-slate-700 text-white text-xs">
                  {artist.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-[10px] font-medium text-gray-300 text-center line-clamp-2 w-full">
                {artist.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

