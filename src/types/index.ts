// src/types/index.ts

// 기존 내용이 있다면 그 아래에 추가
export interface Post {
  id: number;
  author: {
    name: string;
    avatar: string;
    handle: string;
  };
  content: string;
  images?: string[];
  timestamp: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  festivalTag?: string; // 페스티벌 태그 (선택)
}