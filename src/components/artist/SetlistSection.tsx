import { Music } from "lucide-react";

interface SetlistSectionProps {
  trackIds?: string[];
}

export default function SetlistSection({ trackIds }: SetlistSectionProps) {
  // 트랙 ID에서 실제 ID 추출 (URL 파라미터 제거)
  const cleanTrackId = (id: string) => {
    return id.split("?")[0].split("&")[0];
  };

  // 트랙 ID들을 콤마로 구분된 문자열로 변환
  const trackIdsString = trackIds
    ? trackIds.map((id) => cleanTrackId(id)).join(",")
    : "";

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Music className="w-5 h-5 text-blue-400" />
        <h2 className="text-xl font-bold">Setlist</h2>
      </div>

      {trackIds && trackIds.length > 0 ? (
        <div className="space-y-3">
          {trackIds.map((id, index) => {
            const cleanId = cleanTrackId(id);
            return (
              <div
                key={cleanId}
                className="bg-[#161b29]/80 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden"
                style={{ height: "152px" }}
              >
                <iframe
                  src={`https://open.spotify.com/embed/track/${cleanId}?utm_source=generator&theme=0&view=list`}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  style={{ height: "152px", display: "block" }}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#161b29] border border-white/10 rounded-lg p-8 text-center text-gray-400">
          셋리스트 정보가 없습니다.
        </div>
      )}
    </section>
  );
}
