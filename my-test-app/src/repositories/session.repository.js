const Session = require('../models/session.model');

/**
 * Session 리포지토리 - 세션 데이터 액세스 계층
 */
class SessionRepository {
  /**
   * 사용자 ID로 세션 찾기
   * @param {string} userId - 사용자 ID
   * @param {boolean} activeOnly - 활성 세션만 조회할지 여부
   * @param {number} limit - 페이지당 항목 수
   * @param {number} offset - 건너뛸 항목 수
   * @returns {Promise<Object>} 세션 목록과 페이지네이션 정보
   */
  async findByUserId(userId, activeOnly = true, limit = 20, offset = 0) {
    const filter = { userId };
    if (activeOnly) {
      filter.isActive = true;
      filter.expiresAt = { $gt: new Date() };
    }
    
    const total = await Session.countDocuments(filter);
    const sessions = await Session.find(filter)
      .sort({ lastAccessAt: -1 })
      .skip(offset)
      .limit(limit);
    
    return {
      data: sessions,
      pagination: {
        total,
        limit,
        offset,
        page: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit),
        hasNext: offset + limit < total,
        hasPrev: offset > 0
      }
    };
  }

  /**
   * 토큰으로 세션 찾기
   * @param {string} token - 세션 토큰
   * @returns {Promise<Session>} 세션 객체
   */
  async findByToken(token) {
    return await Session.findOne({ token, isActive: true, expiresAt: { $gt: new Date() } });
  }

  /**
   * 세션 ID로 세션 찾기
   * @param {string} id - 세션 ID
   * @returns {Promise<Session>} 세션 객체
   */
  async findById(id) {
    return await Session.findById(id);
  }

  /**
   * 새 세션 생성
   * @param {Object} sessionData - 세션 데이터
   * @returns {Promise<Session>} 생성된 세션 객체
   */
  async create(sessionData) {
    const session = new Session(sessionData);
    return await session.save();
  }

  /**
   * 세션 비활성화
   * @param {string} id - 세션 ID
   * @returns {Promise<Session>} 업데이트된 세션 객체
   */
  async deactivate(id) {
    return await Session.findByIdAndUpdate(id, { isActive: false }, { new: true });
  }

  /**
   * 사용자의 모든 세션 비활성화
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object>} 업데이트 결과
   */
  async deactivateAllForUser(userId) {
    return await Session.updateMany(
      { userId, isActive: true },
      { isActive: false }
    );
  }

  /**
   * 세션 정보 업데이트
   * @param {string} id - 세션 ID
   * @param {Object} updateData - 업데이트할 데이터
   * @returns {Promise<Session>} 업데이트된 세션 객체
   */
  async update(id, updateData) {
    return await Session.findByIdAndUpdate(id, updateData, { new: true });
  }

  /**
   * 만료된 세션 정리
   * @returns {Promise<Object>} 정리 결과
   */
  async cleanupExpiredSessions() {
    return await Session.deleteMany({
      $or: [
        { expiresAt: { $lt: new Date() } },
        { isActive: false }
      ]
    });
  }
}

module.exports = new SessionRepository();