import { mongoose, Schema } from "mongoose";

const UserProfileSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: "Please enter a valid email",
    },
    trim: true,
    lowercase: true,
    required: true,
  },
  badges: {
    type: Schema.Types.ObjectId,
    ref: "Badge"
  },
  questions: {
    selectedTechField: {
      type: String,
      required: true,
    },
    selectedProject: {
      type: String,
      minlength: 10,
      required: false,
    },
  },
  roadmaps: {
    type: Schema.Types.ObjectId,
    ref: "Roadmap",
  },
}, {timestamps: true});

export const UserProfile =
  mongoose.models.UserProfileSchema ||
  mongoose.model("UserProfile", UserProfileSchema);
