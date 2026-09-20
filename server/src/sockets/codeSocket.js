import * as Y from "yjs";
import Interview from "../models/Interview.js";

const isParticipant = (interview, userId) =>
  interview.interviewer.toString() === userId ||
  (interview.candidate && interview.candidate.toString() === userId);

const roomName = (interviewId) => `code:${interviewId}`;

// One Y.Doc per interview's coding session, held in memory.
// Lost on server restart — persisting this to Mongo is a nice future upgrade.
const docs = new Map();
const languages = new Map();

const getDoc = (interviewId) => {
  if (!docs.has(interviewId)) docs.set(interviewId, new Y.Doc());
  return docs.get(interviewId);
};

export const registerCodeHandlers = (io, socket) => {
  socket.on("joinCodeRoom", async (interviewId) => {
    const interview = await Interview.findById(interviewId);
    if (!interview || !isParticipant(interview, socket.user.id)) return;

    socket.join(roomName(interviewId));

    // Send the newcomer the full current state so they start in sync,
    // whether they're first in or the fifth person to join.
    const doc = getDoc(interviewId);
    socket.emit("codeSync", {
      update: Y.encodeStateAsUpdate(doc),
      language: languages.get(interviewId) || "javascript",
    });
  });

  socket.on("codeUpdate", ({ interviewId, update }) => {
    const doc = getDoc(interviewId);
    Y.applyUpdate(doc, new Uint8Array(update));
    socket.to(roomName(interviewId)).emit("codeUpdate", { update });
  });

  socket.on("codeLanguageChange", ({ interviewId, language }) => {
    languages.set(interviewId, language);
    socket.to(roomName(interviewId)).emit("codeLanguageChange", { language });
  });
};