const { getUserModel } = require('../models/user.model');
const bcrypt = require('bcryptjs');

/**
 * User 리포지토리 - 사용자 데이터 액세스 계층
 */
class UserRepository {
  /**
   * User 모델을 지연 로딩으로 가져오기
   */
  getModel() {
    return getUserModel();
  }

  /**
   * 이메일로 사용자 찾기
   * @param {string} email - 사용자 이메일
   * @returns {Promise<User>} 사용자 객체
   */
  async findByEmail(email) {
    const User = this.getModel();
    return await User.findOne({ where: { email } });
  }

  /**
   * ID로 사용자 찾기
   * @param {string} id - 사용자 ID
   * @returns {Promise<User>} 사용자 객체
   */
  async findById(id) {
    const User = this.getModel();
    return await User.findByPk(id);
  }

  /**
   * 사용자명으로 사용자 찾기
   * @param {string} username - 사용자명
   * @returns {Promise<User>} 사용자 객체
   */
  async findByUsername(username) {
    const User = this.getModel();
    return await User.findOne({ where: { username } });
  }

  /**
   * 새 사용자 생성
   * @param {Object} userData - 사용자 데이터
   * @returns {Promise<User>} 생성된 사용자 객체
   */
  async create(userData) {
    const User = this.getModel();
    return await User.create(userData);
  }

  /**
   * 사용자 정보 업데이트
   * @param {string} id - 사용자 ID
   * @param {Object} updateData - 업데이트할 데이터
   * @returns {Promise<User>} 업데이트된 사용자 객체
   */
  async update(id, updateData) {
    const User = this.getModel();
    const [updatedRowsCount, updatedRows] = await User.update(updateData, {
      where: { id },
      returning: true
    });
    
    return updatedRowsCount > 0 ? updatedRows[0] : null;
  }

  /**
   * 사용자 삭제
   * @param {string} id - 사용자 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async delete(id) {
    const User = this.getModel();
    const result = await User.destroy({ where: { id } });
    return result > 0;
  }

  /**
   * 사용자 계정 상태 변경
   * @param {string} id - 사용자 ID
   * @param {string} status - 변경할 상태
   * @returns {Promise<User>} 업데이트된 사용자 객체
   */
  async updateStatus(id, status) {
    return await this.update(id, { status });
  }

  /**
   * 사용자 목록 조회 (페이지네이션)
   * @param {Object} filter - 필터링 조건
   * @param {number} limit - 페이지당 항목 수
   * @param {number} offset - 건너뛸 항목 수
   * @returns {Promise<Object>} 사용자 목록과 페이지네이션 정보
   */
  async findAll(filter = {}, limit = 20, offset = 0) {
    const User = this.getModel();
    const { count, rows } = await User.findAndCountAll({
      where: filter,
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

  /**
   * 비밀번호 검증
   * @param {User} user - 사용자 객체
   * @param {string} password - 검증할 비밀번호
   * @returns {Promise<boolean>} 비밀번호 일치 여부
   */
  async verifyPassword(user, password) {
    return await user.comparePassword(password);
  }
}

module.exports = new UserRepository();