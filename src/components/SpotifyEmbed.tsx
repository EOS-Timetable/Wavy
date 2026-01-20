"use client";

import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface Props {
  type: 'playlist' | 'track' | 'album' | 'artist';
  id: string;
  width?: string | number;
  height?: string | number;
  className?: string; // 외부에서 스타일 주입
}

export default function SpotifyEmbed({ 
  type, 
  id, 
  width = '100%', 
  height = '100%', // 기본값을 100%로 변경 (부모 크기 따라감)
  className = '' 
}: Props) {
  const [key, setKey] = useState(0);
  const src = `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;

  const handleReload = () => {
    setKey(prev => prev + 1);
  };

  return (
    <div 
      className={`relative w-full h-full bg-[#282828] overflow-hidden shadow-xl ${className}`}
    >
      {/* 새로고침 버튼 */}
      <button 
        onClick={handleReload}
        className="absolute top-2 right-2 z-20 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100"
      >
        <RefreshCw size={14} />
      </button>

      <iframe
        key={key}
        src={src}
        width={width}
        height={height}
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="block w-full h-full absolute inset-0" // 절대 위치로 꽉 채우기
      />
    </div>
  );
}