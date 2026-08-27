import jwt from "jsonwebtoken";
import User from "../models/User.js";


export const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Not authorized, no token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new Error("User no longer exists"));
    }

    // Attach the authenticated user to this socket for later use
    socket.user = {
      id: user._id.toString(),
      name: user.name,
      role: user.role,
    };

    next();
  } catch (error) {
    next(new Error("Not authorized, token invalid or expired"));
  }
};