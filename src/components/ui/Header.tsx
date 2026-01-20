import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface HeaderProps {
  backHref?: string;
  title?: string;
}

export default function Header({ backHref = "/lookup", title }: HeaderProps) {
  return (
    <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-sm border-b border-white/5">
      <div className="w-full px-4 py-3 flex items-center gap-3">
        <Link
          href={backHref}
          className="inline-flex items-center justify-center p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        {title && (
          <h1 className="text-lg font-bold">{title}</h1>
        )}
      </div>
    </div>
  );
}

