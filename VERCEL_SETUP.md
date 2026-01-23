# Vercel 환경 변수 설정 가이드

## 🚀 자동 생성된 환경 변수 값

아래 값들을 복사해서 Vercel에 붙여넣으세요:

### 1. NEXTAUTH_SECRET
```
vFLab7QoUOyVD34cqQ6nmsRHG6jZU9dTPXSJhMhH+60=
```
- **환경**: Production, Preview, Development 모두 체크 ✅

### 2. NEXTAUTH_URL
```
https://project-36-7m7s-ic3lm0eoh-sooins-projects-4b973337.vercel.app
```
- **환경**: Production만 체크 ✅

### 3. DATABASE_URL
- **Vercel 대시보드 → Storage 탭**에서 확인
- Postgres 데이터베이스 클릭
- **Connect** 버튼 → `.env.local` 탭
- `POSTGRES_PRISMA_URL` 값을 복사
- **환경**: Production, Preview, Development 모두 체크 ✅

---

## 📋 단계별 설정 방법

### Step 1: Vercel 대시보드 접속
1. 브라우저에서 https://vercel.com/dashboard 열기
2. 프로젝트 선택 (project_36)

### Step 2: 환경 변수 메뉴로 이동
1. **Settings** 탭 클릭
2. 왼쪽 메뉴에서 **Environment Variables** 클릭

### Step 3: 환경 변수 추가

#### NEXTAUTH_SECRET 추가
1. **Add New** 버튼 클릭
2. **Name**: `NEXTAUTH_SECRET`
3. **Value**: `vFLab7QoUOyVD34cqQ6nmsRHG6jZU9dTPXSJhMhH+60=`
4. **Environments**: Production ✅ Preview ✅ Development ✅
5. **Save** 클릭

#### NEXTAUTH_URL 추가
1. **Add New** 버튼 클릭
2. **Name**: `NEXTAUTH_URL`
3. **Value**: `https://project-36-7m7s-ic3lm0eoh-sooins-projects-4b973337.vercel.app`
4. **Environments**: Production ✅
5. **Save** 클릭

#### DATABASE_URL 추가
1. 상단 메뉴에서 **Storage** 탭 클릭
2. Postgres 데이터베이스 선택
3. **Connect** 버튼 클릭
4. `.env.local` 탭 선택
5. `POSTGRES_PRISMA_URL` 값 복사
6. 다시 **Settings** → **Environment Variables**로 이동
7. **Add New** 버튼 클릭
8. **Name**: `DATABASE_URL`
9. **Value**: [복사한 Postgres URL]
10. **Environments**: Production ✅ Preview ✅ Development ✅
11. **Save** 클릭

### Step 4: Redeploy
1. **Deployments** 탭으로 이동
2. 최신 배포의 **...** (점 3개) 클릭
3. **Redeploy** 선택
4. **Redeploy** 버튼 클릭

### Step 5: 확인
배포 완료 후 (1-2분) 다음 URL로 환경 변수 확인:
```
https://project-36-7m7s-ic3lm0eoh-sooins-projects-4b973337.vercel.app/api/health
```

모든 환경 변수가 ✅로 표시되어야 합니다.

---

## 🎯 빠른 체크리스트

- [ ] NEXTAUTH_SECRET 추가 (모든 환경)
- [ ] NEXTAUTH_URL 추가 (Production만)
- [ ] DATABASE_URL 추가 (모든 환경)
- [ ] Redeploy 실행
- [ ] /api/health에서 확인
- [ ] 로그인 테스트

---

## 🆘 문제 해결

### "Server error" 계속 발생
→ Vercel 대시보드 → Deployments → 최근 배포 → Runtime Logs 확인

### DATABASE_URL 찾을 수 없음
→ Storage 탭에서 Postgres 데이터베이스 생성 필요

### 환경 변수 추가했는데 적용 안 됨
→ 반드시 Redeploy 해야 적용됩니다!
