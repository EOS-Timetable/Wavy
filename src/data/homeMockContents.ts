export type HomeFestivalKey = "pentaport" | "busan" | "countdown";

export interface HomeSavedFestival {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  posterUrl?: string;
}

// 페스티벌 이름으로 키워드 매핑
export const getFestivalKey = (festivalName: string): HomeFestivalKey | null => {
  const name = festivalName.toLowerCase();
  if (name.includes("펜타포트") || name.includes("pentaport")) return "pentaport";
  if (name.includes("부산") || name.includes("busan")) return "busan";
  if (name.includes("카운트다운") || name.includes("countdown")) return "countdown";
  return null;
};

// Home 화면용 "저장된 페스티벌" 목업 (D-Day 배너 드롭다운용)
export const MOCK_HOME_FESTIVALS: HomeSavedFestival[] = [
  {
    id: "mock-pentaport",
    name: "인천 펜타포트 락 페스티벌",
    startDate: "2026-08-01",
    endDate: "2026-08-03",
    posterUrl:
      "https://i.namu.wiki/i/JhXPjDXOVmox2ey4AQ2iRVkr5LeOMBE32gK6EgzVz5OLPmElPHrWKdtStyeLQsJQ0kWTgOkQbW6zIdkex8nb1Q.webp",
  },
  {
    id: "mock-busan-rock",
    name: "부산 록 페스티벌",
    startDate: "2026-09-12",
    endDate: "2026-09-13",
    posterUrl:
      "https://i.namu.wiki/i/UFq4wrLLoq8M2vrZdTJUzztsGgFMJBvkRadf3Zq664mqqRNyk8aeBhjm9NnHnrELZHGhiA5WBvf2v53bQ6ABAdWvATTmiXG9YdiE376Zkyv3sO7AV3Z3vovAzuWz7b1dy1ivVZfLOpFp4udMdD6p3w.webp",
  },
  {
    id: "mock-countdown",
    name: "카운트다운 판타지",
    startDate: "2026-12-31",
    endDate: "2027-01-01",
    posterUrl:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2070&auto=format&fit=crop",
  },
];

// Home This Year 목업 데이터 (인스타 링크 포함)
export const MOCK_THIS_YEAR_CONTENTS: Record<HomeFestivalKey, any[]> = {
  pentaport: [
    {
      id: "pentaport-ty-1",
      category: "라인업" as const,
      title: "최종 라인업 안내",
      date: "2시간 전",
      linkUrl: "https://www.instagram.com/p/DMwZx--v0HG/?igsh=MXE5MjQwd2pmaWg4eA==",
      imageUrl: "data:image/jpeg;base64,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",
      isNew: true,
    },
    {
      id: "pentaport-ty-2",
      category: "티켓" as const,
      title: "얼리버드 티켓 오픈 예고",
      date: "1일 전",
      linkUrl: "https://www.instagram.com/p/DIyBaWvv5Sc/?igsh=cHd6NG9ydXl3eXlj",
      imageUrl: undefined,
    },
    {
      id: "pentaport-ty-3",
      category: "MD" as const,
      title: "공식 MD 1차 온라인 선판매 OPEN",
      date: "3일 전",
      linkUrl: "https://www.instagram.com/p/DLy0iUgu5aB/?igsh=Zmpwc2J5am42MDJh",
      imageUrl: undefined,
    },
    {
      id: "pentaport-ty-4",
      category: "현장안내" as const,
      title: "셔틀 운항편 확정 및 판매 종료 일정 공지",
      date: "4일 전",
      linkUrl: "https://www.instagram.com/p/DMWqYIcP3Nr/?igsh=MWp3bTRlODV0NmhkbA==",
      imageUrl: undefined,
    },
    {
      id: "pentaport-ty-5",
      category: "현장안내" as const,
      title: "F&B 메뉴 안내",
      date: "5일 전",
      linkUrl: "https://www.instagram.com/p/DMhfV6puBET/?igsh=aWlzcjA1emxjOTNk",
      imageUrl: undefined,
    },
  ],
  busan: [
    {
      id: "busan-ty-1",
      category: "라인업" as const,
      title: "부산 록 페스티벌 2025 라인업 공개",
      date: "3일 전",
      linkUrl: "#",
      imageUrl:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070&auto=format&fit=crop",
    },
    {
      id: "busan-ty-2",
      category: "티켓" as const,
      title: "얼리버드 티켓 오픈 안내",
      date: "5일 전",
      linkUrl: "#",
      imageUrl:
        "https://images.unsplash.com/photo-1478147427282-58a87a120781?q=80&w=2070&auto=format&fit=crop",
    },
    {
      id: "busan-ty-3",
      category: "MD" as const,
      title: "부산 록 페스티벌 공식 굿즈 출시",
      date: "1주 전",
      linkUrl: "#",
      imageUrl:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=2070&auto=format&fit=crop",
    },
  ],
  countdown: [
    {
      id: "countdown-ty-1",
      category: "라인업" as const,
      title: "카운트다운판타지 2025 메인 라인업 공개",
      date: "1일 전",
      linkUrl: "#",
      imageUrl:
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2070&auto=format&fit=crop",
      isNew: true,
    },
    {
      id: "countdown-ty-2",
      category: "티켓" as const,
      title: "프리셀 티켓 오픈 안내",
      date: "2일 전",
      linkUrl: "#",
      imageUrl:
        "https://images.unsplash.com/photo-1504384764586-bb4be8b97933?q=80&w=2070&auto=format&fit=crop",
    },
    {
      id: "countdown-ty-3",
      category: "이벤트" as const,
      title: "새해 카운트다운 특별 이벤트",
      date: "3일 전",
      linkUrl: "#",
      imageUrl:
        "https://images.unsplash.com/photo-1517457210928-2b997b16780f?q=80&w=2070&auto=format&fit=crop",
    },
    {
      id: "countdown-ty-4",
      category: "현장안내" as const,
      title: "공연장 안내 및 교통편 안내",
      date: "4일 전",
      linkUrl: "#",
      imageUrl:
        "https://images.unsplash.com/photo-1505373877861-8beca1870195?q=80&w=2070&auto=format&fit=crop",
    },
  ],
};

