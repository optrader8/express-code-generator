const userRepository = require('../repositories/user.repository');
const securityLogRepository = require('../repositories/security-log.repository');
const sessionRepository = require('../repositories/session.repository');

/**
 * 사용자 관련 서비스
 */
class UserService {
  /**
   * ID로 사용자 조회
   * @param {string} id - 사용자 ID
   * @returns {Promise<User>} 사용자 객체
   */
  async getUserById(id) {
    const user = await userRepository.findById(id);
    
    if (!user) {
      const error = new Error('사용자를 찾을 수 없습니다');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }
    
    return user;
  }

  /**
   * 프로필 업데이트
   * @param {string} userId - 사용자 ID
   * @param {Object} profileData - 업데이트할 프로필 데이터
   * @returns {Promise<User>} 업데이트된 사용자 객체
   */
  async updateProfile(userId, profileData) {
    // 사용자 존재 여부 확인
    const user = await userRepository.findById(userId);
    
    if (!user) {
      const error = new Error('사용자를 찾을 수 없습니다');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }
    
    // 사용자명 변경 시 중복 확인
    if (profileData.username && profileData.username !== user.username) {
      const existingUsername = await userRepository.findByUsername(profileData.username);
      
      if (existingUsername) {
        const error = new Error('이미 사용 중인 사용자명입니다');
        error.statusCode = 409;
        error.code = 'USERNAME_ALREADY_EXISTS';
        throw error;
      }
    }
    
    // 프로필 업데이트
    const updatedUser = await userRepository.update(userId, profileData);
    
    // 보안 로그 기록
    await securityLogRepository.create({
      userId,
      eventType: 'profile_updated',
      details: { updatedFields: Object.keys(profileData) }
    });
    
    return updatedUser;
  }

  /**
   * 비밀번호 변경
   * @param {string} userId - 사용자 ID
   * @param {string} currentPassword - 현재 비밀번호
   * @param {string} newPassword - 새 비밀번호
   * @returns {Promise<boolean>} 변경 성공 여부
   */
  async changePassword(userId, currentPassword, newPassword) {
    // 사용자 조회
    const user = await userRepository.findById(userId);
    
    if (!user) {
      const error = new Error('사용자를 찾을 수 없습니다');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }
    
    // 현재 비밀번호 확인
    const isPasswordValid = await userRepository.verifyPassword(user, currentPassword);
    
    if (!isPasswordValid) {
      const error = new Error('현재 비밀번호가 올바르지 않습니다');
      error.statusCode = 401;
      error.code = 'INVALID_PASSWORD';
      throw error;
    }
    
    // 새 비밀번호가 이전 비밀번호와 같은지 확인
    const isSamePassword = await userRepository.verifyPassword(user, newPassword);
    
    if (isSamePassword) {
      const error = new Error('새 비밀번호는 현재 비밀번호와 달라야 합니다');
      error.statusCode = 400;
      error.code = 'SAME_PASSWORD';
      throw error;
    }
    
    // 비밀번호 업데이트
    await userRepository.update(userId, { password: newPassword });
    
    // 보안 로그 기록
    await securityLogRepository.create({
      userId,
      eventType: 'password_changed'
    });
    
    // 비밀번호 변경 시 모든 세션 종료 (보안 조치)
    await sessionRepository.deactivateAllForUser(userId);
    
    return true;
  }

  /**
   * 계정 비활성화
   * @param {string} userId - 사용자 ID
   * @returns {Promise<boolean>} 비활성화 성공 여부
   */
  async deactivateAccount(userId) {
    // 사용자 조회
    const user = await userRepository.findById(userId);
    
    if (!user) {
      const error = new Error('사용자를 찾을 수 없습니다');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }
    
    // 계정 상태 업데이트
    await userRepository.updateStatus(userId, 'inactive');
    
    // 모든 세션 종료
    await sessionRepository.deactivateAllForUser(userId);
    
    // 보안 로그 기록
    await securityLogRepository.create({
      userId,
      eventType: 'account_locked',
      details: { reason: 'user_requested' }
    });
    
    return true;
  }

