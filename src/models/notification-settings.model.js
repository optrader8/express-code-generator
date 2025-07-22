const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * NotificationSettings 모델 정의
 */
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

const NotificationSettings = mongoose.model('NotificationSettings', notificationSettingsSchema);

module.exports = NotificationSettings;