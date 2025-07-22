const { getSessionModel } = require('../models/session.model');

/**
 * Session 리포지토리 - 세션 데이터 액세스 계층
 */
class SessionRepository {
  /**
   * Session 모델을 지연 로딩으로 가져오기
   */
  getModel() {
    return getSessionModel();
  }

  /**
   * 사용자 ID로 세션 찾기
   * @param {string} userId - 사용자 ID
   * @param {boolean} activeOnly - 활성 세션만 조회할지 여부
   * @param {number} limit - 페이지당 항목 수
   * @param {number} offset - 건너뛸 항목 수
   * @returns {Promise<Object>} 세션 목록과 페이지네이션 정보
   */
  async findByUserId(userId, activeOnly = true, limit = 20, offset = 0) {
    const Session = this.getModel();
    const dbConfig = require('../config/database').dbConfig;
    
    if (dbConfig.defaultType === 'mongodb') {
      // MongoDB 쿼리
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
    } else {
      // Sequelize 쿼리
      const { Op } = require('sequelize');
      const filter = { userId };
      if (activeOnly) {
        filter.isActive = true;
        filter.expiresAt = { [Op.gt]: new Date() };
      }
      
      const { count, rows } = await Session.findAndCountAll({
        where: filter,
        order: [['lastAccessAt', 'DESC']],
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

  /**
   * 토큰으로 세션 찾기
   * @param {string} token - 세션 토큰
   * @returns {Promise<Session>} 세션 객체
   */
  async findByToken(token) {
    const Session = this.getModel();
    const dbConfig = require('../config/database').dbConfig;
    
    if (dbConfig.defaultType === 'mongodb') {
      return await Session.findOne({ token, isActive: true, expiresAt: { $gt: new Date() } });
    } else {
      const { Op } = require('sequelize');
      return await Session.findOne({
        where: {
          token,
          isActive: true,
          expiresAt: { [Op.gt]: new Date() }
        }
      });
    }
  }

  /**
   * 세션 ID로 세션 찾기
   * @param {string} id - 세션 ID
   * @returns {Promise<Session>} 세션 객체
   */
  async findById(id) {
    const Session = this.getModel();
    const dbConfig = require('../config/database').dbConfig;
    
    if (dbConfig.defaultType === 'mongodb') {
      return await Session.findById(id);
    } else {
      return await Session.findByPk(id);
    }
  }

  /**
   * 새 세션 생성
   * @param {Object} sessionData - 세션 데이터
   * @returns {Promise<Session>} 생성된 세션 객체
   */
  async create(sessionData) {
    const Session = this.getModel();
    const dbConfig = require('../config/database').dbConfig;
    
    if (dbConfig.defaultType === 'mongodb') {
      const session = new Session(sessionData);
      return await session.save();
    } else {
      return await Session.create(sessionData);
    }
  }

  /**
   * 세션 비활성화
   * @param {string} id - 세션 ID
   * @returns {Promise<Session>} 업데이트된 세션 객체
   */
  async deactivate(id) {
    const Session = this.getModel();
    const dbConfig = require('../config/database').dbConfig;
    
    if (dbConfig.defaultType === 'mongodb') {
      return await Session.findByIdAndUpdate(id, { isActive: false }, { new: true });
    } else {
      const [updatedRowsCount, updatedRows] = await Session.update(
        { isActive: false },
        { where: { id }, returning: true }
      );
      return updatedRowsCount > 0 ? updatedRows[0] : null;
    }
  }

  /**
   * 사용자의 모든 세션 비활성화
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object>} 업데이트 결과
   */
  async deactivateAllForUser(userId) {
    const Session = this.getModel();
    const dbConfig = require('../config/database').dbConfig;
    
    if (dbConfig.defaultType === 'mongodb') {
      return await Session.updateMany(
        { userId, isActive: true },
        { isActive: false }
      );
    } else {
      return await Session.update(
        { isActive: false },
        { where: { userId, isActive: true } }
      );
    }
  }

  /**
   * 세션 정보 업데이트
   * @param {string} id - 세션 ID
   * @param {Object} updateData - 업데이트할 데이터
   * @returns {Promise<Session>} 업데이트된 세션 객체
   */
  async update(id, updateData) {
    const Session = this.getModel();
    const dbConfig = require('../config/database').dbConfig;
    
    if (dbConfig.defaultType === 'mongodb') {
      return await Session.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      const [updatedRowsCount, updatedRows] = await Session.update(
        updateData,
        { where: { id }, returning: true }
      );
      return updatedRowsCount > 0 ? updatedRows[0] : null;
    }
  }

  /**
   * 만료된 세션 정리
   * @returns {Promise<Object>} 정리 결과
   */
  async cleanupExpiredSessions() {
    const Session = this.getModel();
    const dbConfig = require('../config/database').dbConfig;
    
    if (dbConfig.defaultType === 'mongodb') {
      return await Session.deleteMany({
        $or: [
          { expiresAt: { $lt: new Date() } },
          { isActive: false }
        ]
      });
    } else {
      const { Op } = require('sequelize');
      return await Session.destroy({
        where: {
          [Op.or]: [
            { expiresAt: { [Op.lt]: new Date() } },
            { isActive: false }
          ]
        }
      });
    }
  }
}

module.exports = new SessionRepository();