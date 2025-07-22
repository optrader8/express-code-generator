const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');

/**
 * User 모델 정의
 */
class User extends Model {
  // 비밀번호 검증 메서드
  async comparePassword(password) {
    return await bcrypt.compare(password, this.password);
  }
}

/**
 * Sequelize 모델 초기화 함수
 * @param {Sequelize} sequelize - Sequelize 인스턴스
 */
const initUserModel = (sequelize) => {
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: '유효한 이메일 주소를 입력하세요'
        }
      }
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        len: {
          args: [3, 30],
          msg: '사용자명은 3~30자 사이어야 합니다'
        },
        is: {
          args: /^[a-zA-Z0-9_]+$/,
          msg: '사용자명은 영문자, 숫자, 언더스코어만 포함할 수 있습니다'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [8, 128],
          msg: '비밀번호는 8~128자 사이어야 합니다'
        }
      }
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: {
          msg: '유효한 URL을 입력하세요'
        }
      }
    },
    role: {
      type: DataTypes.ENUM('user', 'admin', 'moderator'),
      defaultValue: 'user'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended', 'deleted'),
      defaultValue: 'active'
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    twoFactorEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    twoFactorSecret: {
      type: DataTypes.STRING,
      allowNull: true
    },
    backupCodes: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue('backupCodes');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue('backupCodes', JSON.stringify(value));
      }
    },
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    emailVerificationToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    emailVerificationExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    refreshTokens: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue('refreshTokens');
        return value ? JSON.parse(value) : [];
      },
      set(value) {
        this.setDataValue('refreshTokens', JSON.stringify(value));
      }
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    suspendedUntil: {
      type: DataTypes.DATE,
      allowNull: true
    },
    suspensionReason: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
    timestamps: true, // createdAt, updatedAt 자동 생성
    hooks: {
      // 비밀번호 해싱 훅
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });
  
  return User;
};

/**
 * Mongoose 스키마 정의 (MongoDB 사용 시)
 */
const createMongooseModel = () => {
  const mongoose = require('mongoose');
  const { Schema } = mongoose;
  
  const userSchema = new Schema({
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, '유효한 이메일 주소를 입력하세요']
    },
    username: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: [/^[a-zA-Z0-9_]+$/, '사용자명은 영문자, 숫자, 언더스코어만 포함할 수 있습니다'],
      sparse: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: 50
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: 50
    },
    avatar: {
      type: String
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'deleted'],
      default: 'active'
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    twoFactorSecret: {
      type: String,
      select: false
    },
    backupCodes: {
      type: [String],
      select: false
    },
    passwordResetToken: {
      type: String,
      select: false
    },
    passwordResetExpires: {
      type: Date,
      select: false
    },
    emailVerificationToken: {
      type: String,
      select: false
    },
    emailVerificationExpires: {
      type: Date,
      select: false
    },
    refreshTokens: {
      type: [String],
      select: false
    },
    oauth: {
      google: {
        id: String,
        email: String,
        picture: String
      }
    },
    lastLoginAt: {
      type: Date
    },
    suspendedUntil: {
      type: Date
    },
    suspensionReason: {
      type: String
    }
  }, {
    timestamps: true // createdAt, updatedAt 자동 생성
  });

  // 비밀번호 필드를 API 응답에서 제외
  userSchema.set('toJSON', {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  });
  
  return mongoose.model('User', userSchema);
};

/**
 * 데이터베이스 타입에 따라 적절한 User 모델 반환
 */
const getUserModel = () => {
  const dbConfig = require('../config/database').dbConfig;
  
  if (dbConfig.defaultType === 'mongodb') {
    return createMongooseModel();
  }
  
  // SQLite/Sequelize가 기본값
  if (!global.sequelize) {
    throw new Error('Sequelize instance is not initialized');
  }
  
  return initUserModel(global.sequelize);
};

// 모델을 지연 로딩하도록 객체로 래핑
module.exports = {
  getUserModel,
  initUserModel,
  createMongooseModel
};