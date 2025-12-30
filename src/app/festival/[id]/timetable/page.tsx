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
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [performances, setPerformances] = useState<PerformanceJoined[]>([]);
  
  // ID 타입 변경: number -> string
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // 1. 초기 데이터 로드 (페스티벌 정보, 날짜, 스테이지)
  useEffect(() => {
    async function initData() {
      if (!festivalId) return;
      setLoading(true);

      // 병렬로 데이터 가져오기 (속도 최적화)
      const [fetchedFestival, fetchedStages, fetchedDates] = await Promise.all([
        getFestival(festivalId),
        getStages(festivalId),
        getFestivalDates(festivalId),
      ]);

      setFestival(fetchedFestival);
      setStages(fetchedStages);
      setDates(fetchedDates);
      
      // ✅ [수정] 날짜 문자열을 넣는 게 아니라, 그냥 무조건 1일차(1)로 시작합니다.
      // 만약 오늘 날짜에 맞춰 자동으로 탭을 띄우고 싶다면 추가 로직이 필요하지만,
      // 지금은 기본 1일차로 두는 게 안전합니다.
      setCurrentDay(1);

      setLoading(false);
    }

    initData();
  }, [festivalId]);

  // 2. 날짜가 변경될 때마다 해당 날짜의 공연 데이터 로드
  useEffect(() => {
    async function loadPerformances() {
      if (!festivalId) return;
      // 로딩 상태를 여기서 true로 주면 탭 전환 시 깜빡일 수 있으므로 선택적으로 사용
      // setLoading(true); 
      
      // ✅ [수정] getPerformancesByDay에 숫자(1, 2)를 넘깁니다.
      const data = await getPerformancesByDay(festivalId, currentDay);
      setPerformances(data || []);
      
      // setLoading(false);
    }
    loadPerformances();
  }, [festivalId, currentDay]); // currentDay(숫자)가 바뀌면 실행됨

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