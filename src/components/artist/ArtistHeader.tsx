import Header from "@/components/ui/Header";

interface ArtistHeaderProps {
  backHref?: string;
  artistName?: string;
}

export default function ArtistHeader({ backHref = "/lookup", artistName }: ArtistHeaderProps) {
  return <Header backHref={backHref} title={artistName} />;
}

