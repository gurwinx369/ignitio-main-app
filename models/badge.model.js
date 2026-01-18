import {mongoose, Schema} from 'mongoose';

const BadgeSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: false,
  }
}, {timestamps: true})

export const Badge = mongoose.models.BadgeSchema || mongoose.model('Badge', BadgeSchema);