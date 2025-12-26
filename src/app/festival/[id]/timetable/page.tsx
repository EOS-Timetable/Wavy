'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { 
  getFestival, 
  getStages, 
  getFestivalDates, 
  getPerformancesByDay 
} from '@/utils/dataFetcher';

// 분리된 컴포넌트 임포트
import TimetableHeader from '@/components/timetable/TimetableHeader';
import TimetableBody from '@/components/timetable/TimetableBody';

export default function TimetablePage() {
  const params = useParams();
  const festivalId = params.id as string;

  // --- 1. 데이터 로드 ---
  const festival = getFestival(festivalId);
  
  // stages와 dates는 festivalId가 바뀔 때만 다시 계산
  const stages = useMemo(() => getStages(festivalId), [festivalId]);
  const festivalDates = useMemo(() => getFestivalDates(festivalId), [festivalId]);

  // --- 2. 상태 관리 ---
  const [currentDay, setCurrentDay] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // [수정된 useEffect]
  // festivalDates 배열 자체가 아니라 길이(length)나 festivalId를 의존성으로 사용하거나
  // festivalDates가 useMemo로 안정화되었으므로 그대로 써도 되지만, 
  // 가장 안전한 방법은 아래와 같이 조건을 명확히 하는 것입니다.
  useEffect(() => {
    // 날짜 데이터가 있고, 아직 선택된 날짜가 없을 때만 첫 번째 날짜로 설정
    if (festivalDates.length > 0 && !currentDay) {
      setCurrentDay(festivalDates[0]);
    }
  }, [festivalDates, currentDay]); 
  // ↑ 만약 여전히 에러가 난다면 [festivalDates.join(','), currentDay] 처럼 primitive로 변환해서 넣으세요.
  // 하지만 위 코드의 useMemo 덕분에 festivalDates 참조가 유지되어 해결될 것입니다.

  // --- 3. 현재 선택된 날짜의 공연 데이터 필터링 ---
  const currentPerformances = useMemo(() => {
    if (!currentDay) return [];
    return getPerformancesByDay(festivalId, currentDay);
  }, [festivalId, currentDay]);

  // --- 4. 핸들러 ---
  const handleToggle = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  // --- 5. 렌더링 (예외 처리 포함) ---
  if (!festival) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p>Festival info not found.</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-950 text-white flex flex-col overflow-hidden">
      {/* 상단 헤더 (제목 + 날짜 선택) */}
      <div className="flex-shrink-0 z-50">
        <TimetableHeader 
          title={festival.name}
          days={festivalDates}
          currentDay={currentDay}
          onSelectDay={setCurrentDay}
        />
      </div>

      {/* 메인 바디 (스테이지 바 + 시간표 콘텐츠) */}
      {/* 데이터 로딩 전(currentDay가 없을 때)에는 렌더링 방지 혹은 스켈레톤 처리 */}
      <div className="flex-1 relative overflow-hidden">
        {currentDay && (
          <TimetableBody 
            stages={stages}
            performances={currentPerformances}
            selectedIds={selectedIds}
            onToggleId={handleToggle}
          />
        )}
      </div>
    </div>
  );
}