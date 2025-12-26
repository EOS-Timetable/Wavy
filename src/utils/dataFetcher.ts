import db from '@/data/mock_db.json';

// --- Types ---
export interface Artist {
  id: number;
  name: string;
  imageUrl: string;
  spotifyId: string;
}

export interface Stage {
  id: number;
  festivalId: number;
  name: string;
  color: string;
}

export interface PerformanceJoined {
  id: number;
  stageId: number;
  startTime: string; // ISO String
  endTime: string;   // ISO String
  artist: Artist;
  stage: Stage;
}

// --- Helper Functions ---

// 1. 페스티벌 정보 가져오기
export const getFestival = (id: string | number) => {
  return db.festivals.find((f) => f.id === Number(id));
};

// 2. 특정 페스티벌의 스테이지 목록 가져오기
export const getStages = (festivalId: string | number) => {
  return db.stages.filter((s) => s.festivalId === Number(festivalId));
};

// 3. 공연 데이터 날짜별로 가져오기 (핵심 조인 로직)
export const getPerformancesByDay = (
  festivalId: string | number,
  dateString: string // "2025-08-02" 형식
): PerformanceJoined[] => {
  const fid = Number(festivalId);

  return db.performances
    .filter((p) => {
      // 페스티벌 ID 일치 && 날짜 일치 확인
      const pDate = p.startTime.split('T')[0];
      // 해당 스테이지가 이 페스티벌에 속하는지도 확인 (데이터 무결성)
      const stage = db.stages.find(s => s.id === p.stageId);
      return stage?.festivalId === fid && pDate === dateString;
    })
    .map((p) => {
      const artist = db.artists.find((a) => a.id === p.artistId);
      const stage = db.stages.find((s) => s.id === p.stageId);

      return {
        ...p,
        artist: artist!, // !는 데이터가 무조건 있다고 가정 (실제론 예외처리 필요)
        stage: stage!,
      };
    });
};

// 4. 페스티벌의 공연 날짜 목록 추출 (Day 1, Day 2... 대신 실제 날짜 사용)
export const getFestivalDates = (festivalId: string | number) => {
  const festival = getFestival(festivalId);
  if (!festival) return [];

  const start = new Date(festival.startDate);
  const end = new Date(festival.endDate);
  const dates: string[] = [];

  // 날짜 루프
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    // [수정] toISOString() 대신 로컬 시간 기준으로 날짜 문자열 생성
    // 이유: toISOString은 UTC 기준이라 한국 시간 00:00을 전날 15:00으로 변환해버림
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    const dateStr = `${year}-${month}-${day}`;
    dates.push(dateStr);
  }

  return dates;
};