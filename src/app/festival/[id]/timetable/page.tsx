"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  getFestival,
  getStages,
  getFestivalDates,
  getPerformancesByDay,
  Stage,
  PerformanceJoined,
} from "@/utils/dataFetcher";

import TimetableHeader from "@/components/timetable/TimetableHeader";
import TimetableBody from "@/components/timetable/TimetableBody";
import TimetableFab from "@/components/timetable/TimetableFab";
import SpotifyEmbed from "@/components/SpotifyEmbed";
import { Loader2 } from "lucide-react";

export default function TimetablePage() {
  const params = useParams();
  const festivalId = params.id as string;

  // --- State 관리 ---
  const [festival, setFestival] = useState<any>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [performances, setPerformances] = useState<PerformanceJoined[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  
  // 플레이리스트 관련 State
  const [createdPlaylistId, setCreatedPlaylistId] = useState<string | null>(null);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);

  // 1. 초기 데이터 로드
  useEffect(() => {
    async function initData() {
      if (!festivalId) return;
      setLoading(true);

      const [fetchedFestival, fetchedStages, fetchedDates] = await Promise.all([
        getFestival(festivalId),
        getStages(festivalId),
        getFestivalDates(festivalId),
      ]);

      setFestival(fetchedFestival);
      setStages(fetchedStages);
      setDates(fetchedDates);
      setCurrentDay(1);

      setLoading(false);
    }
    initData();
  }, [festivalId]);

  // 2. 공연 데이터 로드
  useEffect(() => {
    async function loadPerformances() {
      if (!festivalId) return;
      const data = await getPerformancesByDay(festivalId, currentDay);
      setPerformances(data || []);
    }
    loadPerformances();
  }, [festivalId, currentDay]);

  // --- 핸들러 ---
  const handleToggle = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleMakeWallpaper = () => {
    alert("🎨 배경화면 만들기 기능은 준비 중입니다!");
  };

  // [변경] 서버 API를 호출하여 플레이리스트 생성 (로그인 불필요)
  const handleMakePlaylist = async () => {
    if (selectedIds.size === 0) {
      alert("공연을 먼저 선택해주세요!");
      return;
    }

    const selectedPerformances = performances.filter(p => selectedIds.has(p.id));
    if (selectedPerformances.length === 0) {
      alert("선택된 공연이 없습니다.");
      return;
    }

    // 시간순 정렬
    selectedPerformances.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    const artistNames = selectedPerformances.map(p => p.artist.name);
    
    setIsCreatingPlaylist(true);

    try {
      // 서버 API 호출
      const res = await fetch('/api/create-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          artistNames,
          festivalName: festival.name,
          day: currentDay
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '플레이리스트 생성 실패');
      }
      
      // [추가] 스포티파이 서버가 정신 차릴 때까지 1.5초 대기
      // 사용자에게는 "마무리 중..." 같은 느낌을 줍니다.
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setCreatedPlaylistId(data.playlistId);
      alert("✨ 플레이리스트가 생성되었습니다! 아래 플레이어에서 바로 들어보세요.");

    } catch (error: any) {
      console.error("Error:", error);
      alert(`오류 발생: ${error.message}`);
    } finally {
      setIsCreatingPlaylist(false);
    }
  };

  // --- 렌더링 ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!festival) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Festival info not found.
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-950 text-white flex flex-col overflow-hidden relative">
      {/* 헤더 */}
      <div className="flex-shrink-0 z-50">
        <TimetableHeader
          title={festival.name}
          days={dates}
          currentDay={currentDay}
          onSelectDay={setCurrentDay}
        />
      </div>

      {/* 바디 */}
      <div className="flex-1 relative overflow-hidden">
        <TimetableBody
          stages={stages}
          performances={performances}
          selectedIds={selectedIds}
          onToggleId={handleToggle}
        />
      </div>

      {/* 임베드 플레이어 (생성 성공 시 표시) */}
      {createdPlaylistId && (
        // 1. 위치 잡기 (화면 하단 고정)
        <div className="fixed bottom-24 left-4 right-4 z-50 flex justify-center animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* 2. 반응형 컨테이너 (여기가 핵심!) */}
          <div className="
            relative w-full 
            max-w-[500px]           /* PC에서도 너무 안 커지게 제한 */
            bg-[#121212] 
            rounded-2xl 
            border border-white/10 
            shadow-2xl 
            p-1                     /* 내부 패딩을 아주 얇게 줌 */
          ">
            
            {/* 닫기 버튼 */}
            <button 
              onClick={() => setCreatedPlaylistId(null)}
              className="absolute -top-3 -right-3 bg-neutral-800 text-white rounded-full p-2 shadow-lg border border-neutral-600 z-30 hover:bg-neutral-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>

            {/* 3. 높이 조절 (모바일 vs PC) */}
            <div className="
              w-full 
              h-[152px]       /* 기본(모바일): 중간 크기 */
              md:h-[352px]    /* 태블릿/PC(768px 이상): 목록형 크기 */
              transition-all duration-300 ease-in-out /* 크기 변할 때 부드럽게 */
            ">
              {/* 컴포넌트에 rounded-xl을 직접 줘서 iframe 모서리를 깎음 */}
              <SpotifyEmbed 
                type="playlist" 
                id={createdPlaylistId} 
                className="rounded-xl"
              />
            </div>

            {/* 하단 안내 문구 (모바일 공간 부족 시 숨김 가능) */}
            <div className="text-center py-2 px-4">
              <p className="text-[11px] text-gray-400 truncate">
                우측 상단 로고를 눌러 저장하세요
                <span className="hidden md:inline"> · PC에서는 목록 스크롤이 가능합니다</span>
              </p>
            </div>

          </div>
        </div>
      )}

      {/* FAB 버튼 */}
      <TimetableFab 
        onMakeWallpaper={handleMakeWallpaper}
        onMakePlaylist={handleMakePlaylist}
        // isLoading={isCreatingPlaylist}
      />

      {/* 로딩 오버레이 */}
      {isCreatingPlaylist && (
        <div className="absolute inset-0 bg-black/60 z-[100] flex flex-col items-center justify-center backdrop-blur-sm">
            <div className="bg-slate-800 p-6 rounded-2xl flex flex-col items-center gap-4 shadow-2xl border border-slate-700">
                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                <div className="text-center">
                  <p className="font-bold text-lg">Spotify 플레이리스트 생성 중...</p>
                  <p className="text-sm text-gray-400 mt-1">잠시만 기다려주세요 (약 5~10초)</p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}