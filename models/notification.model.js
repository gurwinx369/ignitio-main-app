import mongoose from 'mongoose';

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
}, {
    timestamps: true,
});

export default mongoose.models.UserNotification || mongoose.model('UserNotification', UserNotificationSchema);
