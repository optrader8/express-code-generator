const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

/**
 * JWT 토큰을 검증하여 사용자 인증을 처리하는 미들웨어
 */
const authenticateJWT = (req, res, next) => {
  // Authorization 헤더에서 토큰 추출
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: '인증 토큰이 필요합니다',
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }

  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: '유효한 인증 토큰이 필요합니다',
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }

  try {
    // 토큰 검증
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'TOKEN_EXPIRED',
        message: '만료된 토큰입니다',
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    }
    
    return res.status(401).json({
      error: 'INVALID_TOKEN',
      message: '유효하지 않은 토큰입니다',
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }
};

/**
 * 관리자 권한이 있는지 확인하는 미들웨어
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: '인증이 필요합니다',
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: '관리자 권한이 필요합니다',
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }

  next();
};

/**
 * 모더레이터 이상의 권한이 있는지 확인하는 미들웨어
 */
const requireModerator = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: '인증이 필요합니다',
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: '모더레이터 이상의 권한이 필요합니다',
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    });
  }

  next();
};

module.exports = {
  authenticateJWT,
  requireAdmin,
  requireModerator
};