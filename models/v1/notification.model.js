import mongoose from 'mongoose';

const NotificationHistoryEntrySchema = new mongoose.Schema({
    id: { type: String, required: true },
    sentAt: { type: Date, required: true },
    messageIndex: { type: Number, required: true },
}, { _id: false });

const UserNotificationSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
    },
    fcmToken: {
        type: String,
        required: true,
    },
    lastActive: {
        type: Date,
        default: Date.now,
    },
    lastNotificationSent: {
        type: Date,
        default: null,
    },
    notificationsEnabled: {
        type: Boolean,
        default: true,
    },
    notificationsSent: {
        type: Number,
        default: 0,
        min: 0,
        max: 2,
    },
    notificationHistory: {
        type: [NotificationHistoryEntrySchema],
        default: [],
    },
}, {
    timestamps: true,
});

export default mongoose.models.UserNotification || mongoose.model('UserNotification', UserNotificationSchema);
