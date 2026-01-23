#!/usr/bin/env node

/**
 * Vercel 환경 변수 자동 설정 스크립트
 * 
 * 실행 방법:
 * 1. Vercel CLI 로그인: vercel login
 * 2. 프로젝트 링크: vercel link
 * 3. 스크립트 실행: node scripts/setup-vercel-env.js
 */

const { execSync } = require('child_process');
const crypto = require('crypto');

// 환경 변수 값 생성
const NEXTAUTH_SECRET = crypto.randomBytes(32).toString('base64');
const NEXTAUTH_URL = 'https://project-36-7m7s-ic3lm0eoh-sooins-projects-4b973337.vercel.app';

console.log('🔧 Vercel 환경 변수 설정 시작...\n');

// 환경 변수 목록
const envVars = [
  {
    name: 'NEXTAUTH_SECRET',
    value: NEXTAUTH_SECRET,
    environments: ['production', 'preview', 'development'],
    description: 'NextAuth JWT 시크릿 키',
  },
  {
    name: 'NEXTAUTH_URL',
    value: NEXTAUTH_URL,
    environments: ['production'],
    description: 'NextAuth 프로덕션 URL',
  },
];

console.log('📋 설정할 환경 변수:\n');
envVars.forEach((env) => {
  console.log(`  ${env.name}:`);
  console.log(`    - 설명: ${env.description}`);
  console.log(`    - 값: ${env.value.substring(0, 20)}...`);
  console.log(`    - 환경: ${env.environments.join(', ')}`);
  console.log('');
});

console.log('\n⚠️  수동 설정이 필요합니다:\n');
console.log('1. Vercel 대시보드 접속: https://vercel.com/dashboard');
console.log('2. 프로젝트 선택 → Settings → Environment Variables');
console.log('3. 다음 환경 변수를 추가:\n');

envVars.forEach((env) => {
  console.log(`   변수명: ${env.name}`);
  console.log(`   값: ${env.value}`);
  console.log(`   환경: ${env.environments.join(', ')}`);
  console.log('');
});

console.log('\n📝 DATABASE_URL도 설정해야 합니다:');
console.log('   - Vercel 대시보드 → Storage 탭');
console.log('   - Postgres 데이터베이스에서 연결 URL 복사');
console.log('   - Environment Variables에 DATABASE_URL로 추가\n');

console.log('✅ 환경 변수 추가 후 Redeploy 하세요!');
console.log('   Deployments 탭 → 최근 배포 → ... → Redeploy\n');

// .env.vercel 파일에 저장
const fs = require('fs');
const envContent = `# Vercel 환경 변수 (자동 생성)
# 생성 시각: ${new Date().toISOString()}

# NextAuth 설정
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
NEXTAUTH_URL="${NEXTAUTH_URL}"

# DATABASE_URL은 Vercel Postgres에서 가져와야 합니다
# DATABASE_URL="postgresql://..."
`;

fs.writeFileSync('.env.vercel', envContent);
console.log('💾 환경 변수가 .env.vercel 파일에 저장되었습니다.\n');
