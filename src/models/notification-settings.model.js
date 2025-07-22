const { DataTypes, Model } = require('sequelize');

/**
 * NotificationSettings 모델 정의 (Sequelize)
 */
class NotificationSettings extends Model {}

/**
 * Sequelize 모델 초기화 함수
 * @param {Sequelize} sequelize - Sequelize 인스턴스
 */
const initNotificationSettingsModel = (sequelize) => {
  NotificationSettings.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    emailNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    securityAlerts: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    marketingEmails: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    systemUpdates: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    loginAlerts: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'NotificationSettings',
    timestamps: true
  });
  
  return NotificationSettings;
};

/**
 * Mongoose 스키마 정의 (MongoDB 사용 시)
 */
const createMongooseModel = () => {
  const mongoose = require('mongoose');
  const { Schema } = mongoose;

  const notificationSettingsSchema = new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    securityAlerts: {
      type: Boolean,
      default: true
    },
    marketingEmails: {
      type: Boolean,
      default: false
    },
    systemUpdates: {
      type: Boolean,
      default: true
    },
    loginAlerts: {
      type: Boolean,
      default: false
    }
  }, {
    timestamps: true
  });

  return mongoose.model('NotificationSettings', notificationSettingsSchema);
};

/**
 * 데이터베이스 타입에 따라 적절한 NotificationSettings 모델 반환
 */
const getNotificationSettingsModel = () => {
  const dbConfig = require('../config/database').dbConfig;
  
  if (dbConfig.defaultType === 'mongodb') {
    return createMongooseModel();
  }
  
  // SQLite/Sequelize가 기본값
  if (!global.sequelize) {
    throw new Error('Sequelize instance is not initialized');
  }
  
  return initNotificationSettingsModel(global.sequelize);
};

// 모델을 지연 로딩하도록 객체로 래핑
module.exports = {
  getNotificationSettingsModel,
  initNotificationSettingsModel,
  createMongooseModel
};