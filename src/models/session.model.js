const { DataTypes, Model } = require('sequelize');

/**
 * Session 모델 정의 (Sequelize)
 */
class Session extends Model {}

/**
 * Sequelize 모델 초기화 함수
 * @param {Sequelize} sequelize - Sequelize 인스턴스
 */
const initSessionModel = (sequelize) => {
  Session.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false
    },
    deviceInfo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    lastAccessAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Session',
    timestamps: true
  });
  
  return Session;
};

/**
 * Mongoose 스키마 정의 (MongoDB 사용 시)
 */
const createMongooseModel = () => {
  const mongoose = require('mongoose');
  const { Schema } = mongoose;

  const sessionSchema = new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    token: {
      type: String,
      required: true
    },
    deviceInfo: {
      type: String
    },
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    },
    location: {
      type: String
    },
    isActive: {
      type: Boolean,
      default: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    lastAccessAt: {
      type: Date,
      default: Date.now
    }
  }, {
    timestamps: true
  });

  // 토큰 필드를 API 응답에서 제외
  sessionSchema.set('toJSON', {
    transform: function(doc, ret) {
      delete ret.token;
      delete ret.__v;
      return ret;
    }
  });

  return mongoose.model('Session', sessionSchema);
};

/**
 * 데이터베이스 타입에 따라 적절한 Session 모델 반환
 */
const getSessionModel = () => {
  const dbConfig = require('../config/database').dbConfig;
  
  if (dbConfig.defaultType === 'mongodb') {
    return createMongooseModel();
  }
  
  // SQLite/Sequelize가 기본값
  if (!global.sequelize) {
    throw new Error('Sequelize instance is not initialized');
  }
  
  return initSessionModel(global.sequelize);
};

// 모델을 지연 로딩하도록 객체로 래핑
module.exports = {
  getSessionModel,
  initSessionModel,
  createMongooseModel
};