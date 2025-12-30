'use client';

import { useState, useRef, useEffect } from 'react';
import { PerformanceJoined } from '@/utils/dataFetcher';

interface Props {
  data: PerformanceJoined;
  isSelected: boolean;
  onToggle: () => void;
  style?: React.CSSProperties;
}

export default function PerformanceCard({ data, isSelected, onToggle, style }: Props) {
  // 👁️ UI 표시용 State (렌더링 유발)
  const [isPeeking, setIsPeeking] = useState(false);
  
  // ⚡ 로직 판단용 Ref (즉시 반영, 렌더링 X)
  const isLongPress = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const timeRange = `${formatTime(data.startTime)} - ${formatTime(data.endTime)}`;

  // 👇 1. 터치 시작
  const handlePointerDown = () => {
    // 초기화
    isLongPress.current = false; 
    if (timerRef.current) clearTimeout(timerRef.current);

    // 200ms 뒤에 "롱프레스"로 판단
    timerRef.current = setTimeout(() => {
      isLongPress.current = true; // 로직용 플래그 ON
      setIsPeeking(true);         // UI용 상태 ON (카드 확장)
    }, 200);
  };

  // 👇 2. 터치 종료 (손을 뗄 때 or 밖으로 나갈 때)
  const handlePointerUpOrLeave = (e: React.PointerEvent) => {
    // 타이머 취소 (아직 200ms 안 지났으면 롱프레스 아님)
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (isLongPress.current) {
      // A. 꾹 눌렀다 뗀 경우 (롱프레스 O)
      // -> 미리보기만 끄고, 토글은 실행하지 않음
      setIsPeeking(false);
      isLongPress.current = false;
    } else {
      // B. 짧게 탭한 경우 (롱프레스 X)
      // -> 토글(선택) 실행
      // (단, 드래그로 나간 경우가 아닐 때만)
      if (e.type === 'pointerup') {
        onToggle();
      }
    }
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUpOrLeave}
      onPointerLeave={handlePointerUpOrLeave}
      // 🚨 모바일에서 꾹 누를 때 시스템 메뉴(우클릭) 뜨는 것 방지
      onContextMenu={(e) => e.preventDefault()}
      
      style={{ ...style, minHeight: style?.height }}
      className={`
        absolute w-full rounded-md border cursor-pointer transition-all duration-200 overflow-hidden group select-none touch-none
        
        hover:z-50 hover:scale-[1.05] hover:shadow-xl hover:!h-auto
        
        ${/* 롱프레스 상태일 때 스타일 적용 */''}
        ${isPeeking ? 'z-50 scale-[1.05] shadow-xl !h-auto' : ''}
        
        ${isSelected
          ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-900/50 text-white z-20' 
          : 'bg-gray-800/90 border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-500'}
      `}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-0.5 transition-colors ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />

      <div className="pl-2 pr-1 py-1 h-full flex flex-col justify-center pointer-events-none">
        <h3 className={`
          font-bold text-xs leading-tight mb-0.5 truncate 
          group-hover:whitespace-normal group-hover:overflow-visible
          ${isPeeking ? 'whitespace-normal overflow-visible' : ''}
        `}>
          {data.artist.name}
        </h3>
        
        <p className={`text-[10px] font-mono leading-none ${isSelected ? 'text-blue-100' : 'text-gray-400/80'}`}>
          {timeRange}
        </p>
      </div>
    </div>
  );
}