import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// 상호작용 타입 한글 변환
const interactionTypeLabels: Record<string, string> = {
  EFFECT_INCREASE: '효과 증가',
  EFFECT_DECREASE: '효과 감소',
  SIDE_EFFECT_INCREASE: '부작용 증가',
  ABSORPTION_CHANGE: '흡수율 변화',
};

// 심각도 레벨 한글 변환
const severityLabels: Record<string, string> = {
  MILD: '참고',
  MODERATE: '주의',
  SEVERE: '경고',
};

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
    const { dosage, frequency, startDate, endDate, notes } = body;

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

    // 기존 약물 목록 조회 (상호작용 체크용)
    const existingUserMedicines = await prisma.userMedicine.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      include: {
        medicine: true,
      },
    });

    const existingMedicineIds = existingUserMedicines.map(um => um.medicineId);

    // 상호작용 체크
    const interactions = await prisma.drugInteraction.findMany({
      where: {
        OR: [
          {
            medicineAId: id,
            medicineBId: { in: existingMedicineIds },
          },
          {
            medicineAId: { in: existingMedicineIds },
            medicineBId: id,
          },
        ],
      },
      include: {
        medicineA: {
          select: { id: true, name: true, genericName: true },
        },
        medicineB: {
          select: { id: true, name: true, genericName: true },
        },
      },
    });

    // 상호작용 정보 포맷팅
    const interactionWarnings = interactions.map(interaction => {
      const otherMedicine = interaction.medicineAId === id 
        ? interaction.medicineB 
        : interaction.medicineA;
      
      return {
        otherMedicine,
        severityLevel: interaction.severityLevel,
        severityLabel: severityLabels[interaction.severityLevel] || interaction.severityLevel,
        interactionType: interaction.interactionType,
        interactionTypeLabel: interactionTypeLabels[interaction.interactionType] || interaction.interactionType,
        description: interaction.description,
        recommendation: interaction.recommendation,
      };
    });

    // 성분 중복 체크
    const duplicateIngredients: Array<{
      ingredient: string;
      existingMedicine: { id: string; name: string };
    }> = [];

    if (medicine.ingredients) {
      const newIngredients = medicine.ingredients.split(',').map(i => i.trim().toLowerCase());
      
      existingUserMedicines.forEach(um => {
        if (um.medicine.ingredients) {
          const existingIngredients = um.medicine.ingredients.split(',').map(i => i.trim().toLowerCase());
          const common = newIngredients.filter(i => existingIngredients.includes(i));
          
          common.forEach(ingredient => {
            duplicateIngredients.push({
              ingredient,
              existingMedicine: {
                id: um.medicine.id,
                name: um.medicine.name,
              },
            });
          });
        }
      });
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
        endDate: endDate ? new Date(endDate) : null,
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
      interactionWarnings,
      duplicateIngredients,
      hasWarnings: interactionWarnings.length > 0 || duplicateIngredients.length > 0,
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
