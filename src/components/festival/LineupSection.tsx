"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Music, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Artist } from "@/utils/dataFetcher";
import { createPortal } from "react-dom";

interface LineupSectionProps {
  artists: Artist[];
}

export default function LineupSection({ artists }: LineupSectionProps) {
  if (artists.length === 0) return null;

  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleArtistClick = (artist: Artist) => {
    // DB에서 가져온 UUID를 사용하여 아티스트 페이지로 이동
    router.push(`/artist/${artist.id}`);
  };

  const sortedArtists = useMemo(() => {
    // 이름 기준 정렬(선택): UI에서 찾기 쉬움
    return [...artists].sort((a, b) => a.name.localeCompare(b.name));
  }, [artists]);

  return (
    <div className="bg-[#161b29]/80 backdrop-blur-sm border border-white/10 rounded-lg p-3.5">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-blue-400" />
          <h2 className="text-base font-bold">Lineup</h2>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-0.5 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
        >
          전체보기
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
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

      {/* 전체보기 모달 */}
      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setIsOpen(false);
            }}
          >
            <div className="w-full max-w-2xl bg-[#0b0f1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-blue-400" />
                  <h3 className="text-base font-bold text-white">Lineup</h3>
                  <span className="text-xs text-gray-400">
                    {sortedArtists.length}팀
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors"
                  aria-label="닫기"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto p-4">
                <div className="grid grid-cols-4 gap-3">
                  {sortedArtists.map((artist) => (
                    <button
                      key={artist.id}
                      type="button"
                      onClick={() => handleArtistClick(artist)}
                      className="group flex flex-col items-center gap-2 rounded-xl p-2 hover:bg-white/5 transition-colors"
                    >
                      <Avatar className="w-14 h-14 ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
                        <AvatarImage
                          src={artist.imageUrl || "https://github.com/shadcn.png"}
                          alt={artist.name}
                        />
                        <AvatarFallback className="bg-slate-700 text-white text-xs">
                          {artist.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-semibold text-gray-200 text-center line-clamp-2 w-full">
                        {artist.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

