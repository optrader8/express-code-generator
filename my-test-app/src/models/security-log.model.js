const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * SecurityLog 모델 정의
 */
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
      'email_verified',
      'account_locked',
      'account_unlocked',
      '2fa_enabled',
      '2fa_disabled'
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
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

const SecurityLog = mongoose.model('SecurityLog', securityLogSchema);

module.exports = SecurityLog;