"use client";

import { Search, Music, Calendar, Clock } from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getRecentSearches, saveSearchHistory } from "@/utils/dataFetcher";
import { createClient } from "@/lib/supabase";

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

interface SearchFieldProps {
  festivals: Festival[];
  artists: Artist[];
  onSearch: (query: string) => void;
  onSelectFestival: (festivalId: string) => void;
}

const supabase = createClient();

export default function SearchField({
  festivals,
  artists,
  onSearch,
  onSelectFestival,
}: SearchFieldProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useAuth();

  // 최근 검색어 로드
  useEffect(() => {
    if (!user?.id) return;
    
    async function loadRecentSearches() {
      const searches = await getRecentSearches(user!.id, 5);
      setRecentSearches(searches.map((s) => s.query));
    }
    
    loadRecentSearches();
  }, [user]);

  // 자동완성 후보 리스트 (페스티벌 + 아티스트, 최대 5개)
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const matchedFestivals = festivals
      .filter((festival) => festival.name.toLowerCase().includes(query))
      .map((f) => ({ ...f, type: "festival" as const }));

    const matchedArtists = artists
      .filter((artist) => artist.name.toLowerCase().includes(query))
      .map((a) => ({ ...a, type: "artist" as const }));

    // 디버깅: 매칭된 아티스트 로그
    if (matchedArtists.length > 0) {
      console.log(`[SearchField] Matched artists for "${query}":`, matchedArtists.map(a => ({ id: a.id, name: a.name })));
      console.log(`[SearchField] Total matched artists: ${matchedArtists.length}, Total matched festivals: ${matchedFestivals.length}`);
    }

    // 페스티벌과 아티스트를 합쳐서 최대 5개 반환
    const allSuggestions = [...matchedFestivals, ...matchedArtists];
    console.log(`[SearchField] Total suggestions before slice: ${allSuggestions.length}`);
    const result = allSuggestions.slice(0, 5);
    console.log(`[SearchField] Final suggestions count: ${result.length}`);
    return result;
  }, [searchQuery, festivals, artists]);

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
    setShowRecentSearches(false);
    onSearch(value);
  };

  const handleFocus = () => {
    if (searchQuery.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowRecentSearches(true);
    }
  };

  const handleRecentSearchClick = async (query: string) => {
    setSearchQuery(query);
    setShowRecentSearches(false);
    setShowSuggestions(false);
    
    // 검색 기록 저장
    if (user?.id) {
      await saveSearchHistory(user.id, query);
    }
    
    onSearch(query);
  };

  const handleSuggestionClick = (
    item: (Festival & { type: "festival" }) | (Artist & { type: "artist" })
  ) => {
    if (item.type === "artist") {
      setSearchQuery(item.name);
      setShowSuggestions(false);
      // 아티스트 페이지로 이동은 Link로 처리
    } else {
      setSearchQuery(item.name);
      setShowSuggestions(false);
      onSelectFestival(item.id);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setShowSuggestions(false);
      setShowRecentSearches(false);
      return;
    }

    const query = searchQuery.trim();
    const queryLower = query.toLowerCase();

    // 검색 기록 저장
    if (user?.id) {
      await saveSearchHistory(user.id, query);
    }

    // 디버깅: 전체 아티스트 목록 확인
    console.log(`[SearchField] handleSearch - query: "${query}"`);
    console.log(`[SearchField] Total artists available:`, artists.length);
    console.log(`[SearchField] Sample artists:`, artists.slice(0, 3).map(a => ({ id: a.id, name: a.name })));

    // 1. 정확히 일치하는 아티스트 찾기
    const exactArtistMatch = artists.find(
      (artist) => artist.name.toLowerCase() === queryLower
    );

    if (exactArtistMatch) {
      console.log(`[SearchField] Exact artist match found:`, { id: exactArtistMatch.id, name: exactArtistMatch.name });
      console.log(`[SearchField] Navigating to: /artist/${exactArtistMatch.id}`);
      // 아티스트 페이지로 이동
      router.push(`/artist/${exactArtistMatch.id}`);
      setShowSuggestions(false);
      setShowRecentSearches(false);
      return;
    } else {
      console.log(`[SearchField] No exact match found for "${query}"`);
      console.log(`[SearchField] All artist names:`, artists.map(a => a.name));
    }

    // 2. 정확히 일치하는 페스티벌 찾기
    const exactFestivalMatch = festivals.find(
      (festival) => festival.name.toLowerCase() === queryLower
    );

    if (exactFestivalMatch) {
      // 페스티벌 선택
      onSelectFestival(exactFestivalMatch.id);
      setSearchQuery(exactFestivalMatch.name);
      setShowSuggestions(false);
      setShowRecentSearches(false);
      return;
    }

    // 3. 일치하는 항목이 없으면 일반 검색 수행
    onSearch(query);
    setShowSuggestions(false);
    setShowRecentSearches(false);
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
          onFocus={handleFocus}
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

      {/* 최근 검색어 목록 (검색어 입력 없을 때) */}
      {showRecentSearches && recentSearches.length > 0 && !searchQuery && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 border border-white/20 rounded-lg overflow-hidden z-10 backdrop-blur-sm">
          <div className="px-4 py-2 text-xs text-gray-400 border-b border-white/5">
            최근 검색어
          </div>
          {recentSearches.map((query, index) => (
            <button
              key={`recent-${index}`}
              onClick={() => handleRecentSearchClick(query)}
              className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0 flex items-center gap-2"
            >
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{query}</span>
            </button>
          ))}
        </div>
      )}

      {/* 자동완성 후보 리스트 */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 border border-white/20 rounded-lg overflow-hidden z-10 backdrop-blur-sm">
          {suggestions.map((item) => {
            if (item.type === "artist") {
              return (
                <Link
                  key={`artist-${item.id}`}
                  href={`/artist/${item.id}`}
                  onClick={async () => {
                    console.log(`[SearchField] Artist clicked from suggestions:`, { id: item.id, name: item.name });
                    setSearchQuery(item.name);
                    setShowSuggestions(false);
                    
                    // 검색 기록 저장
                    if (user?.id) {
                      await saveSearchHistory(user.id, item.name);
                    }
                  }}
                  className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0 flex items-center gap-2"
                >
                  <Music className="w-4 h-4 text-purple-400" />
                  <span>{item.name}</span>
                  <span className="ml-auto text-xs text-gray-400">
                    아티스트
                  </span>
                </Link>
              );
            } else {
              return (
                <button
                  key={`festival-${item.id}`}
                  onClick={() => handleSuggestionClick(item)}
                  className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0 flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span>{item.name}</span>
                  <span className="ml-auto text-xs text-gray-400">
                    페스티벌
                  </span>
                </button>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}
