import Interview from "../models/Interview.js";

const isParticipant = (interview, userId) =>
  interview.interviewer.toString() === userId ||
  (interview.candidate && interview.candidate.toString() === userId);


export const registerCallHandlers = (io, socket) => {
  const roomName = (interviewId) => `call:${interviewId}`;

  socket.on("joinCallRoom", async (interviewId) => {
    const interview = await Interview.findById(interviewId);
    if (!interview || !isParticipant(interview, socket.user.id)) return;

    socket.join(roomName(interviewId));
    socket.currentCallRoom = interviewId; 
  });

  socket.on("peerReady", async ({ interviewId, peerId }) => {
    const interview = await Interview.findById(interviewId);
    if (!interview || !isParticipant(interview, socket.user.id)) return;

    socket.to(roomName(interviewId)).emit("peerAvailable", {
      peerId,
      name: socket.user.name,
    });
  });

  socket.on("leaveCallRoom", (interviewId) => {
    socket.leave(roomName(interviewId));
    socket.to(roomName(interviewId)).emit("peerLeft", { name: socket.user.name });
  });

  socket.on("disconnect", () => {
    if (socket.currentCallRoom) {
      socket.to(roomName(socket.currentCallRoom)).emit("peerLeft", { name: socket.user.name });
    }
  });
};