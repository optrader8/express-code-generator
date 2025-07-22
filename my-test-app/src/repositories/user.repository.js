const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

/**
 * User 리포지토리 - 사용자 데이터 액세스 계층
 */
class UserRepository {
  /**
   * 이메일로 사용자 찾기
   * @param {string} email - 사용자 이메일
   * @returns {Promise<User>} 사용자 객체
   */
  async findByEmail(email) {
    return await User.findOne({ email });
  }

  /**
   * ID로 사용자 찾기
   * @param {string} id - 사용자 ID
   * @returns {Promise<User>} 사용자 객체
   */
  async findById(id) {
    return await User.findById(id);
  }

  /**
   * 사용자명으로 사용자 찾기
   * @param {string} username - 사용자명
   * @returns {Promise<User>} 사용자 객체
   */
  async findByUsername(username) {
    return await User.findOne({ username });
  }

  /**
   * 새 사용자 생성
   * @param {Object} userData - 사용자 데이터
   * @returns {Promise<User>} 생성된 사용자 객체
   */
  async create(userData) {
    // 비밀번호 해싱
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }
    
    const user = new User(userData);
    return await user.save();
  }

  /**
   * 사용자 정보 업데이트
   * @param {string} id - 사용자 ID
   * @param {Object} updateData - 업데이트할 데이터
   * @returns {Promise<User>} 업데이트된 사용자 객체
   */
  async update(id, updateData) {
    // 비밀번호가 포함된 경우 해싱
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  }

  /**
   * 사용자 삭제
   * @param {string} id - 사용자 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async delete(id) {
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }

  /**
   * 사용자 계정 상태 변경
   * @param {string} id - 사용자 ID
   * @param {string} status - 변경할 상태
   * @returns {Promise<User>} 업데이트된 사용자 객체
   */
  async updateStatus(id, status) {
    return await User.findByIdAndUpdate(id, { status }, { new: true });
  }

  /**
   * 사용자 목록 조회 (페이지네이션)
   * @param {Object} filter - 필터링 조건
   * @param {number} limit - 페이지당 항목 수
   * @param {number} offset - 건너뛸 항목 수
   * @returns {Promise<Object>} 사용자 목록과 페이지네이션 정보
   */
  async findAll(filter = {}, limit = 20, offset = 0) {
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
    
    return {
      data: users,
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
   * 비밀번호 검증
   * @param {User} user - 사용자 객체
   * @param {string} password - 검증할 비밀번호
   * @returns {Promise<boolean>} 비밀번호 일치 여부
   */
  async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password);
  }
}

module.exports = new UserRepository();