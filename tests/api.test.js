const request = require('supertest');
const app = require('../src/app');

describe('API 엔드포인트 테스트', () => {
  // 기본 라우트 테스트
  test('GET / 기본 라우트가 올바른 메시지를 반환해야 함', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('Universal Auth API');
  });
  
  // 헬스 체크 테스트
  test('GET /health 상태 체크가 정상적으로 응답해야 함', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body.status).toBe('healthy');
  });
});

// 인증 API 테스트
describe('인증 API 테스트', () => {
  // 회원가입 테스트
  test('POST /api/v1/auth/signup 유효하지 않은 데이터로 회원가입 시 400 응답', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        email: 'invalid-email',
        password: 'short'
      });
    
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });
});