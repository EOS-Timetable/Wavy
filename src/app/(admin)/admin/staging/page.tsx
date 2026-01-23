// app/(admin)/admin/staging/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Filter, Clock, AlertCircle, CheckCircle, XCircle, Zap } from 'lucide-react';
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
  ocr_status: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  last_crawled_at: string | null;
}

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const REJECTION_REASONS = [
  '페스티벌이 아닙니다 (단콘, 투어 등)',
  '잘못된 데이터가 들어왔습니다',
  '이미지 화질이 너무 낮습니다',
  '중복된 데이터입니다',
];

const CATEGORIES = ['FESTIVAL_BASE', 'OFFICIAL_LINEUP', 'OFFICIAL_TIMETABLE', 'OFFICIAL_NOTICE'];

// 반려 모달
const RejectionModal: React.FC<RejectionModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const reason = selectedReason === 'custom' ? customReason : selectedReason;
    if (reason) {
      onConfirm(reason);
      setSelectedReason('');
      setCustomReason('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-4">반려 사유 선택</h3>
        
        <div className="space-y-2 mb-4">
          {REJECTION_REASONS.map((reason, index) => (
            <label
              key={index}
              className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="radio"
                name="reason"
                value={reason}
                checked={selectedReason === reason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="mr-3"
              />
              <span className="text-sm">{reason}</span>
            </label>
          ))}
          
          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="reason"
              value="custom"
              checked={selectedReason === 'custom'}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="mr-3"
            />
            <span className="text-sm">직접 입력</span>
          </label>
        </div>

        {selectedReason === 'custom' && (
          <textarea
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="반려 사유를 입력해주세요"
            className="w-full p-3 border rounded-lg mb-4 text-sm"
            rows={3}
          />
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedReason || (selectedReason === 'custom' && !customReason.trim())}
            className="flex-1 py-3 px-4 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            반려하기
          </button>
        </div>
      </div>
    </div>
  );
};

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

// "OCR 다시하기" 버튼 클릭 시 실행할 함수
const retryOCR = async (id: number) => {
  const supabase = createClient();
  const { error } = await supabase
    .from('staged_contents')
    .update({ 
      ocr_status: null, // 상태를 초기화 -> 워커가 다시 채감
      // (선택) 기존 결과가 헷갈리면 지워버리기
      // raw_data: { ...existingData, ocr_result: [] } 
    })
    .eq('id', id);

  if (!error) alert("재요청 되었습니다! 잠시 후 새로고침 하세요.");
};

export default function StagingPage() {
  const [contents, setContents] = useState<StagedContent[]>([]);
  const [filteredContents, setFilteredContents] = useState<StagedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<StagedContent | null>(null);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);

  // 필터 상태
  const [filters, setFilters] = useState({
    title: '',
    category: '',
    source: '',
    priority: 'all',
  });
  const [sortField, setSortField] = useState<SortField>('created_at');
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
        .eq('status', 'PENDING')
        .order('created_at', { ascending: false });

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

      return titleMatch && categoryMatch && sourceMatch && priorityMatch;
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

  const updateContentStatus = async (id: string, status: StagingStatus, rejectionReason?: string) => {
    const supabase = createClient();
    setProcessingId(id);

    try {
      const updates: any = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      if (rejectionReason) {
        updates.rejection_reason = rejectionReason;
      }

      const { error } = await supabase
        .from('staged_contents')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      // UI에서 해당 항목을 회색으로 표시하기 위해 로컬 상태 업데이트
      setContents(prev =>
        prev.map(content =>
          content.id === id
            ? { ...content, status, rejection_reason: rejectionReason || null, updated_at: new Date().toISOString() }
            : content
        )
      );
    } catch (error) {
      console.error('상태 업데이트 실패:', error);
      alert('상태 업데이트에 실패했습니다.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleAllow = (id: string) => {
    updateContentStatus(id, 'ALLOWED');
  };

  const handleReject = (content: StagedContent) => {
    setSelectedContent(content);
    setIsRejectionModalOpen(true);
  };

  const confirmRejection = (reason: string) => {
    if (selectedContent) {
      updateContentStatus(selectedContent.id, 'REJECTED', reason);
    }
    setIsRejectionModalOpen(false);
    setSelectedContent(null);
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
      <div className="bg-gray border-b sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                ← 돌아가기
              </Link>
              <h1 className="text-2xl font-bold">검수 대기</h1>
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
            const isProcessed = content.status !== 'PENDING';
            
            return (
              <div
                key={content.id}
                className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-all ${
                  processingId === content.id ? 'opacity-50' : ''
                } ${isProcessed ? 'bg-gray-50 opacity-60' : ''}`}
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
                      {content.last_crawled_at && (
                        <div className="flex items-center gap-1">
                          크롤링: {formatTime(content.last_crawled_at)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 중앙: 상태 조정 */}
                  <div className="flex flex-col items-center justify-center gap-3 md:px-6 md:border-x">
                    {!isProcessed ? (
                      <>
                        <button
                          onClick={() => handleAllow(content.id)}
                          disabled={processingId === content.id}
                          className="w-32 py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={18} />
                          승인
                        </button>
                        <button
                          onClick={() => handleReject(content)}
                          disabled={processingId === content.id}
                          className="w-32 py-3 px-4 border-2 border-red-500 text-red-500 rounded-xl font-medium hover:bg-red-50 disabled:border-gray-300 disabled:text-gray-300 transition-colors flex items-center justify-center gap-2"
                        >
                          <XCircle size={18} />
                          반려
                        </button>
                      </>
                    ) : (
                      <div className="text-center">
                        <div
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${
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
                        <div className="mt-2 text-xs text-gray-600">처리 완료</div>
                      </div>
                    )}
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
              <p className="text-gray-600">검수 대기 중인 데이터가 없습니다</p>
            </div>
          )}
        </div>
      </div>

      {/* 반려 모달 */}
      <RejectionModal
        isOpen={isRejectionModalOpen}
        onClose={() => {
          setIsRejectionModalOpen(false);
          setSelectedContent(null);
        }}
        onConfirm={confirmRejection}
      />
    </div>
  );
}