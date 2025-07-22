const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validator');
const authService = require('../services/auth.service');

const router = express.Router();

/**
 * 회원가입 라우트
 * POST /auth/signup
 */
router.post('/signup', [
  // 유효성 검사 규칙
  body('email')
    .isEmail().withMessage('유효한 이메일 주소를 입력하세요'),
  body('password')
    .isLength({ min: 8, max: 128 }).withMessage('비밀번호는 8~128자 사이어야 합니다')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다'),
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 }).withMessage('사용자명은 3~30자 사이어야 합니다')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('사용자명은 영문자, 숫자, 언더스코어만 포함할 수 있습니다'),
  body('firstName')
    .optional()
    .isLength({ max: 50 }).withMessage('이름은 최대 50자까지 가능합니다'),
  body('lastName')
    .optional()
    .isLength({ max: 50 }).withMessage('성은 최대 50자까지 가능합니다'),
  body('acceptTerms')
    .isBoolean().withMessage('이용약관 동의 여부는 불리언 값이어야 합니다')
    .equals('true').withMessage('이용약관에 동의해야 합니다'),
  validate
], async (req, res, next) => {
  try {
    // IP 주소와 사용자 에이전트 정보 추가
    const userData = {
      ...req.validData,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    };
    
    const result = await authService.signup(userData);
    
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 로그인 라우트
 * POST /auth/signin
 */
router.post('/signin', [
  body('email')
    .isEmail().withMessage('유효한 이메일 주소를 입력하세요'),
  body('password')
    .notEmpty().withMessage('비밀번호를 입력하세요'),
  body('rememberMe')
    .optional()
    .isBoolean().withMessage('로그인 상태 유지 여부는 불리언 값이어야 합니다'),
  body('twoFactorCode')
    .optional()
    .matches(/^[0-9]{6}$/).withMessage('2FA 코드는 6자리 숫자여야 합니다'),
  validate
], async (req, res, next) => {
  try {
    // IP 주소와 사용자 에이전트 정보 추가
    const credentials = {
      ...req.validData,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    };
    
    const result = await authService.signin(credentials);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 토큰 갱신 라우트
 * POST /auth/refresh
 */
router.post('/refresh', [
  body('refreshToken')
    .notEmpty().withMessage('리프레시 토큰이 필요합니다'),
  validate
], async (req, res, next) => {
  try {
    const { refreshToken } = req.validData;
    
    const result = await authService.refreshToken(refreshToken);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * 로그아웃 라우트
 * POST /auth/signout
 */
router.post('/signout', [
  body('refreshToken')
    .notEmpty().withMessage('리프레시 토큰이 필요합니다'),
  validate
], async (req, res, next) => {
  try {
    const { refreshToken } = req.validData;
    
    await authService.signout(refreshToken);
    
    res.status(200).json({
      success: true,
      message: '로그아웃 되었습니다',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 모든 디바이스에서 로그아웃 라우트
 * POST /auth/signout-all
 */
router.post('/signout-all', async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    await authService.signoutAll(userId);
    
    res.status(200).json({
      success: true,
      message: '모든 디바이스에서 로그아웃 되었습니다',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 이메일 인증 라우트
 * POST /auth/verify-email
 */
router.post('/verify-email', [
  body('token')
    .notEmpty().withMessage('인증 토큰이 필요합니다'),
  validate
], async (req, res, next) => {
  try {
    const { token } = req.validData;
    
    await authService.verifyEmail(token);
    
    res.status(200).json({
      success: true,
      message: '이메일 인증이 완료되었습니다',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 인증 이메일 재발송 라우트
 * POST /auth/resend-verification
 */
router.post('/resend-verification', async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    await authService.resendVerificationEmail(userId);
    
    res.status(200).json({
      success: true,
      message: '인증 이메일이 발송되었습니다',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 비밀번호 재설정 요청 라우트
 * POST /auth/password-reset
 */
router.post('/password-reset', [
  body('email')
    .isEmail().withMessage('유효한 이메일 주소를 입력하세요'),
  validate
], async (req, res, next) => {
  try {
    const { email } = req.validData;
    
    await authService.requestPasswordReset(email);
    
    // 보안을 위해 항상 성공 응답 (이메일이 존재하지 않더라도)
    res.status(200).json({
      success: true,
      message: '비밀번호 재설정 이메일이 발송되었습니다',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 비밀번호 재설정 확인 라우트
 * POST /auth/password-reset/confirm
 */
router.post('/password-reset/confirm', [
  body('token')
    .notEmpty().withMessage('인증 토큰이 필요합니다'),
  body('newPassword')
    .isLength({ min: 8, max: 128 }).withMessage('비밀번호는 8~128자 사이어야 합니다')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다'),
  validate
], async (req, res, next) => {
  try {
    const { token, newPassword } = req.validData;
    
    await authService.confirmPasswordReset(token, newPassword);
    
    res.status(200).json({
      success: true,
      message: '비밀번호가 재설정되었습니다',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;