"use client";

import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import SearchField from "./SearchField";

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
}

export default function LookupHeader({
  festivals,
  artists,
  onSearch,
  onSelectFestival,
}: LookupHeaderProps) {
  return (
    <div className="max-w-5xl mx-auto mb-10 mt-8">
      {/* 타이틀 */}
      <div className="text-center mb-6">
        <h1 className="text-2.5xl md:text-3xl font-extrabold leading-tight mb-2.5 text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200">
          Festival Lookup
        </h1>
        <p className="text-gray-400">
          Wavy와 함께 이번 시즌 가장 핫한 페스티벌을 찾아보세요.
        </p>
      </div>

      {/* 검색 필드 */}
      <div className="max-w-2xl mx-auto">
        <SearchField
          festivals={festivals}
          artists={artists}
          onSearch={onSearch}
          onSelectFestival={onSelectFestival}
        />
      </div>
    </div>
  );
}
