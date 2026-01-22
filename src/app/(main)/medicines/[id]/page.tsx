'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import AddMedicineDialog from '@/components/AddMedicineDialog';
import { ClockIcon, InformationCircleIcon, ExclamationTriangleIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

interface InteractionInfo {
  id: string;
  otherMedicine: {
    id: string;
    name: string;
    genericName: string;
    className: string;
  };
  severityLevel: string;
  severityLabel: string;
  interactionType: string;
  interactionTypeLabel: string;
  description: string;
  recommendation: string | null;
}

export default function MedicineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [medicine, setMedicine] = useState<any>(null);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [interactions, setInteractions] = useState<InteractionInfo[]>([]);
  const [userMedicineInteractions, setUserMedicineInteractions] = useState<InteractionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchMedicineDetail();
      fetchInteractions();
    }
  }, [params.id]);

  const fetchMedicineDetail = async () => {
    try {
      const response = await fetch(`/api/medicines/${params.id}`);
      const result = await response.json();
      
      if (result.success) {
        setMedicine(result.data.medicine);
        setRecommendation(result.data.recommendation);
      } else {
        alert('약물 정보를 불러올 수 없습니다.');
        router.push('/medicines/search');
      }
    } catch (error) {
      console.error('Fetch medicine detail error:', error);
      alert('약물 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInteractions = async () => {
    try {
      const response = await fetch(`/api/medicines/${params.id}/interactions`);
      const result = await response.json();
      
      if (result.success) {
        setInteractions(result.data.allInteractions || []);
        setUserMedicineInteractions(result.data.userMedicineInteractions || []);
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

  if (isLoading) {
    return (
      <div className="container-custom py-8">
        <Card>
          <div className="text-center py-12">
            <p className="text-body text-neutral-gray-600">로딩 중...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!medicine) {
    return null;
  }

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-primary hover:text-primary-hover mb-4"
        >
          ← 뒤로 가기
        </button>
        <h1 className="text-h1 text-neutral-gray-900 mb-2">{medicine.name}</h1>
        <p className="text-body text-neutral-gray-600">
          {medicine.genericName}
        </p>
      </div>

      {/* 약물 특성 태그 */}
      <div className="flex gap-2 flex-wrap mb-8">
        <span className="px-3 py-1 bg-neutral-gray-100 text-neutral-gray-700 rounded-lg text-small">
          {medicine.className}
        </span>
        {medicine.sleepInducing !== 'NONE' && (
          <span className="px-3 py-1 bg-warning-50 text-warning-700 rounded-lg text-small">
            😴 졸음 유발
          </span>
        )}
        {medicine.alertnessEffect !== 'NONE' && (
          <span className="px-3 py-1 bg-info-50 text-info-700 rounded-lg text-small">
            ⚡ 각성 효과
          </span>
        )}
        {medicine.stomachIrritation && (
          <span className="px-3 py-1 bg-danger-50 text-danger-700 rounded-lg text-small">
            ⚠️ 위장 자극
          </span>
        )}
      </div>

      {/* 복용 시간 추천 (가장 중요!) */}
      {recommendation && (
        <Card className="mb-6 border-2 border-primary">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-6 h-6 text-primary" />
              <CardHeader className="!mb-0">추천 복용 시간</CardHeader>
            </div>

            {/* 추천 시간대 */}
            <div className="bg-primary-50 p-4 rounded-lg">
              <p className="text-small text-neutral-gray-600 mb-2">
                일반적으로 고려되는 복용 시간대
              </p>
              <div className="flex gap-3 flex-wrap">
                {recommendation.recommendedTimes.map((time: string, index: number) => {
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
                      className="px-4 py-2 bg-primary text-white rounded-lg text-h4 font-bold"
                    >
                      {getTimeIcon()} {time}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* 추천 이유 */}
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <InformationCircleIcon className="w-5 h-5 text-info mt-0.5" />
                <div>
                  <p className="text-small font-semibold text-neutral-gray-800 mb-1">
                    추천 이유
                  </p>
                  <p className="text-small text-neutral-gray-700">
                    {recommendation.reason}
                  </p>
                </div>
              </div>

              {/* 약물 특성 기반 설명 */}
              {recommendation.medicineCharacteristics && (
                <div className="bg-info-50 p-3 rounded">
                  <p className="text-small font-semibold text-info-900 mb-2">
                    💊 약물 특성
                  </p>
                  <ul className="text-small text-info-800 space-y-1 ml-4">
                    {recommendation.medicineCharacteristics.map((char: string, index: number) => (
                      <li key={index} className="list-disc">{char}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 생체리듬 기반 설명 */}
              {recommendation.chronopharmacology && (
                <div className="bg-success-50 p-3 rounded">
                  <p className="text-small font-semibold text-success-900 mb-2">
                    🧬 생체리듬과 약물학
                  </p>
                  <p className="text-small text-success-800">
                    {recommendation.chronopharmacology}
                  </p>
                </div>
              )}

              {/* 생활 패턴 기반 설명 */}
              {recommendation.lifePatternConsideration && (
                <div className="bg-warning-50 p-3 rounded">
                  <p className="text-small font-semibold text-warning-900 mb-2">
                    🏃 회원님의 생활패턴 고려
                  </p>
                  <p className="text-small text-warning-800">
                    {recommendation.lifePatternConsideration}
                  </p>
                </div>
              )}

              {/* 특별 주의사항 */}
              {recommendation.specialWarnings && recommendation.specialWarnings.length > 0 && (
                <div className="flex items-start gap-2 bg-danger-50 p-3 rounded">
                  <ExclamationTriangleIcon className="w-5 h-5 text-danger mt-0.5" />
                  <div>
                    <p className="text-small font-semibold text-danger-900 mb-1">
                      특별 주의사항
                    </p>
                    <ul className="text-small text-danger-800 space-y-1 ml-4">
                      {recommendation.specialWarnings.map((warning: string, index: number) => (
                        <li key={index} className="list-disc">{warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* 개인차 안내 */}
            <div className="border-t border-neutral-gray-200 pt-3">
              <p className="text-small text-neutral-gray-600">
                ⚠️ 약물 반응에는 개인차가 있을 수 있으며, 복용 중인 다른 약물이나 건강 상태에 따라
                적절한 복용 시간이 달라질 수 있습니다.
              </p>
            </div>

            {/* 추가 버튼 */}
            <Button
              variant="primary"
              className="w-full"
              onClick={() => setShowAddDialog(true)}
            >
              내 약으로 추가하기
            </Button>
          </div>
        </Card>
      )}

      {/* 약물 기본 정보 */}
      <Card className="mb-6">
        <CardHeader>기본 정보</CardHeader>
        <CardBody>
          <div className="space-y-3">
            <div>
              <p className="text-small font-semibold text-neutral-gray-700">효능</p>
              <p className="text-small text-neutral-gray-600">{medicine.effect}</p>
            </div>
            <div>
              <p className="text-small font-semibold text-neutral-gray-700">복용 방법</p>
              <p className="text-small text-neutral-gray-600">{medicine.usage}</p>
            </div>
            {medicine.company && (
              <div>
                <p className="text-small font-semibold text-neutral-gray-700">제조사</p>
                <p className="text-small text-neutral-gray-600">{medicine.company}</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* 부작용 */}
      {medicine.sideEffects && (
        <Card className="mb-6">
          <CardHeader>주요 부작용</CardHeader>
          <CardBody>
            <p className="text-small text-neutral-gray-600">{medicine.sideEffects}</p>
          </CardBody>
        </Card>
      )}

      {/* 주의사항 */}
      {medicine.precautions && (
        <Card className="mb-6">
          <CardHeader>복용 시 주의사항</CardHeader>
          <CardBody>
            <p className="text-small text-neutral-gray-600">{medicine.precautions}</p>
          </CardBody>
        </Card>
      )}

      {/* 약물 상호작용 - 일반 설명 */}
      {medicine.interactions && (
        <Card className="mb-6">
          <CardHeader>약물 상호작용 안내</CardHeader>
          <CardBody>
            <p className="text-small text-neutral-gray-600">{medicine.interactions}</p>
          </CardBody>
        </Card>
      )}

      {/* 내 약과의 상호작용 경고 (로그인 사용자) */}
      {userMedicineInteractions.length > 0 && (
        <Card className="mb-6 border-2 border-danger">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShieldExclamationIcon className="w-6 h-6 text-danger" />
              <CardHeader className="!mb-0 text-danger-800">
                현재 복용 중인 약물과의 상호작용
              </CardHeader>
            </div>
            
            <div className="bg-danger-50 p-3 rounded-lg">
              <p className="text-small text-danger-800">
                ⚠️ 현재 등록된 약물 중 이 약과 상호작용이 있을 수 있는 약물이 있습니다.
                추가 전 아래 내용을 확인하시고, 반드시 의사 또는 약사와 상담하세요.
              </p>
            </div>

            <div className="space-y-3">
              {userMedicineInteractions.map((interaction) => (
                <div
                  key={interaction.id}
                  className={`p-4 rounded-lg border ${getSeverityColor(interaction.severityLevel)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityBadgeColor(interaction.severityLevel)}`}>
                        {interaction.severityLabel}
                      </span>
                      <span className="text-small font-medium">
                        {interaction.otherMedicine.name}
                      </span>
                    </div>
                    <span className="text-xs text-neutral-gray-500">
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
          </div>
        </Card>
      )}

      {/* 함께 복용 시 주의가 필요한 약물 */}
      {interactions.length > 0 && (
        <Card className="mb-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="w-6 h-6 text-warning" />
              <CardHeader className="!mb-0">함께 복용 시 주의가 필요한 약물</CardHeader>
            </div>
            
            <p className="text-small text-neutral-gray-600">
              아래 약물과 함께 복용할 경우 상호작용이 발생할 수 있습니다.
              해당 약물을 복용 중이시라면 의사 또는 약사와 상담하세요.
            </p>

            <div className="space-y-3">
              {interactions.map((interaction) => (
                <div
                  key={interaction.id}
                  className={`p-4 rounded-lg border ${getSeverityColor(interaction.severityLevel)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityBadgeColor(interaction.severityLevel)}`}>
                        {interaction.severityLabel}
                      </span>
                      <span className="text-small font-medium">
                        {interaction.otherMedicine.name}
                      </span>
                      {interaction.otherMedicine.className && (
                        <span className="text-xs text-neutral-gray-500">
                          ({interaction.otherMedicine.className})
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-neutral-gray-500">
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

            <div className="border-t border-neutral-gray-200 pt-3">
              <p className="text-small text-neutral-gray-500">
                ※ 위 정보는 일반적으로 알려진 상호작용 정보입니다. 
                모든 상호작용을 포괄하지 않으며, 개인의 건강 상태에 따라 다를 수 있습니다.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* 고지사항 */}
      <DisclaimerBanner />

      {/* 약 추가 다이얼로그 */}
      {showAddDialog && (
        <AddMedicineDialog
          medicine={medicine}
          onClose={() => setShowAddDialog(false)}
          onSuccess={() => {
            router.push('/my-medicines');
          }}
        />
      )}
    </div>
  );
}
