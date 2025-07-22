const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const userRepository = require('../repositories/user.repository');
const sessionRepository = require('../repositories/session.repository');
const jwtConfig = require('../config/jwt');

/**
 * 인증 관련 서비스
 */
class AuthService {
  /**
   * 회원가입
   * @param {Object} userData - 사용자 등록 데이터
   * @returns {Promise<Object>} 생성된 사용자와 토큰
   */
  async signup(userData) {
    // 이메일 중복 확인
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      const error = new Error('이미 등록된 이메일입니다');
      error.statusCode = 409;
      error.code = 'EMAIL_ALREADY_EXISTS';
      throw error;
    }

    // 사용자명 중복 확인 (있는 경우)
    if (userData.username) {
      const existingUsername = await userRepository.findByUsername(userData.username);
      if (existingUsername) {
        const error = new Error('이미 사용 중인 사용자명입니다');
        error.statusCode = 409;
        error.code = 'USERNAME_ALREADY_EXISTS';
        throw error;
      }
    }

    // 이메일 인증 토큰 생성 (실제로는 이메일 발송 로직이 추가되어야 함)
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24시간 후 만료

    // 사용자 생성
    const user = await userRepository.create({
      ...userData,
      emailVerificationToken,
      emailVerificationExpires,
      emailVerified: false
    });

    // 토큰 생성
    const tokens = await this._generateTokens(user);

    // 세션 생성
    await this._createSession(user._id, tokens.refreshToken, {
      userAgent: userData.userAgent,
      ipAddress: userData.ipAddress
    });

