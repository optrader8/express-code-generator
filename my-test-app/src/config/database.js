require('dotenv').config();
const path = require('path');

const dbConfig = {
  defaultType: process.env.DB_TYPE || 'sqlite',
  
  // SQLite 설정 (기본값)
  sqlite: {
    dbPath: process.env.SQLITE_PATH || path.join(process.cwd(), 'data', 'database.sqlite'),
    options: {
      // SQLite 옵션
    }
  },
  
  // MongoDB 설정 (옵션)
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-api',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  }
};

/**
 * 데이터베이스 연결 초기화
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  const dbType = dbConfig.defaultType;
  
  try {
    if (dbType === 'mongodb') {
      // MongoDB 연결
      const mongoose = require('mongoose');
      await mongoose.connect(dbConfig.mongodb.uri, dbConfig.mongodb.options);
      console.log('MongoDB connected successfully');
    } else if (dbType === 'sqlite') {
      // SQLite 설정
      const { Sequelize } = require('sequelize');
      const fs = require('fs');
      
      // 데이터 디렉토리가 없으면 생성
      const dataDir = path.dirname(dbConfig.sqlite.dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      // SQLite 연결
      global.sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: dbConfig.sqlite.dbPath,
        logging: false
      });
      
      // 연결 테스트
      await global.sequelize.authenticate();
      console.log('SQLite connected successfully');
      
      // 모델 동기화 (실제 구현에서는 모델을 불러와서 sync 해야 함)
      // await sequelize.sync();
    } else {
      throw new Error(`Unsupported database type: ${dbType}`);
    }
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  dbConfig
};