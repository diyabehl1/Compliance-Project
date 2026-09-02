import jwt from "jsonwebtoken";
import User from "../models/User.js";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    req.userRole = payload.role;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}

/** Attach full user + org for routes that need it */
export async function loadUserOrg(req, res, next) {
  try {
    const user = await User.findById(req.userId).populate("organization");
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = user;
    req.organizationId = user.organization?._id?.toString();
    next();
  } catch (e) {
    next(e);
  }
}
