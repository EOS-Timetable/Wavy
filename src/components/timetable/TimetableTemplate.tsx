"use client";

import React, { useState, useEffect } from "react";
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

const EMPTY_SET = new Set<string>();

interface TimetableTemplateProps {
  festivalId: string;
  initialSelectedIds?: Set<string>; // [Flow A용] 저장된 선택값
  onSelectionChange?: (ids: Set<string>) => void; // [Flow B용] 선택 변경 시 상위로 알림
  headerAction?: React.ReactNode; // [공통] 헤더 우측 버튼 (저장 or 목록)
  subTitle?: string;
  onTitleClick?: () => void;
}

export default function TimetableTemplate({ 
  festivalId, 
  initialSelectedIds = EMPTY_SET, 
  onSelectionChange,
  headerAction,
  subTitle,
  onTitleClick
}: TimetableTemplateProps) {
  
  // --- State 관리 ---
  const [festival, setFestival] = useState<any>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [performances, setPerformances] = useState<PerformanceJoined[]>([]);
  
  // 선택된 ID 관리
  const [selectedIds, setSelectedIds] = useState<Set<string>>(initialSelectedIds);
  const [loading, setLoading] = useState(true);
  
  // 플레이리스트 관련 State
  const [createdPlaylistId, setCreatedPlaylistId] = useState<string | null>(null);
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);

  // 초기값 동기화 (Flow A에서 목록 변경 시 필요)
  useEffect(() => {
    setSelectedIds(initialSelectedIds);
  }, [initialSelectedIds]);

  // 1. 초기 데이터 로드
  useEffect(() => {
    async function initData() {
      if (!festivalId) return;
      setLoading(true);

      try {
        const [fetchedFestival, fetchedStages, fetchedDates] = await Promise.all([
            getFestival(festivalId),
            getStages(festivalId),
            getFestivalDates(festivalId),
        ]);

        setFestival(fetchedFestival);
        setStages(fetchedStages);
        setDates(fetchedDates);
        // 날짜가 바뀌거나 페스티벌이 바뀌면 1일차로 초기화
        setCurrentDay(1);
      } catch (e) {
          console.error("Failed to load festival data", e);
      } finally {
        setLoading(false);
      }
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
    if (onSelectionChange) onSelectionChange(newSet); // 상위 컴포넌트에 알림
  };

  const handleMakeWallpaper = () => {
    alert("🎨 배경화면 만들기 기능은 준비 중입니다!");
  };

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

    selectedPerformances.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    const artistNames = selectedPerformances.map(p => p.artist.name);
    
    setIsCreatingPlaylist(true);

    try {
      const res = await fetch('/api/create-playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistNames,
          festivalName: festival.name,
          day: currentDay
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '플레이리스트 생성 실패');
      
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      setCreatedPlaylistId(data.playlistId);
      alert("✨ 플레이리스트가 생성되었습니다!");

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
      <div className="h-screen w-screen bg-slate-950 flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!festival) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex items-center justify-center text-white">
        Festival info not found.
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-950 text-white flex flex-col overflow-hidden relative">
      {/* 헤더 */}
      <div className="flex-shrink-0 z-50 relative">
        <TimetableHeader
          title={festival.name}
          subTitle={subTitle}
          onTitleClick={onTitleClick}
          days={dates}
          currentDay={currentDay}
          onSelectDay={setCurrentDay}
          headerAction={headerAction}
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

      {/* 임베드 플레이어 */}
      {createdPlaylistId && (
        <div className="fixed bottom-24 left-4 right-4 z-50 flex justify-center animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="relative w-full max-w-[500px] bg-[#121212] rounded-2xl border border-white/10 shadow-2xl p-1">
            <button 
              onClick={() => setCreatedPlaylistId(null)}
              className="absolute -top-3 -right-3 bg-neutral-800 text-white rounded-full p-2 shadow-lg border border-neutral-600 z-30 hover:bg-neutral-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <div className="w-full h-[152px] md:h-[352px] transition-all duration-300 ease-in-out">
              <SpotifyEmbed type="playlist" id={createdPlaylistId} className="rounded-xl" />
            </div>
          </div>
        </div>
      )}

      {/* FAB 버튼 */}
      {!isCreatingPlaylist && !createdPlaylistId && (
        <TimetableFab 
          onMakeWallpaper={handleMakeWallpaper} 
          onMakePlaylist={handleMakePlaylist} 
        />
      )}

      {/* 로딩 오버레이 */}
      {isCreatingPlaylist && (
        <div className="absolute inset-0 bg-black/60 z-[100] flex flex-col items-center justify-center backdrop-blur-sm">
            <div className="bg-slate-800 p-6 rounded-2xl flex flex-col items-center gap-4 shadow-2xl border border-slate-700">
                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                <div className="text-center">
                  <p className="font-bold text-lg">플레이리스트 생성 중...</p>
                  <p className="text-sm text-gray-400 mt-1">잠시만 기다려주세요</p>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}