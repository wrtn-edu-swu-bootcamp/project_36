'use client';

import { useState } from 'react';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function SchedulePage() {
  // TODO: 실제 스케줄 데이터 페칭
  const [schedules] = useState<any[]>([]);

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-h1 text-neutral-gray-900 mb-2">복용 시간표</h1>
        <p className="text-body text-neutral-gray-600">{today}</p>
      </div>

      {/* Timeline */}
      {schedules.length === 0 ? (
        <Card>
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⏰</div>
            <h3 className="text-h3 text-neutral-gray-800 mb-2">
              오늘 복용할 약이 없습니다
            </h3>
            <p className="text-body text-neutral-gray-600 mb-6">
              약물을 등록하고 복용 시간표를 만들어보세요.
            </p>
            <Link href="/medicines/search">
              <Button variant="primary">약 추가하기</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <Card key={schedule.id}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-4">
                    <span className="text-h3 text-primary font-bold">
                      {schedule.time}
                    </span>
                    <div>
                      <CardHeader>{schedule.medicineName}</CardHeader>
                      <CardBody>{schedule.dosage}</CardBody>
                    </div>
                  </div>
                </div>
                <Button
                  variant={schedule.completed ? 'secondary' : 'primary'}
                  size="sm"
                >
                  {schedule.completed ? '복용 완료' : '복용하기'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
