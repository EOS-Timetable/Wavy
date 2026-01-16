"use client";

import { useState } from "react";
import LookupHeader from "./LookupHeader";
import FestivalList from "./FestivalList";

interface Festival {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  place_name: string;
  poster_url?: string;
}

interface Artist {
  id: string;
  name: string;
}

interface LookupViewProps {
  festivals: Festival[];
  artists: Artist[];
}

export default function LookupView({ festivals, artists }: LookupViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFestivalId, setSelectedFestivalId] = useState<
    string | undefined
  >();

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}. ${String(date.getDate()).padStart(2, "0")}`;
  };

  // D-Day 계산 함수
  const getDDay = (startDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const diff = start.getTime() - today.getTime();
    const dDay = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (dDay === 0) return "D-Day";
    if (dDay < 0) return "End";
    return `D-${dDay}`;
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedFestivalId(undefined); // 검색 시 선택 해제
  };

  const handleSelectFestival = (festivalId: string) => {
    setSelectedFestivalId(festivalId);
    setSearchQuery(""); // 선택 시 검색어 초기화
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 pb-24">
      <LookupHeader
        festivals={festivals}
        artists={artists}
        onSearch={handleSearch}
        onSelectFestival={handleSelectFestival}
      />
      <FestivalList
        festivals={festivals}
        searchQuery={searchQuery}
        selectedFestivalId={selectedFestivalId}
        formatDate={formatDate}
        getDDay={getDDay}
      />
    </div>
  );
}
