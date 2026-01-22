import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // 약물 정보 조회
    const medicine = await prisma.medicine.findUnique({
      where: { id: params.id },
    });

    if (!medicine) {
      return NextResponse.json(
        { error: '약물을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 사용자 생활 패턴 조회 (로그인한 경우)
    let lifePattern = null;
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          lifePattern: true,
        },
      });
      lifePattern = user?.lifePattern;
    }

    // 복용 시간 추천 생성
    const recommendation = generateDetailedRecommendation(medicine, lifePattern);

    return NextResponse.json({
      success: true,
      data: {
        medicine,
        recommendation,
      },
    });
  } catch (error) {
    console.error('Get medicine detail error:', error);
    return NextResponse.json(
      { error: '약물 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 상세한 복용 시간 추천 생성
function generateDetailedRecommendation(medicine: any, lifePattern: any) {
  const recommendation: any = {
    recommendedTimes: [],
    reason: '',
    medicineCharacteristics: [],
    chronopharmacology: '',
    lifePatternConsideration: '',
    specialWarnings: [],
  };

  // 기본 시간 설정
  const wakeTime = lifePattern?.wakeUpTime || '07:00';
  const bedTime = lifePattern?.bedTime || '23:00';
  const wakeHour = parseInt(wakeTime.split(':')[0]);
  const bedHour = parseInt(bedTime.split(':')[0]);

  // 1. 약물 특성 분석
  const characteristics = [];
  
  if (medicine.sleepInducing === 'HIGH') {
    characteristics.push('강한 수면 유도 성분 함유 - 졸음을 유발할 수 있습니다');
    recommendation.chronopharmacology = '멜라토닌은 야간에 분비되어 수면을 유도합니다. 이 약의 수면 유도 성분은 멜라토닌 분비 시간대와 맞물려 더 효과적으로 작용할 수 있습니다.';
    recommendation.recommendedTimes.push(`${String(bedHour - 1).padStart(2, '0')}:00`);
    recommendation.reason = '이 약은 수면 유도 성분을 포함하고 있어 졸음을 유발할 수 있습니다. 일반적으로 취침 전 복용을 고려하는 경우가 많습니다.';
    
    if (lifePattern?.hasDriving) {
      recommendation.specialWarnings.push('운전을 자주 하시는 분은 복용 후 최소 8시간 이상 운전을 피하시는 것이 좋습니다.');
    }
    if (lifePattern?.hasFocusWork) {
      recommendation.specialWarnings.push('집중력이 필요한 업무 전에는 복용을 피하시는 것이 권장됩니다.');
    }
  } else if (medicine.sleepInducing === 'MEDIUM') {
    characteristics.push('중등도 수면 유도 효과 - 졸음이 올 수 있습니다');
    recommendation.chronopharmacology = '이 약은 중추신경계에 작용하여 각성도를 낮출 수 있습니다. 활동 시간대에는 집중력이 저하될 수 있으므로 취침 전 복용이 일반적으로 고려됩니다.';
    recommendation.recommendedTimes.push(`${String(bedHour - 1).padStart(2, '0')}:00`);
    recommendation.reason = '중등도의 졸음을 유발할 수 있어, 일반적으로 저녁 시간대 또는 취침 전 복용을 고려하는 경우가 많습니다.';
    
    if (lifePattern?.hasDriving || lifePattern?.hasFocusWork) {
      recommendation.specialWarnings.push('낮 시간 복용 시 졸음이나 집중력 저하가 있을 수 있으니 주의하세요.');
    }
  }

  if (medicine.alertnessEffect === 'HIGH') {
    characteristics.push('강한 각성 효과 - 수면을 방해할 수 있습니다');
    recommendation.chronopharmacology = '코티솔 호르몬은 아침에 분비가 최고조에 달합니다. 이 약의 각성 효과는 자연스러운 코티솔 리듬과 함께 작용하여 낮 시간 활동을 돕지만, 저녁 복용 시 멜라토닌 분비를 방해하여 불면을 유발할 수 있습니다.';
    recommendation.recommendedTimes.push(`${String(wakeHour).padStart(2, '0')}:30`);
    recommendation.reason = '이 약은 각성 효과가 있어 수면을 방해할 수 있습니다. 일반적으로 아침 시간대 복용이 고려됩니다.';
    recommendation.specialWarnings.push('저녁 복용 시 불면증이 발생할 수 있으니 저녁 복용은 피하시는 것이 좋습니다.');
  } else if (medicine.alertnessEffect === 'MEDIUM') {
    characteristics.push('중등도 각성 효과 - 저녁 복용 시 주의');
    recommendation.chronopharmacology = '이 약은 중추신경계를 자극할 수 있습니다. 저녁에 복용하면 자연스러운 멜라토닌 분비와 수면 리듬을 방해할 수 있어 낮 시간대 복용이 일반적으로 권장됩니다.';
    recommendation.recommendedTimes.push(`${String(wakeHour + 1).padStart(2, '0')}:00`);
    recommendation.reason = '각성 효과가 있어 저녁 복용 시 수면에 영향을 줄 수 있습니다. 일반적으로 오전 또는 낮 시간대 복용을 고려합니다.';
  }

  if (medicine.stomachIrritation) {
    characteristics.push('위장 자극 가능 - 식후 복용 권장');
    if (!recommendation.chronopharmacology) {
      recommendation.chronopharmacology = '위산 분비는 식사 시간과 밀접한 관련이 있습니다. 식후에는 위 점막이 음식으로 보호되어 있어 약물로 인한 자극을 완화할 수 있습니다.';
    }
    recommendation.specialWarnings.push('공복 복용 시 속쓰림이나 위장 불편감이 있을 수 있으니 식후 복용하세요.');
  }

  recommendation.medicineCharacteristics = characteristics;

  // 2. 식사 시간 관련 추천
  if (medicine.mealTiming === 'BEFORE_MEAL') {
    const breakfastTime = lifePattern?.breakfastTime || '08:00';
    const lunchTime = lifePattern?.lunchTime || '12:30';
    const dinnerTime = lifePattern?.dinnerTime || '19:00';
    
    const breakfastHour = parseInt(breakfastTime.split(':')[0]);
    const lunchHour = parseInt(lunchTime.split(':')[0]);
    const dinnerHour = parseInt(dinnerTime.split(':')[0]);

    recommendation.recommendedTimes = [
      `${String(breakfastHour).padStart(2, '0')}:00`,
      `${String(lunchHour).padStart(2, '0')}:00`,
      `${String(dinnerHour).padStart(2, '0')}:00`,
    ];
    recommendation.reason = '이 약은 공복에 복용하는 것이 권장됩니다. 식사 30분 전 복용을 고려할 수 있습니다.';
    
    if (!recommendation.chronopharmacology) {
      recommendation.chronopharmacology = '공복 시 위가 비어있어 약물 흡수가 빠르고 효과적으로 일어날 수 있습니다. 특히 일부 약물은 음식과 함께 복용하면 흡수율이 감소할 수 있습니다.';
    }
  } else if (medicine.mealTiming === 'AFTER_MEAL') {
    const breakfastTime = lifePattern?.breakfastTime || '08:00';
    const lunchTime = lifePattern?.lunchTime || '12:30';
    const dinnerTime = lifePattern?.dinnerTime || '19:00';
    
    const breakfastHour = parseInt(breakfastTime.split(':')[0]);
    const lunchHour = parseInt(lunchTime.split(':')[0]);
    const dinnerHour = parseInt(dinnerTime.split(':')[0]);

    recommendation.recommendedTimes = [
      `${String(breakfastHour).padStart(2, '0')}:30`,
      `${String(lunchHour).padStart(2, '0')}:30`,
      `${String(dinnerHour).padStart(2, '0')}:30`,
    ];
    recommendation.reason = '이 약은 위장 보호를 위해 식후 복용이 권장됩니다.';
    
    if (!recommendation.chronopharmacology) {
      recommendation.chronopharmacology = '식후에는 위에 음식이 있어 약물로 인한 위 점막 자극을 완화할 수 있습니다. 또한 일부 약물은 음식과 함께 복용 시 흡수가 개선될 수 있습니다.';
    }
  } else if (medicine.mealTiming === 'WITH_MEAL') {
    const breakfastTime = lifePattern?.breakfastTime || '08:00';
    recommendation.recommendedTimes = [breakfastTime];
    recommendation.reason = '이 약은 식사 중 또는 식사 직후 복용이 권장됩니다.';
    
    if (!recommendation.chronopharmacology) {
      recommendation.chronopharmacology = '음식과 함께 복용하면 약물의 흡수가 안정적이며, 저혈당과 같은 부작용을 예방할 수 있습니다.';
    }
  }

  // 3. 생활 패턴 고려사항 추가
  if (lifePattern) {
    const workStartTime = lifePattern.workStartTime;
    const workEndTime = lifePattern.workEndTime;
    
    let considerations = [];
    
    considerations.push(`기상 시간: ${lifePattern.wakeUpTime}, 취침 시간: ${lifePattern.bedTime}`);
    
    if (medicine.sleepInducing !== 'NONE' && workStartTime) {
      considerations.push(`업무 시작 전(${workStartTime})에는 복용을 피하시는 것이 좋습니다.`);
    }
    
    if (medicine.alertnessEffect !== 'NONE') {
      considerations.push(`취침 시간(${lifePattern.bedTime}) 최소 6시간 전에 복용하시는 것이 권장됩니다.`);
    }
    
    if (lifePattern.breakfastTime && medicine.mealTiming !== 'ANYTIME') {
      considerations.push(`식사 시간(아침: ${lifePattern.breakfastTime})에 맞춰 복용하시면 됩니다.`);
    }

    recommendation.lifePatternConsideration = considerations.join(' ');
  } else {
    recommendation.lifePatternConsideration = '마이페이지에서 생활 패턴을 설정하시면 더욱 정확한 복용 시간을 추천받으실 수 있습니다.';
  }

  // 4. 기본 추천이 없는 경우 (ANYTIME 약물)
  if (recommendation.recommendedTimes.length === 0) {
    recommendation.recommendedTimes = [`${String(wakeHour + 1).padStart(2, '0')}:00`];
    
    if (!recommendation.reason) {
      recommendation.reason = '이 약은 복용 시간이 비교적 자유로운 편입니다. 일정한 시간에 규칙적으로 복용하시는 것이 좋습니다.';
    }
    
    if (!recommendation.chronopharmacology) {
      recommendation.chronopharmacology = '규칙적인 복용이 약물의 혈중 농도를 일정하게 유지하여 효과를 극대화할 수 있습니다.';
    }
  }

  // 5. 특수 약물 추가 경고
  if (medicine.className?.includes('항생제')) {
    recommendation.specialWarnings.push('항생제는 처방된 기간 동안 규칙적으로 복용해야 합니다. 증상이 나아져도 임의로 중단하지 마세요.');
  }

  if (medicine.className?.includes('당뇨')) {
    recommendation.specialWarnings.push('저혈당 증상(식은땀, 떨림, 어지러움)이 나타나면 즉시 당분을 섭취하고 의사와 상담하세요.');
  }

  if (medicine.className?.includes('고혈압')) {
    recommendation.specialWarnings.push('어지러움이 심하거나 혈압이 너무 낮아지면 의사와 상담하여 복용 시간 조정이 필요할 수 있습니다.');
  }

  if (medicine.className?.includes('수면제')) {
    recommendation.specialWarnings.push('수면제는 의존성이 생길 수 있으므로 의사의 지시에 따라 복용하세요.');
    recommendation.specialWarnings.push('복용 후 최소 7-8시간의 수면 시간을 확보하세요.');
  }

  return recommendation;
}
