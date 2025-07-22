/**
 * 에러 처리 미들웨어
 */
const errorHandler = (err, req, res, next) => {
  // 기본 상태 코드는 500 (서버 오류)
  const statusCode = err.statusCode || 500;
  
  // 에러 응답 생성
  const errorResponse = {
    error: err.code || 'INTERNAL_SERVER_ERROR',
    message: err.message || '서버 내부 오류가 발생했습니다',
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  };

  // 개발 환경에서만 스택 정보 추가
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // 필드 유효성 검사 오류가 있는 경우
  if (err.errors) {
    errorResponse.fields = err.errors;
  }

  // 에러 로깅
  console.error(`[${statusCode}] ${err.message}`, err.stack);
  
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found 핸들러
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: '요청한 리소스를 찾을 수 없습니다',
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};