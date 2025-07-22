require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || 'your-secret-key-here',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRATION || '7d',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
  algorithms: ['HS256']
};