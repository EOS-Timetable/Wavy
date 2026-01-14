import React from 'react';

interface Props {
  type: 'playlist' | 'track' | 'album' | 'artist';
  id: string; // 예: 플레이리스트 ID
  width?: string | number;
  height?: string | number;
}

export default function SpotifyEmbed({ type, id, width = '100%', height = 352 }: Props) {
  // 스포티파이 임베드 URL 형식
  const src = `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;

  return (
    <div className="my-4 rounded-xl overflow-hidden shadow-lg">
      <iframe
        src={src}
        width={width}
        height={height}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        style={{ border: 0 }}
      />
    </div>
  );
}