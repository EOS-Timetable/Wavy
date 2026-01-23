import { createClient } from "@/lib/supabase";
import { getArtistById, getFestival, getSetlistTrackIds } from "@/utils/dataFetcher";
import ArtistHeader from "@/components/artist/ArtistHeader";
import ArtistImage from "@/components/artist/ArtistImage";
import FestivalInfo from "@/components/artist/FestivalInfo";
import SetlistSection from "@/components/artist/SetlistSection";
import PerformanceVideosSection from "@/components/artist/PerformanceVideosSection";

interface PageProps {
  params: Promise<{ id: string; festivalId: string }>;
}

const supabase = createClient();

export default async function ArtistFestivalPage({ params }: PageProps) {
  const { id: artistId, festivalId } = await params;

  const artist = await getArtistById(artistId);
  const festival = await getFestival(festivalId);

  if (!artist || !festival) {
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

  const performanceVideos = (
    (
      await supabase
        .from("performance_videos")
        .select("id, title, video_url, thumbnail_url")
        .eq("artist_id", artistId)
        .eq("festival_id", festivalId)
    ).data?.map((v: any) => ({
      id: v.id,
      title: v.title,
      videoUrl: v.video_url,
      thumbnailUrl: v.thumbnail_url,
    })) ?? []
  );

  const setlistTrackIds = await getSetlistTrackIds(artistId, festivalId);

  // 페스티벌 포스터 URL (페스티벌 ID에서 가져오기)
  const festivalPosterUrl =
    (festival as any).posterUrl ||
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      <ArtistHeader backHref={`/artist/${artistId}`} artistName={(artist as any).name} />
      <ArtistImage imageUrl={festivalPosterUrl} artistName={(festival as any).name} />
      <div className="max-w-2xl mx-auto px-4 -mt-20 relative z-10">
        <FestivalInfo
          festivalName={(festival as any).name}
          startDate={(festival as any).startDate}
          endDate={(festival as any).endDate}
          location={(festival as any).location || (festival as any).placeName || "장소 정보 없음"}
          formatDate={formatDate}
        />
        <SetlistSection trackIds={setlistTrackIds} />
        <PerformanceVideosSection videos={performanceVideos} />
      </div>
    </div>
  );
}
