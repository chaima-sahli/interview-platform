import mongoose from "mongoose";

const ratingField = {
  type: Number,
  min: 1,
  max: 5,
  required: true,
};

const evaluationSchema = new mongoose.Schema(
  {
    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
      unique: true, // one evaluation per interview
    },
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ratings: {
      technicalSkills: ratingField,
      problemSolving: ratingField,
      communication: ratingField,
      codeQuality: ratingField,
    },
    recommendation: {
      type: String,
      enum: ["strong-hire", "hire", "no-hire", "strong-no-hire"],
      required: [true, "A hiring recommendation is required"],
    },
    strengths: {
      type: String,
      default: "",
      trim: true,
    },
    improvements: {
      type: String,
      default: "",
      trim: true,
    },
    comments: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

const Evaluation = mongoose.model("Evaluation", evaluationSchema);

export default Evaluation;