'use client';
import StageBar from './StageBar';
import TimelineSidebar from './TimelineSidebar';
import TimetableGrid from './TimetableGrid';
import { Stage, PerformanceJoined } from '@/utils/dataFetcher';
import { useTimetableLayout } from '@/hooks/useTimetableLayout';

interface TimetableBodyProps {
  stages: Stage[];
  performances: PerformanceJoined[];
  selectedIds: Set<string>;
  onToggleId: (id: string) => void;
}

export default function TimetableBody({ stages, performances, selectedIds, onToggleId }: TimetableBodyProps) {
  const { startHour, endHour, topPadding, bottomPadding } = useTimetableLayout(performances);

  const SIDEBAR_WIDTH = 56;
  
  return (
    // ⚡ [핵심] Tailwind로 CSS 변수 선언 (모바일 60px / 데스크탑 120px)
    <div 
      className="w-full h-full overflow-auto bg-slate-950 custom-scrollbar relative max-w-7xl mx-auto border-x border-white/10
                 [--hour-height:60px] md:[--hour-height:120px]" 
    >      
      <div 
        className="min-w-[350px] md:min-w-full relative flex flex-col"
        style={{ minHeight: '100%' }}
      >
        {/* [A] 상단 고정 헤더 (StageBar) */}
        <div className="sticky top-0 z-40 flex bg-slate-950/95 backdrop-blur-sm border-b border-white/10">
          <div 
            className="flex-shrink-0 border-r border-white/10 bg-slate-950"
            style={{ width: `${SIDEBAR_WIDTH}px` }}
          />
          <div className="flex-1">
            <StageBar stages={stages} />
          </div>
        </div>

        {/* [B] 메인 그리드 영역 */}
        <div className="flex relative">
          
          {/* B-1. 좌측 시간축 (TimelineSidebar) */}
          <div 
            className="sticky left-0 z-30 bg-slate-950 border-r border-white/10 flex-shrink-0"
            style={{ 
              width: `${SIDEBAR_WIDTH}px`,
              paddingTop: `${topPadding}px`,
              paddingBottom: `${bottomPadding}px`
            }}
          >
            <TimelineSidebar startHour={startHour} endHour={endHour} />
          </div>

          {/* B-2. 공연 그리드 (TimetableGrid) */}
          <div 
            className="flex-1"
            style={{ 
              paddingTop: `${topPadding}px`, 
              paddingBottom: `${bottomPadding}px` 
            }}
          >
            <TimetableGrid 
              stages={stages} 
              performances={performances}
              selectedIds={selectedIds}
              onToggleId={onToggleId}
              startHour={startHour}
              endHour={endHour}
            />
          </div>
        </div>
      </div>
    </div>
  );
}