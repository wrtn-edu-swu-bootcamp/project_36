'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';

const registerSchema = z
  .object({
    name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다.'),
    email: z.string().email('올바른 이메일 형식이 아닙니다.'),
    password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
    passwordConfirm: z.string(),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: '이용약관에 동의해주세요.',
    }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error?.message || '회원가입에 실패했습니다.');
        return;
      }

      // 회원가입 성공 -> 로그인 페이지로 이동
      router.push('/login?registered=true');
    } catch (err) {
      setError('회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <div className="card max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-h1 text-neutral-gray-900 mb-2">회원가입</h1>
          <p className="text-body text-neutral-gray-600">
            건강한 약 복용 습관을 시작하세요
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="danger" className="mb-6">
            {error}
          </Alert>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            id="name"
            type="text"
            label="이름"
            placeholder="홍길동"
            error={errors.name?.message}
            {...register('name')}
          />

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
            placeholder="8자 이상 입력하세요"
            helperText="영문, 숫자 조합 8자 이상"
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            id="passwordConfirm"
            type="password"
            label="비밀번호 확인"
            placeholder="비밀번호를 다시 입력하세요"
            error={errors.passwordConfirm?.message}
            {...register('passwordConfirm')}
          />

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3">
            <input
              id="agreeTerms"
              type="checkbox"
              className="mt-1 w-5 h-5 rounded border-neutral-gray-300 text-primary focus:ring-primary"
              {...register('agreeTerms')}
            />
            <label htmlFor="agreeTerms" className="text-small text-neutral-gray-700">
              <Link href="/terms" className="link">
                이용약관
              </Link>{' '}
              및{' '}
              <Link href="/privacy" className="link">
                개인정보처리방침
              </Link>
              에 동의합니다.
              {errors.agreeTerms && (
                <span className="block text-danger mt-1">{errors.agreeTerms.message}</span>
              )}
            </label>
          </div>

          <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
            회원가입
          </Button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <p className="text-small text-neutral-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="link">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
