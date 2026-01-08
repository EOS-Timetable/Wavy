"use client";

import { useState } from "react";
import FestivalCard from "./FestivalCard";

interface Festival {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  place_name: string;
  poster_url?: string;
}

interface FestivalListProps {
  festivals: Festival[];
  searchQuery: string;
  selectedFestivalId?: string;
  formatDate: (dateString: string) => string;
  getDDay: (startDate: string) => string;
}

export default function FestivalList({
  festivals,
  searchQuery,
  selectedFestivalId,
  formatDate,
  getDDay,
}: FestivalListProps) {
  const [excludeEnded, setExcludeEnded] = useState(false);

  // 필터링 및 정렬 로직
  const filteredFestivals = festivals
    .filter((festival) => {
      // 종료된 페스티벌 제외 필터
      if (excludeEnded) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endDate = new Date(festival.end_date);
        endDate.setHours(0, 0, 0, 0);
        if (endDate < today) return false;
      }

      // 선택된 페스티벌만 표시
      if (selectedFestivalId) {
        return festival.id === selectedFestivalId;
      }

      // 검색어 필터링
      if (searchQuery.trim()) {
        return festival.name.toLowerCase().includes(searchQuery.toLowerCase());
      }

      return true;
    })
    .sort((a, b) => {
      // 임박순 정렬 (시작일이 가까운 순)
      const today = new Date();
      const dateA = new Date(a.start_date);
      const dateB = new Date(b.start_date);

      // 오늘 이후 날짜만 고려
      const diffA = dateA.getTime() - today.getTime();
      const diffB = dateB.getTime() - today.getTime();

      // 둘 다 미래면 시작일 순
      if (diffA > 0 && diffB > 0) {
        return diffA - diffB;
      }
      // 하나만 미래면 미래가 앞으로
      if (diffA > 0) return -1;
      if (diffB > 0) return 1;
      // 둘 다 과거면 최근 순
      return diffB - diffA;
    });

  return (
    <div>
      {/* 필터 체크박스 */}
      <div className="max-w-5xl mx-auto mb-6 flex justify-end">
        <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-gray-300 transition-colors">
          <input
            type="checkbox"
            checked={excludeEnded}
            onChange={(e) => setExcludeEnded(e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-white/10 text-purple-500 focus:outline-none cursor-pointer"
          />
          <span className="text-sm">종료된 페스티벌 제외</span>
        </label>
      </div>

      {/* 페스티벌 목록 */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFestivals.length > 0 ? (
          filteredFestivals.map((festival) => (
            <FestivalCard
              key={festival.id}
              festival={festival}
              formatDate={formatDate}
              getDDay={getDDay}
            />
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-gray-500">
            검색 결과가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
