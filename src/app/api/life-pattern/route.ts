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
      include: {
        lifePattern: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user.lifePattern,
    });
  } catch (error) {
    console.error('Get life pattern error:', error);
    return NextResponse.json(
      { error: '생활 패턴 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const {
      wakeUpTime,
      bedTime,
      breakfastTime,
      lunchTime,
      dinnerTime,
      workStartTime,
      workEndTime,
      hasDriving,
      hasFocusWork,
    } = body;

    // 기존 생활 패턴이 있는지 확인
    const existingPattern = await prisma.lifePattern.findUnique({
      where: { userId: user.id },
    });

    let lifePattern;
    if (existingPattern) {
      // 업데이트
      lifePattern = await prisma.lifePattern.update({
        where: { userId: user.id },
        data: {
          wakeUpTime,
          bedTime,
          breakfastTime,
          lunchTime,
          dinnerTime,
          workStartTime,
          workEndTime,
          hasDriving: hasDriving || false,
          hasFocusWork: hasFocusWork || false,
        },
      });
    } else {
      // 생성
      lifePattern = await prisma.lifePattern.create({
        data: {
          userId: user.id,
          wakeUpTime,
          bedTime,
          breakfastTime,
          lunchTime,
          dinnerTime,
          workStartTime,
          workEndTime,
          hasDriving: hasDriving || false,
          hasFocusWork: hasFocusWork || false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: lifePattern,
    });
  } catch (error) {
    console.error('Save life pattern error:', error);
    return NextResponse.json(
      { error: '생활 패턴 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
