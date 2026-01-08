import { supabase } from "@/lib/supabase";
import { getFestivalArtists } from "@/utils/dataFetcher";
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

  // Supabase에서 페스티벌 정보 조회
  const { data: festival, error } = await supabase
    .from("festivals")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !festival) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p>페스티벌 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

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
    festival.poster_url ||
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop";

  // 예매처 정보 파싱 (JSON 배열 또는 null)
  const bookingVendors = festival.booking_vendors
    ? Array.isArray(festival.booking_vendors)
      ? festival.booking_vendors
      : JSON.parse(festival.booking_vendors)
    : undefined;

  // 공식 홈페이지 URL (ticket_url을 official_url로 사용)
  const officialUrl = festival.official_url || festival.ticket_url || "#";

  // 전체 아티스트 사용

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
              startDate={festival.start_date}
              endDate={festival.end_date}
              placeName={festival.place_name}
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
                placeName={festival.place_name}
                address={festival.address}
                latitude={festival.latitude}
                longitude={festival.longitude}
              />

              {/* 예매 정보 */}
              <TicketInfoSection
                ticket1stOpenDate={festival.ticket_1st_open_date}
                ticket2ndOpenDate={festival.ticket_2nd_open_date}
                ticket3rdOpenDate={festival.ticket_3rd_open_date}
                bookingVendors={bookingVendors}
                officialUrl={officialUrl}
                formatDate={formatDate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
