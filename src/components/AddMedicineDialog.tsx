'use client';

import { useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';

interface AddMedicineDialogProps {
  medicine: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMedicineDialog({ medicine, onClose, onSuccess }: AddMedicineDialogProps) {
  const [dosage, setDosage] = useState('1정');
  const [frequency, setFrequency] = useState('1');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          startDate: new Date().toISOString(),
          notes,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('약물이 성공적으로 등록되었습니다!');
        onSuccess();
        onClose();
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