// Home Legacy 목업 데이터
export const MOCK_LEGACY_CONTENTS: Record<HomeFestivalKey, any[]> = {
  pentaport: [
    {
      id: "pentaport-lc-1",
      category: "Recap" as const,
      title: "[2024 PENTAPORT] After Movie",
      year: "2024",
      linkUrl: "https://www.youtube.com/watch?v=FuznOBsIMes",
      source: "YouTube",
      thumbnailUrl:
        "",
    },
    {
      id: "pentaport-lc-2",
      category: "후기글" as const,
      title: "폭우 속의 펜타포트, 그래도 행복했다",
      year: "2024",
      linkUrl: "#",
      source: "Instagram",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1514525253164-ff4ade295d0d?q=80&w=2070&auto=format&fit=crop",
    },
    {
      id: "pentaport-lc-3",
      category: "라인업" as const,
      title: "The Strokes, 엘르가든 포함 60팀",
      year: "2024",
      linkUrl: "#",
      source: "Instagram",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070&auto=format&fit=crop",
    },
    {
      id: "pentaport-lc-4",
      category: "MD" as const,
      title: "2024 한정판 굿즈 리뷰",
      year: "2024",
      linkUrl: "#",
      source: "Instagram",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1523240795600-2035cac60245?q=80&w=2070&auto=format&fit=crop",
    },
  ],
  busan: [
    {
      id: "busan-lc-1",
      category: "Recap" as const,
      title: "부산 록 페스티벌 2024 하이라이트",
      year: "2024",
      linkUrl: "#",
      source: "YouTube",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1478147427282-58a87a120781?q=80&w=2070&auto=format&fit=crop",
    },
    {
      id: "busan-lc-2",
      category: "후기글" as const,
      title: "2024 부산 록 페스티벌 후기",
      year: "2024",
      linkUrl: "#",
      source: "Instagram",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070&auto=format&fit=crop",
    },
  ],
  countdown: [
    {
      id: "countdown-lc-1",
      category: "Recap" as const,
      title: "카운트다운판타지 2024 하이라이트",
      year: "2024",
      linkUrl: "#",
      source: "YouTube",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2070&auto=format&fit=crop",
    },
    {
      id: "countdown-lc-2",
      category: "후기글" as const,
      title: "2024 새해를 맞이한 카운트다운판타지",
      year: "2024",
      linkUrl: "#",
      source: "Instagram",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1514525253164-ff4ade295d0d?q=80&w=2070&auto=format&fit=crop",
    },
    {
      id: "countdown-lc-3",
      category: "라인업" as const,
      title: "2024 카운트다운판타지 최종 라인업",
      year: "2024",
      linkUrl: "#",
      source: "Instagram",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2070&auto=format&fit=crop",
    },
  ],
};


