import { getArtistById, getArtistRecentFestivals, getArtistFollowerCount, isArtistFollowed } from "@/utils/dataFetcher";
import { createClient } from "@/lib/supabase";
import ArtistHeader from "@/components/artist/ArtistHeader";
import ArtistImage from "@/components/artist/ArtistImage";
import ArtistInfoSection from "@/components/artist/ArtistInfoSection";
import SongsSection from "@/components/artist/SongsSection";
import RecentFestivalSection from "@/components/artist/RecentFestivalSection";

export const revalidate = 0; // 페이지를 캐싱하지 않고 매번 최신 데이터 로드

const supabase = createClient();

interface PageProps {
  params: Promise<{ id: string }>;
}

// UUID 형식 검증 함수
const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export default async function ArtistPage({ params }: PageProps) {
  const { id } = await params;

  console.log(`[ArtistPage] Loading artist with id: ${id}`);

  // UUID 형식이 아닌 경우 아티스트를 찾을 수 없음
  if (!isValidUUID(id)) {
    console.warn(`[ArtistPage] Invalid UUID format: ${id}`);
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>아티스트 정보를 찾을 수 없습니다. (ID 형식 오류)</p>
      </div>
    );
  }

  const artist = await getArtistById(id);
  console.log(`[ArtistPage] Artist data:`, artist ? JSON.stringify({
    id: artist.id,
    name: artist.name,
    imageUrl: artist.imageUrl,
    spotifyId: artist.spotifyId,
    description: artist.description,
    tags: artist.tags,
    top_tracks: artist.top_tracks,
  }, null, 2) : null);
  const festivals = await getArtistRecentFestivals(id);

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

  // 팔로우 수 및 팔로우 상태 가져오기
  const followerCount = await getArtistFollowerCount(id);
  
  // 현재 로그인한 사용자의 팔로우 상태 확인
  let initialIsFollowed = false;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      initialIsFollowed = await isArtistFollowed(user.id, id);
    }
  } catch (error) {
    console.error("Error checking follow status:", error);
  }

  // 아티스트 이미지 URL (DB에서 가져온 값 사용 + 빈 문자열/프로토콜 정규화)
  const normalizeImageUrl = (url?: string | null) => {
    if (!url) return undefined;
    const trimmed = String(url).trim();
    if (!trimmed) return undefined;
    if (trimmed.startsWith("http://")) return `https://${trimmed.slice("http://".length)}`;
    return trimmed;
  };

  // DB에서 가져온 이미지 URL 사용 (없으면 기본 이미지)
  const artistImageUrl =
    normalizeImageUrl(artist.imageUrl) ||
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      <ArtistHeader artistName={(artist as any).name} />
      <ArtistImage imageUrl={artistImageUrl} artistName={(artist as any).name} />
      <div className="max-w-2xl mx-auto px-4 -mt-20 relative z-10">
        <ArtistInfoSection
          artistId={id}
          artistName={artist.name}
          initialFollowerCount={followerCount}
          initialIsFollowed={initialIsFollowed}
          description={artist.description}
          tags={artist.tags}
        />
        <SongsSection trackIds={artist.top_tracks || []} />
        <RecentFestivalSection
          festivals={festivals}
          formatDate={formatDate}
          artistId={id}
        />
      </div>
    </div>
  );
}
