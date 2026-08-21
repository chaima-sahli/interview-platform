import Interview from "../models/Interview.js";
import User from "../models/User.js";


export const createInterview = async (req, res, next) => {
  try {
    const { candidateEmail, title, type, scheduledFor, durationMinutes, notes } = req.body;

    const existingCandidate = await User.findOne({ email: candidateEmail, role: "candidate" });

    const interview = await Interview.create({
      candidate: existingCandidate ? existingCandidate._id : null,
      candidateEmail,
      interviewer: req.user._id,
      title,
      type,
      scheduledFor,
      durationMinutes,
      notes,
    });

    const populated = await interview.populate([
      { path: "candidate", select: "name email" },
      { path: "interviewer", select: "name email" },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const getMyInterviews = async (req, res, next) => {
  try {
    const filter =
      req.user.role === "interviewer"
        ? { interviewer: req.user._id }
        : { candidate: req.user._id };

    const interviews = await Interview.find(filter)
      .populate("candidate", "name email")
      .populate("interviewer", "name email title")
      .sort({ scheduledFor: 1 });

    res.json(interviews);
  } catch (error) {
    next(error);
  }
};


export const getInterviewById = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate("candidate", "name email")
      .populate("interviewer", "name email title");

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const isParticipant =
      interview.candidate._id.equals(req.user._id) ||
      interview.interviewer._id.equals(req.user._id);

    if (!isParticipant) {
      return res.status(403).json({ message: "Not authorized to view this interview" });
    }

    res.json(interview);
  } catch (error) {
    next(error);
  }
};