# Vercel 배포 설정 가이드

## 1. Vercel Postgres 생성

1. [Vercel 대시보드](https://vercel.com/dashboard) 접속
2. 프로젝트 선택 → **Storage** 탭
3. **Create Database** → **Postgres** 선택
4. 데이터베이스 이름 입력 후 생성

## 2. 환경 변수 설정

Vercel Postgres를 생성하면 다음 환경 변수가 자동으로 생성됩니다:
- `POSTGRES_PRISMA_URL` - Prisma용 연결 문자열 (pooling)
- `POSTGRES_URL` - 일반 연결 문자열
- `POSTGRES_URL_NON_POOLING` - 직접 연결용

### 필수 환경 변수 추가

**Settings** → **Environment Variables**에서 다음을 추가/수정:

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `DATABASE_URL` | `$POSTGRES_PRISMA_URL` | Prisma가 사용할 연결 문자열 |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | 실제 배포 도메인으로 변경 |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` 실행 결과 | 인증용 시크릿 키 |

### 환경 변수 설정 방법

1. Vercel 대시보드 → 프로젝트 → **Settings** → **Environment Variables**
2. **Add New** 클릭
3. `DATABASE_URL` 추가:
   - **Key**: `DATABASE_URL`
   - **Value**: `$POSTGRES_PRISMA_URL` (다른 변수 참조)
   - 또는 직접 `POSTGRES_PRISMA_URL`의 값을 복사해서 붙여넣기
4. `NEXTAUTH_URL` 추가 (Production, Preview, Development 모두)
5. `NEXTAUTH_SECRET` 추가 (Production, Preview, Development 모두)

## 3. 데이터베이스 스키마 적용

### 방법 1: Vercel CLI 사용 (권장)

```bash
# Vercel CLI 설치 (없는 경우)
npm i -g vercel

# Vercel 로그인
vercel login

# 프로젝트 연결
vercel link

# 환경 변수 가져오기
vercel env pull .env.local

# Prisma 클라이언트 생성
npx prisma generate

# 스키마 적용
npx prisma db push

# 시드 데이터 추가 (선택사항)
npm run db:seed
```

### 방법 2: Vercel 대시보드에서 직접

1. Vercel 대시보드 → 프로젝트 → **Storage** → Postgres 선택
2. **.env.local** 탭에서 연결 문자열 복사
3. 로컬에서 `.env.local` 파일 생성 후 붙여넣기
4. 위의 명령어 실행

## 4. 재배포

환경 변수를 설정한 후:

```bash
git add .
git commit -m "fix: configure PostgreSQL for Vercel"
git push
```

또는 Vercel 대시보드에서 **Deployments** → **Redeploy** 클릭

## 5. 문제 해결

### 빌드 에러: "Prisma Client not generated"

**해결책**: `vercel.json`이 올바르게 설정되어 있는지 확인

### 연결 에러: "Can't reach database server"

**해결책**: 
1. `DATABASE_URL`이 `$POSTGRES_PRISMA_URL`로 설정되어 있는지 확인
2. 또는 `POSTGRES_PRISMA_URL`의 실제 값을 복사해서 `DATABASE_URL`에 설정

### 인증 에러: "NEXTAUTH_SECRET is missing"

**해결책**: 
- 터미널에서 `openssl rand -base64 32` 실행
- 결과를 `NEXTAUTH_SECRET` 환경 변수로 추가

## 6. 확인

배포가 완료되면:
1. 배포된 사이트 접속
2. "시작하기" 버튼 클릭 → 로그인 페이지로 이동하는지 확인
3. 회원가입/로그인 테스트
