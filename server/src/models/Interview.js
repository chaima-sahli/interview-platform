import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Interview title is required"],
      trim: true,
      // e.g. "Frontend Technical Round", "System Design Interview"
    },
    type: {
      type: String,
      enum: ["technical", "behavioral", "system-design"],
      default: "technical",
    },
    scheduledFor: {
      type: Date,
      required: [true, "Scheduled date/time is required"],
    },
    durationMinutes: {
      type: Number,
      default: 45,
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    notes: {
      type: String,
      default: "",
      // interviewer's private prep notes before the interview
    },
  },
  { timestamps: true }
);

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;