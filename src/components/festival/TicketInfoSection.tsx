import { Ticket, ExternalLink, Globe } from "lucide-react";

export interface BookingVendor {
  name: string;
  url: string;
}

interface TicketInfoSectionProps {
  ticket1stOpenDate?: string;
  ticket2ndOpenDate?: string;
  ticket3rdOpenDate?: string;
  bookingVendors?: BookingVendor[];
  officialUrl?: string;
  formatDate: (dateString: string) => string;
}

export default function TicketInfoSection({
  ticket1stOpenDate,
  ticket2ndOpenDate,
  ticket3rdOpenDate,
  bookingVendors = [],
  officialUrl,
  formatDate,
}: TicketInfoSectionProps) {
  // 목업 예매처 데이터
  const mockVendors: BookingVendor[] = [
    { name: "인터파크 예매", url: "#" },
    { name: "티켓링크 예매", url: "#" },
    { name: "YES24 예매", url: "#" },
  ];

  const vendors = bookingVendors.length > 0 ? bookingVendors : mockVendors;

  // 날짜 포맷팅 (MM/DD 형식)
  const formatDateShort = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${month}/${day}`;
  };

  // 티켓팅 날짜 배열 생성
  const ticketDates = [
    { label: "1차 OPEN", date: ticket1stOpenDate, mockDate: "6/7" },
    { label: "2차 OPEN", date: ticket2ndOpenDate, mockDate: "6/14" },
    { label: "3차 OPEN", date: ticket3rdOpenDate, mockDate: "7/14" },
  ].map((item) => ({
    label: item.label,
    date: item.date || item.mockDate,
  }));

  return (
    <div className="bg-[#161b29]/80 backdrop-blur-sm border border-white/10 rounded-lg p-3.5 flex flex-col">
      <div className="flex items-center gap-2 mb-2.5">
        <Ticket className="w-4 h-4 text-purple-400" />
        <h2 className="text-base font-bold">예매 정보</h2>
      </div>
      <div className="space-y-3 flex flex-col flex-1">
        {/* 예매처 버튼 */}
        <div className="flex flex-wrap gap-1.5">
          {vendors.map((vendor, index) => (
            <a
              key={index}
              href={vendor.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${
                vendor.url !== "#"
                  ? "bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 hover:border-purple-500/50"
                  : "bg-gray-700/30 border border-gray-600/30 text-gray-400 cursor-not-allowed opacity-50"
              }`}
            >
              {vendor.name}
              {vendor.url !== "#" && <ExternalLink className="w-2.5 h-2.5" />}
            </a>
          ))}
        </div>

        {/* 티켓팅 날짜들 */}
        <div className="flex gap-2 flex-1">
          {ticketDates.map((item, index) => (
            <div
              key={index}
              className="flex-1 bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-lg p-2.5 flex flex-col items-center justify-center min-h-[60px]"
            >
              <span className="text-[10px] font-bold text-purple-300 mb-1">
                {item.label}
              </span>
              <span className="text-base font-extrabold text-white">
                {item.date.includes("/")
                  ? item.date
                  : formatDateShort(item.date)}
              </span>
            </div>
          ))}
        </div>

        {/* 공식 홈페이지 버튼 */}
        {officialUrl && officialUrl !== "#" ? (
          <a
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-md text-white hover:from-purple-600/30 hover:to-blue-600/30 transition-all group text-xs font-semibold mt-auto"
          >
            <Globe className="w-3.5 h-3.5 text-purple-400" />
            <span>공식 홈페이지</span>
            <ExternalLink className="w-2.5 h-2.5 text-gray-400 group-hover:text-white transition-colors" />
          </a>
        ) : (
          <div className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-md text-white opacity-50 cursor-not-allowed text-xs font-semibold mt-auto">
            <Globe className="w-3.5 h-3.5 text-purple-400" />
            <span>공식 홈페이지</span>
            <ExternalLink className="w-2.5 h-2.5 text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
}
