import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 활성 약물 목록 조회
    const userMedicines = await prisma.userMedicine.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      include: {
        medicine: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // recommendedTimes JSON 파싱
    const medicines = userMedicines.map(um => ({
      ...um,
      recommendedTimes: um.recommendedTimes ? JSON.parse(um.recommendedTimes) : [],
    }));

    return NextResponse.json({
      success: true,
      data: medicines,
    });
  } catch (error) {
    console.error('Get user medicines error:', error);
    return NextResponse.json(
      { error: '약물 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
