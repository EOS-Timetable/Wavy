// app/(admin)/admin/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase';

type StagingStatus = 'PENDING' | 'ALLOWED' | 'REJECTED';

interface StatusCount {
  status: StagingStatus;
  count: number;
}

export default function AdminPage() {
  const [pendingCount, setPendingCount] = useState(0);
  const [allowedCount, setAllowedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    const supabase = createClient();
    
    try {
      // PENDING 카운트
      const { count: pending } = await supabase
        .from('staged_contents')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDING');

      // ALLOWED 카운트
      const { count: allowed } = await supabase
        .from('staged_contents')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ALLOWED');

      // REJECTED 카운트
      const { count: rejected } = await supabase
        .from('staged_contents')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'REJECTED');

      setPendingCount(pending || 0);
      setAllowedCount(allowed || 0);
      setRejectedCount(rejected || 0);
    } catch (error) {
      console.error('카운트 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">페스티벌 관리</h1>
        <p className="text-gray-600 mb-8">크롤링된 페스티벌 데이터를 검수하고 관리합니다</p>
        
        <div className="grid gap-4">
          <Link href="/admin/staging">
            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group cursor-pointer">
              <div>
                <h2 className="text-xl font-bold mb-1">검수 대기</h2>
                <p className="text-gray-600 text-sm">크롤링된 데이터를 확인하고 승인/반려합니다</p>
                <div className="mt-2 inline-flex items-center gap-2 text-blue-600 font-medium">
                  {loading ? (
                    <span className="text-sm">로딩 중...</span>
                  ) : (
                    <>
                      <span className="text-2xl">{pendingCount}</span>
                      <span className="text-sm">건 대기중</span>
                    </>
                  )}
                </div>
              </div>
              <ChevronRight className="text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </Link>

          <Link href="/admin/staged">
            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group cursor-pointer">
              <div>
                <h2 className="text-xl font-bold mb-1">처리 완료</h2>
                <p className="text-gray-600 text-sm">승인/반려된 데이터를 확인하고 재처리합니다</p>
                <div className="mt-2 flex items-center gap-4">
                  {loading ? (
                    <span className="text-sm text-gray-600">로딩 중...</span>
                  ) : (
                    <>
                      <div className="inline-flex items-center gap-2 text-green-600 font-medium">
                        <span className="text-2xl">{allowedCount}</span>
                        <span className="text-sm">승인</span>
                      </div>
                      <div className="inline-flex items-center gap-2 text-red-600 font-medium">
                        <span className="text-2xl">{rejectedCount}</span>
                        <span className="text-sm">반려</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <ChevronRight className="text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}