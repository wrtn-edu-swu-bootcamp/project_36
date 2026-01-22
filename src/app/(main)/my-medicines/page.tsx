'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { PlusIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function MyMedicinesPage() {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMedicines();
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
                    onClick={() => {
                      if (confirm('이 약을 삭제하시겠습니까?')) {
                        // TODO: 삭제 API 호출
                      }
                    }}
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
                      {userMedicine.recommendedTimes.map((time: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary-50 text-primary rounded-lg text-small font-medium"
                        >
                          {time}
                        </span>
                      ))}
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
    </div>
  );
}
