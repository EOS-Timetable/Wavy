"use client";

import SearchField from "./SearchField";
import { SortOption } from "./LookupView";

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

interface LookupHeaderProps {
  festivals: Festival[];
  artists: Artist[];
  onSearch: (query: string) => void;
  onSelectFestival: (festivalId: string) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  excludeEnded: boolean;
  onExcludeEndedChange: (exclude: boolean) => void;
}

export default function LookupHeader({
  festivals,
  artists,
  onSearch,
  onSelectFestival,
  sortOption,
  onSortChange,
  excludeEnded,
  onExcludeEndedChange,
}: LookupHeaderProps) {
  return (
    <div className="px-4 pt-12 pb-6">
      {/* 웹 환경: 헤더와 검색 필드를 같은 컨테이너로 감싸서 검색 필드 중앙, 헤더는 왼쪽 끝에 배치 */}
      <div className="max-w-5xl mx-auto">
        {/* 타이틀 - home과 동일한 스타일 */}
        <h1 className="text-2xl md:text-3xl font-extrabold mb-5 md:max-w-2xl md:mx-auto md:text-left">
          Lookup
        </h1>

        {/* 검색 필드 - 웹에서 중앙 정렬 */}
        <div className="max-w-2xl md:mx-auto mb-5">
          <SearchField
            festivals={festivals}
            artists={artists}
            onSearch={onSearch}
            onSelectFestival={onSelectFestival}
          />
        </div>

        {/* 정렬 옵션 - 웹에서 검색 필드 왼쪽 끝에 맞춤 */}
        <div className="max-w-2xl md:mx-auto flex items-center justify-between gap-1">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">정렬:</span>
          <button
            onClick={() => onSortChange("imminent")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              sortOption === "imminent"
                ? "bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/15 border border-transparent"
            }`}
          >
            임박순
          </button>
          <button
            onClick={() => onSortChange("popular")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              sortOption === "popular"
                ? "bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 text-white"
                : "bg-white/10 text-gray-300 hover:bg-white/15 border border-transparent"
            }`}
          >
            인기순
          </button>
        </div>
        
        {/* 종료된 페스티벌 제외 */}
        <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-gray-300 transition-colors">
          <input
            type="checkbox"
            checked={excludeEnded}
            onChange={(e) => onExcludeEndedChange(e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-white/10 text-purple-500 focus:outline-none cursor-pointer"
          />
          <span className="text-xs">종료된 페스티벌 제외</span>
        </label>
      </div>
      </div>
    </div>
  );
}
