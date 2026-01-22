'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function MyPage() {
  const { data: session } = useSession();
  const [isEditingPattern, setIsEditingPattern] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lifePattern, setLifePattern] = useState<any>(null);
  const [formData, setFormData] = useState({
    wakeUpTime: '07:00',
    bedTime: '23:00',
    breakfastTime: '',
    lunchTime: '',
    dinnerTime: '',
    workStartTime: '',
    workEndTime: '',
    hasDriving: false,
    hasFocusWork: false,
  });

  useEffect(() => {
    fetchLifePattern();
  }, []);

  const fetchLifePattern = async () => {
    try {
      const response = await fetch('/api/life-pattern');
      const result = await response.json();
      
      if (result.success && result.data) {
        setLifePattern(result.data);
        setFormData({
          wakeUpTime: result.data.wakeUpTime || '07:00',
          bedTime: result.data.bedTime || '23:00',
          breakfastTime: result.data.breakfastTime || '',
          lunchTime: result.data.lunchTime || '',
          dinnerTime: result.data.dinnerTime || '',
          workStartTime: result.data.workStartTime || '',
          workEndTime: result.data.workEndTime || '',
          hasDriving: result.data.hasDriving || false,
          hasFocusWork: result.data.hasFocusWork || false,
        });
      }
    } catch (error) {
      console.error('Fetch life pattern error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/life-pattern', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert('생활 패턴이 저장되었습니다!');
        setLifePattern(result.data);
        setIsEditingPattern(false);
      } else {
        alert(result.error || '저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('Save life pattern error:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-h1 text-neutral-gray-900 mb-2">마이페이지</h1>
        <p className="text-body text-neutral-gray-600">
          프로필과 생활패턴을 관리하세요.
        </p>
      </div>

      {/* User Profile */}
      <Card className="mb-6">
        <CardHeader>프로필 정보</CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div>
              <label className="label">이름</label>
              <p className="text-body">{session?.user?.name || '사용자'}</p>
            </div>
            <div>
              <label className="label">이메일</label>
              <p className="text-body">{session?.user?.email || '이메일 없음'}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Life Pattern */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <CardHeader>생활 패턴</CardHeader>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditingPattern(!isEditingPattern)}
          >
            {isEditingPattern ? '취소' : '수정'}
          </Button>
        </div>
        <CardBody>
          {isEditingPattern ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="wakeUpTime"
                  type="time"
                  label="기상 시간 *"
                  value={formData.wakeUpTime}
                  onChange={(e) => setFormData({ ...formData, wakeUpTime: e.target.value })}
                  required
                />
                <Input
                  id="bedTime"
                  type="time"
                  label="취침 시간 *"
                  value={formData.bedTime}
                  onChange={(e) => setFormData({ ...formData, bedTime: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Input
                  id="breakfastTime"
                  type="time"
                  label="아침 식사 (선택)"
                  value={formData.breakfastTime}
                  onChange={(e) => setFormData({ ...formData, breakfastTime: e.target.value })}
                />
                <Input
                  id="lunchTime"
                  type="time"
                  label="점심 식사 (선택)"
                  value={formData.lunchTime}
                  onChange={(e) => setFormData({ ...formData, lunchTime: e.target.value })}
                />
                <Input
                  id="dinnerTime"
                  type="time"
                  label="저녁 식사 (선택)"
                  value={formData.dinnerTime}
                  onChange={(e) => setFormData({ ...formData, dinnerTime: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="workStartTime"
                  type="time"
                  label="업무 시작 (선택)"
                  value={formData.workStartTime}
                  onChange={(e) => setFormData({ ...formData, workStartTime: e.target.value })}
                />
                <Input
                  id="workEndTime"
                  type="time"
                  label="업무 종료 (선택)"
                  value={formData.workEndTime}
                  onChange={(e) => setFormData({ ...formData, workEndTime: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasDriving}
                    onChange={(e) => setFormData({ ...formData, hasDriving: e.target.checked })}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-small">자주 운전을 합니다</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasFocusWork}
                    onChange={(e) => setFormData({ ...formData, hasFocusWork: e.target.checked })}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-small">집중력이 필요한 업무를 합니다</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="primary" isLoading={isSaving}>
                  저장하기
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsEditingPattern(false);
                    if (lifePattern) {
                      setFormData({
                        wakeUpTime: lifePattern.wakeUpTime || '07:00',
                        bedTime: lifePattern.bedTime || '23:00',
                        breakfastTime: lifePattern.breakfastTime || '',
                        lunchTime: lifePattern.lunchTime || '',
                        dinnerTime: lifePattern.dinnerTime || '',
                        workStartTime: lifePattern.workStartTime || '',
                        workEndTime: lifePattern.workEndTime || '',
                        hasDriving: lifePattern.hasDriving || false,
                        hasFocusWork: lifePattern.hasFocusWork || false,
                      });
                    }
                  }}
                >
                  취소
                </Button>
              </div>
            </form>
          ) : lifePattern ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-small text-neutral-gray-600">기상 시간</p>
                  <p className="font-semibold">{lifePattern.wakeUpTime}</p>
                </div>
                <div>
                  <p className="text-small text-neutral-gray-600">취침 시간</p>
                  <p className="font-semibold">{lifePattern.bedTime}</p>
                </div>
              </div>
              {(lifePattern.breakfastTime || lifePattern.lunchTime || lifePattern.dinnerTime) && (
                <div className="grid grid-cols-3 gap-4">
                  {lifePattern.breakfastTime && (
                    <div>
                      <p className="text-small text-neutral-gray-600">아침 식사</p>
                      <p className="font-semibold">{lifePattern.breakfastTime}</p>
                    </div>
                  )}
                  {lifePattern.lunchTime && (
                    <div>
                      <p className="text-small text-neutral-gray-600">점심 식사</p>
                      <p className="font-semibold">{lifePattern.lunchTime}</p>
                    </div>
                  )}
                  {lifePattern.dinnerTime && (
                    <div>
                      <p className="text-small text-neutral-gray-600">저녁 식사</p>
                      <p className="font-semibold">{lifePattern.dinnerTime}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-gray-500">
              <p className="text-body">아직 생활 패턴을 설정하지 않았습니다.</p>
              <p className="text-small mt-2">
                생활 패턴을 설정하면 더 정확한 복용 시간을 추천받을 수 있습니다.
              </p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Logout */}
      <Card>
        <CardBody>
          <Button
            variant="danger"
            className="w-full"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            로그아웃
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
