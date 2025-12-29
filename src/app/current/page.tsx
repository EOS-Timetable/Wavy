// src/app/current/page.tsx

import CurrentView from "@/components/current/CurrentView";

// ----------------------------------------------------------------------
// 1. 타입 정의 (나중에 src/types/post.ts 등으로 분리 추천)
// ----------------------------------------------------------------------

export type PostType = "TUBE" | "RIPPLE" | "PIECE";

export interface Post {
  id: string;
  type: PostType;
  festivalId: string;
  festivalName: string;
  festivalColor: string; // Tailwind class (ex: text-yellow-400) or Hex
  content: string;
  image?: string; // PIECE 타입용
  createdAt: string; // ISO String or "방금 전"
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  tubeStatus?: "OPEN" | "CLOSED"; // TUBE 타입용
}

// ----------------------------------------------------------------------
// 2. Mock Data & Fetching 함수 (나중에 DB 호출로 교체)
// ----------------------------------------------------------------------

const MOCK_POSTS: Post[] = [
  {
    id: "p1",
    type: "TUBE",
    festivalId: "penta_2025",
    festivalName: "펜타포트 2025",
    festivalColor: "text-yellow-400",
    content: "토요일 헤드라이너때 깃발 들고 같이 슬램존 들어가실 분? 🔥 텐션 높은 분들 환영합니다!",
    createdAt: "방금 전",
    user: { id: "u1", name: "슬램전사", avatar: "https://github.com/shadcn.png" },
    tubeStatus: "OPEN",
  },
  {
    id: "p2",
    type: "RIPPLE",
    festivalId: "water_2025",
    festivalName: "워터밤 서울",
    festivalColor: "text-blue-400",
    content: "올해 라인업 진짜 역대급인듯;; 근데 블루팀 티켓 벌써 매진 실화냐... ㅠㅠ",
    createdAt: "5분 전",
    user: { id: "u2", name: "물총장전완료" },
  },
  {
    id: "p3",
    type: "PIECE",
    festivalId: "penta_2025",
    festivalName: "펜타포트 2025",
    festivalColor: "text-yellow-400",
    content: "작년 펜타 노을 질 때 분위기.. 올해도 이 바이브 기대한다 🤘 #펜타포트 #추억팔이",
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1000",
    createdAt: "20분 전",
    user: { id: "u3", name: "락페고인물" },
  },
  {
    id: "p4",
    type: "RIPPLE",
    festivalId: "gmf_2025",
    festivalName: "GMF 2025",
    festivalColor: "text-green-400",
    content: "잔디마당 돗자리 자리 잡으려면 몇 시에 가야 할까요? 🤔",
    createdAt: "1시간 전",
    user: { id: "u4", name: "가을소풍" },
  },
];

// DB Fetch 시뮬레이션 함수
async function getPosts(filter: string): Promise<Post[]> {
  // 실제로는: const res = await fetch(`api/posts?filter=${filter}`);
  
  // 네트워크 딜레이 시뮬레이션 (0.5초)
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (filter === "all" || !filter) {
    return MOCK_POSTS;
  }
  
  return MOCK_POSTS.filter((post) => post.festivalId === filter);
}

// ----------------------------------------------------------------------
// 3. Server Component (Page)
// ----------------------------------------------------------------------

interface PageProps {
  // Next.js 13+ App Router에서 searchParams는 객체로 들어옵니다.
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function CurrentPage({ searchParams }: PageProps) {
  // 1. 쿼리 스트링 파싱 (기본값 'all')
  const filter = (searchParams.filter as string) || "all";

  // 2. 데이터 Fetching (Server Side)
  const posts = await getPosts(filter);

  // 3. Client Component 렌더링
  // 데이터를 props로 넘겨줘서 초기 상태를 잡아줍니다 (Hydration)
  return (
    <main className="w-full h-full relative bg-[#0a0e17] text-white">
      <CurrentView initialPosts={posts} activeFilter={filter} />
    </main>
  );
}