"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase"; 
import { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

export function useAuth() {
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. 프로필 가져오기 (실패해도 전체 흐름을 막지 않음)
  const fetchProfileData = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('nickname, avatar_url')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.warn('[useAuth] 프로필 없음:', error.message);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (e) {
      console.error('[useAuth] 프로필 조회 에러:', e);
    }
  }, [supabase]);

  useEffect(() => {
    // 초기 세션 확인
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await fetchProfileData(session.user.id);
        }
      } catch (error) {
        console.error('[useAuth] 초기화 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // 2. 상태 변경 감지 리스너 (로그아웃 핵심)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      console.log(`[useAuth] Auth Event: ${event}`);

      if (session?.user) {
        // 로그인/세션 유지 상태
        setUser(session.user);
        // 프로필 조회를 기다리지 않고 비동기로 실행 (UI 차단 방지)
        fetchProfileData(session.user.id);
      } else {
        // ⚡ 로그아웃 상태: 즉시 상태 초기화
        console.log("[useAuth] Clearing user state (Logged Out)");
        setUser(null);
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfileData]);

  return { 
    user, 
    profile,
    loading, 
    isAuthenticated: !!user
  };
}