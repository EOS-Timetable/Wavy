"use client";

import { Star, Tag } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import {
  followArtist,
  unfollowArtist,
  isArtistFollowed,
  getArtistFollowerCount,
} from "@/utils/dataFetcher";
import { useAuth } from "@/hooks/useAuth";

interface ArtistInfoSectionProps {
  artistId: string;
  artistName: string;
  initialFollowerCount: number;
  initialIsFollowed: boolean;
  description?: string | null;
  tags?: string[] | null;
}

const supabase = createClient();

export default function ArtistInfoSection({
  artistId,
  artistName,
  initialFollowerCount,
  initialIsFollowed,
  description,
  tags,
}: ArtistInfoSectionProps) {
  const { user } = useAuth();
  const [isStarred, setIsStarred] = useState(initialIsFollowed);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [isLoading, setIsLoading] = useState(false);

  const normalizedTags = useMemo(() => {
    const arr = (tags || [])
      .map((t) => String(t).trim())
      .filter(Boolean)
      .slice(0, 10);
    return arr.length ? arr : [];
  }, [tags]);

  const normalizedDescription = useMemo(() => {
    const d = (description ?? "").trim();
    return d.length ? d : null;
  }, [description]);

  // 팔로우 상태 동기화
  useEffect(() => {
    if (!user?.id) return;

    async function checkFollowStatus() {
      if (!user) return;
      const followed = await isArtistFollowed(user.id, artistId);
      setIsStarred(followed);
    }

    checkFollowStatus();
  }, [user, artistId]);

  const handleFollowToggle = async () => {
    if (!user?.id) {
      alert("로그인이 필요한 기능입니다.");
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);
      const wasFollowed = isStarred;

      if (wasFollowed) {
        // 언팔로우
        const { error } = await unfollowArtist(user.id, artistId);
        if (error) {
          console.error("Error unfollowing artist:", error);
          alert("팔로우 해제에 실패했습니다.");
          return;
        }
        setIsStarred(false);
        setFollowerCount((prev) => Math.max(0, prev - 1));
      } else {
        // 팔로우
        const { error } = await followArtist(user.id, artistId);
        if (error) {
          console.error("Error following artist:", error);
          alert("팔로우에 실패했습니다.");
          return;
        }
        setIsStarred(true);
        setFollowerCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      alert("팔로우 상태 변경에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-5">
      {/* 타이틀 + 팔로우 버튼 */}
      <div className="flex items-start justify-between">
        <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">
          {artistName}
        </h1>
        <div className="flex items-center gap-2 self-start">
          <button
            type="button"
            onClick={handleFollowToggle}
            disabled={isLoading || !user}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              isStarred
                ? "bg-yellow-500/20 border border-yellow-500/50 hover:bg-yellow-500/30"
                : "bg-white/10 border border-white/20 hover:bg-white/15"
            } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <Star
              className={`w-4 h-4 transition-colors ${
                isStarred ? "text-yellow-400 fill-yellow-400" : "text-gray-400"
              }`}
            />
            <span className="text-sm font-medium">
              {followerCount.toLocaleString()}
            </span>
          </button>
        </div>
      </div>

      {/* 설명/바이오 */}
      {normalizedDescription && (
        <p className="mt-5 text-sm text-gray-300 leading-relaxed whitespace-pre-line">
          {normalizedDescription}
        </p>
      )}

      {/* 태그 */}
      {normalizedTags.length > 0 && (
        <div className="mt-5 flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1 text-xs text-gray-400">
            <Tag className="w-3.5 h-3.5" />
            <span className="font-semibold">Tags</span>
          </div>
          {normalizedTags.map((t) => (
            <span
              key={t}
              className="text-xs font-semibold px-2 py-1 rounded-full bg-white/5 border border-white/10 text-gray-200"
            >
              {t.startsWith("#") ? t : `#${t}`}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}


