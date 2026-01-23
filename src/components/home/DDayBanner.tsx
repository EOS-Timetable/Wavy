"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown, Search } from "lucide-react";
import Link from "next/link";

interface Festival {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  posterUrl?: string;
}

interface DDayBannerProps {
  savedFestivals: Festival[];
  selectedFestivalId?: string;
  onFestivalChange: (festivalId: string) => void;
  /** 홈에서 섹션 간격을 부모가 관리할 때(예: space-y-5) 배너 자체의 mb를 끌 수 있음 */
  withBottomMargin?: boolean;
}

// D-Day 계산 함수
const getDDay = (startDate: string): string => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 날짜 문자열 파싱 (ISO 형식 또는 다른 형식 지원)
    let start: Date;
    if (typeof startDate === 'string') {
      // ISO 형식 (2026-08-01T00:00:00) 또는 날짜만 (2026-08-01)
      start = new Date(startDate);
    } else {
      start = new Date(startDate);
    }
    
    // 유효한 날짜인지 확인
    if (isNaN(start.getTime())) {
      console.error("Invalid date:", startDate);
      return "Invalid";
    }
    
    start.setHours(0, 0, 0, 0);

    const diff = start.getTime() - today.getTime();
    const dDay = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (dDay === 0) return "D-Day";
    if (dDay < 0) return "End";
    return `D-${dDay}`;
  } catch (error) {
    console.error("Error calculating D-Day:", error, "startDate:", startDate);
    return "Error";
  }
};

export default function DDayBanner({
  savedFestivals,
  selectedFestivalId,
  onFestivalChange,
  withBottomMargin = true,
}: DDayBannerProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 드롭다운 바깥 클릭 시 닫기 (오버레이 방식 대신 document listener 사용)
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isDropdownOpen]);

  // 저장한 페스티벌이 없을 때
  if (savedFestivals.length === 0) {
    return (
      <div className={withBottomMargin ? "mb-5" : ""}>
        {/* 정상 D-Day 배너와 동일한 카드 래퍼로 통일 */}
        <div className="relative bg-[#161b29]/80 backdrop-blur-sm border border-white/10 rounded-lg overflow-visible">
          <div className="relative p-6 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">
              저장한 페스티벌이 없습니다
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              관심 있는 페스티벌을 탐색해보세요!
            </p>
            <Link
              href="/lookup"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 text-white rounded-lg font-semibold hover:from-blue-600/30 hover:to-cyan-600/30 transition-all"
            >
              <Search className="w-4 h-4 text-blue-300" />
              페스티벌 찾아보기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 선택된 페스티벌 찾기 (명시적으로 선택된 것이 있으면 그것을 사용, 없으면 가장 임박한 페스티벌)
  let currentFestival: Festival | null | undefined;
  if (selectedFestivalId !== undefined) {
    // null이면 명시적으로 선택 안 함을 의미하므로 null 유지
    if (selectedFestivalId === null) {
      currentFestival = null;
    } else {
      // 선택된 페스티벌 찾기
      currentFestival = savedFestivals.find((f) => f.id === selectedFestivalId) || null;
    }
  }
  
  // selectedFestivalId가 undefined면 아직 선택 안 한 상태 → 가장 임박한 페스티벌 사용
  if (currentFestival === undefined) {
    currentFestival = [...savedFestivals].sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return dateA - dateB;
    })[0];
  }

  // currentFestival이 null이면 배너를 숨김 (명시적으로 선택 안 함)
  if (currentFestival === null) return null;

  const dDay = getDDay(currentFestival.startDate);
  const isEnded = dDay === "End";

  return (
    <div
      className={
        withBottomMargin
          ? `mb-5 relative ${isDropdownOpen ? "z-[300]" : "z-0"}`
          : `relative ${isDropdownOpen ? "z-[300]" : "z-0"}`
      }
    >
      <div
        className={`
          relative bg-[#161b29]/80 backdrop-blur-sm border rounded-lg overflow-visible
          ${isEnded ? "border-gray-600/50" : "border-cyan-400/50"}
        `}
      >
        {/* 배경 그라데이션 */}
        {currentFestival.posterUrl && (
          <div className="absolute inset-0 opacity-20">
            <img
              src={currentFestival.posterUrl}
              alt={currentFestival.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="relative p-6">
          {/* 페스티벌 선택 드롭다운 */}
          <div ref={dropdownRef} className="relative mb-4 z-[350]">
            <button
              type="button"
              onClick={() => setIsDropdownOpen((v) => !v)}
              className="w-full flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold text-white">
                  {currentFestival.name}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* 드롭다운 메뉴 */}
            {isDropdownOpen && (
              <div 
                className="dropdown-menu absolute top-full left-0 right-0 mt-2 bg-[#161b29] border border-white/10 rounded-lg overflow-hidden z-[400] backdrop-blur-md shadow-xl"
                style={{ minWidth: '100%' }}
              >
                {savedFestivals.map((festival) => (
                  <button
                    key={festival.id}
                    type="button"
                    onClick={() => {
                      onFestivalChange(festival.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`
                      w-full px-4 py-3 text-left hover:bg-white/10 transition-colors cursor-pointer
                      ${
                        festival.id === currentFestival.id
                          ? "bg-white/5 border-l-2 border-cyan-400"
                          : ""
                      }
                    `}
                  >
                    <div className="text-sm font-semibold text-white">
                      {festival.name}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {getDDay(festival.startDate)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* D-Day 표시 */}
          <div className="flex items-center gap-4">
            <div className="px-6 py-4">
              <div
                className={`text-3xl md:text-4xl font-extrabold ${
                  isEnded ? "text-gray-400" : "text-cyan-400"
                }`}
              >
                {dDay}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-400 mb-1">
                {isEnded ? "종료된 페스티벌" : "페스티벌 시작까지"}
              </div>
              <div className="text-lg font-bold text-white">
                {currentFestival.name}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

