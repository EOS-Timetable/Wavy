// src/types/staging.ts

// 1. 기본 페스티벌 정보 (FESTIVAL_BASE)
export interface StagedFestivalBase {
  name: string;
  start_date: string;
  end_date: string;
  place_name: string;
  description?: string;
  poster_url?: string; // OCR 대상 또는 원본 이미지
}

// 2. 아티스트 정보 (ARTIST_BASE)
export interface StagedArtistBase {
  name: string;
  image_url?: string;
  genres?: string[];
}

// 3. 금년도 소식용 (OFFICIAL_LINEUP, TIMETABLE, NOTICE, EXTERNAL_CONTENT)
// ThisYearSection 컴포넌트와 매핑될 데이터
export interface StagedOfficialContent {
  title: string;
  date: string;
  link_url?: string; // 인스타 링크 등
  image_url?: string; // OCR 이미지 또는 썸네일
  content_type?: "라인업" | "티켓" | "MD" | "이벤트" | "현장안내" | "관련글";
  priority?: boolean;
}

// 4. 아카이브 데이터 (ARCHIVE_DATA)
// PerformanceVideosSection 컴포넌트와 매핑
export interface StagedArchiveData {
  title: string;
  video_url: string; // 유튜브 링크
  thumbnail_url?: string;
  artist_name?: string;
}

// 통합 타입
export type StagedRawData = 
  | StagedFestivalBase 
  | StagedArtistBase 
  | StagedOfficialContent 
  | StagedArchiveData;