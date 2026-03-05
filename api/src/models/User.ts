import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    name: { type: String, default: "" },
    timezone: { type: String, default: "America/Chicago" },
    onboardingComplete: { type: Boolean, default: false },
    preferences: {
      studyWindow: {
        start: { type: String, default: "18:00" },
        end: { type: String, default: "23:00" }
      },
      preferredDays: { type: [String], default: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
      pomodoro: {
        focusMin: { type: Number, default: 25 },
        breakMin: { type: Number, default: 5 },
        longBreakMin: { type: Number, default: 15 },
        cyclesBeforeLongBreak: { type: Number, default: 4 }
      },
      remindersEnabled: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);