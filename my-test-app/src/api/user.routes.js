const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validator');
const { authenticateJWT } = require('../middlewares/auth');
const userService = require('../services/user.service');

const router = express.Router();

/**
 * 내 프로필 조회 라우트
 * GET /users/me
 */
router.get('/me', authenticateJWT, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const user = await userService.getUserById(userId);
    
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * 내 프로필 수정 라우트
 * PUT /users/me
 */
router.put('/me', [
  authenticateJWT,
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
  body('avatar')
    .optional()
    .isURL().withMessage('유효한 URL을 입력하세요'),
  validate
], async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profileData = req.validData;
    
    const updatedUser = await userService.updateProfile(userId, profileData);
    
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
});

/**
 * 비밀번호 변경 라우트
 * PUT /users/me/password
 */
router.put('/me/password', [
  authenticateJWT,
  body('currentPassword')
    .notEmpty().withMessage('현재 비밀번호를 입력하세요'),
  body('newPassword')
    .isLength({ min: 8, max: 128 }).withMessage('비밀번호는 8~128자 사이어야 합니다')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다'),
  validate
], async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.validData;
    
    await userService.changePassword(userId, currentPassword, newPassword);
    
    res.status(200).json({
      success: true,
      message: '비밀번호가 변경되었습니다',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 계정 비활성화 라우트
 * POST /users/me/deactivate
 */
router.post('/me/deactivate', authenticateJWT, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    await userService.deactivateAccount(userId);
    
    res.status(200).json({
      success: true,
      message: '계정이 비활성화되었습니다',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 계정 삭제 라우트
 * DELETE /users/me/delete
 */
router.delete('/me/delete', authenticateJWT, async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    await userService.deleteAccount(userId);
    
    res.status(200).json({
      success: true,
      message: '계정이 삭제되었습니다',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;