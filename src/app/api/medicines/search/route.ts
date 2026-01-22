import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: '검색어는 최소 2자 이상 입력해주세요.' },
        { status: 400 }
      );
    }

    // 약물 검색 (이름 또는 성분명으로 검색)
    const medicines = await prisma.medicine.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
            },
          },
          {
            genericName: {
              contains: query,
            },
          },
        ],
      },
      take: 20, // 최대 20개까지만 반환
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: medicines,
      count: medicines.length,
    });
  } catch (error) {
    console.error('Medicine search error:', error);
    return NextResponse.json(
      { error: '약물 검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
