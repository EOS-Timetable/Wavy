import { useMemo } from 'react';
import { PerformanceJoined } from '@/utils/dataFetcher';

interface TimetableLayout {
  startHour: number;
  endHour: number;
  topPadding: number;
  bottomPadding: number;
}

export const useTimetableLayout = (performances: PerformanceJoined[]): TimetableLayout => {
  return useMemo(() => {
    // 1. 데이터가 없을 때 기본값
    if (!performances || performances.length === 0) {
      return { startHour: 10, endHour: 24, topPadding: 60, bottomPadding: 60 };
    }

    let minH = 24;
    let maxH = 0;

    let minStartTime = Number.MAX_SAFE_INTEGER;
    let firstPerfMinute = 0;

    let maxEndTime = 0;
    let lastPerfMinute = 0;

    performances.forEach((p) => {
      const start = new Date(p.startTime);
      const end = new Date(p.endTime);
      
      const startTimeVal = start.getTime();
      const endTimeVal = end.getTime();

      let sH = start.getHours();
      let eH = end.getHours();

      // 새벽 시간 보정 (00~04시 -> 24~28시)
      if (sH < 9) sH += 24;
      if (eH < 9) eH += 24;

      // 그리드 종료 시간 계산 (분이 있으면 올림)
      let gridEndHour = eH;
      if (end.getMinutes() > 0) gridEndHour += 1;

      if (sH < minH) minH = sH;
      if (gridEndHour > maxH) maxH = gridEndHour;

      // 가장 빠른 시작 시간 추적
      if (startTimeVal < minStartTime) {
        minStartTime = startTimeVal;
        firstPerfMinute = start.getMinutes();
      }

      // 가장 늦은 종료 시간 추적
      if (endTimeVal > maxEndTime) {
        maxEndTime = endTimeVal;
        lastPerfMinute = end.getMinutes();
      }
    });

    // --- 패딩 계산 로직 ---

    // 1. 상단 패딩: 30분 미만 시작이면 좁으니까 패딩 추가
    const tPadding = firstPerfMinute < 30 ? 60 : 0;

    // 2. 하단 패딩:
    // - 정각 종료(0분) -> 꽉 참 -> 패딩 60px
    // - 30분 초과 종료 -> 여백 좁음 -> 패딩 60px
    // - 1~30분 사이 종료 -> 여백 충분 -> 패딩 0px
    let bPadding = 0;
    if (lastPerfMinute === 0) {
      bPadding = 60;
    } else if (lastPerfMinute > 30) {
      bPadding = 60;
    } else {
      bPadding = 0;
    }

    return {
      startHour: minH,
      endHour: maxH,
      topPadding: tPadding,
      bottomPadding: bPadding,
    };
  }, [performances]);
};