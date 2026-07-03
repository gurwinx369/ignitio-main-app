import mongoose from 'mongoose';

const RetentionEmailLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProfile',
    required: true,
  },
  firebaseUID: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  campaignKey: {
    type: String,
    required: true,
  },
  streakStartedAt: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['queued', 'sent', 'skipped', 'failed', 'dry_run'],
    required: true,
  },
  provider: {
    type: String,
    default: 'resend',
  },
  providerMessageId: {
    type: String,
    default: null,
  },
  reason: {
    type: String,
    default: null,
  },
  sentAt: {
    type: Date,
    default: null,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

// Unique index per user per campaign per streak
RetentionEmailLogSchema.index({ userId: 1, campaignKey: 1, streakStartedAt: 1 }, { unique: true });

// Secondary indexes for cron queries
RetentionEmailLogSchema.index({ campaignKey: 1, status: 1 });
RetentionEmailLogSchema.index({ userId: 1, streakStartedAt: 1 });
RetentionEmailLogSchema.index({ sentAt: 1 });

export const RetentionEmailLog = mongoose.models.RetentionEmailLog || mongoose.model('RetentionEmailLog', RetentionEmailLogSchema);
