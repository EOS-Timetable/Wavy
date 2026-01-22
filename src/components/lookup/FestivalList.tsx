"use client";

import { useState, useEffect, useMemo } from "react";
import FestivalCard from "./FestivalCard";
import { SortOption } from "./LookupView";
import { createClient } from "@/lib/supabase";

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
  sortOption: SortOption;
  excludeEnded: boolean;
}

const supabase = createClient();

export default function FestivalList({
  festivals,
  searchQuery,
  selectedFestivalId,
  formatDate,
  getDDay,
  sortOption,
  excludeEnded,
}: FestivalListProps) {
  const [popularityMap, setPopularityMap] = useState<Record<string, number>>({});

  // 인기순 정렬을 위한 저장 횟수 가져오기
  useEffect(() => {
    if (sortOption !== "popular") return;

    async function loadPopularity() {
      // user_saved_performances와 performances를 조인해서 festival_id별 저장 횟수 집계
      const { data, error } = await supabase
        .from("user_saved_performances")
        .select(`
          performance_id,
          performances!inner(festival_id)
        `);

      if (error) {
        console.error("Error fetching popularity:", error);
        return;
      }

      // festival_id별로 저장 횟수 집계
      const festivalCounts: Record<string, number> = {};

      (data || []).forEach((item: any) => {
        const festivalId = item.performances?.festival_id;
        if (festivalId) {
          festivalCounts[festivalId] = (festivalCounts[festivalId] || 0) + 1;
        }
      });

      setPopularityMap(festivalCounts);
    }

    loadPopularity();
  }, [sortOption]);

  // 필터링 및 정렬 로직
  const filteredFestivals = useMemo(() => {
    const filtered = festivals.filter((festival) => {
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
    });

    return filtered.sort((a, b) => {
      if (sortOption === "popular") {
        // 인기순 정렬 (저장 횟수 기준)
        const countA = popularityMap[a.id] || 0;
        const countB = popularityMap[b.id] || 0;
        if (countA !== countB) {
          return countB - countA; // 내림차순
        }
        // 저장 횟수가 같으면 임박순으로 정렬
      }

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
  }, [festivals, searchQuery, selectedFestivalId, excludeEnded, sortOption, popularityMap]);

  return (
    <div>
      {/* 페스티벌 목록 */}
      <div className="max-w-5xl mx-auto px-2 md:px-0 flex flex-wrap justify-center md:justify-start gap-5">
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
          <div className="w-full py-20 text-center text-gray-500">
            검색 결과가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
