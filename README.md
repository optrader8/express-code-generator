# Express Code Generator

OpenAPI/Swagger 명세서로부터 모듈식 Express.js API 프로젝트를 생성하는 강력한 CLI 도구입니다.

## 개요

Express Code Generator는 OpenAPI/Swagger 명세서를 입력으로 받아 잘 구조화된 Express.js 애플리케이션을 생성하는 도구입니다. 관심사 분리와 계층적 아키텍처를 갖춘 Node.js 애플리케이션을 자동으로 생성해 개발 시간을 단축하고 일관된 코드 품질을 유지할 수 있습니다.

## 주요 기능

- **OpenAPI/Swagger 파싱**: OpenAPI 3.0 명세서에서 API 엔드포인트, 데이터 모델 및 유효성 검사 규칙을 추출합니다.
- **모듈식 아키텍처**: 아래와 같은 계층적 구조의 코드를 생성합니다.
  - **API 계층**: HTTP 요청을 처리하는 Express 라우터
  - **서비스 계층**: 비즈니스 로직 구현
  - **리포지토리 계층**: 데이터베이스 액세스 추상화
  - **모델 계층**: 데이터 모델 및 유효성 검사 정의
- **다양한 데이터베이스 지원**:
  - **SQLite** (기본값): 별도 설정 없이 바로 사용 가능
  - **MongoDB**: 대규모 애플리케이션용 NoSQL 옵션
  - **PostgreSQL**: 강력한 관계형 데이터베이스 지원
  - **MySQL**: 널리 사용되는 관계형 데이터베이스 지원
- **유효성 검사**: Joi, Zod 등의 라이브러리를 사용한 요청 데이터 검증
- **TypeScript 지원**: 타입 안전성을 갖춘 TypeScript 코드 생성
- **미들웨어**: 인증, 오류 처리, 로깅 등 필수 미들웨어 자동 생성
- **테스트 프레임워크**: 단위 및 통합 테스트를 위한 기본 설정 제공
- **문서화**: OpenAPI 명세서 기반 API 문서 자동 생성

## 설치 방법

### 전역 설치 (권장)

소스 코드에서 직접 전역으로 설치하는 방법:

```bash
# 저장소 복제
git clone https://github.com/yourusername/express-code-generator.git

# 프로젝트 디렉토리로 이동
cd express-code-generator

# 의존성 설치
npm install

# 전역으로 설치 (중요!)
npm install -g .
```

이렇게 하면 `express-gen` 명령을 시스템 어디서나 사용할 수 있습니다.

### npm을 통한 설치 (패키지 배포 후)

```bash
# 전역 설치
npm install -g express-code-generator

# 로컬 프로젝트에 설치
npm install express-code-generator --save-dev
```
### 로컬 소스 전달 시 전역 설치 방법 (압축 파일 배포)

압축 파일(zip/tar)로 배포받은 경우:

```bash
# 1. 압축 파일 해제 후 폴더로 이동
unzip express-code-generator-main.zip
cd express-code-generator-main

# 2. 의존성 설치
npm install

# 3. 전역 설치
npm install -g .
```

또는 프로젝트 폴더만 받은 경우:

```bash
# 1. 폴더 내로 이동
cd express-code-generator

# 2. 의존성 설치
npm install

# 3. 전역 설치
npm install -g .
```

설치 후, 어디서든 `express-gen` 명령을 사용할 수 있습니다.

### Git 저장소에서 직접 설치

```bash
npm install -g https://github.com/yourusername/express-code-generator.git
```


## 빠른 시작

1. OpenAPI/Swagger 명세서 준비 (예: swagger.json 또는 openapi.yaml)
2. 다음 명령으로 프로젝트 생성:

```bash
express-gen create --spec path/to/swagger.json --output my-api
```

3. 생성된 프로젝트로 이동 및 의존성 설치:

```bash
cd my-api
npm install
```

4. 개발 서버 실행:

```bash
npm run dev
```

## 명령어 옵션

```
사용법: express-gen [명령] [옵션]

명령:
  create     OpenAPI 명세서에서 새 Express.js 프로젝트 생성
  add        기존 프로젝트에 새 리소스 추가
  validate   OpenAPI 명세서 유효성 검사

옵션:
  --spec, -s          OpenAPI 명세서 파일 경로 (필수)
  --output, -o        생성된 코드 출력 디렉토리 (기본값: 현재 디렉토리)
  --db, -d            데이터베이스 타입: sqlite, mongodb, postgres, mysql (기본값: sqlite)
  --typescript, -ts   TypeScript 코드 생성 (기본값: true)
  --validation, -v    유효성 검사 라이브러리: joi, zod, class-validator (기본값: zod)
  --template, -t      템플릿 유형: basic, full (기본값: basic)
  --force, -f         기존 파일 덮어쓰기 (기본값: false)
  --help, -h          도움말 표시
  --version           버전 정보 표시
```

