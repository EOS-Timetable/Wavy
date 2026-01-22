import { getFestival, getFestivalArtists } from "@/utils/dataFetcher";
import FestivalHeader from "@/components/festival/FestivalHeader";
import FestivalSaveButton from "@/components/festival/FestivalSaveButton";
import LineupSection from "@/components/festival/LineupSection";
import LocationSection from "@/components/festival/LocationSection";
import TicketInfoSection from "@/components/festival/TicketInfoSection";
import TimetableButton from "@/components/festival/TimetableButton";
import Header from "@/components/ui/Header";
import ThisYearSection from "@/components/home/ThisYearSection";
import LegacySection from "@/components/home/LegacySection";
import {
  getFestivalKey,
  MOCK_LEGACY_CONTENTS,
  MOCK_THIS_YEAR_CONTENTS,
} from "@/data/homeMockContents";
import Image from "next/image";

interface PageProps {
  params: Promise<{ id: string }>;
}

// 1. 서버 컴포넌트: DB에서 직접 데이터를 가져옵니다.
export default async function FestivalDetailPage({ params }: PageProps) {
  const { id } = await params;

  // 스키마 변경에 안전하도록 공용 fetcher 사용 (jsonb 파싱 포함)
  const festival = await getFestival(id);

  if (!festival) {
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

  // 포스터 이미지 URL (festival.posterUrl이 있으면 사용, 없으면 더미 이미지)
  const posterUrl =
    festival.posterUrl ||
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop";

  // // 예매처 정보 (jsonb 파싱은 getFestival에서 처리됨)
  // const bookingInfo = festival.bookingInfo ?? [];

  // // booking_info → 기존 TicketInfoSection props로 변환
  // const sortedBookingInfo = [...bookingInfo].sort((a: any, b: any) => {
  //   const da = new Date(a?.date || 0).getTime();
  //   const db = new Date(b?.date || 0).getTime();
  //   return da - db;
  // });

  // const ticket1stOpenDate = sortedBookingInfo[0]?.date;
  // const ticket2ndOpenDate = sortedBookingInfo[1]?.date;
  // const ticket3rdOpenDate = sortedBookingInfo[2]?.date;

  // const bookingVendors =
  //   sortedBookingInfo.length > 0
  //     ? sortedBookingInfo
  //         .filter((x: any) => x?.url)
  //         .map((x: any) => ({
  //           name: x?.tier || "예매",
  //           url: x?.url || "#",
  //         }))
  //     : undefined;

  // // official_links → 공식 URL 결정 (homepage 우선, 없으면 instagram)
  // const officialUrl =
  //   festival.officialLinks?.homepage ||
  //   festival.officialLinks?.instagram ||
  //   "#";

  // Home과 동일한 목업 데이터(인스타 링크 포함)로 테스트
  const festivalKey = getFestivalKey(festival.name);
  const thisYearContents = festivalKey ? MOCK_THIS_YEAR_CONTENTS[festivalKey] : [];
  const legacyContents = festivalKey ? MOCK_LEGACY_CONTENTS[festivalKey] : [];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden pb-20">
      {/* 상단 헤더 (되돌아가기 버튼) */}
      <Header backHref="/lookup" title={festival.name} />
      
      {/* 상단 포스터 이미지 (artist-festival 페이지와 동일한 방식으로 모바일/웹 통일) */}
      <div className="relative w-full h-[40vh] min-h-[300px] overflow-hidden">
        <Image
          src={posterUrl}
          alt={festival.name}
          fill
          className="object-cover object-center object-[center_top]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
      </div>

      {/* 정보 영역 */}
      <div className="max-w-5xl mx-auto px-4 -mt-20 relative z-10">
        <div className="flex flex-col gap-5">
          {/* FestivalInfo(헤더) + 타임테이블 버튼: 간격만 별도로 더 좁게 */}
          <div className="flex flex-col gap-2.5">
            <FestivalHeader
              name={festival.name}
              startDate={festival.startDate}
              endDate={festival.endDate}
              placeName={festival.placeName}
              formatDate={formatDate}
              saveButton={<FestivalSaveButton festivalId={id} />}
            />

            <TimetableButton festivalId={id} />
          </div>

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

        {/* This Year & Legacy 섹션 */}
        <ThisYearSection
          festivalId={id}
          festivalName={festival.name}
          contents={thisYearContents}
          withPagePadding={false}
        />
        <LegacySection
          festivalId={id}
          festivalName={festival.name}
          contents={legacyContents}
          withPagePadding={false}
        />
      </div>
    </div>
  );
}
