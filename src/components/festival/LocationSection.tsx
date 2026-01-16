import { MapPin } from "lucide-react";
import FestivalMap from "@/components/festival/festivalMap";

interface LocationSectionProps {
  placeName: string;
  address: string;
  latitude: number;
  longitude: number;
}

export default function LocationSection({
  placeName,
  address,
  latitude,
  longitude,
}: LocationSectionProps) {
  // 카카오맵 검색 URL 생성 (검색어로 검색)
  const kakaoMapUrl = `https://map.kakao.com/link/search/${encodeURIComponent(
    address
  )}`;

  return (
    <div className="bg-[#161b29]/80 backdrop-blur-sm border border-white/10 rounded-lg p-3.5">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-4 h-4 text-blue-400" />
        <h2 className="text-base font-bold">오시는 길</h2>
      </div>
      <div className="space-y-1.5">
        <p className="font-semibold text-xs">{placeName}</p>
        <p className="text-gray-400 text-[10px]">{address}</p>
        <a
          href={kakaoMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-md overflow-hidden border border-white/10 mt-2 h-28 hover:border-blue-500/40 transition-colors cursor-pointer"
        >
          <FestivalMap lat={latitude} lng={longitude} placeName={placeName} />
        </a>
      </div>
    </div>
  );
}
