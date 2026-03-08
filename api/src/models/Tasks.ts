import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
      index: true,
    },
    deadline: {
      type: Date,
      required: false,
      index: true,
    },
    status: {
      type: String,
      enum: ["todo", "completed", "overdue"],
      default: "todo",
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

TaskSchema.index({ userId: 1, status: 1, deadline: 1 });

export const Task = mongoose.model("Task", TaskSchema);