const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * ApiKey 모델 정의
 */
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

const ApiKey = mongoose.model('ApiKey', apiKeySchema);

module.exports = ApiKey;