export default function Footer() {
  return (
    <footer className="bg-neutral-gray-900 text-neutral-gray-300 mt-20">
      <div className="container-custom py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand Info */}
          <div>
            <h3 className="text-h4 font-bold text-white mb-4">MediTime</h3>
            <p className="text-small mb-4">
              생체리듬 기반 과학적 약 복용 시간 추천 서비스
            </p>
            <p className="text-caption text-neutral-gray-400">
              © 2026 MediTime. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">서비스</h4>
            <ul className="space-y-2 text-small">
              <li>
                <a href="/about" className="hover:text-primary transition-colors">
                  서비스 소개
                </a>
              </li>
              <li>
                <a href="/education" className="hover:text-primary transition-colors">
                  참고 자료
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-primary transition-colors">
                  이용약관
                </a>
              </li>
              <li>
                <a href="/privacy" className="hover:text-primary transition-colors">
                  개인정보처리방침
                </a>
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h4 className="font-semibold text-white mb-4">주의사항</h4>
            <p className="text-small text-neutral-gray-400">
              본 서비스는 의학적 조언을 대체하지 않습니다. 복용 시간 변경이나 치료 결정은
              반드시 의사 또는 약사와 상담하세요.
            </p>
          </div>
        </div>

        <div className="divider" />

        <div className="text-center text-caption text-neutral-gray-500">
          <p>
            본 서비스의 약물 정보는 식품의약품안전처 공공데이터를 활용합니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
