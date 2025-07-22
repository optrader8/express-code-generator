const SecurityLog = require('../models/security-log.model');

/**
 * SecurityLog 리포지토리 - 보안 로그 데이터 액세스 계층
 */
class SecurityLogRepository {
  /**
   * 새 보안 로그 생성
   * @param {Object} logData - 로그 데이터
   * @returns {Promise<SecurityLog>} 생성된 로그 객체
   */
  async create(logData) {
    const log = new SecurityLog(logData);
    return await log.save();
  }

  /**
   * 사용자 ID로 보안 로그 조회
   * @param {string} userId - 사용자 ID
   * @param {Object} filter - 추가 필터링 조건
   * @param {number} limit - 페이지당 항목 수
   * @param {number} offset - 건너뛸 항목 수
   * @returns {Promise<Object>} 로그 목록과 페이지네이션 정보
   */
  async findByUserId(userId, filter = {}, limit = 20, offset = 0) {
    const query = { userId, ...filter };
    
    const total = await SecurityLog.countDocuments(query);
    const logs = await SecurityLog.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
    
    return {
      data: logs,
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
   * 모든 보안 로그 조회 (관리자용)
   * @param {Object} filter - 필터링 조건
   * @param {number} limit - 페이지당 항목 수
   * @param {number} offset - 건너뛸 항목 수
   * @returns {Promise<Object>} 로그 목록과 페이지네이션 정보
   */
  async findAll(filter = {}, limit = 20, offset = 0) {
    const total = await SecurityLog.countDocuments(filter);
    const logs = await SecurityLog.find(filter)
      .populate('userId', 'email username')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
    
    return {
      data: logs,
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
   * 특정 기간의 보안 로그 조회
   * @param {Date} startDate - 시작 날짜
   * @param {Date} endDate - 종료 날짜
   * @param {Object} filter - 추가 필터링 조건
   * @returns {Promise<SecurityLog[]>} 로그 목록
   */
  async findByDateRange(startDate, endDate, filter = {}) {
    const query = {
      ...filter,
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    };
    
    return await SecurityLog.find(query).sort({ createdAt: -1 });
  }

  /**
   * 이벤트 타입별 보안 로그 조회
   * @param {string} eventType - 이벤트 타입
   * @param {Object} filter - 추가 필터링 조건
   * @param {number} limit - 페이지당 항목 수
   * @param {number} offset - 건너뛸 항목 수
   * @returns {Promise<Object>} 로그 목록과 페이지네이션 정보
   */
  async findByEventType(eventType, filter = {}, limit = 20, offset = 0) {
    const query = { eventType, ...filter };
    
    const total = await SecurityLog.countDocuments(query);
    const logs = await SecurityLog.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
    
    return {
      data: logs,
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
}

module.exports = new SecurityLogRepository();