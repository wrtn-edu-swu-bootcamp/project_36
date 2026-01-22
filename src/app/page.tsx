export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="container-custom py-20">
        <div className="text-center max-w-4xl mx-auto">
          {/* Hero Section */}
          <h1 className="text-display-1 text-neutral-gray-900 mb-6">
            약 복용, 이제 올바른 시간에
          </h1>
          <p className="text-h4 text-neutral-gray-600 mb-12 font-normal">
            생체리듬 기반 과학적 약 복용 시간 추천 서비스
          </p>

          {/* CTA Button */}
          <div className="flex gap-4 justify-center mb-20">
            <a href="/login" className="btn-primary btn-lg">
              시작하기
            </a>
            <a href="#features" className="btn-outline btn-lg">
              더 알아보기
            </a>
          </div>

          {/* Feature Cards */}
          <div id="features" className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="card text-left">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="card-header">맞춤 복용 시간</h3>
              <p className="card-body">
                생체리듬과 약물 특성을 고려한 개인화된 복용 시간을 추천해드립니다.
              </p>
            </div>

            <div className="card text-left">
              <div className="text-4xl mb-4">💊</div>
              <h3 className="card-header">약물 정보</h3>
              <p className="card-body">
                식약처 데이터 기반의 정확한 약물 정보와 상호작용을 확인하세요.
              </p>
            </div>

            <div className="card text-left">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="card-header">교육 콘텐츠</h3>
              <p className="card-body">
                시간약리학과 올바른 복용법에 대한 전문 지식을 제공합니다.
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="alert-warning mt-20">
            <span className="text-2xl">⚠️</span>
            <div className="text-left">
              <h4 className="font-bold mb-2">중요</h4>
              <p>
                이 서비스는 교육 목적의 참고 자료입니다. 복용 시간 변경이나 치료 결정은 반드시
                의사 또는 약사와 상담하세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
