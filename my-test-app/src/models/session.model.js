const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Session 모델 정의
 */
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

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;