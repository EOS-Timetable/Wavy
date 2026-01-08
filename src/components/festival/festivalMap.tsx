"use client";

import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";

interface FestivalMapProps {
  lat: number;
  lng: number;
  placeName?: string;
}

export default function FestivalMap({ lat, lng, placeName }: FestivalMapProps) {
  // 1. 여기서 스크립트를 직접 로드합니다. (layout.tsx 필요 없음)
  const [loading, error] = useKakaoLoader({
    appkey: "84fd5fe132fa446010b308f2687d6dc5", // 👈 여기에 발급받은 JS 키를 넣으세요!
    libraries: ["clusterer", "services"],
  });

  // 2. 좌표값이 없으면 에러 메시지
  if (!lat || !lng) return <div className="text-red-500">좌표 오류</div>;

  // 3. 로딩 중일 때 보여줄 UI (스켈레톤)
  if (loading)
    return (
      <div className="w-full h-[300px] bg-gray-200 animate-pulse rounded-xl" />
    );

  // 4. 로딩 실패 시 에러 메시지
  if (error)
    return <div className="text-red-500">지도 로드 실패: {error.message}</div>;

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-white/10 shadow-lg relative z-0">
      <Map
        center={{ lat, lng }}
        style={{ width: "100%", height: "100%" }}
        level={3}
      >
        <MapMarker position={{ lat, lng }}>
          {placeName && (
            <div
              style={{
                padding: "5px",
                color: "#000",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {placeName}
            </div>
          )}
        </MapMarker>
      </Map>
    </div>
  );
}
