import mongoose, {Schema} from "mongoose";

const UserProfileSchema = new Schema(
    {
        firebaseUID: {
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
            unique: true,
        },
        badges: [{
            type: Schema.Types.ObjectId,
            ref: "Badge",
        }],
        questions: {
            selectedTechField: [{
                type: String,
                enum: [
                    "Ui/Ux",
                    "backend development",
                    "Gen Ai",
                    "frontend development",
                    "Ai/ML",
                    "Others",
                    "cloud computing",
                    "Cybersecurity",
                ],
                required: true,
            }],
            selectedProject: {
                type: String,
                required: false,
            },
        },
        roadmaps: {
            type: Schema.Types.ObjectId,
            ref: "Roadmap",
        },
    },
    {timestamps: true},
);

export const UserProfile =
    mongoose.models.UserProfile || mongoose.model("UserProfile", UserProfileSchema)

