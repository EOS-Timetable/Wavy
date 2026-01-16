"use client";

import { Calendar, MapPin } from "lucide-react";

interface FestivalInfoProps {
  festivalName: string;
  startDate: string;
  endDate: string;
  location: string;
  formatDate: (dateString: string) => string;
}

export default function FestivalInfo({
  festivalName,
  startDate,
  endDate,
  location,
  formatDate,
}: FestivalInfoProps) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
        {festivalName}
      </h1>
      <div className="space-y-2 text-sm text-gray-300">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span>
            {formatDate(startDate)} ~ {formatDate(endDate)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-purple-400" />
          <span>{location}</span>
        </div>
      </div>
    </div>
  );
}