    return {
      ...tokens,
      user
    };
  }

  /**
   * 로그인
   * @param {Object} credentials - 로그인 자격 증명
   * @returns {Promise<Object>} 사용자와 토큰
   */
  async signin(credentials) {
    const { email, password, userAgent, ipAddress, rememberMe, twoFactorCode } = credentials;

    // 사용자 찾기
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('이메일 또는 비밀번호가 잘못되었습니다');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    // 계정 상태 확인
    if (user.status === 'suspended') {
      const error = new Error('계정이 정지되었습니다');
      error.statusCode = 423;
      error.code = 'ACCOUNT_SUSPENDED';
      error.details = { until: user.suspendedUntil, reason: user.suspensionReason };
      throw error;
    }

    if (user.status === 'deleted') {
      const error = new Error('존재하지 않는 계정입니다');
      error.statusCode = 401;
      error.code = 'ACCOUNT_DELETED';
      throw error;
    }

    // 비밀번호 확인
    const isPasswordValid = await userRepository.verifyPassword(user, password);
    if (!isPasswordValid) {
      const error = new Error('이메일 또는 비밀번호가 잘못되었습니다');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    // 2FA 확인 (활성화된 경우)
    if (user.twoFactorEnabled) {
      // 실제 구현에서는 TOTP 검증 로직이 필요
      if (!twoFactorCode) {
        const error = new Error('2단계 인증 코드가 필요합니다');
        error.statusCode = 401;
        error.code = 'TWO_FACTOR_REQUIRED';
        throw error;
      }

      // 여기에 2FA 코드 검증 로직 추가
      const is2FAValid = true; // 실제로는 검증해야 함
      
      if (!is2FAValid) {
        const error = new Error('유효하지 않은 2단계 인증 코드입니다');
        error.statusCode = 401;
        error.code = 'INVALID_TWO_FACTOR_CODE';
        throw error;
      }
    }

    // 토큰 생성
    const tokens = await this._generateTokens(user, rememberMe);

    // 세션 생성
    await this._createSession(user._id, tokens.refreshToken, {
      userAgent,
      ipAddress
    });

    // 마지막 로그인 시간 업데이트
    await userRepository.update(user._id, { lastLoginAt: new Date() });

    return {
      ...tokens,
      user
    };
  }

  /**
   * 로그아웃
   * @param {string} refreshToken - 리프레시 토큰
   * @returns {Promise<boolean>} 로그아웃 성공 여부
   */
  async signout(refreshToken) {
    const session = await sessionRepository.findByToken(refreshToken);
    if (!session) {
      return false;
    }

    await sessionRepository.deactivate(session._id);
    return true;
  }

  /**
   * 모든 기기에서 로그아웃
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object>} 로그아웃 결과
   */
  async signoutAll(userId) {
    return await sessionRepository.deactivateAllForUser(userId);
  }

  /**
   * 토큰 갱신
   * @param {string} refreshToken - 리프레시 토큰
   * @returns {Promise<Object>} 새로운 토큰과 사용자 정보
   */
  async refreshToken(refreshToken) {
    // 리프레시 토큰으로 세션 찾기
    const session = await sessionRepository.findByToken(refreshToken);
    if (!session) {
      const error = new Error('유효하지 않은 리프레시 토큰입니다');
      error.statusCode = 401;
      error.code = 'INVALID_REFRESH_TOKEN';
      throw error;
    }

    // 사용자 조회
    const user = await userRepository.findById(session.userId);
    if (!user || user.status !== 'active') {
      await sessionRepository.deactivate(session._id);
      const error = new Error('존재하지 않거나 비활성화된 계정입니다');
      error.statusCode = 401;
      error.code = 'INVALID_USER';
      throw error;
    }

    // 새 토큰 생성 (rememberMe는 기존 세션의 만료 시간에 따라 결정)
    const isLongSession = session.expiresAt.getTime() - Date.now() > 24 * 60 * 60 * 1000;
    const tokens = await this._generateTokens(user, isLongSession);

    // 기존 세션 비활성화 및 새 세션 생성
    await sessionRepository.deactivate(session._id);
    await this._createSession(user._id, tokens.refreshToken, {
      userAgent: session.userAgent,
      ipAddress: session.ipAddress
    });

    return {
      ...tokens,
      user
    };
  }

  /**
   * 토큰 생성
   * @private
   * @param {User} user - 사용자 객체
   * @param {boolean} rememberMe - 로그인 유지 여부
   * @returns {Promise<Object>} 액세스 토큰과 리프레시 토큰
   */
  async _generateTokens(user, rememberMe = false) {
    // 페이로드에 필요한 정보만 포함
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role
    };

    // 액세스 토큰 생성
    const accessToken = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.accessExpiresIn
    });

    // 리프레시 토큰 생성 (로그인 유지 시 더 긴 만료 시간)
    const refreshExpiresIn = rememberMe ? '30d' : jwtConfig.refreshExpiresIn;
    const refreshToken = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: refreshExpiresIn
    });

    // 토큰 만료 시간 계산 (초 단위)
    const tokenInfo = jwt.decode(accessToken);
    const expiresIn = tokenInfo.exp - Math.floor(Date.now() / 1000);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn
    };
  }

  /**
   * 세션 생성
   * @private
   * @param {string} userId - 사용자 ID
   * @param {string} token - 리프레시 토큰
   * @param {Object} sessionInfo - 세션 정보
   * @returns {Promise<Session>} 생성된 세션
   */
  async _createSession(userId, token, sessionInfo) {
    // 토큰 디코딩하여 만료 시간 확인
    const decoded = jwt.decode(token);
    const expiresAt = new Date(decoded.exp * 1000);

    return await sessionRepository.create({
      userId,
      token,
      deviceInfo: sessionInfo.userAgent,
      ipAddress: sessionInfo.ipAddress,
      userAgent: sessionInfo.userAgent,
      isActive: true,
      expiresAt,
      lastAccessAt: new Date()
    });
  }

  /**
   * 이메일 인증
   * @param {string} token - 이메일 인증 토큰
   * @returns {Promise<boolean>} 인증 성공 여부
   */
  async verifyEmail(token) {
    const user = await userRepository.findOne({ emailVerificationToken: token });
    if (!user || user.emailVerificationExpires < new Date()) {
      const error = new Error('유효하지 않거나 만료된 토큰입니다');
      error.statusCode = 400;
      error.code = 'INVALID_TOKEN';
      throw error;
    }

    await userRepository.update(user._id, {
      emailVerified: true,
      emailVerificationToken: undefined,
      emailVerificationExpires: undefined
    });

    return true;
  }

  /**
   * 비밀번호 재설정 요청
   * @param {string} email - 사용자 이메일
   * @returns {Promise<boolean>} 요청 성공 여부
   */
  async requestPasswordReset(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // 보안상 사용자가 존재하지 않아도 성공 응답
      return true;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1시간 후 만료

    await userRepository.update(user._id, {
      passwordResetToken: token,
      passwordResetExpires: expiresAt
    });

    // 여기에 이메일 발송 로직 추가

    return true;
  }

  /**
   * 비밀번호 재설정 확인
   * @param {string} token - 비밀번호 재설정 토큰
   * @param {string} newPassword - 새 비밀번호
   * @returns {Promise<boolean>} 재설정 성공 여부
   */
  async confirmPasswordReset(token, newPassword) {
    const user = await userRepository.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      const error = new Error('유효하지 않거나 만료된 토큰입니다');
      error.statusCode = 400;
      error.code = 'INVALID_TOKEN';
      throw error;
    }

    await userRepository.update(user._id, {
      password: newPassword,
      passwordResetToken: undefined,
      passwordResetExpires: undefined
    });

    // 모든 세션 종료 (비밀번호 변경 시 보안을 위해)
    await sessionRepository.deactivateAllForUser(user._id);

    return true;
  }
}

module.exports = new AuthService();