## 생성된 프로젝트 구조

```
my-api/
├── src/
│   ├── api/             # API 라우트 정의
│   │   └── [리소스].routes.(js|ts)
│   ├── services/        # 비즈니스 로직 구현
│   │   └── [리소스].service.(js|ts)
│   ├── repositories/    # 데이터 액세스 로직
│   │   └── [리소스].repository.(js|ts)
│   ├── models/          # 데이터 모델 정의
│   │   └── [리소스].model.(js|ts)
│   ├── middlewares/     # Express 미들웨어
│   │   ├── auth.(js|ts)
│   │   ├── error-handler.(js|ts)
│   │   └── validator.(js|ts)
│   ├── config/          # 환경 설정
│   │   ├── database.(js|ts)
│   │   └── server.(js|ts)
│   ├── utils/           # 유틸리티 함수
│   │   └── helpers.(js|ts)
│   └── app.(js|ts)      # Express 앱 설정
├── tests/               # 테스트 파일
├── data/                # SQLite 데이터베이스 파일 (SQLite 사용 시)
├── .env.example         # 환경 변수 템플릿
├── package.json         # 프로젝트 의존성
└── README.md            # 프로젝트 문서
```

## 데이터베이스 설정

Express Code Generator는 여러 데이터베이스를 지원합니다:

### SQLite (기본값)

추가 설정 없이 바로 사용 가능하며, 간단한 애플리케이션이나 개발/테스트 환경에 적합합니다.

```bash
express-gen create --spec swagger.json --db sqlite
```

생성된 프로젝트는 Sequelize ORM을 사용하여 SQLite와 상호작용합니다.

### MongoDB

MongoDB를 사용하려면:

```bash
express-gen create --spec swagger.json --db mongodb
```

생성된 프로젝트는 Mongoose를 사용하여 MongoDB와 상호작용합니다.

### PostgreSQL / MySQL

관계형 데이터베이스를 사용하려면:

```bash
# PostgreSQL
express-gen create --spec swagger.json --db postgres

# MySQL
express-gen create --spec swagger.json --db mysql
```

## 예제: 사용자 API 생성

OpenAPI 명세서 예시:

```yaml
openapi: 3.0.0
info:
  title: 사용자 API
  version: 1.0.0
paths:
  /users:
    get:
      summary: 모든 사용자 조회
      responses:
        '200':
          description: 사용자 목록
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
    post:
      summary: 새 사용자 생성
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserCreate'
      responses:
        '201':
          description: 생성된 사용자
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
        username:
          type: string
        email:
          type: string
      required:
        - id
        - username
        - email
    UserCreate:
      type: object
      properties:
        username:
          type: string
        email:
          type: string
        password:
          type: string
      required:
        - username
        - email
        - password
```

이 명세서로 프로젝트 생성:

```bash
express-gen create --spec user-api.yaml --output user-api
```

## 테스트 실행

생성된 프로젝트에서 테스트를 실행할 수 있습니다:

```bash
cd my-api
npm test
```

## 고급 사용법

### 사용자 정의 템플릿

자신만의 템플릿을 사용하여 코드 생성:

```bash
express-gen create --spec swagger.json --template-dir ./my-templates
```

### 기존 프로젝트에 리소스 추가

이미 생성된 프로젝트에 새 리소스 추가:

```bash
express-gen add --spec new-resource.yaml --output existing-project
```

## 문제 해결

### 데이터베이스 연결 오류

- `.env` 파일의 데이터베이스 설정을 확인하세요
- 데이터베이스 서버가 실행 중인지 확인하세요
- 필요한 의존성을 설치했는지 확인하세요:
  - MongoDB: `npm install mongoose`
  - PostgreSQL: `npm install pg sequelize`
  - MySQL: `npm install mysql2 sequelize`

### CLI 실행 권한 오류 (Linux/Mac)

```bash
chmod +x ./bin/cli.js
```

### 디버그 모드

상세한 로그 정보 확인:

```bash
express-gen --debug
```

## 기여하기

기여는 언제나 환영합니다!

1. 저장소 포크
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다 - 자세한 내용은 LICENSE 파일을 참조하세요.