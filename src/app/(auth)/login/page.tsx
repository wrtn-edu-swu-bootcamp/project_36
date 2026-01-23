'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';

const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');

    try {
      const from = searchParams.get('from') || '/dashboard';
      
      // NextAuth의 signIn 호출 (redirect: false로 에러 처리 가능)
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
        callbackUrl: from,
      });

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      } else if (result?.ok) {
        // 로그인 성공 - NextAuth가 세션 쿠키를 설정함
        // 세션이 설정될 시간을 확보하기 위해 짧은 지연
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // NextAuth의 기본 리디렉션처럼 동작하도록 전체 페이지 리로드
        // 이렇게 하면 middleware가 새로운 요청에서 세션을 확인할 수 있음
        window.location.href = from;
      }
    } catch (err: any) {
      // 에러 메시지 처리
      const errorMessage = err?.message || '로그인 중 오류가 발생했습니다.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <div className="card max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-h1 text-neutral-gray-900 mb-2">로그인</h1>
          <p className="text-body text-neutral-gray-600">
            MediTime에 오신 것을 환영합니다
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="danger" className="mb-6">
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            id="email"
            type="email"
            label="이메일"
            placeholder="example@email.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            id="password"
            type="password"
            label="비밀번호"
            placeholder="비밀번호를 입력하세요"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            로그인
          </Button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <p className="text-small text-neutral-gray-600">
            계정이 없으신가요?{' '}
            <Link href="/register" className="link">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
        <div className="card max-w-md w-full">
          <div className="text-center py-12">
            <p className="text-body text-neutral-gray-600">로딩 중...</p>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
