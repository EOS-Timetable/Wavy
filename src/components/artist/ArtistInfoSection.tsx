"use client";

import { Star, Tag } from "lucide-react";
import { useMemo, useState } from "react";

interface ArtistInfoSectionProps {
  artistName: string;
  followerCount: number;
  description?: string | null;
  tags?: string[] | null;
}

export default function ArtistInfoSection({
  artistName,
  followerCount,
  description,
  tags,
}: ArtistInfoSectionProps) {
  const [isStarred, setIsStarred] = useState(false);

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

  return (
    <div className="mb-5">
      {/* 타이틀 + 저장(임시) */}
      <div className="flex items-start justify-between">
        <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">
          {artistName}
        </h1>
        <div className="flex items-center gap-2 self-start">
          <button
            type="button"
            onClick={() => setIsStarred(!isStarred)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-lg hover:bg-white/15 transition-colors"
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