  /**
   * 계정 영구 삭제
   * @param {string} userId - 사용자 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async deleteAccount(userId) {
    // 사용자 조회
    const user = await userRepository.findById(userId);
    
    if (!user) {
      const error = new Error('사용자를 찾을 수 없습니다');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }
    
    // 계정 삭제 처리 (실제로는 상태만 변경하고 개인정보는 익명화하는 것이 일반적)
    await userRepository.updateStatus(userId, 'deleted');
    
    // 중요한 개인정보 익명화
    await userRepository.update(userId, {
      email: `deleted_${userId}@example.com`,
      username: `deleted_${userId}`,
      firstName: null,
      lastName: null,
      avatar: null,
      password: crypto.randomBytes(16).toString('hex') // 랜덤 비밀번호로 변경
    });
    
    // 모든 세션 종료
    await sessionRepository.deactivateAllForUser(userId);
    
    // 보안 로그 기록
    await securityLogRepository.create({
      userId,
      eventType: 'account_deleted'
    });
    
    return true;
  }

  /**
   * 사용자 관리 (관리자 기능)
   */

  /**
   * 모든 사용자 조회 (관리자)
   * @param {Object} filter - 필터링 조건
   * @param {number} limit - 페이지당 항목 수
   * @param {number} offset - 건너뛸 항목 수
   * @returns {Promise<Object>} 사용자 목록과 페이지네이션 정보
   */
  async getAllUsers(filter = {}, limit = 20, offset = 0) {
    return await userRepository.findAll(filter, limit, offset);
  }

  /**
   * 사용자 역할 변경 (관리자)
   * @param {string} userId - 사용자 ID
   * @param {string} role - 새 역할
   * @returns {Promise<User>} 업데이트된 사용자 객체
   */
  async updateUserRole(userId, role) {
    // 사용자 조회
    const user = await userRepository.findById(userId);
    
    if (!user) {
      const error = new Error('사용자를 찾을 수 없습니다');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }
    
    // 역할 업데이트
    const updatedUser = await userRepository.update(userId, { role });
    
    // 보안 로그 기록
    await securityLogRepository.create({
      userId,
      eventType: 'role_updated',
      details: { oldRole: user.role, newRole: role }
    });
    
    return updatedUser;
  }

  /**
   * 사용자 계정 정지 (관리자)
   * @param {string} userId - 사용자 ID
   * @param {string} reason - 정지 사유
   * @param {Date} until - 정지 해제 시간
   * @returns {Promise<User>} 업데이트된 사용자 객체
   */
  async suspendUser(userId, reason, until) {
    // 사용자 조회
    const user = await userRepository.findById(userId);
    
    if (!user) {
      const error = new Error('사용자를 찾을 수 없습니다');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }
    
    // 정지 처리
    const updatedUser = await userRepository.update(userId, {
      status: 'suspended',
      suspendedUntil: until,
      suspensionReason: reason
    });
    
    // 모든 세션 종료
    await sessionRepository.deactivateAllForUser(userId);
    
    // 보안 로그 기록
    await securityLogRepository.create({
      userId,
      eventType: 'account_suspended',
      details: { reason, until }
    });
    
    return updatedUser;
  }

  /**
   * 사용자 계정 정지 해제 (관리자)
   * @param {string} userId - 사용자 ID
   * @returns {Promise<User>} 업데이트된 사용자 객체
   */
  async unsuspendUser(userId) {
    // 사용자 조회
    const user = await userRepository.findById(userId);
    
    if (!user) {
      const error = new Error('사용자를 찾을 수 없습니다');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }
    
    // 정지 해제
    const updatedUser = await userRepository.update(userId, {
      status: 'active',
      suspendedUntil: null,
      suspensionReason: null
    });
    
    // 보안 로그 기록
    await securityLogRepository.create({
      userId,
      eventType: 'account_unsuspended'
    });
    
    return updatedUser;
  }
}

module.exports = new UserService();