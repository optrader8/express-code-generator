const { DataTypes, Model } = require('sequelize');

/**
 * ApiKey 모델 정의 (Sequelize)
 */
class ApiKey extends Model {}

/**
 * Sequelize 모델 초기화 함수
 * @param {Sequelize} sequelize - Sequelize 인스턴스
 */
const initApiKeyModel = (sequelize) => {
  ApiKey.init({
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
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false
    },
    keyPrefix: {
      type: DataTypes.STRING,
      allowNull: false
    },
    permissions: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: JSON.stringify(['read']),
      get() {
        const value = this.getDataValue('permissions');
        return value ? JSON.parse(value) : ['read'];
      },
      set(value) {
        this.setDataValue('permissions', JSON.stringify(value));
      },
      validate: {
        isValidPermissions(value) {
          const permissions = typeof value === 'string' ? JSON.parse(value) : value;
          const validPerms = ['read', 'write', 'delete', 'admin'];
          if (!Array.isArray(permissions) || !permissions.every(p => validPerms.includes(p))) {
            throw new Error('Invalid permissions');
          }
        }
      }
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lastUsedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'ApiKey',
    timestamps: true
  });
  
  return ApiKey;
};

/**
 * Mongoose 스키마 정의 (MongoDB 사용 시)
 */
const createMongooseModel = () => {
  const mongoose = require('mongoose');
  const { Schema } = mongoose;

  const apiKeySchema = new Schema({
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true,
      maxlength: 100
    },
    key: {
      type: String,
      required: true
    },
    keyPrefix: {
      type: String,
      required: true
    },
    permissions: {
      type: [String],
      enum: ['read', 'write', 'delete', 'admin'],
      default: ['read']
    },
    expiresAt: {
      type: Date
    },
    lastUsedAt: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }, {
    timestamps: true
  });

  // key 필드를 API 응답에서 제외
  apiKeySchema.set('toJSON', {
    transform: function(doc, ret) {
      delete ret.key;
      delete ret.__v;
      return ret;
    }
  });

  return mongoose.model('ApiKey', apiKeySchema);
};

/**
 * 데이터베이스 타입에 따라 적절한 ApiKey 모델 반환
 */
const getApiKeyModel = () => {
  const dbConfig = require('../config/database').dbConfig;
  
  if (dbConfig.defaultType === 'mongodb') {
    return createMongooseModel();
  }
  
  // SQLite/Sequelize가 기본값
  if (!global.sequelize) {
    throw new Error('Sequelize instance is not initialized');
  }
  
  return initApiKeyModel(global.sequelize);
};

// 모델을 지연 로딩하도록 객체로 래핑
module.exports = {
  getApiKeyModel,
  initApiKeyModel,
  createMongooseModel
};