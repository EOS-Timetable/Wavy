import Image from "next/image";

interface ArtistImageProps {
  imageUrl: string;
  artistName: string;
}

export default function ArtistImage({
  imageUrl,
  artistName,
}: ArtistImageProps) {
  return (
    <div className="relative w-full h-[40vh] min-h-[300px] overflow-hidden">
      <Image
        src={imageUrl}
        alt={artistName}
        fill
        className="object-cover object-center object-[center_top]"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
    </div>
  );
}

