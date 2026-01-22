import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(
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

    const body = await request.json();
    const { dosage, frequency, startDate, notes } = body;

    // 약물 존재 확인
    const medicine = await prisma.medicine.findUnique({
      where: { id },
    });

    if (!medicine) {
      return NextResponse.json(
        { error: '약물을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 등록된 약인지 확인
    const existingUserMedicine = await prisma.userMedicine.findFirst({
      where: {
        userId: user.id,
        medicineId: id,
        isActive: true,
      },
    });

    if (existingUserMedicine) {
      return NextResponse.json(
        { error: '이미 등록된 약물입니다.' },
        { status: 400 }
      );
    }

    // 생활 패턴 가져오기 (복용 시간 추천용)
    const lifePattern = await prisma.lifePattern.findUnique({
      where: { userId: user.id },
    });

    // 복용 시간 추천
    const recommendedTimes = generateRecommendedTimes(medicine, lifePattern, frequency);

    // 약물 등록
    const userMedicine = await prisma.userMedicine.create({
      data: {
        userId: user.id,
        medicineId: id,
        dosage: dosage || '1정',
        frequency: parseInt(frequency) || 1,
        startDate: new Date(startDate || new Date()),
        notes,
        recommendedTimes: JSON.stringify(recommendedTimes),
        isActive: true,
      },
      include: {
        medicine: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: userMedicine,
    });
  } catch (error) {
    console.error('Add medicine error:', error);
    return NextResponse.json(
      { error: '약물 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 복용 시간 추천 함수
function generateRecommendedTimes(
  medicine: any,
  lifePattern: any,
  frequency: number
): string[] {
  const times: string[] = [];
  
  // 기본 시간 (생활 패턴이 없는 경우)
  const defaultWakeTime = '07:00';
  const defaultBedTime = '23:00';
  
  const wakeTime = lifePattern?.wakeUpTime || defaultWakeTime;
  const bedTime = lifePattern?.bedTime || defaultBedTime;

  // 졸음 유발 약물
  if (medicine.sleepInducing === 'HIGH' || medicine.sleepInducing === 'MEDIUM') {
    // 취침 전 복용 권장
    const bedHour = parseInt(bedTime.split(':')[0]);
    times.push(`${String(bedHour - 1).padStart(2, '0')}:00`);
    return times;
  }

  // 각성 효과가 있는 약물
  if (medicine.alertnessEffect === 'HIGH' || medicine.alertnessEffect === 'MEDIUM') {
    // 아침 복용 권장
    const wakeHour = parseInt(wakeTime.split(':')[0]);
    times.push(`${String(wakeHour).padStart(2, '0')}:30`);
    return times;
  }

  // 식사 시간 관련
  if (medicine.mealTiming === 'BEFORE_MEAL') {
    if (frequency === 1) {
      times.push('07:30'); // 아침 식전
    } else if (frequency === 2) {
      times.push('07:30', '18:30'); // 아침, 저녁 식전
    } else if (frequency >= 3) {
      times.push('07:30', '12:00', '18:30'); // 아침, 점심, 저녁 식전
    }
    return times;
  }

  if (medicine.mealTiming === 'AFTER_MEAL') {
    if (frequency === 1) {
      times.push('08:30'); // 아침 식후
    } else if (frequency === 2) {
      times.push('08:30', '20:00'); // 아침, 저녁 식후
    } else if (frequency >= 3) {
      times.push('08:30', '13:00', '20:00'); // 아침, 점심, 저녁 식후
    }
    return times;
  }

  // 기본 복용 시간 (하루 균등 분배)
  const wakeHour = parseInt(wakeTime.split(':')[0]);
  const bedHour = parseInt(bedTime.split(':')[0]);
  const activeHours = bedHour > wakeHour ? bedHour - wakeHour : 24 - wakeHour + bedHour;
  
  if (frequency === 1) {
    times.push(`${String(wakeHour + 1).padStart(2, '0')}:00`);
  } else if (frequency === 2) {
    times.push(
      `${String(wakeHour + 1).padStart(2, '0')}:00`,
      `${String(wakeHour + Math.floor(activeHours / 2)).padStart(2, '0')}:00`
    );
  } else if (frequency === 3) {
    times.push(
      `${String(wakeHour + 1).padStart(2, '0')}:00`,
      `${String(wakeHour + Math.floor(activeHours / 3)).padStart(2, '0')}:00`,
      `${String(wakeHour + Math.floor(activeHours * 2 / 3)).padStart(2, '0')}:00`
    );
  } else {
    const interval = Math.floor(activeHours / frequency);
    for (let i = 0; i < frequency; i++) {
      times.push(`${String((wakeHour + 1 + i * interval) % 24).padStart(2, '0')}:00`);
    }
  }

  return times;
}
