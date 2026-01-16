import { Music } from "lucide-react";

interface SongsSectionProps {
  trackIds?: string[];
}

export default function SongsSection({ trackIds }: SongsSectionProps) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Music className="w-5 h-5 text-blue-400" />
        <h2 className="text-xl font-bold">Songs</h2>
      </div>

      <div className="relative">
        <div className="flex gap-4 overflow-x-auto scrollbar-responsive pb-2 scroll-smooth -mx-4 px-4">
          {/* Spotify 트랙 임베드 */}
          {trackIds && trackIds.length > 0 ? (
            trackIds.map((trackId) => (
              <div
                key={trackId}
                className="flex-shrink-0 w-[calc(100vw-3rem)] md:w-[calc((100%-1rem)/2)] bg-[#161b29] border border-white/10 rounded-lg overflow-hidden"
              >
                <iframe
                  src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="w-full"
                />
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

