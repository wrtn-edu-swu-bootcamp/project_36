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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    // 해당 약물의 모든 상호작용 정보 조회
    const interactions = await prisma.drugInteraction.findMany({
      where: {
        OR: [
          { medicineAId: id },
          { medicineBId: id },
        ],
      },
      include: {
        medicineA: {
          select: { id: true, name: true, genericName: true, className: true },
        },
        medicineB: {
          select: { id: true, name: true, genericName: true, className: true },
        },
      },
    });

    // 상호작용 약물 목록 포맷팅 (현재 약물이 아닌 상대 약물 정보)
    const formattedInteractions = interactions.map(interaction => {
      const otherMedicine = interaction.medicineAId === id 
        ? interaction.medicineB 
        : interaction.medicineA;
      
      return {
        id: interaction.id,
        otherMedicine,
        severityLevel: interaction.severityLevel,
        severityLabel: severityLabels[interaction.severityLevel] || interaction.severityLevel,
        interactionType: interaction.interactionType,
        interactionTypeLabel: interactionTypeLabels[interaction.interactionType] || interaction.interactionType,
        description: interaction.description,
        recommendation: interaction.recommendation,
      };
    });

    // 로그인한 사용자의 경우, 현재 복용 중인 약물 중 상호작용이 있는지 체크
    let userMedicineInteractions: typeof formattedInteractions = [];
    
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (user) {
        const userMedicines = await prisma.userMedicine.findMany({
          where: {
            userId: user.id,
            isActive: true,
          },
          select: {
            medicineId: true,
          },
        });

        const userMedicineIds = userMedicines.map(um => um.medicineId);
        
        userMedicineInteractions = formattedInteractions.filter(
          interaction => userMedicineIds.includes(interaction.otherMedicine.id)
        );
      }
    }

    // 심각도별 정렬 (SEVERE > MODERATE > MILD)
    const severityOrder = { SEVERE: 0, MODERATE: 1, MILD: 2 };
    formattedInteractions.sort((a, b) => 
      (severityOrder[a.severityLevel as keyof typeof severityOrder] || 3) - 
      (severityOrder[b.severityLevel as keyof typeof severityOrder] || 3)
    );

    return NextResponse.json({
      success: true,
      data: {
        // 이 약물의 모든 상호작용 정보
        allInteractions: formattedInteractions,
        // 사용자가 현재 복용 중인 약물 중 상호작용이 있는 약물
        userMedicineInteractions,
        summary: {
          totalInteractions: formattedInteractions.length,
          severeCount: formattedInteractions.filter(i => i.severityLevel === 'SEVERE').length,
          moderateCount: formattedInteractions.filter(i => i.severityLevel === 'MODERATE').length,
          mildCount: formattedInteractions.filter(i => i.severityLevel === 'MILD').length,
          hasUserMedicineConflict: userMedicineInteractions.length > 0,
        },
      },
    });
  } catch (error) {
    console.error('Get medicine interactions error:', error);
    return NextResponse.json(
      { error: '상호작용 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
