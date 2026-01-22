# MediTime - 약 복용 시간 추천 서비스

생체리듬 기반 과학적 약 복용 시간 추천 헬스케어 서비스

## 🚀 빠른 시작

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 입력하세요:

```env
# Database (Vercel Postgres)
POSTGRES_URL="your-postgres-url"
POSTGRES_PRISMA_URL="your-prisma-url"
POSTGRES_URL_NON_POOLING="your-non-pooling-url"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# External API
MFDS_SERVICE_KEY="your-mfds-api-key"
```

**NEXTAUTH_SECRET 생성 방법:**

```bash
openssl rand -base64 32
```

### 3. 데이터베이스 설정

```bash
# Prisma 클라이언트 생성
npm run db:generate

# 마이그레이션 실행
npm run db:migrate

# 시드 데이터 삽입 (선택사항)
npm run db:seed
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어보세요.

## 📁 프로젝트 구조

```
meditime/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # 인증 페이지 (로그인, 회원가입)
│   │   ├── (main)/            # 메인 애플리케이션 페이지
│   │   ├── api/               # API Routes
│   │   ├── layout.tsx         # 루트 레이아웃
│   │   ├── page.tsx           # 랜딩 페이지
│   │   └── globals.css        # 글로벌 스타일
│   ├── components/            # React 컴포넌트
│   │   ├── ui/               # 재사용 가능한 UI 컴포넌트
│   │   └── layout/           # 레이아웃 컴포넌트
│   ├── lib/                  # 유틸리티 & 설정
│   ├── services/             # 비즈니스 로직
│   ├── store/                # 상태 관리 (Zustand)
│   ├── hooks/                # Custom React Hooks
│   └── types/                # TypeScript 타입 정의
├── prisma/
│   ├── schema.prisma         # 데이터베이스 스키마
│   └── seed.ts              # 시드 데이터
├── public/                   # 정적 파일
└── docs/                     # 프로젝트 문서
```

## 🛠️ 기술 스택

- **Framework**: Next.js 15.1.4 (App Router)
- **UI Library**: React 19.0.0
- **Language**: TypeScript 5.7.3
- **Styling**: Tailwind CSS 4.1.18
- **Database**: Vercel Postgres (Neon)
- **ORM**: Prisma 7.2.0
- **Authentication**: NextAuth.js 4.24.13
- **State Management**: Zustand 5.0.2
- **Form**: React Hook Form 7.x + Zod 3.x
- **HTTP Client**: Axios 1.x
- **Date**: date-fns 3.x

## 📝 개발 가이드

### 주요 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트 검사
npm run lint

# Prisma Studio 실행 (데이터베이스 GUI)
npx prisma studio

# 데이터베이스 마이그레이션
npm run db:migrate

# Prisma 클라이언트 재생성
npm run db:generate
```

### 코딩 규칙

프로젝트의 코딩 규칙은 `.cursorrules` 파일에 정의되어 있습니다. 주요 원칙:

- Server Components 우선 사용
- TypeScript strict 모드
- Interface 사용 (type alias 대신)
- 함수형 & 선언형 프로그래밍
- Early returns & guard clauses
- 의료 정보는 완화된 표현 사용
- 모든 약물 정보에 고지사항 포함

## 🗄️ 데이터베이스 스키마

주요 모델:

- **User**: 사용자 계정
- **Medicine**: 약물 정보
- **LifePattern**: 사용자 생활 패턴
- **UserMedicine**: 사용자가 등록한 약물
- **MedicationSchedule**: 복용 스케줄

자세한 스키마는 `prisma/schema.prisma` 파일을 참조하세요.

## 🎨 디자인 시스템

### 색상 팔레트

- **Primary**: `#7FA99B` (세이지 그린)
- **Success**: `#9CAF88` (올리브 그린)
- **Warning**: `#E8A87C` (복숭아 오렌지)
- **Danger**: `#D48A88` (부드러운 코랄)

### 타이포그래피

- Display: 48px / 40px
- Heading: 32px - 20px
- Body: 16px
- Small: 14px
- Caption: 12px

자세한 디자인 가이드는 `docs/디자인_가이드.md`를 참조하세요.

## 🚢 배포

### Vercel 배포

1. Vercel 계정에 GitHub 연동
2. 프로젝트 Import
3. Environment Variables 설정
4. Deploy 버튼 클릭

### 환경 변수 (Vercel Dashboard)

Production, Preview, Development 환경별로 설정:

- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `MFDS_SERVICE_KEY`

## ⚠️ 중요 공지사항

본 서비스는 참고용 정보를 제공하며, 의학적 조언을 대체하지 않습니다. 복용 시간 변경이나 치료 결정은 반드시 의사 또는 약사와 상담하세요.

## 📚 참고 문서

- [서비스 기획안](docs/서비스_기획안.md)
- [디자인 가이드](docs/디자인_가이드.md)
- [코드 아키텍처](docs/코드_아키텍처.md)
- [와이어프레임](docs/wireframe.md)

## 📄 라이선스

이 프로젝트는 참고용으로 제작되었습니다.

## 🤝 기여

버그 리포트나 기능 제안은 이슈를 통해 제출해주세요.
