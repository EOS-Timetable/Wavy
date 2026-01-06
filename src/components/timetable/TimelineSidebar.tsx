'use client';

interface Props {
  startHour: number;
  endHour: number;
}

export default function TimelineSidebar({ startHour, endHour }: Props) {
  const hours = Array.from(
    { length: endHour - startHour }, 
    (_, i) => startHour + i
  );

  return (
    <div className="flex flex-col items-center w-full select-none">
      {hours.map((hour, index) => {
        const displayHour = hour >= 24 ? hour - 24 : hour;
        
        // ✅ [수정 포인트 1] 첫 번째 항목인지 확인
        const isFirst = index === 0;
        
        return (
          <div 
            key={hour} 
            style={{ height: 'var(--hour-height)' }} 
            className="w-full relative border-b border-white/5 last:border-none"
          >
            {/* 1. 정각 (Hour) 표시 */}
            <div className={`
              absolute w-full text-center z-10
              /* ✅ [수정 포인트 2] 첫 번째 시간만 top-0으로 내려서 표시, 나머지는 기존대로 중앙 정렬(-top-...) */
              ${isFirst ? 'top-0' : '-top-2.5 md:-top-3'}
            `}>
              <span className="
                block bg-slate-950 px-1 font-bold text-gray-200
                text-xs md:text-lg 
              ">
                {displayHour}
              </span>
            </div>

            {/* 2. 30분 (30) 표시 */}
            <div className="absolute top-1/2 -translate-y-1/2 w-full text-center">
              <span className="
                block bg-slate-950 px-1 font-medium text-gray-600
                text-[10px] md:text-sm 
              ">
                30
              </span>
            </div>
          </div>
        );
      })}

      {/* 마지막 종료 시간 표시 (기존 유지) */}
      <div className="w-full relative h-0">
        <div className="absolute -top-2.5 md:-top-3 w-full text-center z-10">
          <span className="
            block bg-slate-950 px-1 font-bold text-gray-200
            text-xs md:text-lg
          ">
            {endHour >= 24 ? endHour - 24 : endHour}
          </span>
        </div>
      </div>
    </div>
  );
}