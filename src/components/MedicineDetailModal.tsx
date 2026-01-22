'use client';

import { useState, useEffect } from 'react';
import Button from './ui/Button';
import { XMarkIcon, ClockIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface MedicineDetailModalProps {
  medicine: any;
  onClose: () => void;
  onAddMedicine: () => void;
}

export default function MedicineDetailModal({ medicine, onClose, onAddMedicine }: MedicineDetailModalProps) {
  const [recommendation, setRecommendation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecommendation();
  }, [medicine.id]);

  const fetchRecommendation = async () => {
    try {
      const response = await fetch(`/api/medicines/${medicine.id}/recommendation`);
      const result = await response.json();
      
      if (result.success) {
        setRecommendation(result.data.recommendation);
      }
    } catch (error) {
      console.error('Fetch recommendation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-gray-200 p-6 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-h2 text-neutral-gray-900 mb-1">{medicine.name}</h2>
            <p className="text-small text-neutral-gray-600">{medicine.genericName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-gray-100 rounded-lg transition-colors"
            aria-label="닫기"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* 약물 기본 정보 */}
          <div>
            <h3 className="text-h4 text-neutral-gray-900 mb-3">기본 정보</h3>
            <div className="space-y-2 text-small">
              {medicine.company && (
                <div className="flex">
                  <span className="text-neutral-gray-600 w-24">제조사</span>
                  <span className="font-medium">{medicine.company}</span>
                </div>
              )}
              {medicine.className && (
                <div className="flex">
                  <span className="text-neutral-gray-600 w-24">분류</span>
                  <span className="font-medium">{medicine.className}</span>
                </div>
              )}
              {medicine.effect && (
                <div className="flex">
                  <span className="text-neutral-gray-600 w-24">효능</span>
                  <span className="font-medium flex-1">{medicine.effect}</span>
                </div>
              )}
              {medicine.usage && (
                <div className="flex">
                  <span className="text-neutral-gray-600 w-24">용법</span>
                  <span className="font-medium flex-1">{medicine.usage}</span>
                </div>
              )}
            </div>
          </div>

          {/* 약물 특성 */}
          <div>
            <h3 className="text-h4 text-neutral-gray-900 mb-3">약물 특성</h3>
            <div className="flex gap-2 flex-wrap">
              {medicine.sleepInducing !== 'NONE' && (
                <span className="px-3 py-2 bg-warning-50 text-warning-700 rounded-lg text-small font-medium">
                  😴 졸음 유발 ({medicine.sleepInducing === 'HIGH' ? '강함' : medicine.sleepInducing === 'MEDIUM' ? '중간' : '약함'})
                </span>
              )}
              {medicine.alertnessEffect !== 'NONE' && (
                <span className="px-3 py-2 bg-info-50 text-info-700 rounded-lg text-small font-medium">
                  ⚡ 각성 효과 ({medicine.alertnessEffect === 'HIGH' ? '강함' : medicine.alertnessEffect === 'MEDIUM' ? '중간' : '약함'})
                </span>
              )}
              {medicine.stomachIrritation && (
                <span className="px-3 py-2 bg-danger-50 text-danger-700 rounded-lg text-small font-medium">
                  ⚠️ 위장 자극
                </span>
              )}
              {medicine.mealTiming && medicine.mealTiming !== 'ANYTIME' && (
                <span className="px-3 py-2 bg-primary-50 text-primary rounded-lg text-small font-medium">
                  🍽️ {medicine.mealTiming === 'BEFORE_MEAL' ? '식전' : medicine.mealTiming === 'AFTER_MEAL' ? '식후' : '식사 중'}
                </span>
              )}
            </div>
          </div>

          {/* 추천 복용 시간 */}
          {!isLoading && recommendation && (
            <div className="bg-primary-50 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-primary" />
                <h3 className="text-h4 text-neutral-gray-900">추천 복용 시간</h3>
              </div>
              
              {/* 아침/점심/저녁 표시 */}
              {recommendation.mealPeriod && (
                <div className="flex gap-2 justify-center">
                  <div className={`px-4 py-2 rounded-lg text-small font-semibold ${
                    recommendation.mealPeriod === '아침' 
                      ? 'bg-primary text-white' 
                      : 'bg-neutral-gray-100 text-neutral-gray-400'
                  }`}>
                    🌅 아침
                  </div>
                  <div className={`px-4 py-2 rounded-lg text-small font-semibold ${
                    recommendation.mealPeriod === '점심' 
                      ? 'bg-primary text-white' 
                      : 'bg-neutral-gray-100 text-neutral-gray-400'
                  }`}>
                    ☀️ 점심
                  </div>
                  <div className={`px-4 py-2 rounded-lg text-small font-semibold ${
                    recommendation.mealPeriod === '저녁' 
                      ? 'bg-primary text-white' 
                      : 'bg-neutral-gray-100 text-neutral-gray-400'
                  }`}>
                    🌙 저녁
                  </div>
                </div>
              )}
              
              <div className="bg-white rounded-lg p-4">
                <div className="text-center mb-3">
                  <span className="text-4xl font-bold text-primary">{recommendation.recommendedTime}</span>
                  <p className="text-small text-neutral-gray-600 mt-1">({recommendation.timeSlot})</p>
                </div>
                
                <div className="space-y-3 text-small">
                  <div>
                    <p className="font-semibold text-neutral-gray-700 mb-1">💡 추천 이유</p>
                    <p className="text-neutral-gray-600">{recommendation.reason}</p>
                  </div>
                  
                  <div>
                    <p className="font-semibold text-neutral-gray-700 mb-1">🧬 생체리듬과의 관계</p>
                    <p className="text-neutral-gray-600">{recommendation.chronopharmacology}</p>
                  </div>
                  
                  {recommendation.precautions && recommendation.precautions.length > 0 && (
                    <div>
                      <p className="font-semibold text-neutral-gray-700 mb-1">⚠️ 주의사항</p>
                      <ul className="list-disc list-inside text-neutral-gray-600 space-y-1">
                        {recommendation.precautions.map((precaution: string, index: number) => (
                          <li key={index}>{precaution}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {recommendation.lifestyleAdvice && (
                    <div className="bg-info-50 rounded p-3">
                      <div className="flex gap-2">
                        <InformationCircleIcon className="w-5 h-5 text-info-700 flex-shrink-0" />
                        <p className="text-info-700">{recommendation.lifestyleAdvice}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 부작용 및 주의사항 */}
          {medicine.sideEffects && (
            <div>
              <h3 className="text-h4 text-neutral-gray-900 mb-3">부작용</h3>
              <p className="text-small text-neutral-gray-600">{medicine.sideEffects}</p>
            </div>
          )}

          {medicine.precautions && (
            <div>
              <h3 className="text-h4 text-neutral-gray-900 mb-3">복용 시 주의사항</h3>
              <p className="text-small text-neutral-gray-600">{medicine.precautions}</p>
            </div>
          )}

          {/* 고지사항 */}
          <div className="alert-warning">
            <p className="text-small font-semibold mb-1">⚠️ 중요</p>
            <p className="text-small">
              이 정보는 일반적인 참고용 설명입니다. 복용 시간 변경이나 치료 결정은 반드시 의사 또는 약사와 상담하세요.
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={onClose}
            >
              닫기
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={onAddMedicine}
            >
              내 약으로 추가
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
