// app/(admin)/admin/staged/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Filter, Clock, AlertCircle, CheckCircle, XCircle, Zap, RotateCcw } from 'lucide-react';
import { createClient } from '@/lib/supabase';

type StagingStatus = 'PENDING' | 'ALLOWED' | 'REJECTED';
type SortField = 'created_at' | 'updated_at' | 'last_crawled_at';
type SortOrder = 'asc' | 'desc';

interface StagedContent {
  id: string;
  category: string;
  source_name: string | null;
  source_url: string | null;
  raw_data: any;
  status: StagingStatus;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  last_crawled_at: string | null;
}

const CATEGORIES = ['FESTIVAL_BASE', 'TIMETABLE', 'ARTIST_BASE', 'FESTIVAL_CONTENT', 'SOCIAL_FEED'];

// 시간 포맷
const formatTime = (dateString?: string | null) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  return date.toLocaleDateString('ko-KR');
};

// raw_data에서 is_priority 추출
const checkPriority = (rawData: any): boolean => {
  return rawData?.is_priority === true || rawData?.priority === true;
};

export default function StagedPage() {
  const [contents, setContents] = useState<StagedContent[]>([]);
  const [filteredContents, setFilteredContents] = useState<StagedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // 필터 상태
  const [filters, setFilters] = useState({
    title: '',
    category: '',
    source: '',
    priority: 'all',
    status: 'all', // 'all', 'ALLOWED', 'REJECTED'
  });
  const [sortField, setSortField] = useState<SortField>('updated_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // 고유한 소스 이름 목록
  const [uniqueSources, setUniqueSources] = useState<string[]>([]);

  useEffect(() => {
    loadContents();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [contents, filters, sortField, sortOrder]);

  const loadContents = async () => {
    const supabase = createClient();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('staged_contents')
        .select('*')
        .in('status', ['ALLOWED', 'REJECTED'])
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setContents(data || []);
      
      // 고유한 소스 이름 추출
      const sources = Array.from(new Set(data?.map((d: { source_name: any; }) => d.source_name).filter(Boolean) as string[]));
      setUniqueSources(sources);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = contents.filter(content => {
      const title = content.raw_data?.title || content.raw_data?.name || '';
      const titleMatch = !filters.title || title.toLowerCase().includes(filters.title.toLowerCase());
      const categoryMatch = !filters.category || content.category === filters.category;
      const sourceMatch = !filters.source || content.source_name === filters.source;
      const isPriority = checkPriority(content.raw_data);
      const priorityMatch = filters.priority === 'all' || 
        (filters.priority === 'priority' && isPriority) ||
        (filters.priority === 'normal' && !isPriority);
      const statusMatch = filters.status === 'all' || content.status === filters.status;

      return titleMatch && categoryMatch && sourceMatch && priorityMatch && statusMatch;
    });

    // 정렬
    filtered.sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      const comparison = aValue > bValue ? 1 : -1;
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredContents(filtered);
  };

  const reprocessContent = async (id: string) => {
    const supabase = createClient();
    setProcessingId(id);

    const confirmMessage = '이 항목을 다시 검수 대기 상태로 되돌리시겠습니까?';
    if (!confirm(confirmMessage)) {
      setProcessingId(null);
      return;
    }

    try {
      // status를 PENDING으로 변경하고 rejection_reason을 null로 초기화
      const { error } = await supabase
        .from('staged_contents')
        .update({
          status: 'PENDING',
          rejection_reason: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // UI에서 해당 항목 제거
      setContents(prev => prev.filter(content => content.id !== id));
      
      alert('검수 대기 상태로 되돌렸습니다.');
    } catch (error) {
      console.error('재처리 실패:', error);
      alert('재처리에 실패했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* 헤더 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                ← 돌아가기
              </Link>
              <h1 className="text-2xl font-bold">처리 완료</h1>
              <span className="text-gray-500">{filteredContents.length}건</span>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter size={20} />
              필터
            </button>
          </div>

          {/* 필터 영역 */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t">
              <input
                type="text"
                placeholder="페스티벌 이름"
                value={filters.title}
                onChange={(e) => setFilters({ ...filters, title: e.target.value })}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">모든 카테고리</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={filters.source}
                onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">모든 제공처</option>
                {uniqueSources.map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>

              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="all">모든 우선순위</option>
                <option value="priority">우선순위만</option>
                <option value="normal">일반만</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="all">모든 상태</option>
                <option value="ALLOWED">승인만</option>
                <option value="REJECTED">반려만</option>
              </select>

              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="created_at">생성일</option>
                <option value="updated_at">수정일</option>
                <option value="last_crawled_at">크롤링일</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="desc">최신순</option>
                <option value="asc">오래된순</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 컨텐츠 리스트 */}
      <div className="p-6">
        <div className="space-y-4">
          {filteredContents.map((content) => {
            const isPriority = checkPriority(content.raw_data);
            
            return (
              <div
                key={content.id}
                className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-all ${
                  processingId === content.id ? 'opacity-50' : ''
                }`}
              >
                <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 p-6">
                  {/* 좌측: 크롤링 데이터 */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            {content.category}
                          </span>
                          {content.source_name && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {content.source_name}
                            </span>
                          )}
                          {isPriority && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium flex items-center gap-1">
                              <Zap size={12} />
                              우선순위
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold">
                          {content.raw_data?.title || content.raw_data?.name || '제목 없음'}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      {Object.entries(content.raw_data).map(([key, value]) => {
                        if (key === 'title' || key === 'name' || key === 'is_priority' || key === 'priority') return null;
                        return (
                          <div key={key} className="flex gap-2">
                            <span className="text-gray-500 font-medium min-w-24 flex-shrink-0">{key}:</span>
                            <span className="text-gray-900 break-all">
                              {Array.isArray(value) 
                                ? value.join(', ') 
                                : typeof value === 'object' 
                                ? JSON.stringify(value, null, 2)
                                : String(value)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {content.source_url && (
                      <div className="pt-2 border-t">
                        <a 
                          href={content.source_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm break-all"
                        >
                          {content.source_url}
                        </a>
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-4 border-t">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        생성: {formatTime(content.created_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        처리: {formatTime(content.updated_at)}
                      </div>
                      {content.last_crawled_at && (
                        <div className="flex items-center gap-1">
                          크롤링: {formatTime(content.last_crawled_at)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 중앙: 상태 표시 및 재처리 */}
                  <div className="flex flex-col items-center justify-center gap-3 md:px-6 md:border-x">
                    <div className="text-center">
                      <div
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium mb-3 ${
                          content.status === 'ALLOWED'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {content.status === 'ALLOWED' ? (
                          <>
                            <CheckCircle size={18} />
                            승인됨
                          </>
                        ) : (
                          <>
                            <XCircle size={18} />
                            반려됨
                          </>
                        )}
                      </div>
                      
                      {content.rejection_reason && (
                        <div className="mb-3 px-3 py-2 bg-red-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">반려 사유</div>
                          <div className="text-sm text-red-700">{content.rejection_reason}</div>
                        </div>
                      )}

                      <button
                        onClick={() => reprocessContent(content.id)}
                        disabled={processingId === content.id}
                        className="w-full py-2 px-4 border-2 border-blue-500 text-blue-600 rounded-lg font-medium hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-300 transition-colors flex items-center justify-center gap-2"
                      >
                        <RotateCcw size={16} />
                        재처리
                      </button>
                    </div>
                  </div>

                  {/* 우측: 프리뷰 */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-3">미리보기</div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-3 flex items-center justify-center text-white font-bold text-sm">
                        포스터 이미지
                      </div>
                      <h4 className="font-bold text-lg mb-2">
                        {content.raw_data?.title || content.raw_data?.name || '제목 없음'}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {content.raw_data?.description || content.raw_data?.content || '설명 없음'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {content.raw_data?.date && <span>{content.raw_data.date}</span>}
                        {content.raw_data?.date && content.raw_data?.location && <span>•</span>}
                        {content.raw_data?.location && <span>{content.raw_data.location}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredContents.length === 0 && (
            <div className="text-center py-20">
              <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-600">처리된 데이터가 없습니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}