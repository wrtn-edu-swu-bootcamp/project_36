import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// CSV 파싱 함수
function parseCSV(content: string): any[] {
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  const results: any[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    
    results.push(row);
  }
  
  return results;
}

// 약물 특성 분석 함수
function analyzeMedicineCharacteristics(row: any) {
  const name = row['품목명'] || row['제품명'] || '';
  const genericName = row['주성분'] || row['성분명'] || '';
  const effect = row['효능효과'] || row['효능'] || '';
  const usage = row['용법용량'] || row['용법'] || '';
  const precautions = row['주의사항'] || row['사용상주의사항'] || '';
  const sideEffects = row['부작용'] || '';

  // 텍스트 분석으로 특성 추출
  const lowerText = (name + genericName + effect + precautions + sideEffects).toLowerCase();

  // 졸음 유발 성분 체크
  let sleepInducing = 'NONE';
  const sleepKeywords = ['졸음', '수면', '클로르페니라민', '디펜히드라민', '졸피뎀', '멜라토닌', '진정'];
  const highSleepKeywords = ['수면제', '졸피뎀', '스틸녹스', '렘수면'];
  
  if (highSleepKeywords.some(k => lowerText.includes(k))) {
    sleepInducing = 'HIGH';
  } else if (sleepKeywords.some(k => lowerText.includes(k))) {
    sleepInducing = lowerText.includes('항히스타민') || lowerText.includes('클로르') ? 'HIGH' : 'MEDIUM';
  }

  // 각성 효과 체크
  let alertnessEffect = 'NONE';
  const alertKeywords = ['카페인', '불면', '각성', '티록신', '갑상선호르몬', '에페드린', '슈도에페드린'];
  const highAlertKeywords = ['갑상선호르몬', '신지로이드', '레보티록신'];
  
  if (highAlertKeywords.some(k => lowerText.includes(k))) {
    alertnessEffect = 'HIGH';
  } else if (alertKeywords.some(k => lowerText.includes(k))) {
    alertnessEffect = 'MEDIUM';
  }

  // 위장 자극 체크
  const stomachIrritation = 
    lowerText.includes('위장') ||
    lowerText.includes('소염') ||
    lowerText.includes('이부프로펜') ||
    lowerText.includes('아스피린') ||
    lowerText.includes('nsaid') ||
    lowerText.includes('식후');

  // 식사 시간 관계
  let mealTiming = 'ANYTIME';
  if (lowerText.includes('식전') || lowerText.includes('공복')) {
    mealTiming = 'BEFORE_MEAL';
  } else if (lowerText.includes('식후') || stomachIrritation) {
    mealTiming = 'AFTER_MEAL';
  } else if (lowerText.includes('식사 중') || lowerText.includes('식사와 함께')) {
    mealTiming = 'WITH_MEAL';
  }

  return {
    name,
    genericName,
    company: row['업체명'] || row['제조사'] || '',
    className: row['분류명'] || row['약효분류'] || '',
    effect: effect.substring(0, 500), // 최대 500자
    usage: usage.substring(0, 500),
    sideEffects: sideEffects.substring(0, 500),
    precautions: precautions.substring(0, 500),
    sleepInducing,
    alertnessEffect,
    stomachIrritation,
    mealTiming,
  };
}

async function importFromCSV(csvFilePath: string) {
  try {
    console.log('📂 CSV 파일 읽기 중...');
    
    const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
    const rows = parseCSV(csvContent);
    
    console.log(`✅ ${rows.length}개 행 파싱 완료`);
    console.log('🔍 약물 특성 분석 및 저장 중...');

    let successCount = 0;
    let skipCount = 0;

    for (const row of rows) {
      try {
        const medicineData = analyzeMedicineCharacteristics(row);
        
        // 약물명이 없으면 스킵
        if (!medicineData.name) {
          skipCount++;
          continue;
        }

        // 중복 체크 (이름으로)
        const existing = await prisma.medicine.findFirst({
          where: { name: medicineData.name },
        });

        if (existing) {
          skipCount++;
          continue;
        }

        await prisma.medicine.create({
          data: medicineData,
        });

        successCount++;
        
        if (successCount % 50 === 0) {
          console.log(`  진행 중... ${successCount}개 저장됨`);
        }
      } catch (error) {
        console.error(`  ⚠️ 행 스킵 (오류):`, error);
        skipCount++;
      }
    }

    console.log(`\n✅ 완료!`);
    console.log(`  - 성공: ${successCount}개`);
    console.log(`  - 스킵: ${skipCount}개`);
    console.log(`  - 전체: ${rows.length}개`);
  } catch (error) {
    console.error('❌ CSV 처리 중 오류:', error);
    throw error;
  }
}

// 명령줄 인자로 CSV 파일 경로 받기
const csvFilePath = process.argv[2];

if (!csvFilePath) {
  console.error('사용법: tsx scripts/import-medicines-from-csv.ts <CSV파일경로>');
  console.error('예: tsx scripts/import-medicines-from-csv.ts data/medicines.csv');
  process.exit(1);
}

if (!fs.existsSync(csvFilePath)) {
  console.error(`❌ 파일을 찾을 수 없습니다: ${csvFilePath}`);
  process.exit(1);
}

importFromCSV(csvFilePath)
  .then(() => {
    console.log('🎉 데이터 임포트 완료!');
  })
  .catch((error) => {
    console.error('❌ 임포트 실패:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
