'use client';

import { Stage, PerformanceJoined } from '@/utils/dataFetcher';
import PerformanceCard from './PerformanceCard';

interface Props {
  stages: Stage[];
  performances: PerformanceJoined[];
  selectedIds: Set<number>;
  onToggleId: (id: number) => void;
  startHour: number; // 추가됨
  endHour: number;   // 추가됨
}

export default function TimetableGrid({ 
  stages, 
  performances, 
  selectedIds, 
  onToggleId,
  startHour, 
  endHour
}: Props) {
  
  const HOUR_HEIGHT = 120; 
  const PIXELS_PER_MIN = HOUR_HEIGHT / 60;
  
  // 전체 높이는 동적으로 계산된 시간 범위에 따름
  const totalHeight = (endHour - startHour) * HOUR_HEIGHT;

  const getPositionStyles = (perf: PerformanceJoined) => {
    const start = new Date(perf.startTime);
    const end = new Date(perf.endTime);
    
    // [중요] 위치 계산 시 props로 받은 startHour를 기준점으로 사용
    // 시작 시간의 '시(Hour)'가 자정을 넘겨(0, 1, 2...) startHour보다 작으면 +24 처리
    let sH = start.getHours();
    if (sH < startHour && sH < 5) sH += 24; 

    // (현재 시 - 기준 시) * 60 + 현재 분
    const startMinutes = ((sH - startHour) * 60) + start.getMinutes();
    
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    return {
      top: `${startMinutes * PIXELS_PER_MIN}px`,
      height: `${durationMinutes * PIXELS_PER_MIN}px`,
    };
  };

  return (
    <div 
      className="relative w-full border-l border-white/5 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)]"
      style={{ 
        height: `${totalHeight}px`,
        backgroundSize: `100% ${HOUR_HEIGHT / 2}px` 
      }}
    >
      <div className="absolute inset-0 flex w-full h-full">
        {stages.map((stage, idx) => (
          <div 
            key={stage.id} 
            className={`
              flex-1 min-w-[135px] h-full relative px-0.5 md:px-1
              ${idx < stages.length - 1 ? 'border-r border-white/5' : ''}
            `} 
          >
            {performances
              .filter(p => p.stageId === stage.id)
              .map((perf) => (
                <PerformanceCard
                  key={perf.id}
                  data={perf}
                  isSelected={selectedIds.has(perf.id)}
                  onToggle={() => onToggleId(perf.id)}
                  style={getPositionStyles(perf)}
                />
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}