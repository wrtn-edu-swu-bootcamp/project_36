const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = 'postgresql://postgres.frosty-silence-64784428:tndls2080%21%2F@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres';

async function setupDatabase() {
  console.log('🚀 데이터베이스 설정을 시작합니다...\n');
  
  const pool = new Pool({ connectionString: DATABASE_URL });
  
  try {
    // SQL 파일 읽기
    const sqlFilePath = path.join(__dirname, 'database-setup.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📝 SQL 실행 중...');
    await pool.query(sql);
    
    console.log('\n✅ 데이터베이스 테이블이 성공적으로 생성되었습니다!');
    console.log('\n생성된 테이블:');
    console.log('  - users');
    console.log('  - accounts');
    console.log('  - sessions');
    console.log('  - verification_tokens');
    console.log('  - medicines');
    console.log('  - life_patterns');
    console.log('  - user_medicines');
    console.log('  - medication_schedules');
    console.log('\n🎉 데이터베이스 설정 완료!');
    console.log('이제 회원가입과 로그인을 테스트할 수 있습니다.\n');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
