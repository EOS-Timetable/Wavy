import { Calendar, MapPin } from "lucide-react";

interface FestivalHeaderProps {
  name: string;
  startDate: string;
  endDate: string;
  placeName?: string;
  formatDate: (dateString: string) => string;
  saveButton?: React.ReactNode;
}

export default function FestivalHeader({
  name,
  startDate,
  endDate,
  placeName,
  formatDate,
  saveButton,
}: FestivalHeaderProps) {
  return (
    <div className="mb-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h1 className="text-2xl md:text-3xl font-extrabold leading-tight flex-1">
          {name}
        </h1>
        {saveButton}
      </div>

      <div className="space-y-2 text-sm text-gray-300">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span className="font-medium">
            {formatDate(startDate)} ~ {formatDate(endDate)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-purple-400" />
          <span>{placeName || "장소 정보 없음"}</span>
        </div>
      </div>
    </div>
  );
}

