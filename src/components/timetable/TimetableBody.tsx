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
    // ✅ 로직 분리: 여기서 훅을 호출하여 필요한 값만 받아옵니다.
    const { startHour, endHour, topPadding, bottomPadding } = useTimetableLayout(performances);

    // [중요] 레이아웃 상수 정의
  const SIDEBAR_WIDTH = 56; // w-14 = 56px
  const STAGE_BAR_HEIGHT = 50; 

  return (
    // [변경 1] 전체 스크롤 컨테이너 (가로/세로 모두 여기서 스크롤)
    // custom-scrollbar: 이전에 만든 스크롤바 디자인 적용
    <div className="w-full h-full overflow-auto bg-slate-950 custom-scrollbar relative max-w-7xl mx-auto border-x border-white/10">      
      {/* 내부 컨텐츠 래퍼: 최소 너비 설정으로 가로 스크롤 유도 */}
      <div className="min-w-max flex flex-col relative">

        {/* --- [A] 상단 고정 영역 (StageBar + 좌측 상단 코너) --- */}
        {/* sticky top-0: 세로 스크롤 시 상단에 고정됨 */}
        <div className="sticky top-0 z-40 flex w-full">
          
          {/* A-1. 좌측 상단 코너 (Sidebar 위쪽 빈 공간) */}
          {/* sticky left-0: 가로 스크롤 시 좌측에 고정됨 */}
          {/* z-50: 가장 위에 떠 있어야 함 (Sidebar와 StageBar가 겹치는 부분) */}
          <div 
            className="sticky left-0 top-0 z-50 bg-slate-950 border-r border-b border-white/10 flex-shrink-0"
            style={{ width: `${SIDEBAR_WIDTH}px`, height: `${STAGE_BAR_HEIGHT}px` }}
          />

          {/* A-2. 스테이지 바 (실제 Stage 이름들) */}
          <div className="flex-1 bg-slate-950 border-b border-white/10">
            <StageBar stages={stages} />
          </div>
        </div>


        {/* --- [B] 메인 그리드 영역 (Sidebar + Grid) --- */}
        <div className="flex relative">
          
          {/* B-1. 좌측 고정 시간축 (Sidebar) */}
          {/* sticky left-0: 가로 스크롤 시 좌측에 고정됨 */}
          {/* 세로 스크롤 시에는 부모와 함께 위아래로 움직임 (원하는 동작) */}
          <div 
            className="sticky left-0 z-30 bg-slate-950 border-r border-white/10 flex-shrink-0"
            style={{ 
              width: `${SIDEBAR_WIDTH}px`,
              paddingTop: `${topPadding}px`,
              paddingBottom: `${bottomPadding}px`
            }}
          >
            <TimelineSidebar 
              startHour={startHour} 
              endHour={endHour}
            />
          </div>

          {/* B-2. 실제 공연 그리드 */}
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