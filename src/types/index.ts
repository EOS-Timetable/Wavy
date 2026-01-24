// src/types/index.ts

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