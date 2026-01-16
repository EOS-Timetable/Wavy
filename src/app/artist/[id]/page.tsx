"use client";

import { getMockArtist, getMockArtistFestivals } from "@/utils/mockDataFetcher";
import { useParams } from "next/navigation";
import ArtistHeader from "@/components/artist/ArtistHeader";
import ArtistImage from "@/components/artist/ArtistImage";
import ArtistInfo from "@/components/artist/ArtistInfo";
import SongsSection from "@/components/artist/SongsSection";
import RecentFestivalSection from "@/components/artist/RecentFestivalSection";

export default function ArtistPage() {
  const params = useParams();
  const id = params.id as string;

  const artist = getMockArtist(id);
  const festivals = getMockArtistFestivals(id);

  if (!artist) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>아티스트 정보를 찾을 수 없습니다.</p>
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

  // 목업 팔로워 수 (실제로는 DB에서 가져와야 함)
  const followerCount = 11231;

  // 아티스트 이미지 URL (목업 데이터가 비어있으면 더미 이미지)
  const artistImageUrl =
    artist.imageUrl ||
    "https://i.namu.wiki/i/ZfxxSn5nUPydUyntYJaCiAXgSPNpn6djNmUWgqvvEMcLRjimB12OA4PgqTg45idTHqa3T_WEN_u6AV3K4gnCQCKBf6wCluLnCkEhJpTpsMhiKp44pPlqx7Lhi97zfDDzj_A2W-KaoQ6pDeL7Q1350g.webp";

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      <ArtistHeader />
      <ArtistImage imageUrl={artistImageUrl} artistName={artist.name} />
      <div className="max-w-2xl mx-auto px-4 -mt-20 relative z-10">
        <ArtistInfo artistName={artist.name} followerCount={followerCount} />
        <SongsSection trackIds={artist.trackIds} />
        <RecentFestivalSection
          festivals={festivals}
          formatDate={formatDate}
          artistId={id}
        />
      </div>
    </div>
  );
}
