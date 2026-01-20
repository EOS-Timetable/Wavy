import Image from "next/image";

interface FestivalPosterProps {
  posterUrl: string;
  festivalName: string;
}

export default function FestivalPoster({
  posterUrl,
  festivalName,
}: FestivalPosterProps) {
  return (
    <div className="relative w-full max-w-[320px] mx-auto lg:mx-0 rounded-lg overflow-hidden border border-white/10 shadow-xl">
      <div className="relative w-full aspect-[2/3] lg:aspect-auto lg:h-full">
        <Image
          src={posterUrl}
          alt={festivalName}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
      </div>
    </div>
  );
}

