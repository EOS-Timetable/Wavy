import mockData from "@/data/mock_db.json";

export interface MockArtist {
  id: number;
  name: string;
  imageUrl: string;
  spotifyId: string;
  trackIds?: string[]; // Spotify 트랙 ID 목록
  description?: string; // 아티스트 바이오/설명
  tags?: string[]; // 아티스트 태그 (#슬램, #떼창 등)
}

export interface MockFestival {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  posterUrl: string;
}

export interface MockPerformance {
  id: number;
  festivalId: number;
  stageId: number;
  artistId: number;
  startTime: string;
  endTime: string;
}

export interface MockPerformanceVideo {
  id: number;
  artistId: number;
  festivalId: number;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
}

export interface MockSetlist {
  id: number;
  artistId: number;
  festivalId: number;
  trackIds: string[]; // 페스티벌별 실제 공연 순서
}

// 아티스트 정보 가져오기
export const getMockArtist = (id: string): MockArtist | null => {
  const artist = mockData.artists.find((a) => a.id === parseInt(id));
  return artist || null;
};

// 아티스트가 참여한 페스티벌 목록 가져오기
export const getMockArtistFestivals = (artistId: string): MockFestival[] => {
  const artistIdNum = parseInt(artistId);

  // 해당 아티스트의 공연 찾기
  const performances = mockData.performances.filter(
    (p) => p.artistId === artistIdNum
  );

  // 페스티벌 ID 중복 제거
  const uniqueFestivalIds = new Set(performances.map((p) => p.festivalId));

  // 페스티벌 정보 가져오기
  const festivals = Array.from(uniqueFestivalIds)
    .map((festivalId) => mockData.festivals.find((f) => f.id === festivalId))
    .filter((f): f is MockFestival => f !== undefined)
    .sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    ); // 최신순 정렬

  return festivals;
};

// 모든 아티스트 목록 가져오기 (검색용)
export const getAllMockArtists = (): MockArtist[] => {
  return mockData.artists;
};

// 특정 아티스트의 특정 페스티벌 공연 정보 가져오기
export const getMockArtistFestivalPerformance = (
  artistId: string,
  festivalId: string
): MockPerformance | null => {
  const artistIdNum = parseInt(artistId);
  const festivalIdNum = parseInt(festivalId);

  const performance = mockData.performances.find(
    (p) => p.artistId === artistIdNum && p.festivalId === festivalIdNum
  );

  return performance || null;
};

// 특정 페스티벌 정보 가져오기
export const getMockFestival = (id: string): MockFestival | null => {
  const festival = mockData.festivals.find((f) => f.id === parseInt(id));
  return festival || null;
};

// 모든 페스티벌 목록 가져오기 (홈 페이지용)
export const getAllMockFestivals = (): MockFestival[] => {
  return mockData.festivals.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
};

// 특정 아티스트의 특정 페스티벌 공연 영상 가져오기
export const getMockArtistFestivalVideos = (
  artistId: string,
  festivalId: string
): MockPerformanceVideo[] => {
  const artistIdNum = parseInt(artistId);
  const festivalIdNum = parseInt(festivalId);

  // performanceVideos가 없거나 배열이 아닌 경우 빈 배열 반환
  if (
    !mockData.performanceVideos ||
    !Array.isArray(mockData.performanceVideos)
  ) {
    return [];
  }

  const videos = mockData.performanceVideos.filter(
    (v) => v.artistId === artistIdNum && v.festivalId === festivalIdNum
  );

  return videos;
};

// 특정 아티스트의 특정 페스티벌 셋리스트 가져오기
export const getMockArtistFestivalSetlist = (
  artistId: string,
  festivalId: string
): MockSetlist | null => {
  const artistIdNum = parseInt(artistId);
  const festivalIdNum = parseInt(festivalId);

  // setlists가 없거나 배열이 아닌 경우 null 반환
  if (!mockData.setlists || !Array.isArray(mockData.setlists)) {
    return null;
  }

  const setlist = mockData.setlists.find(
    (s) => s.artistId === artistIdNum && s.festivalId === festivalIdNum
  );

  return setlist || null;
};
