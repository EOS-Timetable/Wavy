"use client";

import { createClient } from "@/lib/supabase";
import { LogOut } from "lucide-react"; // 기존에 사용하던 라이브러리

export default function LogoutButton() {
  const supabase = createClient();

  const handleLogout = async () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error.message);
        alert("로그아웃 중 오류가 발생했습니다.");
      } else {
        console.log("[LogoutButton] SignOut success");
        // 또는 미들웨어가 작동 중이라면 강제 새로고침으로 세션 정리
        window.location.href = "/";
      }
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-950/30 rounded-xl transition-all border border-transparent hover:border-red-900/50"
    >
      <LogOut size={18} />
      <span>로그아웃</span>
    </button>
  );
}