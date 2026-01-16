import { Video } from "lucide-react";
import Image from "next/image";

interface PerformanceVideo {
  id: number;
  title: string;
  thumbnailUrl?: string;
  videoUrl: string;
}

interface PerformanceVideosSectionProps {
  videos: PerformanceVideo[];
}

// YouTube URL에서 video ID 추출
const getYouTubeVideoId = (url: string): string | null => {
  // youtu.be 형식: https://youtu.be/xCcm_r50N3k?si=...
  const youtuBeMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (youtuBeMatch) {
    return youtuBeMatch[1];
  }

  // youtube.com/watch?v= 형식: https://www.youtube.com/watch?v=xCcm_r50N3k
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) {
    return watchMatch[1];
  }

  return null;
};

// YouTube video ID로 썸네일 URL 생성
const getYouTubeThumbnail = (videoId: string): string => {
  // maxresdefault: 최고 품질 (1280x720), 없으면 hqdefault로 fallback
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

export default function PerformanceVideosSection({
  videos,
}: PerformanceVideosSectionProps) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Video className="w-5 h-5 text-purple-400" />
        <h2 className="text-xl font-bold">Performance Videos</h2>
      </div>
      {videos.length > 0 ? (
        <div className="space-y-3">
          {videos.map((video) => {
            const videoId = getYouTubeVideoId(video.videoUrl);
            const thumbnailUrl =
              video.thumbnailUrl ||
              (videoId ? getYouTubeThumbnail(videoId) : null);

            return (
              <a
                key={video.id}
                href={video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-[#161b29]/80 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-all group"
              >
                <div className="flex items-center gap-4 p-3">
                  {/* 썸네일 */}
                  <div className="w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500/20 to-blue-500/20 relative">
                    {thumbnailUrl ? (
                      <Image
                        src={thumbnailUrl}
                        alt={video.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    {/* 재생 버튼 오버레이 */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white ml-0.5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  {/* 제목 */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white group-hover:text-purple-300 transition-colors truncate">
                      {video.title}
                    </h3>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#161b29] border border-white/10 rounded-lg p-8 text-center text-gray-400">
          공연 영상이 없습니다.
        </div>
      )}
    </section>
  );
}
