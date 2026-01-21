import mongoose, { Schema } from 'mongoose';

const BadgeSchema = new Schema({
  name: {
    type: String,
    required: false,
  },
  badgeUrl: {
    type: String,
    required: false,
  }
}, {timestamps: true})

export const Badge = mongoose.models.Badge || mongoose.model('Badge', BadgeSchema);
