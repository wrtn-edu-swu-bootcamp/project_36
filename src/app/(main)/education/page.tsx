import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import DisclaimerBanner from '@/components/DisclaimerBanner';

export default function EducationPage() {
  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-h1 text-neutral-gray-900 mb-2">참고 자료</h1>
        <p className="text-body text-neutral-gray-600">
          올바른 약 복용법과 시간약리학에 대한 정보를 확인하세요.
        </p>
      </div>

      <DisclaimerBanner />

      {/* Education Content */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <Card hover className="cursor-pointer">
          <div className="text-4xl mb-4">🕐</div>
          <CardHeader>시간약리학이란?</CardHeader>
          <CardBody>
            약물의 효과가 복용 시간에 따라 어떻게 달라지는지 알아보세요.
          </CardBody>
        </Card>

        <Card hover className="cursor-pointer">
          <div className="text-4xl mb-4">💉</div>
          <CardHeader>생체리듬과 약물</CardHeader>
          <CardBody>
            우리 몸의 생체리듬이 약물 효과에 미치는 영향을 이해해보세요.
          </CardBody>
        </Card>

        <Card hover className="cursor-pointer">
          <div className="text-4xl mb-4">⚠️</div>
          <CardHeader>올바른 복용법</CardHeader>
          <CardBody>
            약을 안전하고 효과적으로 복용하는 방법을 배워보세요.
          </CardBody>
        </Card>

        <Card hover className="cursor-pointer">
          <div className="text-4xl mb-4">🤝</div>
          <CardHeader>약물 상호작용</CardHeader>
          <CardBody>
            여러 약물을 함께 복용할 때 주의할 점을 알아보세요.
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
