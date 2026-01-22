import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    // 사용자 세션 확인 (선택사항)
    const session = await getServerSession(authOptions);
    let lifePattern = null;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { lifePattern: true },
      });
      lifePattern = user?.lifePattern;
    }

    // 추천 시간 계산 (1일 1회 기준)
    const recommendedTimes = generateRecommendation(medicine, lifePattern);

    return NextResponse.json({
      success: true,
      data: {
        medicine,
        recommendation: recommendedTimes,
      },
    });
  } catch (error) {
    console.error('Get recommendation error:', error);
    return NextResponse.json(
      { error: '추천 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

function generateRecommendation(medicine: any, lifePattern: any) {
  const defaultWakeTime = '07:00';
  const defaultBedTime = '23:00';
  
  const wakeTime = lifePattern?.wakeUpTime || defaultWakeTime;
  const bedTime = lifePattern?.bedTime || defaultBedTime;
  const wakeHour = parseInt(wakeTime.split(':')[0]);
  const bedHour = parseInt(bedTime.split(':')[0]);

  let recommendedTime = '';
  let timeSlot = '';
  let mealPeriod = ''; // 아침/점심/저녁
  let reason = '';
  let chronopharmacology = '';
  let precautions: string[] = [];

  // 졸음 유발 약물
  if (medicine.sleepInducing === 'HIGH') {
    recommendedTime = `${String(bedHour - 1).padStart(2, '0')}:00`;
    timeSlot = '취침 전';
    mealPeriod = '저녁';
    reason = '이 약은 강한 졸음을 유발할 수 있어 취침 전 복용이 권장됩니다.';
    chronopharmacology = '멜라토닌 분비가 증가하는 저녁 시간대에 복용하면 자연스러운 수면 유도 효과를 기대할 수 있습니다.';
    precautions.push('운전이나 기계 조작 전 복용 금지');
    precautions.push('업무 시간에는 복용하지 마세요');
  } else if (medicine.sleepInducing === 'MEDIUM') {
    recommendedTime = `${String(bedHour - 2).padStart(2, '0')}:00`;
    timeSlot = '저녁 시간';
    mealPeriod = '저녁';
    reason = '약한 졸음을 유발할 수 있어 저녁 시간 복용이 고려됩니다.';
    chronopharmacology = '활동이 줄어드는 저녁 시간대에 복용하여 일상생활 지장을 최소화할 수 있습니다.';
    precautions.push('복용 후 운전 주의');
    precautions.push('집중력이 필요한 업무 전 피하세요');
  }
  
  // 각성 효과 약물
  else if (medicine.alertnessEffect === 'HIGH') {
    recommendedTime = `${String(wakeHour).padStart(2, '0')}:30`;
    timeSlot = '아침';
    mealPeriod = '아침';
    reason = '각성 효과가 있어 아침 시간 복용이 권장됩니다.';
    chronopharmacology = '코티솔 분비가 최고조에 달하는 아침 시간에 복용하면 약효와 생체리듬이 조화를 이룹니다.';
    precautions.push('저녁 복용 시 불면 가능');
    precautions.push('오후 3시 이후 복용 피하세요');
  } else if (medicine.alertnessEffect === 'MEDIUM') {
    recommendedTime = `${String(wakeHour + 1).padStart(2, '0')}:00`;
    timeSlot = '오전';
    mealPeriod = '아침';
    reason = '약한 각성 효과가 있어 오전 시간 복용이 고려됩니다.';
    chronopharmacology = '오전 시간대에 복용하여 하루 활동에 도움을 줄 수 있습니다.';
    precautions.push('늦은 오후 복용 시 수면 방해 가능');
  }
  
  // 위장 자극 약물
  else if (medicine.stomachIrritation) {
    if (medicine.mealTiming === 'AFTER_MEAL') {
      const breakfastTime = lifePattern?.breakfastTime || '08:00';
      const hour = parseInt(breakfastTime.split(':')[0]);
      recommendedTime = `${String(hour).padStart(2, '0')}:30`;
      timeSlot = '아침 식후';
      mealPeriod = '아침';
      reason = '위장 자극이 있어 아침 식후 복용이 권장됩니다.';
      chronopharmacology = '식사 후 위산 분비가 활발한 시기에 복용하면 위장 보호 효과가 있습니다.';
      precautions.push('공복 복용 금지');
      precautions.push('충분한 물과 함께 복용');
    }
  }
  
  // 식사 시간 관련 약물
  else if (medicine.mealTiming === 'BEFORE_MEAL') {
    const breakfastTime = lifePattern?.breakfastTime || '08:00';
    const hour = parseInt(breakfastTime.split(':')[0]);
    recommendedTime = `${String(hour - 1).padStart(2, '0')}:30`;
    timeSlot = '아침 식전';
    mealPeriod = '아침';
    reason = '식전 복용 시 흡수율이 높아 아침 식사 30분 전 공복에 복용하는 것이 권장됩니다.';
    chronopharmacology = '공복 시 위장 운동이 활발하여 약물 흡수가 빠르게 일어납니다.';
    precautions.push('식사 30분 전 복용');
    precautions.push('물과 함께 복용');
  } else if (medicine.mealTiming === 'AFTER_MEAL') {
    const breakfastTime = lifePattern?.breakfastTime || '08:00';
    const hour = parseInt(breakfastTime.split(':')[0]);
    recommendedTime = `${String(hour).padStart(2, '0')}:30`;
    timeSlot = '아침 식후';
    mealPeriod = '아침';
    reason = '식후 복용 시 흡수가 좋거나 위장 자극을 줄일 수 있습니다.';
    chronopharmacology = '식사와 함께 복용하면 약물의 생체이용률이 향상됩니다.';
    precautions.push('식사 직후 또는 30분 이내 복용');
  } else if (medicine.mealTiming === 'WITH_MEAL') {
    const breakfastTime = lifePattern?.breakfastTime || '08:00';
    recommendedTime = breakfastTime;
    timeSlot = '아침 식사 중';
    mealPeriod = '아침';
    reason = '식사와 함께 복용 시 효과가 가장 좋습니다.';
    chronopharmacology = '음식과 함께 복용하여 약물 작용을 최적화할 수 있습니다.';
    precautions.push('식사 중 또는 식사 직후 복용');
  }
  
  // 기본 (특별한 제약 없음)
  else {
    recommendedTime = `${String(wakeHour + 1).padStart(2, '0')}:00`;
    timeSlot = '아침';
    mealPeriod = '아침';
    reason = '특별한 제약이 없어 일정한 시간에 복용하면 됩니다.';
    chronopharmacology = '규칙적인 복용을 위해 아침 시간을 권장합니다.';
    precautions.push('매일 같은 시간에 복용하세요');
  }

  // 생활 패턴 기반 추가 조언
  let lifestyleAdvice = '';
  if (lifePattern) {
    if (lifePattern.hasDriving && medicine.sleepInducing !== 'NONE') {
      lifestyleAdvice = '운전을 자주 하시므로 운전 전 복용은 피해주세요.';
    }
    if (lifePattern.hasFocusWork && medicine.sleepInducing !== 'NONE') {
      lifestyleAdvice += ' 집중력이 필요한 업무 전에는 복용하지 마세요.';
    }
  }

  return {
    recommendedTime,
    timeSlot,
    mealPeriod, // 아침/점심/저녁
    reason,
    chronopharmacology,
    precautions,
    lifestyleAdvice: lifestyleAdvice || '개인의 생활 패턴에 따라 복용 시간을 조정할 수 있습니다.',
    characteristics: {
      sleepInducing: medicine.sleepInducing,
      alertnessEffect: medicine.alertnessEffect,
      stomachIrritation: medicine.stomachIrritation,
      mealTiming: medicine.mealTiming,
    },
  };
}
