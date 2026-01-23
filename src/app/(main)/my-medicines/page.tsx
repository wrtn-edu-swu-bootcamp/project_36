'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { PlusIcon, TrashIcon, ClockIcon, ShieldExclamationIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface InteractionData {
  interactions: Array<{
    id: string;
    medicineA: { id: string; name: string; genericName: string };
    medicineB: { id: string; name: string; genericName: string };
    severityLevel: string;
    severityLabel: string;
    interactionType: string;
    interactionTypeLabel: string;
    description: string;
    recommendation: string | null;
  }>;
  duplicateIngredients: Array<{
    ingredient: string;
    medicines: Array<{ id: string; name: string }>;
  }>;
  summary: {
    totalMedicines: number;
    interactionCount: number;
    severeCount: number;
    moderateCount: number;
    mildCount: number;
    hasDuplicateIngredients: boolean;
  };
}

export default function MyMedicinesPage() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [interactionData, setInteractionData] = useState<InteractionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMedicines();
    fetchInteractions();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await fetch('/api/user-medicines');
      const result = await response.json();
      
      if (result.success) {
        setMedicines(result.data);
      }
    } catch (error) {
      console.error('Fetch medicines error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInteractions = async () => {
    try {
      const response = await fetch('/api/user-medicines/interactions');
      const result = await response.json();
      
      if (result.success) {
        setInteractionData(result.data);
      }
    } catch (error) {
      console.error('Fetch interactions error:', error);
    }
  };

  const getSeverityColor = (level: string) => {
    switch (level) {
      case 'SEVERE':
        return 'bg-danger-50 border-danger-200 text-danger-800';
      case 'MODERATE':
        return 'bg-warning-50 border-warning-200 text-warning-800';
      case 'MILD':
        return 'bg-info-50 border-info-200 text-info-800';
      default:
        return 'bg-neutral-gray-50 border-neutral-gray-200 text-neutral-gray-800';
    }
  };

  const getSeverityBadgeColor = (level: string) => {
    switch (level) {
      case 'SEVERE':
        return 'bg-danger text-white';
      case 'MODERATE':
        return 'bg-warning text-white';
      case 'MILD':
        return 'bg-info text-white';
      default:
        return 'bg-neutral-gray-400 text-white';
    }
  };

  const handleDelete = async (id: string, medicineName: string) => {
    if (!confirm(`"${medicineName}"을(를) 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/user-medicines/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // 목록 새로고침
        await fetchMedicines();
        await fetchInteractions();
      } else {
        alert(result.error || '약 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Delete medicine error:', error);
      alert('약 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-h1 text-neutral-gray-900 mb-2">내 약 관리</h1>
          <p className="text-body text-neutral-gray-600">
            등록한 약물을 확인하고 관리하세요.
          </p>
        </div>
        <Link href="/medicines/search">
          <Button variant="primary">
            <PlusIcon className="w-5 h-5" />
            약 추가하기
          </Button>
        </Link>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-body text-neutral-gray-600">로딩 중...</p>
          </div>
        </Card>
      ) : medicines.length === 0 ? (
        /* Empty State */
        <Card>
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💊</div>
            <h3 className="text-h3 text-neutral-gray-800 mb-2">
              등록된 약물이 없습니다
            </h3>
            <p className="text-body text-neutral-gray-600 mb-6">
              약물을 검색하고 추가하여 복용 시간을 추천받아보세요.
            </p>
            <Link href="/medicines/search">
              <Button variant="primary">약 검색하러 가기</Button>
            </Link>
          </div>
        </Card>
      ) : (
        /* Medicine List */
        <div className="grid gap-4">
          {medicines.map((userMedicine) => (
            <Card key={userMedicine.id}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardHeader>{userMedicine.medicine.name}</CardHeader>
                    <p className="text-small text-neutral-gray-600 mt-1">
                      {userMedicine.medicine.genericName}
                    </p>
                  </div>
                  <button
                    className="btn-sm btn-danger"
                    aria-label="약 삭제"
                    onClick={() => handleDelete(userMedicine.id, userMedicine.medicine.name)}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-small">
                  <div>
                    <p className="text-neutral-gray-600">복용량</p>
                    <p className="font-semibold">{userMedicine.dosage}</p>
                  </div>
                  <div>
                    <p className="text-neutral-gray-600">복용 횟수</p>
                    <p className="font-semibold">하루 {userMedicine.frequency}회</p>
                  </div>
                  <div>
                    <p className="text-neutral-gray-600">복용 시작일</p>
                    <p className="font-semibold">
                      {new Date(userMedicine.startDate).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  {userMedicine.endDate && (
                    <div>
                      <p className="text-neutral-gray-600">복용 종료일</p>
                      <p className="font-semibold">
                        {new Date(userMedicine.endDate).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  )}
                </div>

                {userMedicine.recommendedTimes && userMedicine.recommendedTimes.length > 0 && (
                  <div className="border-t border-neutral-gray-200 pt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <ClockIcon className="w-4 h-4 text-primary" />
                      <p className="text-small font-semibold text-neutral-gray-700">
                        추천 복용 시간
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {userMedicine.recommendedTimes.map((time: string, index: number) => {
                        const hour = parseInt(time.split(':')[0]);
                        const getTimeIcon = () => {
                          if (hour >= 6 && hour < 12) return '🌅';
                          if (hour >= 12 && hour < 18) return '☀️';
                          if (hour >= 18 && hour < 22) return '🌙';
                          return '🌙';
                        };
                        
                        return (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary-50 text-primary rounded-lg text-small font-medium"
                          >
                            {getTimeIcon()} {time}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {userMedicine.notes && (
                  <div className="text-small">
                    <p className="text-neutral-gray-600">메모</p>
                    <p>{userMedicine.notes}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 상호작용 및 주의사항 섹션 */}
      {medicines.length >= 2 && interactionData && (
        <div className="mt-8">
          <h2 className="text-h2 text-neutral-gray-900 mb-4 flex items-center gap-2">
            <ShieldExclamationIcon className="w-6 h-6" />
            복용 중인 약물 간 상호작용
          </h2>

          {/* 요약 정보 */}
          {(interactionData.summary.interactionCount > 0 || interactionData.summary.hasDuplicateIngredients) ? (
            <>
              <Card className="mb-4 border-2 border-warning">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-warning" />
                    <p className="text-body font-semibold text-warning-800">
                      주의가 필요한 사항이 있습니다
                    </p>
                  </div>
                  
                  <div className="flex gap-4 flex-wrap text-small">
                    {interactionData.summary.severeCount > 0 && (
                      <span className="px-3 py-1 bg-danger text-white rounded-lg">
                        경고 {interactionData.summary.severeCount}건
                      </span>
                    )}
                    {interactionData.summary.moderateCount > 0 && (
                      <span className="px-3 py-1 bg-warning text-white rounded-lg">
                        주의 {interactionData.summary.moderateCount}건
                      </span>
                    )}
                    {interactionData.summary.mildCount > 0 && (
                      <span className="px-3 py-1 bg-info text-white rounded-lg">
                        참고 {interactionData.summary.mildCount}건
                      </span>
                    )}
                    {interactionData.summary.hasDuplicateIngredients && (
                      <span className="px-3 py-1 bg-neutral-gray-600 text-white rounded-lg">
                        성분 중복 있음
                      </span>
                    )}
                  </div>

                  <p className="text-small text-neutral-gray-600">
                    아래 정보는 일반적으로 알려진 내용입니다. 
                    복용에 관한 최종 결정은 반드시 의사 또는 약사와 상담하세요.
                  </p>
                </div>
              </Card>

              {/* 상호작용 목록 */}
              {interactionData.interactions.length > 0 && (
                <Card className="mb-4">
                  <CardHeader>약물 간 상호작용</CardHeader>
                  <div className="space-y-3">
                    {interactionData.interactions.map((interaction) => (
                      <div
                        key={interaction.id}
                        className={`p-4 rounded-lg border ${getSeverityColor(interaction.severityLevel)}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityBadgeColor(interaction.severityLevel)}`}>
                              {interaction.severityLabel}
                            </span>
                            <span className="text-small font-medium">
                              {interaction.medicineA.name} + {interaction.medicineB.name}
                            </span>
                          </div>
                          <span className="text-xs text-neutral-gray-500 whitespace-nowrap">
                            {interaction.interactionTypeLabel}
                          </span>
                        </div>
                        <p className="text-small">{interaction.description}</p>
                        {interaction.recommendation && (
                          <p className="text-small mt-2 font-medium">
                            💡 {interaction.recommendation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* 성분 중복 경고 */}
              {interactionData.duplicateIngredients.length > 0 && (
                <Card className="mb-4">
                  <CardHeader>성분 중복 주의</CardHeader>
                  <div className="space-y-3">
                    <p className="text-small text-neutral-gray-600">
                      동일 성분이 포함된 약물을 중복 복용할 경우 과량 복용의 위험이 있을 수 있습니다.
                    </p>
                    {interactionData.duplicateIngredients.map((dup, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg border bg-warning-50 border-warning-200"
                      >
                        <p className="text-small font-medium text-warning-800 mb-1">
                          성분: {dup.ingredient}
                        </p>
                        <p className="text-small text-warning-700">
                          해당 약물: {dup.medicines.map(m => m.name).join(', ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <div className="text-center py-8">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-body text-neutral-gray-700 font-medium">
                  현재 등록된 약물 간 알려진 주요 상호작용이 없습니다
                </p>
                <p className="text-small text-neutral-gray-500 mt-2">
                  다만 모든 상호작용을 포괄하지 않으므로, 
                  새로운 약 추가 시 반드시 의사·약사에게 현재 복용 중인 약 목록을 알려주세요.
                </p>
              </div>
            </Card>
          )}

          {/* 한계 명시 */}
          <div className="mt-4 p-4 bg-neutral-gray-50 rounded-lg">
            <p className="text-small text-neutral-gray-600">
              <strong>⚠️ 중요:</strong> 위 정보는 일반적으로 알려진 상호작용 정보이며, 
              모든 상호작용을 포괄할 수 없습니다. 개인의 건강 상태에 따라 다를 수 있으며, 
              새로운 약 추가 시 반드시 의사·약사에게 현재 복용 중인 약 목록을 제공해주세요.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
