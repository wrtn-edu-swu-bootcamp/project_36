'use client';

import { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Link from 'next/link';
import Button from '@/components/ui/Button';

interface MedicineSchedule {
  id: string;
  time: string;
  medicineName: string;
  dosage: string;
  userMedicineId: string;
}

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<MedicineSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/user-medicines');
      const result = await response.json();
      
      if (result.success) {
        // 약물 목록을 시간표로 변환
        const scheduleList: MedicineSchedule[] = [];
        
        result.data.forEach((userMedicine: any) => {
          if (userMedicine.recommendedTimes) {
            const times = JSON.parse(userMedicine.recommendedTimes);
            times.forEach((time: string) => {
              scheduleList.push({
                id: `${userMedicine.id}-${time}`,
                time,
                medicineName: userMedicine.medicine.name,
                dosage: userMedicine.dosage,
                userMedicineId: userMedicine.id,
              });
            });
          }
        });
        
        // 시간순으로 정렬
        scheduleList.sort((a, b) => {
          const timeA = parseInt(a.time.replace(':', ''));
          const timeB = parseInt(b.time.replace(':', ''));
          return timeA - timeB;
        });
        
        setSchedules(scheduleList);
      }
    } catch (error) {
      console.error('Fetch schedules error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeIcon = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 6 && hour < 12) return '🌅';
    if (hour >= 12 && hour < 18) return '☀️';
    if (hour >= 18 && hour < 22) return '🌙';
    return '🌙';
  };

  const getTimeLabel = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 6 && hour < 12) return '아침';
    if (hour >= 12 && hour < 18) return '점심/오후';
    if (hour >= 18 && hour < 22) return '저녁';
    return '밤';
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
            <Card key={schedule.id} hover>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl mb-1">{getTimeIcon(schedule.time)}</div>
                    <span className="text-h3 text-primary font-bold">
                      {schedule.time}
                    </span>
                    <p className="text-xs text-neutral-gray-500 mt-1">
                      {getTimeLabel(schedule.time)}
                    </p>
                  </div>
                  <div className="border-l-2 border-neutral-gray-200 pl-4">
                    <h3 className="text-body font-semibold text-neutral-gray-900">
                      {schedule.medicineName}
                    </h3>
                    <p className="text-small text-neutral-gray-600">
                      {schedule.dosage}
                    </p>
                  </div>
                </div>
                <Link href="/my-medicines">
                  <Button variant="secondary" size="sm">
                    자세히 보기
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {schedules.length > 0 && (
        <div className="mt-6 p-4 bg-info-50 rounded-lg">
          <p className="text-small text-info-800">
            💡 <strong>알림:</strong> 위 시간은 권장 복용 시간입니다. 
            실제 복용 시간은 의사 또는 약사의 지시에 따라 조정하세요.
          </p>
        </div>
      )}
    </div>
  );
}
