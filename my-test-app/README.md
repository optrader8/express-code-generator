# my-test-app

범용 인증 시스템 API - 다양한 프로젝트에서 재사용 가능한 인증 및 사용자 관리 시스템

## 시작하기

### 설치

```bash
npm install
```

### 환경 설정

`.env` 파일을 수정하여 데이터베이스 및 기타 설정을 구성하세요.

### 실행

개발 모드:
```bash
npm run dev
```

프로덕션 모드:
```bash
npm start
```

### API 문서

- **OpenAPI 명세서**: `swagger.json` 파일 참조
- **API 문서**: `docs/api.md` 파일 참조
- **Swagger UI**: 서버 실행 후 `/api-docs`에서 확인 가능

### 테스트

```bash
npm test
```

## API 엔드포인트

이 프로젝트는 다음 주요 엔드포인트를 제공합니다:

- **인증**: `/api/v1/auth/*`
- **사용자 관리**: `/api/v1/users/*`

자세한 API 문서는 `docs/api.md` 또는 `swagger.json` 명세서를 참조하세요.

## 프로젝트 구조

```
my-test-app/
├── src/
│   ├── api/           # API 라우트
│   ├── config/        # 설정 파일
│   ├── middlewares/   # 미들웨어
│   ├── models/        # 데이터 모델
│   ├── repositories/  # 데이터 액세스 계층
│   ├── services/      # 비즈니스 로직
│   └── app.js         # 메인 애플리케이션
├── docs/              # API 문서
├── tests/             # 테스트 파일
├── swagger.json       # OpenAPI 명세서
├── .env              # 환경 변수
└── package.json      # 프로젝트 설정
```

## 데이터베이스

현재 설정된 데이터베이스: sqlite

## 기여하기

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 라이선스

MIT License
