"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Calendar, Zap, BookOpen } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  // 랜딩 페이지에서는 네비게이션 바 숨기기
  if (pathname === "/") {
    return null;
  }

  const navItems = [
    {
      href: "/home",
      label: "Home",
      icon: Home,
      color: "text-blue-400",
      activeColor: "text-blue-300",
    },
    {
      href: "/lookup",
      label: "Lookup",
      icon: Search,
      color: "text-purple-400",
      activeColor: "text-purple-300",
    },
    {
      href: "/timetable",
      label: "Timetable",
      icon: Calendar,
      color: "text-cyan-400",
      activeColor: "text-cyan-300",
    },
    {
      href: "/current",
      label: "Current",
      icon: Zap,
      color: "text-yellow-400",
      activeColor: "text-yellow-300",
    },
    {
      href: "/library",
      label: "Library",
      icon: BookOpen,
      color: "text-green-400",
      activeColor: "text-green-300",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/home") {
      return pathname === "/home" || pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#161b29]/95 backdrop-blur-md border-t border-white/10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg
                  transition-all duration-200
                  ${active 
                    ? `${item.activeColor} bg-white/5` 
                    : `${item.color} opacity-60 hover:opacity-100 hover:bg-white/5`
                  }
                `}
              >
                <Icon 
                  className={`w-5 h-5 transition-transform duration-200 ${
                    active ? "scale-110" : ""
                  }`} 
                />
                <span 
                  className={`
                    text-xs font-medium
                    ${active ? "opacity-100" : "opacity-70"}
                  `}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

