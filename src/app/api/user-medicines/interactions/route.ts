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

    // 사용자의 활성 약물 목록 조회
    const userMedicines = await prisma.userMedicine.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      include: {
        medicine: true,
      },
    });

    if (userMedicines.length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          interactions: [],
          duplicateIngredients: [],
          summary: {
            totalMedicines: userMedicines.length,
            interactionCount: 0,
            severeCount: 0,
            moderateCount: 0,
            mildCount: 0,
            hasDuplicateIngredients: false,
          },
        },
      });
    }

    const medicineIds = userMedicines.map(um => um.medicineId);

    // 약물 간 상호작용 조회
    const interactions = await prisma.drugInteraction.findMany({
      where: {
        OR: [
          {
            medicineAId: { in: medicineIds },
            medicineBId: { in: medicineIds },
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
    const formattedInteractions = interactions.map(interaction => ({
      id: interaction.id,
      medicineA: interaction.medicineA,
      medicineB: interaction.medicineB,
      severityLevel: interaction.severityLevel,
      severityLabel: severityLabels[interaction.severityLevel] || interaction.severityLevel,
      interactionType: interaction.interactionType,
      interactionTypeLabel: interactionTypeLabels[interaction.interactionType] || interaction.interactionType,
      description: interaction.description,
      recommendation: interaction.recommendation,
    }));

    // 성분 중복 체크
    const duplicateIngredients: Array<{
      ingredient: string;
      medicines: Array<{ id: string; name: string }>;
    }> = [];

    const ingredientMap = new Map<string, Array<{ id: string; name: string }>>();

    userMedicines.forEach(um => {
      if (um.medicine.ingredients) {
        const ingredients = um.medicine.ingredients.split(',').map(i => i.trim().toLowerCase());
        ingredients.forEach(ingredient => {
          if (!ingredientMap.has(ingredient)) {
            ingredientMap.set(ingredient, []);
          }
          ingredientMap.get(ingredient)!.push({
            id: um.medicine.id,
            name: um.medicine.name,
          });
        });
      }
    });

    // 2개 이상 약물에서 동일 성분이 있는 경우
    ingredientMap.forEach((medicines, ingredient) => {
      if (medicines.length > 1) {
        duplicateIngredients.push({
          ingredient,
          medicines,
        });
      }
    });

    // 요약 정보
    const summary = {
      totalMedicines: userMedicines.length,
      interactionCount: formattedInteractions.length,
      severeCount: formattedInteractions.filter(i => i.severityLevel === 'SEVERE').length,
      moderateCount: formattedInteractions.filter(i => i.severityLevel === 'MODERATE').length,
      mildCount: formattedInteractions.filter(i => i.severityLevel === 'MILD').length,
      hasDuplicateIngredients: duplicateIngredients.length > 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        interactions: formattedInteractions,
        duplicateIngredients,
        summary,
      },
    });
  } catch (error) {
    console.error('Get interactions error:', error);
    return NextResponse.json(
      { error: '상호작용 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
