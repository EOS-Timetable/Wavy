'use client';

import { Stage, PerformanceJoined } from '@/utils/dataFetcher';
import PerformanceCard from './PerformanceCard';

interface Props {
  stages: Stage[];
  performances: PerformanceJoined[];
  selectedIds: Set<string>;
  onToggleId: (id: string) => void;
  startHour: number;
  endHour: number;
}

export default function TimetableGrid({ 
  stages, 
  performances, 
  selectedIds, 
  onToggleId,
  startHour, 
  endHour
}: Props) {
  
  // 높이는 CSS 변수(--hour-height)가 제어하므로 JS 상수는 제거하거나 참조용으로만 둡니다.
  const totalHours = endHour - startHour;

  const getPositionStyles = (perf: PerformanceJoined) => {
    const start = new Date(perf.startTime);
    const end = new Date(perf.endTime);
    
    let sH = start.getHours();
    if (sH < startHour && sH < 5) sH += 24; 

    // (시작 시간 - 기준 시간)을 시간 단위(소수점 포함)로 환산
    const startDiffHours = (sH - startHour) + (start.getMinutes() / 60);
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    return {
      // ⚡ [핵심] CSS calc()를 사용하여 브라우저가 높이를 계산하게 함
      top: `calc(var(--hour-height) * ${startDiffHours})`,
      height: `calc(var(--hour-height) * ${durationHours})`,
    };
  };

  return (
    <div 
      className="relative w-full border-l border-white/5 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)]"
      style={{ 
        height: `calc(var(--hour-height) * ${totalHours})`,
        // 배경 줄무늬 간격도 CSS 변수 사용 (절반 = 30분)
        backgroundSize: `100% calc(var(--hour-height) / 2)` 
      }}
    >
      <div className="absolute inset-0 flex w-full h-full">
        {stages.map((stage, idx) => (
          <div 
            key={stage.id} 
            className={`
              flex-1 
              /* ⚡ [수정] StageBar와 동일하게 반응형 너비 적용 */
              min-w-[100px] md:min-w-[135px] 
              
              h-full relative px-0.5 md:px-1
              ${idx < stages.length - 1 ? 'border-r border-white/5' : ''}
            `}
          >
            {performances
              .filter(p => p.stage.id === stage.id)
              .map((perf, pIdx) => (
                <PerformanceCard
                  key={perf.id|| `perf-${stage.id}-${pIdx}`}
                  data={perf}
                  isSelected={selectedIds.has(perf.id)}
                  onToggle={() => onToggleId(perf.id)}
                  style={getPositionStyles(perf)}
                />
              ))
            }
          </div>
        ))}
      </div>
    </div>
  );
}