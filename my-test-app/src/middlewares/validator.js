const { validationResult, matchedData } = require('express-validator');

/**
 * express-validator를 사용한 유효성 검사 미들웨어
 * @param {Array} validations - 유효성 검사 규칙 배열
 * @returns {Function} 미들웨어 함수
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // 모든 유효성 검사 규칙 실행
    await Promise.all(validations.map(validation => validation.run(req)));

    // 유효성 검사 결과 확인
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      // 유효성 검사를 통과한 데이터만 추출하여 req.validData에 저장
      req.validData = matchedData(req);
      return next();
    }

    // 유효성 검사 오류가 있는 경우 오류 응답 반환
    const formattedErrors = {};
    
    errors.array().forEach(error => {
      if (!formattedErrors[error.path]) {
        formattedErrors[error.path] = [];
      }
      formattedErrors[error.path].push(error.msg);
    });

    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: '입력 데이터 검증에 실패했습니다',
      fields: formattedErrors,
      timestamp: new Date().toISOString()
    });
  };
};

module.exports = {
  validate
};