"use client";

import { Star } from "lucide-react";
import { useState } from "react";

interface ArtistInfoProps {
  artistName: string;
  followerCount: number;
}

export default function ArtistInfo({
  artistName,
  followerCount,
}: ArtistInfoProps) {
  const [isStarred, setIsStarred] = useState(false);

  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold">{artistName}</h1>
      </div>
      <div className="flex items-center gap-2 self-end mt-2">
        <button
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
  );
}

