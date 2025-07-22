const { getSecurityLogModel } = require('../models/security-log.model');

/**
 * SecurityLog 리포지토리 - 보안 로그 데이터 액세스 계층
 */
class SecurityLogRepository {
  /**
   * SecurityLog 모델을 지연 로딩으로 가져오기
   */
  getModel() {
    return getSecurityLogModel();
  }

  /**
   * 새 보안 로그 생성
   * @param {Object} logData - 로그 데이터
   * @returns {Promise<SecurityLog>} 생성된 로그 객체
   */
  async create(logData) {
    const SecurityLog = this.getModel();
    const dbConfig = require('../config/database').dbConfig;
    
    if (dbConfig.defaultType === 'mongodb') {
      const log = new SecurityLog(logData);
      return await log.save();
    } else {
      return await SecurityLog.create(logData);
    }
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
    const SecurityLog = this.getModel();
    const dbConfig = require('../config/database').dbConfig;
    
    if (dbConfig.defaultType === 'mongodb') {
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
    } else {
      const whereClause = { userId, ...filter };
      
      const { count, rows } = await SecurityLog.findAndCountAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        offset,
        limit
      });
      
      return {
        data: rows,
        pagination: {
          total: count,
          limit,
          offset,
          page: Math.floor(offset / limit) + 1,
          totalPages: Math.ceil(count / limit),
          hasNext: offset + limit < count,
          hasPrev: offset > 0
        }
      };
    }
  }
}

module.exports = new SecurityLogRepository();