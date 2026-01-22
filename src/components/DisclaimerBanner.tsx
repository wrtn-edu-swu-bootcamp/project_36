import Alert from './ui/Alert';

export default function DisclaimerBanner() {
  return (
    <Alert variant="warning" className="my-6">
      <div>
        <h4 className="font-bold mb-2">중요</h4>
        <p>
          이 정보는 일반적인 참고용 설명입니다. 복용 시간 변경이나 치료 결정은 반드시 의사
          또는 약사와 상담하세요. 본 서비스는 교육 목적으로 제공되며, 의학적 조언을 대체하지
          않습니다.
        </p>
      </div>
    </Alert>
  );
}
