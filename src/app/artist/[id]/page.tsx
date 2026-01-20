import { getArtistById, getArtistRecentFestivals } from "@/utils/dataFetcher";
import { USE_MOCK_DATA } from "@/config/dataMode";
import { getMockArtist, getMockArtistFestivals } from "@/utils/mockDataFetcher";
import ArtistHeader from "@/components/artist/ArtistHeader";
import ArtistImage from "@/components/artist/ArtistImage";
import ArtistInfoSection from "@/components/artist/ArtistInfoSection";
import SongsSection from "@/components/artist/SongsSection";
import RecentFestivalSection from "@/components/artist/RecentFestivalSection";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ArtistPage({ params }: PageProps) {
  const { id } = await params;

  const artist = USE_MOCK_DATA ? getMockArtist(id) : await getArtistById(id);
  const festivals = USE_MOCK_DATA
    ? getMockArtistFestivals(id).map((f) => ({
        id: String(f.id),
        name: f.name,
        startDate: f.startDate,
        endDate: f.endDate,
        location: f.location,
        posterUrl: f.posterUrl,
      }))
    : await getArtistRecentFestivals(id);

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

  // TODO: followerCount는 추후 DB 컬럼/집계 생기면 교체
  const followerCount = 0;

  // 아티스트 이미지 URL (응답값을 최대한 사용 + 빈 문자열/프로토콜 정규화)
  const normalizeImageUrl = (url?: string | null) => {
    if (!url) return undefined;
    const trimmed = String(url).trim();
    if (!trimmed) return undefined;
    if (trimmed.startsWith("http://")) return `https://${trimmed.slice("http://".length)}`;
    return trimmed;
  };

  const artistImageUrl =
    normalizeImageUrl((artist as any).imageUrl) ||
    "https://i.namu.wiki/i/ZfxxSn5nUPydUyntYJaCiAXgSPNpn6djNmUWgqvvEMcLRjimB12OA4PgqTg45idTHqa3T_WEN_u6AV3K4gnCQCKBf6wCluLnCkEhJpTpsMhiKp44pPlqx7Lhi97zfDDzj_A2W-KaoQ6pDeL7Q1350g.webp";

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      <ArtistHeader artistName={(artist as any).name} />
      <ArtistImage imageUrl={artistImageUrl} artistName={(artist as any).name} />
      <div className="max-w-2xl mx-auto px-4 -mt-20 relative z-10">
        <ArtistInfoSection
          artistName={(artist as any).name}
          followerCount={followerCount}
          description={(artist as any).description}
          tags={(artist as any).tags}
        />
        <SongsSection trackIds={(artist as any).trackIds || []} />
        <RecentFestivalSection
          festivals={festivals}
          formatDate={formatDate}
          artistId={id}
        />
      </div>
    </div>
  );
}
