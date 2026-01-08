"use client";

import { Search } from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";

interface Festival {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  place_name: string;
  poster_url?: string;
}

interface SearchFieldProps {
  festivals: Festival[];
  onSearch: (query: string) => void;
  onSelectFestival: (festivalId: string) => void;
}

export default function SearchField({
  festivals,
  onSearch,
  onSelectFestival,
}: SearchFieldProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // 자동완성 후보 리스트 (최대 5개)
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const matched = festivals
      .filter((festival) => festival.name.toLowerCase().includes(query))
      .slice(0, 5);

    return matched;
  }, [searchQuery, festivals]);

  // 외부 클릭 시 자동완성 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(value.length > 0);
    onSearch(value);
  };

  const handleSuggestionClick = (festival: Festival) => {
    setSearchQuery(festival.name);
    setShowSuggestions(false);
    onSelectFestival(festival.id);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(searchQuery.length > 0)}
          placeholder="Find your vibe"
          className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
        />
        <button
          onClick={handleSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-purple-300 transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* 자동완성 후보 리스트 */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 border border-white/20 rounded-lg overflow-hidden z-10 backdrop-blur-sm">
          {suggestions.map((festival) => (
            <button
              key={festival.id}
              onClick={() => handleSuggestionClick(festival)}
              className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0"
            >
              {festival.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
