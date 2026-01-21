import { getFestival, getFestivalArtists } from "@/utils/dataFetcher";
import FestivalPoster from "@/components/festival/FestivalPoster";
import FestivalHeader from "@/components/festival/FestivalHeader";
import LineupSection from "@/components/festival/LineupSection";
import LocationSection from "@/components/festival/LocationSection";
import TicketInfoSection from "@/components/festival/TicketInfoSection";
import TimetableButton from "@/components/festival/TimetableButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

// 1. 서버 컴포넌트: DB에서 직접 데이터를 가져옵니다.
export default async function FestivalDetailPage({ params }: PageProps) {
  const { id } = await params;
  const festival = await getFestival(id);
  if (!festival) return <div>정보를 찾을 수 없습니다.</div>;

  // 라인업 아티스트 가져오기
  const artists = await getFestivalArtists(id);

  // 날짜 포맷팅 (YYYY.MM.DD)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}. ${String(date.getDate()).padStart(2, "0")}`;
  };

  // 포스터 이미지 URL (festival.poster_url이 있으면 사용, 없으면 더미 이미지)
  const posterUrl =
    festival.posterUrl ||
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden flex items-center justify-center">
      {/* --- [1. Main Hero Section] 포스터 + 정보 레이아웃 --- */}
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[440px_1fr] gap-5 lg:items-stretch">
          {/* 왼쪽: 포스터 이미지 */}
          <FestivalPoster posterUrl={posterUrl} festivalName={festival.name} />

          {/* 오른쪽: 정보 영역 */}
          <div className="flex flex-col gap-3.5 min-w-0 h-full">
            {/* 타이틀 */}
            <FestivalHeader
              name={festival.name}
              startDate={festival.startDate}
              endDate={festival.endDate}
              placeName={festival.placeName}
              formatDate={formatDate}
            />

            {/* 타임테이블 보기 버튼 */}
            <TimetableButton festivalId={id} />

            {/* 라인업 섹션 */}
            <LineupSection artists={artists} />

            {/* 오시는 길 & 예매 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* 오시는 길 */}
              <LocationSection
                placeName={festival.placeName}
                address={festival.address || ""}
                latitude={festival.latitude}
                longitude={festival.longitude}
              />

              {/* 예매 정보 */}
              <TicketInfoSection
                bookingInfo={festival.bookingInfo}
                officialLinks={festival.officialLinks}
                formatDate={formatDate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
