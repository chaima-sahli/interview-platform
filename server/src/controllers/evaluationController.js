import Evaluation from "../models/Evaluation.js";
import Interview from "../models/Interview.js";

//!(the interviewer who ran that interview only)
export const createEvaluation = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.interviewId);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (!interview.interviewer.equals(req.user._id)) {
      return res.status(403).json({ message: "Only the interviewer can evaluate this interview" });
    }

    if (!interview.candidate) {
      return res.status(400).json({ message: "This interview has no registered candidate to evaluate" });
    }

    if (interview.status === "cancelled") {
      return res.status(400).json({ message: "A cancelled interview can't be evaluated" });
    }

    if (new Date(interview.scheduledFor) > new Date()) {
      return res.status(400).json({ message: "You can only evaluate an interview once it has started" });
    }

    const existing = await Evaluation.findOne({ interview: interview._id });
    if (existing) {
      return res.status(400).json({ message: "This interview has already been evaluated" });
    }

    const { ratings, recommendation, strengths, improvements, comments } = req.body;

    const evaluation = await Evaluation.create({
      interview: interview._id,
      interviewer: req.user._id,
      candidate: interview.candidate,
      ratings,
      recommendation,
      strengths,
      improvements,
      comments,
    });

    // Submitting feedback closes out the interview
    interview.status = "completed";
    await interview.save();

    res.status(201).json(evaluation);
  } catch (error) {
    next(error);
  }
};

//! (the interviewer who ran it)
// Returns null (not a 404) when nothing's been submitted yet, so the
// frontend can simply decide between "show form" and "show result".
export const getEvaluationForInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.interviewId);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    if (!interview.interviewer.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to view this evaluation" });
    }

    const evaluation = await Evaluation.findOne({ interview: interview._id });
    res.json(evaluation);
  } catch (error) {
    next(error);
  }
};

//! (interviewer: evaluations they wrote)
export const getMyEvaluations = async (req, res, next) => {
  try {
    const evaluations = await Evaluation.find({ interviewer: req.user._id })
      .populate("candidate", "name email")
      .populate("interview", "title type scheduledFor")
      .sort({ createdAt: -1 });

    res.json(evaluations);
  } catch (error) {
    next(error);
  }
};