'use client';

interface Props {
  startHour: number;
  endHour: number;
}

export default function TimelineSidebar({ startHour, endHour }: Props) {
  // Grid와 높이를 맞춰야 합니다 (1시간 = 120px)
  const HOUR_HEIGHT = 120;
  
  // startHour부터 endHour까지 시간 배열 생성
  const hours = Array.from(
    { length: endHour - startHour }, 
    (_, i) => startHour + i
  );

  return (
    <div className="flex flex-col items-center w-full select-none">
      {hours.map((hour) => {
        // 24시 넘어가면 0시, 1시... 로 표기 (필요시 사용)
        const displayHour = hour >= 24 ? hour - 24 : hour;
        
        return (
          <div 
            key={hour} 
            style={{ height: `${HOUR_HEIGHT}px` }} 
            className="w-full relative"
          >
            {/* 1. 정각 (Hour) 표시 - 상단 라인에 걸치도록 배치 */}
            <div className="absolute -top-3 w-full text-center z-10">
              <span className="text-base md:text-lg font-bold text-gray-200 block bg-slate-950 px-1">
                {displayHour}
              </span>
            </div>

            {/* 2. 30분 (30) 표시 - 높이의 절반(50%) 지점에 배치 */}
            <div className="absolute top-1/2 -translate-y-1/2 w-full text-center">
              <span className="text-xs md:text-sm font-medium text-gray-500 block bg-slate-950 px-1">
                30
              </span>
            </div>
          </div>
        );
      })}
      {/* 마지막 종료 시간 표시 (예: 24시 or 끝나는 시간) */}
      <div className="w-full relative h-0">
        <div className="absolute -top-3 w-full text-center z-10">
          <span className="text-base md:text-lg font-bold text-gray-200 block bg-slate-950 px-1">
            {endHour >= 24 ? endHour - 24 : endHour}
          </span>
        </div>
      </div>
    </div>
  );
}