import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // 사용자의 약인지 확인
    const userMedicine = await prisma.userMedicine.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!userMedicine) {
      return NextResponse.json(
        { error: '약을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 약 삭제 (isActive를 false로 변경)
    await prisma.userMedicine.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: '약이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('Delete medicine error:', error);
    return NextResponse.json(
      { error: '약 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
