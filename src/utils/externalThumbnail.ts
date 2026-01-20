/**
 * 외부 링크에서 사용할 썸네일 URL을 추출합니다.
 * - YouTube: videoId를 파싱해서 img.youtube.com 썸네일 반환
 */

// YouTube URL에서 video ID 추출
export const getYouTubeVideoId = (url: string): string | null => {
  // youtu.be 형식
  const youtuBeMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (youtuBeMatch) return youtuBeMatch[1];

  // youtube.com/watch?v= 형식
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return watchMatch[1];

  // youtube.com/embed/ 형식
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  if (embedMatch) return embedMatch[1];

  // youtube.com/shorts/ 형식
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch) return shortsMatch[1];

  return null;
};

export const getYouTubeThumbnail = (
  videoId: string,
  quality: "maxres" | "hq" = "hq"
): string => {
  // maxresdefault는 영상에 따라 404가 나는 케이스가 많아서 기본은 hqdefault 사용
  const file = quality === "maxres" ? "maxresdefault.jpg" : "hqdefault.jpg";
  return `https://img.youtube.com/vi/${videoId}/${file}`;
};

export const getExternalThumbnailUrl = (url?: string): string | null => {
  if (!url) return null;
  const videoId = getYouTubeVideoId(url);
  if (videoId) return getYouTubeThumbnail(videoId);
  return null;
};


