"use client";

import {
  getMockArtist,
  getMockFestival,
  getMockArtistFestivalPerformance,
  getMockArtistFestivalVideos,
  getMockArtistFestivalSetlist,
} from "@/utils/mockDataFetcher";
import { useParams } from "next/navigation";
import ArtistHeader from "@/components/artist/ArtistHeader";
import ArtistImage from "@/components/artist/ArtistImage";
import FestivalInfo from "@/components/artist/FestivalInfo";
import SetlistSection from "@/components/artist/SetlistSection";
import PerformanceVideosSection from "@/components/artist/PerformanceVideosSection";

export default function ArtistFestivalPage() {
  const params = useParams();
  const artistId = params.id as string;
  const festivalId = params.festivalId as string;

  const artist = getMockArtist(artistId);
  const festival = getMockFestival(festivalId);
  const performance = getMockArtistFestivalPerformance(artistId, festivalId);

  if (!artist || !festival || !performance) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}. ${String(date.getDate()).padStart(2, "0")}`;
  };

  // 공연 영상 가져오기
  const performanceVideos = getMockArtistFestivalVideos(artistId, festivalId);

  // 페스티벌별 셋리스트 가져오기 (없으면 아티스트의 기본 trackIds 사용)
  const setlist = getMockArtistFestivalSetlist(artistId, festivalId);
  const setlistTrackIds = setlist?.trackIds || artist.trackIds;

  // 페스티벌 포스터 URL (페스티벌 ID에서 가져오기)
  const festivalPosterUrl =
    festival.posterUrl ||
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      <ArtistHeader backHref={`/artist/${artistId}`} artistName={artist.name} />
      <ArtistImage imageUrl={festivalPosterUrl} artistName={festival.name} />
      <div className="max-w-2xl mx-auto px-4 -mt-20 relative z-10">
        <FestivalInfo
          festivalName={festival.name}
          startDate={festival.startDate}
          endDate={festival.endDate}
          location={festival.location}
          formatDate={formatDate}
        />
        <SetlistSection trackIds={setlistTrackIds} />
        <PerformanceVideosSection videos={performanceVideos} />
      </div>
    </div>
  );
}
