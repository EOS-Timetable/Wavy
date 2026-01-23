// src/components/current/CurrentView.tsx
"use client";

import { useRouter } from "next/navigation";
import { Post } from "@/types";
import SmartFilter from "./layout/SmartFilter";
import PostCard from "./feed/PostCard";
import { PenSquare } from "lucide-react"; // 아이콘 라이브러리

interface CurrentViewProps {
  initialPosts: Post[];
  activeFilter: string;
}

export default function CurrentView({ initialPosts, activeFilter }: CurrentViewProps) {
  const router = useRouter();

  // 필터 변경 핸들러: URL을 변경하여 서버 컴포넌트(Controller)가 새 데이터를 가져오게 유도
  const handleFilterChange = (filterId: string) => {
    // 쿼리 파라미터 업데이트 (Shallow routing이 아닌 실제 네비게이션으로 데이터 갱신)
    router.push(`/current?filter=${filterId}`);
  };

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
      {/* 1. 상단 헤더 & 스마트 필터 */}
      <header className="flex-none bg-[#0a0e17]/95 backdrop-blur-md z-10 border-b border-white/5 pb-2">
        <div className="px-5 pt-14 pb-4">
           <h1 className="text-2xl font-extrabold text-white tracking-tight">Current</h1>
        </div>
        
        <SmartFilter 
          activeFilter={activeFilter} 
          onFilterChange={handleFilterChange} 
        />
      </header>

      {/* 2. 메인 피드 리스트 (스크롤 영역) */}
      <main className="flex-1 overflow-y-auto px-5 py-6 scrollbar-hide">
        {initialPosts.length > 0 ? (
          initialPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          // 게시글이 없을 때 Empty State
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 space-y-4">
            <div className="text-4xl">🌊</div>
            <p>아직 이 파도엔 글이 없네요.<br/>첫 번째 물결을 일으켜보세요!</p>
          </div>
        )}
        
        {/* 하단 여백 (FAB 및 탭바 공간 확보) */}
        <div className="h-24" />
      </main>

      {/* 3. FAB (글쓰기 버튼) */}
      <button 
        onClick={() => alert("글쓰기 Drawer 열기")}
        className="absolute bottom-24 right-5 w-14 h-14 rounded-full bg-[#00f2ff] text-black shadow-[0_0_20px_rgba(0,242,255,0.4)] flex items-center justify-center transition-transform active:scale-90 z-20 hover:bg-[#80f9ff]"
      >
        <PenSquare size={24} strokeWidth={2.5} />
      </button>
    </div>
  );
}