import { ChevronLeft, ChevronRight, Music } from "lucide-react";
import SpotifyEmbed from "@/components/SpotifyEmbed";

interface SongsSectionProps {
  trackIds?: string[];
}

export default function SongsSection({ trackIds }: SongsSectionProps) {
  const showScrollHint = (trackIds?.length ?? 0) > 1 || !trackIds || trackIds.length === 0;

  return (
    <section className="mb-5">
      <div className="flex items-center gap-2 mb-5">
        <Music className="w-5 h-5 text-blue-400" />
        <h2 className="text-xl font-bold">Songs</h2>
      </div>

      <div className="relative">
        {/* 모바일 스크롤 힌트 (좌우 그라데이션 + 화살표) */}
        {showScrollHint && (
          <>
            <div className="md:hidden pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-slate-950/90 to-transparent z-10 flex items-center justify-start">
              <ChevronLeft className="w-4 h-4 text-white/50 ml-1" />
            </div>
            <div className="md:hidden pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-slate-950/90 to-transparent z-10 flex items-center justify-end">
              <ChevronRight className="w-4 h-4 text-white/70 mr-2" />
            </div>
          </>
        )}

        <div className="flex gap-5 overflow-x-auto scrollbar-responsive pb-2 scroll-smooth -mx-4 px-4">
          {/* Spotify 트랙 임베드 */}
          {trackIds && trackIds.length > 0 ? (
            trackIds.map((trackId) => (
              <div
                key={trackId}
                className="flex-shrink-0 w-[calc(100vw-3rem)] md:w-[calc((100%-1rem)/2)] bg-[#161b29] border border-white/10 rounded-lg overflow-hidden"
                style={{ height: "152px" }}
              >
                <div className="group w-full h-[152px]">
                  <SpotifyEmbed type="track" id={trackId} />
                </div>
              </div>
            ))
          ) : (
            // 트랙이 없으면 목업 표시
            [1, 2, 3].map((index) => (
              <div
                key={index}
                className="flex-shrink-0 w-[160px] bg-[#161b29] border border-white/10 rounded-lg overflow-hidden"
              >
                <div className="aspect-square bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center">
                  <div className="text-center p-4">
                    <p className="text-xs text-gray-400 mb-2">대표곡</p>
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-xs text-gray-300 text-center line-clamp-2">
                    곡 제목
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

