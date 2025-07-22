# Universal Auth API

범용 인증 시스템 API - 다양한 프로젝트에서 재사용 가능한 인증 및 사용자 관리 시스템

**버전**: 1.0.0

---

## 목차

- [개요](#개요)
- [인증](#인증)
- [서버 정보](#서버-정보)
- [API 엔드포인트](#api-엔드포인트)
- [데이터 모델](#데이터-모델)
- [오류 코드](#오류-코드)

---

## 개요

이 API는 범용 인증 시스템 API - 다양한 프로젝트에서 재사용 가능한 인증 및 사용자 관리 시스템를 제공합니다.

### 기본 정보

- **API 버전**: 1.0.0
- **기본 Content-Type**: `application/json`
- **문자 인코딩**: UTF-8

## 인증

### bearerAuth

- **타입**: http
- **스키마**: bearer
- **설명**: JWT 액세스 토큰을 Authorization 헤더에 Bearer 스키마로 포함

### apiKey

- **타입**: apiKey
- **스키마**: N/A
- **설명**: 서비스 간 통신용 API 키

## 서버 정보

| 환경 | URL | 설명 |
|------|-----|------|
| Development server | `http://localhost:3000/api/v1` | Development server |
| Staging server | `https://staging-api.yourcompany.com/v1` | Staging server |
| Production server | `https://api.yourcompany.com/v1` | Production server |

## API 엔드포인트

### POST /auth/signup

**사용자 회원가입**

새로운 사용자 계정을 생성합니다. 이메일 인증이 필요할 수 있습니다.

**태그**: Authentication

**요청 바디**:

- **Content-Type**: `application/json`
- **스키마**: [SignupRequest](#signuprequest)

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 201 | 회원가입 성공 | [TokenResponse](#tokenresponse) |
| 400 |  |  |
| 409 | 이메일 또는 사용자명 중복 | [Error](#error) |
| 429 |  |  |

---

### POST /auth/signin

**사용자 로그인**

이메일과 비밀번호로 로그인합니다. 2FA가 활성화된 경우 코드가 필요합니다.

**태그**: Authentication

**요청 바디**:

- **Content-Type**: `application/json`
- **스키마**: [SigninRequest](#signinrequest)

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | 로그인 성공 | [TokenResponse](#tokenresponse) |
| 400 |  |  |
| 401 | 인증 실패 - 잘못된 이메일/비밀번호 또는 2FA 코드 | [Error](#error) |
| 423 | 계정 잠김 | [Error](#error) |
| 429 |  |  |

---

### POST /auth/refresh

**토큰 갱신**

리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급받습니다.

**태그**: Authentication

**요청 바디**:

- **Content-Type**: `application/json`
- **스키마**: [RefreshTokenRequest](#refreshtokenrequest)

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | 토큰 갱신 성공 | [TokenResponse](#tokenresponse) |
| 400 |  |  |
| 401 | 유효하지 않은 리프레시 토큰 | [Error](#error) |

---

### POST /auth/signout

**로그아웃**

현재 세션을 종료하고 토큰을 무효화합니다.

**태그**: Authentication

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | 로그아웃 성공 | [SuccessResponse](#successresponse) |
| 401 |  |  |

---

### POST /auth/signout-all

**모든 디바이스에서 로그아웃**

사용자의 모든 활성 세션을 종료합니다.

**태그**: Authentication

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | 모든 세션 종료 성공 | [SuccessResponse](#successresponse) |
| 401 |  |  |

---

### POST /auth/verify-email

**이메일 인증**

이메일로 받은 인증 토큰으로 이메일 주소를 인증합니다.

**태그**: Authentication

**파라미터**:

| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|------|------|
| `token` | query | string | ✅ | 이메일로 받은 인증 토큰 |

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | 이메일 인증 성공 | [SuccessResponse](#successresponse) |
| 400 | 유효하지 않은 토큰 | [Error](#error) |

---

### POST /auth/resend-verification

**인증 이메일 재발송**

이메일 인증을 위한 메일을 다시 발송합니다.

**태그**: Authentication

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | 인증 이메일 발송 완료 | [SuccessResponse](#successresponse) |
| 400 | 이미 인증된 이메일 | [Error](#error) |
| 401 |  |  |
| 429 |  |  |

---

### POST /auth/password-reset

**비밀번호 재설정 요청**

비밀번호 재설정을 위한 이메일을 발송합니다.

**태그**: Authentication

**요청 바디**:

- **Content-Type**: `application/json`
- **스키마**: [PasswordResetRequest](#passwordresetrequest)

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | 재설정 이메일 발송 완료 | [SuccessResponse](#successresponse) |
| 400 |  |  |
| 429 |  |  |

---

### POST /auth/password-reset/confirm

**비밀번호 재설정 확인**

토큰을 사용하여 새로운 비밀번호로 변경합니다.

**태그**: Authentication

**요청 바디**:

- **Content-Type**: `application/json`
- **스키마**: [PasswordResetConfirm](#passwordresetconfirm)

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | 비밀번호 재설정 완료 | [SuccessResponse](#successresponse) |
| 400 |  |  |
| 401 | 유효하지 않은 토큰 | [Error](#error) |

---

### POST /auth/2fa/setup

**2FA 설정 시작**

TOTP 기반 2단계 인증 설정을 시작합니다.

**태그**: Authentication

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | 2FA 설정 정보 | [TwoFactorSetup](#twofactorsetup) |
| 401 |  |  |
| 409 | 이미 2FA가 활성화됨 | [Error](#error) |

---

### POST /auth/2fa/verify

**2FA 활성화**

TOTP 코드를 검증하여 2FA를 활성화합니다.

**태그**: Authentication

**요청 바디**:

- **Content-Type**: `application/json`
- **스키마**: [TwoFactorVerify](#twofactorverify)

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | 2FA 활성화 성공 | [SuccessResponse](#successresponse) |
| 400 | 유효하지 않은 코드 | [Error](#error) |
| 401 |  |  |

---

### POST /auth/2fa/disable

**2FA 비활성화**

2단계 인증을 비활성화합니다.

**태그**: Authentication

**요청 바디**:

- **Content-Type**: `application/json`
- **스키마**: [TwoFactorVerify](#twofactorverify)

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | 2FA 비활성화 성공 | [SuccessResponse](#successresponse) |
| 400 | 유효하지 않은 코드 | [Error](#error) |
| 401 |  |  |

---

### GET /oauth/google

**Google OAuth 로그인 시작**

Google OAuth 인증 프로세스를 시작합니다.

**태그**: OAuth

**파라미터**:

| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|------|------|
| `redirect_uri` | query | string | ❌ | 인증 완료 후 리다이렉트할 URL |

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 302 | Google 인증 페이지로 리다이렉트 |  |

---

### GET /oauth/google/callback

**Google OAuth 콜백**

Google OAuth 인증 완료 후 콜백 처리

**태그**: OAuth

**파라미터**:

| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|------|------|
| `code` | query | string | ✅ | Google에서 반환한 인증 코드 |
| `state` | query | string | ❌ | CSRF 방지용 상태 값 |

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | OAuth 인증 성공 | [TokenResponse](#tokenresponse) |
| 400 | 유효하지 않은 인증 코드 | [Error](#error) |

---

### POST /oauth/google/link

**기존 계정에 Google 연결**

기존 사용자 계정에 Google 계정을 연결합니다.

**태그**: OAuth

**파라미터**:

| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|------|------|
| `code` | query | string | ✅ | Google 인증 코드 |

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | 계정 연결 완료 | [SuccessResponse](#successresponse) |
| 400 | 유효하지 않은 코드 | [Error](#error) |
| 401 |  |  |
| 409 | 이미 다른 계정에 연결된 Google 계정 | [Error](#error) |

---

### DELETE /oauth/google/unlink

**Google 계정 연결 해제**

연결된 Google 계정을 해제합니다.

**태그**: OAuth

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | 연결 해제 완료 | [SuccessResponse](#successresponse) |
| 401 |  |  |
| 404 | 연결된 Google 계정이 없음 | [Error](#error) |

---

### GET /users/me

**내 프로필 조회**

현재 로그인된 사용자의 프로필 정보를 조회합니다.

**태그**: Users

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | 프로필 조회 성공 | [User](#user) |
| 401 |  |  |

---

### PUT /users/me

**내 프로필 수정**

현재 로그인된 사용자의 프로필 정보를 수정합니다.

**태그**: Users

**요청 바디**:

- **Content-Type**: `application/json`
- **스키마**: [UpdateProfileRequest](#updateprofilerequest)

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | 프로필 수정 성공 | [User](#user) |
| 400 |  |  |
| 401 |  |  |
| 409 | 사용자명 중복 | [Error](#error) |

---

### PUT /users/me/password

**비밀번호 변경**

현재 비밀번호를 확인한 후 새로운 비밀번호로 변경합니다.

**태그**: Users

**요청 바디**:

- **Content-Type**: `application/json`
- **스키마**: [ChangePasswordRequest](#changepasswordrequest)

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | 비밀번호 변경 완료 | [SuccessResponse](#successresponse) |
| 400 |  |  |
| 401 | 현재 비밀번호가 일치하지 않음 | [Error](#error) |

---

### POST /users/me/deactivate

**계정 비활성화**

사용자 계정을 비활성화합니다. 이 작업은 되돌릴 수 있습니다.

**태그**: Users

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | 계정 비활성화 완료 | [SuccessResponse](#successresponse) |
| 401 |  |  |

---

### DELETE /users/me/delete

**계정 삭제**

사용자 계정을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.

**태그**: Users

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | 계정 삭제 완료 | [SuccessResponse](#successresponse) |
| 401 |  |  |

---

### GET /sessions

**내 활성 세션 목록**

현재 사용자의 모든 활성 세션을 조회합니다.

**태그**: Sessions

**파라미터**:

| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|------|------|
| `undefined` | undefined | string | ❌ |  |
| `undefined` | undefined | string | ❌ |  |

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | 세션 목록 조회 성공 | [PaginatedSessions](#paginatedsessions) |
| 401 |  |  |

---

### DELETE /sessions/{sessionId}

**특정 세션 종료**

지정된 세션을 종료합니다.

**태그**: Sessions

**파라미터**:

| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|------|------|
| `sessionId` | path | string | ✅ | 종료할 세션 ID |

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | 세션 종료 성공 | [SuccessResponse](#successresponse) |
| 401 |  |  |
| 404 |  |  |

---

### GET /security/logs

**내 보안 로그 조회**

현재 사용자의 보안 관련 활동 로그를 조회합니다.

**태그**: Security

**파라미터**:

| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|------|------|
| `undefined` | undefined | string | ❌ |  |
| `undefined` | undefined | string | ❌ |  |
| `eventType` | query | string | ❌ | 필터링할 이벤트 타입 |
| `from` | query | string | ❌ | 시작 날짜 (ISO 8601) |
| `to` | query | string | ❌ | 종료 날짜 (ISO 8601) |

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | 보안 로그 조회 성공 | [PaginatedSecurityLogs](#paginatedsecuritylogs) |
| 401 |  |  |

---

### GET /notifications/settings

**알림 설정 조회**

현재 사용자의 알림 설정을 조회합니다.

**태그**: Notifications

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | 알림 설정 조회 성공 | [NotificationSettings](#notificationsettings) |
| 401 |  |  |

---

### PUT /notifications/settings

**알림 설정 변경**

사용자의 알림 설정을 변경합니다.

**태그**: Notifications

**요청 바디**:

- **Content-Type**: `application/json`
- **스키마**: [NotificationSettings](#notificationsettings)

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | 알림 설정 변경 성공 | [NotificationSettings](#notificationsettings) |
| 400 |  |  |
| 401 |  |  |

---

### GET /api-keys

**내 API 키 목록**

현재 사용자의 API 키 목록을 조회합니다.

**태그**: API Keys

**파라미터**:

| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|------|------|
| `undefined` | undefined | string | ❌ |  |
| `undefined` | undefined | string | ❌ |  |

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | API 키 목록 조회 성공 |  |
| 401 |  |  |

---

### POST /api-keys

**새 API 키 생성**

새로운 API 키를 생성합니다.

**태그**: API Keys

**요청 바디**:

- **Content-Type**: `application/json`
- **스키마**: [CreateApiKeyRequest](#createapikeyrequest)

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 201 | API 키 생성 성공 |  |
| 400 |  |  |
| 401 |  |  |

---

### DELETE /api-keys/{keyId}

**API 키 삭제**

지정된 API 키를 삭제합니다.

**태그**: API Keys

**파라미터**:

| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|------|------|
| `keyId` | path | string | ✅ | 삭제할 API 키 ID |

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | API 키 삭제 성공 | [SuccessResponse](#successresponse) |
| 401 |  |  |
| 404 |  |  |

---

### GET /admin/users

**사용자 목록 조회 (관리자)**

모든 사용자 목록을 조회합니다. 관리자 권한이 필요합니다.

**태그**: Admin

**파라미터**:

| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|------|------|
| `undefined` | undefined | string | ❌ |  |
| `undefined` | undefined | string | ❌ |  |
| `undefined` | undefined | string | ❌ |  |
| `role` | query | string | ❌ | 역할별 필터링 |
| `status` | query | string | ❌ | 상태별 필터링 |

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | 사용자 목록 조회 성공 | [PaginatedUsers](#paginatedusers) |
| 401 |  |  |
| 403 |  |  |

---

### GET /admin/users/{userId}

**특정 사용자 조회 (관리자)**

특정 사용자의 상세 정보를 조회합니다.

**태그**: Admin

**파라미터**:

| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|------|------|
| `userId` | path | string | ✅ | 조회할 사용자 ID |

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | 사용자 조회 성공 | [User](#user) |
| 401 |  |  |
| 403 |  |  |
| 404 |  |  |

---

### PUT /admin/users/{userId}/role

**사용자 역할 변경 (관리자)**

특정 사용자의 역할을 변경합니다.

**태그**: Admin

**파라미터**:

| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|------|------|
| `userId` | path | string | ✅ | 역할을 변경할 사용자 ID |

**요청 바디**:

- **Content-Type**: `application/json`

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | 역할 변경 성공 | [User](#user) |
| 400 |  |  |
| 401 |  |  |
| 403 |  |  |
| 404 |  |  |

---

### POST /admin/users/{userId}/suspend

**사용자 계정 정지 (관리자)**

특정 사용자의 계정을 정지합니다.

**태그**: Admin

**파라미터**:

| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|------|------|
| `userId` | path | string | ✅ | 정지할 사용자 ID |

**요청 바디**:

- **Content-Type**: `application/json`

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | 계정 정지 성공 | [SuccessResponse](#successresponse) |
| 401 |  |  |
| 403 |  |  |
| 404 |  |  |

---

### POST /admin/users/{userId}/unsuspend

**사용자 계정 정지 해제 (관리자)**

정지된 사용자 계정을 활성화합니다.

**태그**: Admin

**파라미터**:

| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|------|------|
| `userId` | path | string | ✅ | 정지 해제할 사용자 ID |

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | 정지 해제 성공 | [SuccessResponse](#successresponse) |
| 401 |  |  |
| 403 |  |  |
| 404 |  |  |

---

### GET /admin/security/logs

**전체 보안 로그 조회 (관리자)**

모든 사용자의 보안 로그를 조회합니다.

**태그**: Admin

**파라미터**:

| 이름 | 위치 | 타입 | 필수 | 설명 |
|------|------|------|------|------|
| `undefined` | undefined | string | ❌ |  |
| `undefined` | undefined | string | ❌ |  |
| `userId` | query | string | ❌ | 특정 사용자 ID로 필터링 |
| `eventType` | query | string | ❌ | 이벤트 타입으로 필터링 |
| `ipAddress` | query | string | ❌ | IP 주소로 필터링 |

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | 보안 로그 조회 성공 | [PaginatedSecurityLogs](#paginatedsecuritylogs) |
| 401 |  |  |
| 403 |  |  |

---

### GET /health

**시스템 상태 확인**

API 서버와 의존성 서비스들의 상태를 확인합니다.

**태그**: Health

**응답**:

| 상태 코드 | 설명 | 스키마 |
|-----------|------|--------|
| 200 | 시스템 정상 | [HealthStatus](#healthstatus) |
| 503 | 시스템 장애 | [HealthStatus](#healthstatus) |

---

## 데이터 모델

### User

사용자 정보

**속성**:

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `id` | string | ✅ | 사용자 고유 식별자 |
| `email` | string | ✅ | 이메일 주소 |
| `username` | string | ❌ | 사용자명 (영숫자와 언더스코어만 허용) |
| `firstName` | string | ❌ | 이름 |
| `lastName` | string | ❌ | 성 |
| `avatar` | string | ❌ | 프로필 이미지 URL |
| `role` | string | ✅ | 사용자 역할 |
| `status` | string | ✅ | 계정 상태 |
| `emailVerified` | boolean | ✅ | 이메일 인증 여부 |
| `twoFactorEnabled` | boolean | ❌ | 2FA 활성화 여부 |
| `createdAt` | string | ✅ | 계정 생성 시간 |
| `updatedAt` | string | ✅ | 마지막 수정 시간 |
| `lastLoginAt` | string | ❌ | 마지막 로그인 시간 |

---

### SignupRequest

회원가입 요청

**속성**:

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `email` | string | ✅ | 이메일 주소 |
| `password` | string | ✅ | 비밀번호 (최소 8자) |
| `username` | string | ❌ | 사용자명 (선택사항) |
| `firstName` | string | ❌ | 이름 (선택사항) |
| `lastName` | string | ❌ | 성 (선택사항) |
| `acceptTerms` | boolean | ❌ | 이용약관 동의 여부 |

**예시**:

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "username": "john_doe",
  "firstName": "John",
  "lastName": "Doe",
  "acceptTerms": true
}
```

---

### SigninRequest

로그인 요청

**속성**:

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `email` | string | ✅ | 이메일 주소 |
| `password` | string | ✅ | 비밀번호 |
| `rememberMe` | boolean | ❌ | 로그인 상태 유지 여부 |
| `twoFactorCode` | string | ❌ | 2FA 코드 (2FA 활성화 시 필수) |

**예시**:

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "rememberMe": true
}
```

---

### TokenResponse

토큰 응답

**속성**:

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `accessToken` | string | ✅ | JWT 액세스 토큰 |
| `refreshToken` | string | ✅ | 리프레시 토큰 |
| `tokenType` | string | ✅ | 토큰 타입 |
| `expiresIn` | integer | ✅ | 액세스 토큰 만료 시간 (초) |
| `user` | User | ✅ |  |

---

### RefreshTokenRequest

토큰 갱신 요청

**속성**:

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `refreshToken` | string | ✅ | 리프레시 토큰 |

---

### PasswordResetRequest

비밀번호 재설정 요청

**속성**:

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `email` | string | ✅ | 등록된 이메일 주소 |

---

### PasswordResetConfirm

비밀번호 재설정 확인

**속성**:

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `token` | string | ✅ | 이메일로 받은 재설정 토큰 |
| `newPassword` | string | ✅ | 새 비밀번호 |

---

### UpdateProfileRequest

프로필 수정 요청

**속성**:

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `username` | string | ❌ | 사용자명 |
| `firstName` | string | ❌ | 이름 |
| `lastName` | string | ❌ | 성 |
| `avatar` | string | ❌ | 프로필 이미지 URL |

---

### ChangePasswordRequest

비밀번호 변경 요청

**속성**:

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `currentPassword` | string | ✅ | 현재 비밀번호 |
| `newPassword` | string | ✅ | 새 비밀번호 |

---

### Session

사용자 세션 정보

**속성**:

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `id` | string | ❌ | 세션 ID |
| `deviceInfo` | string | ❌ | 디바이스 정보 |
| `ipAddress` | string | ❌ | IP 주소 |
| `location` | string | ❌ | 접속 위치 (국가/도시) |
| `createdAt` | string | ❌ | 세션 생성 시간 |
| `lastAccessAt` | string | ❌ | 마지막 접근 시간 |
| `isActive` | boolean | ❌ | 활성 상태 |
| `isCurrent` | boolean | ❌ | 현재 세션 여부 |

---

### SecurityLog

보안 로그

**속성**:

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `id` | string | ❌ | 로그 ID |
| `eventType` | string | ❌ | 이벤트 타입 |
| `ipAddress` | string | ❌ | IP 주소 |
| `userAgent` | string | ❌ | 사용자 에이전트 정보 |
| `location` | string | ❌ | 접속 위치 |
| `timestamp` | string | ❌ | 이벤트 발생 시간 |
| `details` | object | ❌ | 추가 상세 정보 |

---

### NotificationSettings

알림 설정

**속성**:

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `emailNotifications` | boolean | ❌ | 이메일 알림 활성화 |
| `securityAlerts` | boolean | ❌ | 보안 경고 알림 |
| `marketingEmails` | boolean | ❌ | 마케팅 이메일 수신 |
| `systemUpdates` | boolean | ❌ | 시스템 업데이트 알림 |
| `loginAlerts` | boolean | ❌ | 새로운 로그인 알림 |

---

### ApiKey

API 키 정보

**속성**:

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `id` | string | ❌ | API 키 ID |
| `name` | string | ❌ | API 키 이름 |
| `keyPrefix` | string | ❌ | 키 앞부분 (보안상 일부만 표시) |
| `permissions` | array | ❌ | API 키 권한 목록 |
| `expiresAt` | string | ❌ | 만료 시간 (null이면 무제한) |
| `lastUsedAt` | string | ❌ | 마지막 사용 시간 |
| `createdAt` | string | ❌ | 생성 시간 |
| `isActive` | boolean | ❌ | 활성 상태 |

---

### CreateApiKeyRequest

API 키 생성 요청

**속성**:

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `name` | string | ✅ | API 키 이름 |
| `permissions` | array | ❌ | 권한 목록 |
| `expiresAt` | string | ❌ | 만료 시간 (선택사항) |

---

### TwoFactorSetup

2FA 설정 정보

**속성**:

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `qrCode` | string | ❌ | QR 코드 데이터 URL |
| `secret` | string | ❌ | TOTP 시크릿 키 |
| `backupCodes` | array | ❌ | 백업 코드 목록 |

---

### TwoFactorVerify

2FA 검증 요청

**속성**:

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `code` | string | ✅ | 6자리 TOTP 코드 |

---

### HealthStatus

시스템 상태

**속성**:

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `status` | string | ❌ | 전체 시스템 상태 |
| `timestamp` | string | ❌ | 상태 체크 시간 |
| `services` | object | ❌ | 각 서비스 상태 |
| `uptime` | number | ❌ | 서버 가동 시간 (초) |
| `version` | string | ❌ | API 버전 |
| `memory` | object | ❌ |  |

---

### PaginatedUsers

페이지네이션된 사용자 목록

**속성**:

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `data` | array | ❌ |  |
| `pagination` | Pagination | ❌ |  |

---

### PaginatedSessions

페이지네이션된 세션 목록

**속성**:

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `data` | array | ❌ |  |
| `pagination` | Pagination | ❌ |  |

---

### PaginatedSecurityLogs

페이지네이션된 보안 로그 목록

**속성**:

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `data` | array | ❌ |  |
| `pagination` | Pagination | ❌ |  |

---

### Pagination

페이지네이션 정보

**속성**:

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `total` | integer | ❌ | 전체 항목 수 |
| `limit` | integer | ❌ | 페이지당 항목 수 |
| `offset` | integer | ❌ | 건너뛴 항목 수 |
| `page` | integer | ❌ | 현재 페이지 번호 |
| `totalPages` | integer | ❌ | 전체 페이지 수 |
| `hasNext` | boolean | ❌ | 다음 페이지 존재 여부 |
| `hasPrev` | boolean | ❌ | 이전 페이지 존재 여부 |

---

### Error

일반 오류 응답

**속성**:

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `error` | string | ✅ | 오류 코드 |
| `message` | string | ✅ | 오류 메시지 |
| `code` | string | ❌ | 내부 오류 코드 |
| `details` | object | ❌ | 추가 오류 정보 |
| `timestamp` | string | ✅ | 오류 발생 시간 |
| `path` | string | ❌ | 오류가 발생한 API 경로 |

---

### ValidationError

입력 검증 오류

**속성**:

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `error` | string | ❌ |  |
| `message` | string | ❌ | 검증 오류 메시지 |
| `fields` | object | ❌ | 필드별 오류 메시지 |
| `timestamp` | string | ❌ |  |

---

### SuccessResponse

성공 응답

**속성**:

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `success` | boolean | ❌ |  |
| `message` | string | ❌ | 성공 메시지 |
| `timestamp` | string | ❌ |  |

---

## 오류 코드

이 API는 표준 HTTP 상태 코드를 사용합니다:

| 상태 코드 | 설명 |
|-----------|------|
| 200 | 성공 |
| 201 | 생성됨 |
| 400 | 잘못된 요청 |
| 401 | 인증 실패 |
| 403 | 권한 없음 |
| 404 | 리소스를 찾을 수 없음 |
| 409 | 충돌 |
| 422 | 처리할 수 없는 엔티티 |
| 429 | 요청 제한 초과 |
| 500 | 내부 서버 오류 |

---

*이 문서는 OpenAPI 명세서로부터 자동 생성되었습니다.*
