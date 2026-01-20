"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  isFestivalInterested,
  saveInterestedFestival,
  removeInterestedFestival,
} from "@/utils/dataFetcher";

interface FestivalSaveButtonProps {
  festivalId: string;
  onSaveChange?: (isSaved: boolean) => void;
}

export default function FestivalSaveButton({
  festivalId,
  onSaveChange,
}: FestivalSaveButtonProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 로그인 유저가 있으면 auth.user.id 사용 (user_interested_festivals.user_id는 auth.users.id FK)
  useEffect(() => {
    let isMounted = true;
    async function resolveUserId() {
      try {
        const { data } = await supabase.auth.getUser();
        if (!isMounted) return;
        // 로그인된 유저만 저장 가능 (FK 제약 때문)
        setUserId(data.user?.id ?? null);
      } catch {
        if (!isMounted) return;
        setUserId(null);
      }
    }
    resolveUserId();
    return () => {
      isMounted = false;
    };
  }, []);

  // 초기 저장 상태 확인
  useEffect(() => {
    async function checkSaved() {
      if (!userId) {
        setIsSaved(false);
        onSaveChange?.(false);
        setIsLoading(false);
        return;
      }

      try {
        const saved = await isFestivalInterested(userId, festivalId);
        setIsSaved(saved);
        onSaveChange?.(saved);
      } catch (error) {
        console.error("Error checking saved status:", error);
      } finally {
        setIsLoading(false);
      }
    }

    checkSaved();
  }, [userId, festivalId, onSaveChange]);

  const handleToggle = async () => {
    if (isLoading) return;
    if (!userId) {
      alert("로그인이 필요한 기능입니다. 로그인 후 다시 시도해주세요.");
      return;
    }

    try {
      setIsLoading(true);
      if (isSaved) {
        const { error } = await removeInterestedFestival(userId, festivalId);
        if (error) {
          console.error("Remove interested festival failed:", {
            message: (error as any)?.message,
            details: (error as any)?.details,
            hint: (error as any)?.hint,
            code: (error as any)?.code,
          });
          throw new Error((error as any)?.message || "삭제 실패");
        }
        setIsSaved(false);
        onSaveChange?.(false);
      } else {
        const { error } = await saveInterestedFestival(userId, festivalId, true);
        if (error) {
          console.error("Save interested festival failed:", {
            message: (error as any)?.message,
            details: (error as any)?.details,
            hint: (error as any)?.hint,
            code: (error as any)?.code,
          });
          throw new Error((error as any)?.message || "저장 실패");
        }
        setIsSaved(true);
        onSaveChange?.(true);
      }
    } catch (error) {
      // PostgrestError는 콘솔에 {}처럼 보일 수 있어서, 메시지를 최대한 살려서 보여줍니다.
      const msg =
        (error as any)?.message ||
        (error as any)?.error_description ||
        (() => {
          try {
            return JSON.stringify(error);
          } catch {
            return String(error);
          }
        })();
      console.error("Error toggling save:", error);
      alert(`저장 상태 변경에 실패했습니다.\n${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`
        flex-shrink-0 p-2.5 rounded-lg border transition-all
        ${
          isSaved
            ? "bg-purple-500/20 border-purple-500/50 text-purple-300 hover:bg-purple-500/30"
            : "bg-white/5 border-white/20 text-gray-400 hover:bg-white/10 hover:border-white/30"
        }
        ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
      title={!userId ? "로그인이 필요합니다" : isSaved ? "저장됨" : "저장하기"}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isSaved ? (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ) : (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      )}
    </button>
  );
}

