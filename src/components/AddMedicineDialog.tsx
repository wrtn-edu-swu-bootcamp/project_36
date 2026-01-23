'use client';

import { useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import { ExclamationTriangleIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

interface InteractionWarning {
  otherMedicine: { id: string; name: string; genericName: string };
  severityLevel: string;
  severityLabel: string;
  interactionType: string;
  interactionTypeLabel: string;
  description: string;
  recommendation: string | null;
}

interface DuplicateIngredient {
  ingredient: string;
  existingMedicine: { id: string; name: string };
}

interface AddMedicineDialogProps {
  medicine: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMedicineDialog({ medicine, onClose, onSuccess }: AddMedicineDialogProps) {
  const [dosage, setDosage] = useState('1정');
  const [frequency, setFrequency] = useState('1');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWarnings, setShowWarnings] = useState(false);
  const [interactionWarnings, setInteractionWarnings] = useState<InteractionWarning[]>([]);
  const [duplicateIngredients, setDuplicateIngredients] = useState<DuplicateIngredient[]>([]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/medicines/${medicine.id}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dosage,
          frequency: parseInt(frequency),
          startDate: new Date(startDate).toISOString(),
          endDate: endDate ? new Date(endDate).toISOString() : null,
          notes,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 상호작용 경고가 있으면 표시
        if (result.hasWarnings) {
          setInteractionWarnings(result.interactionWarnings || []);
          setDuplicateIngredients(result.duplicateIngredients || []);
          setShowWarnings(true);
        } else {
          onSuccess();
          onClose();
        }
      } else {
        alert(result.error || '약물 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('Add medicine error:', error);
      alert('약물 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmWarnings = () => {
    onSuccess();
    onClose();
  };

  // 경고 확인 화면
  if (showWarnings) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <ShieldExclamationIcon className="w-6 h-6 text-warning" />
            <h2 className="text-h2 text-neutral-gray-900">상호작용 주의사항</h2>
          </div>

          <div className="mb-4 p-3 bg-warning-50 rounded-lg">
            <p className="text-small text-warning-800">
              <strong>{medicine.name}</strong>이(가) 등록되었습니다.
              현재 복용 중인 약물과 다음과 같은 상호작용이 있을 수 있습니다.
              반드시 의사 또는 약사와 상담하세요.
            </p>
          </div>

          {/* 상호작용 목록 */}
          {interactionWarnings.length > 0 && (
            <div className="mb-4">
              <h3 className="text-body font-semibold text-neutral-gray-800 mb-2">
                약물 상호작용
              </h3>
              <div className="space-y-2">
                {interactionWarnings.map((warning, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${getSeverityColor(warning.severityLevel)}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getSeverityBadgeColor(warning.severityLevel)}`}>
                        {warning.severityLabel}
                      </span>
                      <span className="text-small font-medium">
                        {warning.otherMedicine.name}
                      </span>
                      <span className="text-xs text-neutral-gray-500">
                        ({warning.interactionTypeLabel})
                      </span>
                    </div>
                    <p className="text-small">{warning.description}</p>
                    {warning.recommendation && (
                      <p className="text-small mt-1 font-medium">
                        💡 {warning.recommendation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 성분 중복 */}
          {duplicateIngredients.length > 0 && (
            <div className="mb-4">
              <h3 className="text-body font-semibold text-neutral-gray-800 mb-2">
                성분 중복 주의
              </h3>
              <div className="space-y-2">
                {duplicateIngredients.map((dup, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border bg-warning-50 border-warning-200"
                  >
                    <p className="text-small text-warning-800">
                      <strong>{dup.ingredient}</strong> 성분이{' '}
                      <strong>{dup.existingMedicine.name}</strong>과(와) 중복됩니다.
                      과량 복용에 주의하세요.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-neutral-gray-200 pt-4">
            <p className="text-small text-neutral-gray-600 mb-4">
              ⚠️ 위 정보는 일반적으로 알려진 내용입니다. 
              복용에 관한 결정은 반드시 의사 또는 약사와 상담하세요.
            </p>
            <Button
              variant="primary"
              className="w-full"
              onClick={handleConfirmWarnings}
            >
              확인했습니다
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-h2 text-neutral-gray-900 mb-4">내 약으로 추가</h2>
        
        <div className="mb-4 p-3 bg-neutral-gray-50 rounded">
          <p className="font-semibold text-neutral-gray-900">{medicine.name}</p>
          <p className="text-small text-neutral-gray-600">{medicine.genericName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="dosage"
            label="복용량"
            type="text"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            placeholder="예: 1정, 5ml"
          />

          <div>
            <label htmlFor="frequency" className="label">
              1일 복용 횟수
            </label>
            <select
              id="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="input w-full"
            >
              <option value="1">1회</option>
              <option value="2">2회</option>
              <option value="3">3회</option>
              <option value="4">4회</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="startDate"
              label="복용 시작일"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              id="endDate"
              label="복용 종료일 (선택)"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              placeholder="미정"
            />
          </div>

          <Input
            id="notes"
            label="메모 (선택사항)"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="예: 식후 30분"
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={isSubmitting}
            >
              추가하기
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
