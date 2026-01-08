import { Calendar, MapPin } from "lucide-react";

interface FestivalHeaderProps {
  name: string;
  startDate: string;
  endDate: string;
  placeName: string;
  formatDate: (dateString: string) => string;
}

export default function FestivalHeader({
  name,
  startDate,
  endDate,
  placeName,
  formatDate,
}: FestivalHeaderProps) {
  return (
    <div>
      <h1 className="text-2.5xl md:text-3xl font-extrabold leading-tight mb-2.5 text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200">
        {name}
      </h1>

      {/* 날짜 */}
      <div className="flex items-center gap-2 text-gray-300 mb-2">
        <Calendar className="w-4 h-4 text-blue-400" />
        <span className="text-sm font-medium">
          {formatDate(startDate)} ~ {formatDate(endDate)}
        </span>
      </div>

      {/* 장소 */}
      <div className="flex items-center gap-2 text-gray-300">
        <MapPin className="w-4 h-4 text-purple-400" />
        <span className="text-sm">{placeName}</span>
      </div>
    </div>
  );
}

