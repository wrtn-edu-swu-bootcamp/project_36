# 데이터베이스 설정 가이드

## 🎯 목표
Supabase에서 데이터베이스 테이블 생성하기

---

## 📋 단계별 실행

### 1단계: Supabase 대시보드 열기
브라우저에서 https://supabase.com 접속 → 로그인 → `frosty-silence-64784428` 프로젝트 선택

### 2단계: SQL Editor 열기
좌측 사이드바에서 **🔨 SQL Editor** 클릭

### 3단계: SQL 실행하기

#### A. VS Code에서 파일 열기
`database-setup.sql` 파일을 VS Code에서 열기

#### B. 전체 내용 복사
- Windows: `Ctrl + A` → `Ctrl + C`
- Mac: `Cmd + A` → `Cmd + C`

#### C. Supabase에 붙여넣기
1. SQL Editor에서 **"New query"** 버튼 클릭
2. 에디터에 복사한 SQL 붙여넣기 (`Ctrl + V`)
3. 우측 하단 **"RUN"** 버튼 클릭 (또는 `Ctrl + Enter`)

### 4단계: 결과 확인
성공 메시지가 표시되면 완료!

```
Success. No rows returned
```

---

## ✅ 완료 후 확인사항

데이터베이스에 다음 테이블들이 생성됨:
- ✓ users
- ✓ accounts  
- ✓ sessions
- ✓ verification_tokens
- ✓ medicines
- ✓ life_patterns
- ✓ user_medicines
- ✓ medication_schedules

---

## 🎉 다음 단계

테이블 생성 완료 후:
1. 개발 서버 재시작: `npm run dev`
2. 브라우저에서 `http://localhost:3000/register` 접속
3. 회원가입 테스트!

---

## ❓ 문제 발생 시

**"permission denied" 에러:**
→ Supabase 프로젝트 소유자 계정으로 로그인했는지 확인

**SQL 문법 에러:**
→ SQL 전체를 다시 복사해서 붙여넣기 시도

**프로젝트를 찾을 수 없음:**
→ 프로젝트가 완전히 생성되었는지 확인 (1-2분 소요)
