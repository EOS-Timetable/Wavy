// src/components/festival/TicketInfoSection.tsx
import { Ticket, ExternalLink, Globe } from "lucide-react";
import { FestivalBookingInfoItem, FestivalOfficialLinks } from "@/utils/dataFetcher";

interface TicketInfoSectionProps {
  bookingInfo?: FestivalBookingInfoItem[]; // JSONB 데이터 규격 반영
  officialLinks?: FestivalOfficialLinks; // JSONB 데이터 규격 반영
  formatDate: (dateString: string) => string;
}

export default function TicketInfoSection({
  bookingInfo = [],
  officialLinks = {},
  formatDate,
}: TicketInfoSectionProps) {
  // 렌더링 전 날짜순으로 정렬
  const sortedInfo = [...bookingInfo].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // 날짜 포맷팅 (MM/DD 형식)
  const formatDateShort = (dateString?: string) => {
    if (!dateString) return "TBD";
    const date = new Date(dateString);
    return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
  };

  return (
    <div className="bg-[#161b29]/80 backdrop-blur-sm border border-white/10 rounded-lg p-3.5 flex flex-col">
      <div className="flex items-center gap-2 mb-2.5">
        <Ticket className="w-4 h-4 text-purple-400" />
        <h2 className="text-base font-bold">예매 정보</h2>
      </div>

      <div className="space-y-3 flex flex-col flex-1">
        {/* 1. 예매처 링크 (현재 오픈된 예매처만 노출) */}
        <div className="flex flex-wrap gap-1.5">
          {bookingInfo.filter(b => b.is_open).map((vendor, index) => (
            <a
              key={index}
              href={vendor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-colors"
            >
              {vendor.tier} 예매하기
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          ))}
        </div>

        {/* 2. 티켓팅 오픈 일정 (bookingInfo 배열 전체를 순회하여 카드 생성) */}
        <div className="flex gap-2 flex-1">
          {bookingInfo.slice(0, 3).map((item, index) => (
            <div
              key={index}
              className="flex-1 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-lg p-2.5 flex flex-col items-center justify-center min-h-[60px]"
            >
              <span className="text-[10px] font-bold text-purple-300 mb-1">
                {item.tier}
              </span>
              <span className="text-sm font-extrabold text-white">
                {formatDateShort(item.date)}
              </span>
            </div>
          ))}
        </div>

        {/* 3. 공식 홈페이지 버튼 */}
        {officialLinks?.homepage && (
          <a
            href={officialLinks.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-md text-white hover:from-purple-600/30 hover:to-blue-600/30 transition-all text-xs font-semibold mt-auto"
          >
            <Globe className="w-3.5 h-3.5 text-purple-400" />
            <span>공식 홈페이지</span>
            <ExternalLink className="w-2.5 h-2.5 text-gray-400" />
          </a>
        )}
      </div>
    </div>
  );
}