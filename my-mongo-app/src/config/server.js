require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '15'),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  logLevel: process.env.LOG_LEVEL || 'info'
};