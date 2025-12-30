"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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

export default function TimetablePage() {
  const params = useParams();
  const festivalId = params.id as string;

  // --- State 관리 (데이터가 비동기로 들어오므로 상태로 관리) ---
  const [festival, setFestival] = useState<any>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [currentDay, setCurrentDay] = useState<string>("");
  const [performances, setPerformances] = useState<PerformanceJoined[]>([]);
  
  // ID 타입 변경: number -> string
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // 1. 초기 데이터 로드 (페스티벌 정보, 날짜, 스테이지)
  useEffect(() => {
    async function initData() {
      setLoading(true);
      const fetchedFestival = await getFestival(festivalId);
      const fetchedStages = await getStages(festivalId);
      const fetchedDates = await getFestivalDates(festivalId);

      setFestival(fetchedFestival);
      setStages(fetchedStages);
      setDates(fetchedDates);
      
      // 날짜가 있으면 첫 번째 날짜 자동 선택
      if (fetchedDates.length > 0) {
        setCurrentDay(fetchedDates[0]);
      }
      setLoading(false);
    }

    if (festivalId) initData();
  }, [festivalId]);

  // 2. 날짜가 변경될 때마다 해당 날짜의 공연 데이터 로드
  useEffect(() => {
    async function loadPerformances() {
      if (!festivalId || !currentDay) return;
      
      const data = await getPerformancesByDay(festivalId, currentDay);
      setPerformances(data);
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

  // --- 렌더링 ---
  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;
  }

  if (!festival) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Festival info not found.
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-950 text-white flex flex-col overflow-hidden">
      <div className="flex-shrink-0 z-50">
        <TimetableHeader
          title={festival.name}
          days={dates}
          currentDay={currentDay}
          onSelectDay={setCurrentDay}
        />
      </div>

      <div className="flex-1 relative overflow-hidden">
        {currentDay && (
          <TimetableBody
            stages={stages}
            performances={performances}
            selectedIds={selectedIds} // 이제 string Set입니다
            onToggleId={handleToggle}
          />
        )}
      </div>
    </div>
  );
}