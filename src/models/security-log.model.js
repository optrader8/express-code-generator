const { DataTypes, Model } = require('sequelize');

/**
 * SecurityLog 모델 정의 (Sequelize)
 */
class SecurityLog extends Model {}

/**
 * Sequelize 모델 초기화 함수
 * @param {Sequelize} sequelize - Sequelize 인스턴스
 */
const initSecurityLogModel = (sequelize) => {
  SecurityLog.init({
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
    eventType: {
      type: DataTypes.ENUM(
        'login_success',
        'login_failed', 
        'logout',
        'password_changed',
        'profile_updated',
        'permission_changed',
        'suspicious_activity',
        'account_locked'
      ),
      allowNull: false
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
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue('details');
        return value ? JSON.parse(value) : {};
      },
      set(value) {
        this.setDataValue('details', JSON.stringify(value));
      }
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'low'
    }
  }, {
    sequelize,
    modelName: 'SecurityLog',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['eventType']
      },
      {
        fields: ['createdAt']
      }
    ]
  });
  
  return SecurityLog;
};

/**
 * Mongoose 스키마 정의 (MongoDB 사용 시)
 */
const createMongooseModel = () => {
  const mongoose = require('mongoose');
  const { Schema } = mongoose;

  const securityLogSchema = new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    eventType: {
      type: String,
      enum: [
        'login_success',
        'login_failed',
        'logout',
        'password_changed',
        'profile_updated',
        'permission_changed',
        'suspicious_activity',
        'account_locked'
      ],
      required: true
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
    details: {
      type: Schema.Types.Mixed,
      default: {}
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    }
  }, {
    timestamps: true
  });

  // 인덱스 설정
  securityLogSchema.index({ userId: 1 });
  securityLogSchema.index({ eventType: 1 });
  securityLogSchema.index({ createdAt: -1 });

  return mongoose.model('SecurityLog', securityLogSchema);
};

/**
 * 데이터베이스 타입에 따라 적절한 SecurityLog 모델 반환
 */
const getSecurityLogModel = () => {
  const dbConfig = require('../config/database').dbConfig;
  
  if (dbConfig.defaultType === 'mongodb') {
    return createMongooseModel();
  }
  
  // SQLite/Sequelize가 기본값
  if (!global.sequelize) {
    throw new Error('Sequelize instance is not initialized');
  }
  
  return initSecurityLogModel(global.sequelize);
};

// 모델을 지연 로딩하도록 객체로 래핑
module.exports = {
  getSecurityLogModel,
  initSecurityLogModel,
  createMongooseModel
};