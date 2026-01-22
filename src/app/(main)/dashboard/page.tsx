import DisclaimerBanner from '@/components/DisclaimerBanner';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';

export default function DashboardPage() {
  return (
    <div className="container-custom py-8">
      {/* Welcome Banner */}
      <div className="mb-8">
        <h1 className="text-h1 text-neutral-gray-900 mb-2">안녕하세요 👋</h1>
        <p className="text-body text-neutral-gray-600">
          오늘도 건강한 하루 되세요!
        </p>
      </div>

      {/* Disclaimer */}
      <DisclaimerBanner />

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <a href="/medicines/search">
          <Card hover className="cursor-pointer">
            <div className="text-4xl mb-4">💊</div>
            <CardHeader>약 검색하기</CardHeader>
            <CardBody>새로운 약물을 검색하고 복용 시간을 추천받으세요.</CardBody>
          </Card>
        </a>

        <a href="/my-medicines">
          <Card hover className="cursor-pointer">
            <div className="text-4xl mb-4">📋</div>
            <CardHeader>내 약 관리</CardHeader>
            <CardBody>등록한 약물을 확인하고 관리하세요.</CardBody>
          </Card>
        </a>

        <a href="/schedule">
          <Card hover className="cursor-pointer">
            <div className="text-4xl mb-4">⏰</div>
            <CardHeader>복용 시간표</CardHeader>
            <CardBody>오늘의 복용 일정을 확인하세요.</CardBody>
          </Card>
        </a>
      </div>

      {/* Today's Schedule */}
      <div className="mt-12">
        <h2 className="text-h2 text-neutral-gray-900 mb-6">오늘 복용할 약</h2>
        <Card>
          <div className="text-center py-12 text-neutral-gray-500">
            <p className="text-body">등록된 약물이 없습니다.</p>
            <p className="text-small mt-2">약물을 검색하고 추가해보세요.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
