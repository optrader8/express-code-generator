# Express Code Generator 사용법 가이드

Express Code Generator를 사용하여 OpenAPI/Swagger 명세서로부터 Express.js 애플리케이션을 생성하는 상세한 가이드입니다.

## 목차

1. [기본 사용법](#기본-사용법)
2. [명령어 상세 설명](#명령어-상세-설명)
3. [옵션 가이드](#옵션-가이드)
4. [실제 사용 예제](#실제-사용-예제)
5. [고급 사용법](#고급-사용법)
6. [문제 해결](#문제-해결)
7. [팁과 모범 사례](#팁과-모범-사례)

## 기본 사용법

### 1. 도움말 확인

먼저 사용 가능한 명령어와 옵션을 확인해보세요:

```bash
express-gen --help
```

버전 정보 확인:

```bash
express-gen --version
```

### 2. 가장 간단한 프로젝트 생성

OpenAPI 명세서가 있다면 가장 간단하게 프로젝트를 생성할 수 있습니다:

```bash
express-gen create --spec your-openapi.yaml --output my-project
```

## 명령어 상세 설명

### create 명령어

새로운 Express.js 프로젝트를 생성합니다.

**기본 문법:**
```bash
express-gen create [옵션]
```

**필수 옵션:**
- `--spec, -s <path>`: OpenAPI/Swagger 명세서 파일 경로

**선택 옵션:**
- `--output, -o <directory>`: 출력 디렉토리 (기본값: 현재 디렉토리)
- `--db, -d <type>`: 데이터베이스 타입
- `--typescript, -ts`: TypeScript 사용 여부
- `--validation, -v <library>`: 유효성 검사 라이브러리
- `--template, -t <type>`: 템플릿 타입
- `--force, -f`: 기존 파일 덮어쓰기

### add 명령어 (개발 중)

기존 프로젝트에 새로운 리소스를 추가합니다.

```bash
express-gen add --spec new-resource.yaml --output existing-project
```

### validate 명령어

OpenAPI 명세서의 유효성을 검사합니다.

```bash
express-gen validate --spec your-openapi.yaml
```

## 옵션 가이드

### 데이터베이스 옵션 (--db, -d)

지원되는 데이터베이스 타입:

#### SQLite (기본값)
```bash
express-gen create --spec api.yaml --db sqlite
```
- 추가 설정 불필요
- 개발/테스트 환경에 적합
- 파일 기반 데이터베이스

#### MongoDB
```bash
express-gen create --spec api.yaml --db mongodb
```
- NoSQL 데이터베이스
- 대규모 애플리케이션에 적합
- Mongoose ORM 사용

#### PostgreSQL
```bash
express-gen create --spec api.yaml --db postgres
```
- 강력한 관계형 데이터베이스
- 복잡한 쿼리 지원
- Sequelize ORM 사용

#### MySQL
```bash
express-gen create --spec api.yaml --db mysql
```
- 널리 사용되는 관계형 데이터베이스
- 웹 애플리케이션에 인기
- Sequelize ORM 사용

### TypeScript 옵션 (--typescript, -ts)

TypeScript 코드 생성 (기본값: true):

```bash
# TypeScript 사용 (기본값)
express-gen create --spec api.yaml --typescript

# JavaScript 사용
express-gen create --spec api.yaml --typescript false
```

### 유효성 검사 라이브러리 (--validation, -v)

#### Zod (기본값)
```bash
express-gen create --spec api.yaml --validation zod
```
- TypeScript 우선 스키마 라이브러리
- 타입 안전성 제공
- 현대적인 API

#### Joi
```bash
express-gen create --spec api.yaml --validation joi
```
- 성숙하고 안정적인 라이브러리
- 풍부한 유효성 검사 기능
- 광범위한 생태계

#### Class Validator
```bash
express-gen create --spec api.yaml --validation class-validator
```
- 데코레이터 기반 유효성 검사
- NestJS와 호환성
- 객체 지향 접근법

### 템플릿 옵션 (--template, -t)

#### Basic 템플릿 (기본값)
```bash
express-gen create --spec api.yaml --template basic
```
- 최소한의 기능
- 빠른 시작에 적합
- 기본적인 CRUD 작업

#### Full 템플릿
```bash
express-gen create --spec api.yaml --template full
```
- 완전한 기능 세트
- 인증, 권한, 로깅 포함
- 프로덕션 준비 상태

## 실제 사용 예제

### 예제 1: 간단한 블로그 API

OpenAPI 명세서 파일 (`blog-api.yaml`):

```yaml
openapi: 3.0.0
info:
  title: 블로그 API
  version: 1.0.0
  description: 간단한 블로그 API

paths:
  /posts:
    get:
      summary: 모든 포스트 조회
      responses:
        '200':
          description: 포스트 목록
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Post'
    post:
      summary: 새 포스트 생성
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/PostCreate'
      responses:
        '201':
          description: 생성된 포스트

  /posts/{id}:
    get:
      summary: 특정 포스트 조회
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: 포스트 상세

components:
  schemas:
    Post:
      type: object
      properties:
        id:
          type: string
        title:
          type: string
        content:
          type: string
        author:
          type: string
        createdAt:
          type: string
          format: date-time
      required:
        - id
        - title
        - content
        - author

    PostCreate:
      type: object
      properties:
        title:
          type: string
          minLength: 1
          maxLength: 255
        content:
          type: string
          minLength: 1
        author:
          type: string
          minLength: 1
          maxLength: 100
      required:
        - title
        - content
        - author
```

프로젝트 생성:

```bash
# 기본 설정으로 생성
express-gen create --spec blog-api.yaml --output blog-project

# MongoDB와 Full 템플릿 사용
express-gen create --spec blog-api.yaml --output blog-project-full --db mongodb --template full

# TypeScript와 Joi 사용
express-gen create --spec blog-api.yaml --output blog-project-ts --typescript --validation joi
```

### 예제 2: 전자상거래 API

더 복잡한 API의 경우:

```bash
# PostgreSQL 데이터베이스 사용
express-gen create \
  --spec ecommerce-api.yaml \
  --output ecommerce-backend \
  --db postgres \
  --template full \
  --validation zod \
  --typescript
```

### 예제 3: 기존 파일 덮어쓰기

이미 존재하는 디렉토리에 강제로 생성:

```bash
express-gen create --spec api.yaml --output existing-project --force
```

## 고급 사용법

### 1. 명세서 유효성 사전 검사

프로젝트 생성 전에 명세서가 올바른지 확인:

```bash
express-gen validate --spec your-api.yaml
```

### 2. 다양한 환경에 맞는 프로젝트 생성

#### 개발 환경
```bash
express-gen create \
  --spec api.yaml \
  --output dev-project \
  --db sqlite \
  --template basic
```

#### 스테이징 환경
```bash
express-gen create \
  --spec api.yaml \
  --output staging-project \
  --db postgres \
  --template full
```

#### 프로덕션 환경
```bash
express-gen create \
  --spec api.yaml \
  --output prod-project \
  --db postgres \
  --template full \
  --validation zod \
  --typescript
```

### 3. 생성 후 작업 흐름

```bash
# 1. 프로젝트 생성
express-gen create --spec api.yaml --output my-api

# 2. 프로젝트 디렉토리로 이동
cd my-api

# 3. 의존성 설치
npm install

# 4. 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 데이터베이스 연결 정보 등을 설정

# 5. 개발 서버 실행
npm run dev
```

## 문제 해결

### 1. 명세서 파일을 찾을 수 없음

**오류:**
```
❌ 오류: 명세서 파일을 찾을 수 없습니다: api.yaml
```

**해결방법:**
- 파일 경로가 올바른지 확인
- 파일이 실제로 존재하는지 확인
- 절대 경로 또는 상대 경로 사용

```bash
# 절대 경로 사용
express-gen create --spec /full/path/to/api.yaml --output project

# 상대 경로 사용
express-gen create --spec ./specs/api.yaml --output project
```

### 2. 지원되지 않는 데이터베이스 타입

**오류:**
```
❌ 오류: 지원되지 않는 데이터베이스 타입: redis
```

**해결방법:**
지원되는 데이터베이스 타입만 사용: `sqlite`, `mongodb`, `postgres`, `mysql`

### 3. 출력 디렉토리가 비어있지 않음

**오류:**
```
❌ 오류: 출력 디렉토리가 비어있지 않습니다: ./my-project
```

**해결방법:**
- 빈 디렉토리 사용
- `--force` 옵션으로 강제 덮어쓰기
- 다른 출력 디렉토리 선택

```bash
express-gen create --spec api.yaml --output my-project --force
```

### 4. 명세서 파싱 오류

**오류:**
```
❌ 유효성 검사 실패: Invalid YAML
```

**해결방법:**
- YAML/JSON 문법 확인
- 온라인 YAML/JSON 검증기 사용
- OpenAPI 명세서 표준 준수 확인

### 5. 권한 오류 (Linux/Mac)

**오류:**
```
permission denied: express-gen
```

**해결방법:**
```bash
# CLI 파일에 실행 권한 부여
chmod +x /usr/local/lib/node_modules/express-code-generator/bin/cli.js

# 또는 sudo로 전역 설치
sudo npm install -g express-code-generator
```

## 팁과 모범 사례

### 1. 명세서 작성 팁

- **일관된 명명 규칙**: 리소스명과 엔드포인트에 일관된 명명 규칙 사용
- **상세한 스키마**: 가능한 한 상세한 데이터 모델 정의
- **적절한 HTTP 상태 코드**: 각 응답에 맞는 적절한 상태 코드 사용
- **명확한 설명**: 각 엔드포인트와 스키마에 명확한 설명 추가

```yaml
# 좋은 예
paths:
  /users/{userId}:
    get:
      summary: 사용자 정보 조회
      description: ID를 통해 특정 사용자의 상세 정보를 조회합니다.
      parameters:
        - name: userId
          in: path
          required: true
          description: 조회할 사용자의 고유 ID
          schema:
            type: integer
            minimum: 1
```

### 2. 프로젝트 구조 최적화

생성된 프로젝트에서 권장되는 작업:

```bash
# 환경별 설정 파일 생성
cp .env.example .env.development
cp .env.example .env.production

# Git 초기화 및 첫 커밋
git init
git add .
git commit -m "Initial commit: Generated Express.js project"

# 필요한 추가 패키지 설치
npm install --save helmet compression rate-limit
npm install --save-dev nodemon jest supertest
```

### 3. 개발 워크플로우

1. **명세서 우선 설계**: API 설계를 먼저 완료
2. **점진적 개발**: 작은 기능부터 시작해서 점진적으로 확장
3. **테스트 우선**: 생성된 테스트 코드를 기반으로 TDD 적용
4. **문서화**: 생성된 문서를 지속적으로 업데이트

### 4. 성능 최적화

생성된 프로젝트에서 성능 향상을 위한 설정:

```javascript
// app.js에 추가할 수 있는 미들웨어
const compression = require('compression');
const helmet = require('helmet');

app.use(helmet());
app.use(compression());
```

### 5. 보안 모범 사례

- **환경 변수**: 중요한 설정은 환경 변수로 관리
- **입력 검증**: 생성된 유효성 검사 코드 적극 활용
- **에러 처리**: 프로덕션에서는 상세한 에러 정보 노출 금지
- **HTTPS**: 프로덕션 환경에서는 반드시 HTTPS 사용

## 추가 리소스

### 유용한 OpenAPI 도구

- **Swagger Editor**: https://editor.swagger.io/
- **OpenAPI Generator**: https://openapi-generator.tech/
- **Stoplight Studio**: https://stoplight.io/studio/

### 학습 자료

- **OpenAPI 명세서 작성법**: https://swagger.io/docs/specification/
- **Express.js 공식 가이드**: https://expressjs.com/
- **Node.js 모범 사례**: https://nodejs.org/en/docs/guides/

이 가이드를 통해 Express Code Generator를 효과적으로 활용하여 고품질의 Express.js 애플리케이션을 빠르게 개발할 수 있습니다.