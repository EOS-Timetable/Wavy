// src/components/current/feed/PostCard.tsx
"use client";
import { Post } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge"; // Shadcn
import { Card } from "@/components/ui/card";   // Shadcn
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Shadcn
import { Button } from "@/components/ui/button"; // Shadcn
import { MessageCircle, Heart } from "lucide-react";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const isTube = post.type === "TUBE";
  
  // 타입에 따른 스타일 분기
  const cardStyle = cn(
    "mb-5 border border-white/5 text-white transition-all duration-300",
    isTube ? "bg-gradient-to-br from-[#00f2ff]/5 to-[#161b29] border-[#00f2ff]/30 shadow-[0_0_15px_rgba(0,242,255,0.05)]" : "bg-[#161b29]"
  );

  return (
    <Card className={cardStyle}>
      {/* 1. 페스티벌 헤더 (공통) */}
      <div className={cn("px-4 py-2 text-[10px] font-extrabold flex items-center gap-1.5 bg-black/20", post.festivalColor)}>
        <span>{post.festivalName}</span>
      </div>

      <div className="p-4 pt-3">
        {/* 2. 유저 정보 (공통) */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9 border border-white/10 shadow-sm">
              <AvatarImage src={post.user.avatar} />
              <AvatarFallback className="bg-gray-700 text-xs">{post.user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-100 leading-none mb-1">{post.user.name}</span>
              <span className="text-[11px] text-gray-500">{post.createdAt}</span>
            </div>
          </div>
          
          {/* TUBE 상태 뱃지 */}
          {isTube && (
            <Badge variant="outline" className="border-[#00f2ff] text-[#00f2ff] bg-[#00f2ff]/10 text-[10px] h-6 px-2">
              TUBE · 모집중
            </Badge>
          )}
        </div>

        {/* 3. 본문 컨텐츠 (타입별 분기) */}
        <div className="mb-4">
           {/* PIECE 타입은 이미지 표시 */}
           {post.type === "PIECE" && post.image && (
             <div className="rounded-xl overflow-hidden mb-3 aspect-video bg-gray-800 border border-white/5 relative group">
                <img src={post.image} alt="post" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
             </div>
           )}
           
           <p className={cn("text-[15px] leading-relaxed break-keep", isTube ? "text-white font-medium" : "text-gray-300")}>
             {post.content}
           </p>
        </div>

        {/* 4. 액션 버튼 (TUBE 전용 or 공통 인터랙션) */}
        {isTube ? (
          <Button className="w-full bg-[#00f2ff]/10 text-[#00f2ff] hover:bg-[#00f2ff]/20 border border-[#00f2ff]/20 font-bold">
            손들기 (DM 보내기)
          </Button>
        ) : (
          // RIPPLE, PIECE는 좋아요/댓글 버튼
          <div className="flex items-center gap-4 text-gray-500 text-xs font-medium">
             <button className="flex items-center gap-1 hover:text-pink-500 transition-colors">
               <Heart size={16} /> <span>12</span>
             </button>
             <button className="flex items-center gap-1 hover:text-white transition-colors">
               <MessageCircle size={16} /> <span>4</span>
             </button>
          </div>
        )}
      </div>
    </Card>
  );
}