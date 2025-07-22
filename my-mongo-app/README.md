# my-mongo-app

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

API 문서는 서버 실행 후 `/api-docs`에서 확인할 수 있습니다.

### 테스트

```bash
npm test
```

## API 엔드포인트

이 프로젝트는 다음 주요 엔드포인트를 제공합니다:

- **인증**: `/api/v1/auth/*`
- **사용자 관리**: `/api/v1/users/*`

자세한 API 문서는 OpenAPI 명세서를 참조하세요.

## 데이터베이스

현재 설정된 데이터베이스: mongodb

## 기여하기

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 라이선스

MIT License
