const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDB } = require('./config/database');
const serverConfig = require('./config/server');
const { errorHandler, notFoundHandler } = require('./middlewares/error-handler');

// API 라우터들 임포트
const authRoutes = require('./api/auth.routes');
const userRoutes = require('./api/user.routes');
// 다른 라우터들도 필요에 따라 임포트

// Express 앱 생성
const app = express();

// 데이터베이스 연결
connectDB();

// 미들웨어 적용
app.use(helmet()); // 보안 헤더 설정
app.use(cors({
  origin: serverConfig.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); // JSON 파싱
app.use(express.urlencoded({ extended: true })); // URL-encoded 파싱
app.use(morgan(serverConfig.env === 'production' ? 'combined' : 'dev')); // 로깅

// API 라우트 등록
const API_PREFIX = '/api/v1';
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
// 다른 라우터들도 필요에 따라 등록

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    message: 'Universal Auth API - Welcome',
    version: '1.0.0',
    docs: '/api-docs'
  });
});

// 헬스 체크 라우트
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// 404 핸들러
app.use(notFoundHandler);

// 에러 핸들러
app.use(errorHandler);

// 서버 시작
const PORT = serverConfig.port;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${serverConfig.env}`);
});

module.exports = app;