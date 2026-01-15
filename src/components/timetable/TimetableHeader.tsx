'use client';

import React from 'react';
import DaySelector from './DaySelector';

interface TimetableHeaderProps {
  title: string;
  subTitle?: string;
  onTitleClick?: () => void;
  days: string[];
  currentDay: number;
  onSelectDay: (dayNum: number) => void;
  headerAction?: React.ReactNode; 
}

export default function TimetableHeader({ 
  title, 
  subTitle = "Timetable", 
  onTitleClick,
  days, 
  currentDay, 
  onSelectDay,
  headerAction 
}: TimetableHeaderProps) {
  
  const isInteractive = !!onTitleClick;

  return (
    <header className="bg-slate-950 border-b border-white/10 w-full z-50 relative shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 md:px-6 md:pt-6 md:pb-4 flex flex-col gap-4">
        
        {/* 상단 행 */}
        <div className="flex justify-between items-start w-full gap-3 md:gap-4">
          
          {/* [좌측] 제목 영역 컨테이너
              - flex-1: 남은 공간을 모두 차지하려고 시도함
              - min-w-0: 내용이 넘치면 줄어들 수 있게 허용
          */}
          <div className="flex flex-col items-start flex-1 min-w-0 mr-auto">
            
            <div 
              onClick={isInteractive ? onTitleClick : undefined}
              className={`
                /* ⚡ [핵심 수정] Flex로 공간을 확보하되, 최대 60vw는 넘지 않게 제한 */
                w-full max-w-[60vw] md:max-w-md
                
                ${isInteractive ? 'group cursor-pointer' : ''}
              `}
            >
              <h1 className={`
                text-white font-extrabold 
                text-xl md:text-3xl 
                
                /* 말줄임 설정 */
                truncate leading-tight block
                
                transition-colors pb-0.5
                ${isInteractive 
                  ? 'border-b-2 border-gray-600 md:group-hover:border-gray-400' 
                  : ''}
              `}>
                {subTitle}
              </h1>
            </div>

            <p className="
              text-gray-400 font-medium truncate w-full max-w-[60vw] md:max-w-md
              
              /* ⚡ 모바일: text-xs (작게 유지) / 웹: text-xl (시원하게 키움) */
              text-xs md:text-xl
              
              /* 여백 미세 조정 */
              mt-1 md:mt-2 pl-0.5 
            ">
              {title}
            </p>
          </div>

          {/* [우측] 버튼 영역 (절대 줄어들지 않음) */}
          <div className="flex-shrink-0 pt-0.5">
            {headerAction}
          </div>

        </div>

        <DaySelector days={days} currentDay={currentDay} onSelect={onSelectDay} />
      </div>
    </header>
  );
}