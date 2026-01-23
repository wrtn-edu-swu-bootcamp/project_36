/**
 * 테스트 사용자 생성 스크립트
 * 
 * 실행 방법:
 * npx tsx scripts/create-test-user.ts
 */

import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const testUser = {
    name: '테스트 사용자',
    email: 'test@meditime.com',
    password: 'test1234',
  };

  console.log('테스트 사용자 생성 중...');
  console.log(`이메일: ${testUser.email}`);
  console.log(`비밀번호: ${testUser.password}`);

  // 기존 사용자 확인
  const existingUser = await prisma.user.findUnique({
    where: { email: testUser.email },
  });

  if (existingUser) {
    console.log('\n⚠️  이미 존재하는 사용자입니다.');
    console.log('기존 사용자 정보:');
    console.log(`ID: ${existingUser.id}`);
    console.log(`이름: ${existingUser.name}`);
    console.log(`이메일: ${existingUser.email}`);
    return;
  }

  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash(testUser.password, 12);

  // 사용자 생성
  const user = await prisma.user.create({
    data: {
      name: testUser.name,
      email: testUser.email,
      password: hashedPassword,
    },
  });

  console.log('\n✅ 테스트 사용자가 생성되었습니다!');
  console.log('사용자 정보:');
  console.log(`ID: ${user.id}`);
  console.log(`이름: ${user.name}`);
  console.log(`이메일: ${user.email}`);
  console.log('\n로그인 정보:');
  console.log(`이메일: ${testUser.email}`);
  console.log(`비밀번호: ${testUser.password}`);
}

main()
  .catch((error) => {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
