import Interview from "../models/Interview.js";

const isParticipant = (interview, userId) =>
  interview.interviewer.toString() === userId ||
  (interview.candidate && interview.candidate.toString() === userId);

const roomName = (interviewId) => `call:${interviewId}`;

export const registerCallHandlers = (io, socket) => {
  socket.on("joinCallRoom", async (interviewId) => {
    const interview = await Interview.findById(interviewId);
    if (!interview || !isParticipant(interview, socket.user.id)) return;

    socket.join(roomName(interviewId));
    socket.currentCallRoom = interviewId;

    const room = io.sockets.adapter.rooms.get(roomName(interviewId));
    if (room) {
      for (const socketId of room) {
        if (socketId === socket.id) continue;
        const otherSocket = io.sockets.sockets.get(socketId);
        if (otherSocket?.callPeerId) {
          socket.emit("peerAvailable", {
            peerId: otherSocket.callPeerId,
            name: otherSocket.user.name,
          });
        }
      }
    }
  });

  socket.on("peerReady", async ({ interviewId, peerId }) => {
    const interview = await Interview.findById(interviewId);
    if (!interview || !isParticipant(interview, socket.user.id)) return;

    socket.callPeerId = peerId;
    socket.to(roomName(interviewId)).emit("peerAvailable", { peerId, name: socket.user.name });
  });

  socket.on("leaveCallRoom", (interviewId) => {
    socket.leave(roomName(interviewId));
    socket.callPeerId = null;
    socket.to(roomName(interviewId)).emit("peerLeft", { name: socket.user.name });
  });

  socket.on("disconnect", () => {
    if (socket.currentCallRoom) {
      socket.to(roomName(socket.currentCallRoom)).emit("peerLeft", { name: socket.user.name });
    }
  });
};