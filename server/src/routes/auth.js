import { Router } from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import Organization from "../models/Organization.js";
import { randomToken } from "../utils/tokens.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "../services/emailService.js";
import { logActivity } from "../utils/activity.js";

const router = Router();

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

router.post(
  "/register",
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  body("name").trim().notEmpty(),
  body("organizationName").optional().trim(),
  body("role").optional().isIn(["admin", "compliance_manager", "employee"]),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, password, name, organizationName, role } = req.body;
      const exists = await User.findOne({ email });
      if (exists) return res.status(409).json({ message: "Email already registered" });

      const orgName = organizationName || `${name}'s Organization`;
      const slug =
        orgName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") +
        "-" +
        randomToken(4);

      const org = await Organization.create({
        name: orgName,
        slug,
        owner: null,
      });

      const userRole = role === "compliance_manager" || role === "employee" ? role : "admin";
      const user = await User.create({
        email,
        password,
        name,
        role: userRole,
        organization: org._id,
        emailVerified: false,
        verificationToken: randomToken(24),
        verificationExpires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      });

      org.owner = user._id;
      await org.save();

      await sendVerificationEmail(user.email, user.verificationToken);
      await logActivity({
        organization: org._id,
        user: user._id,
        action: "user.registered",
        entity: "User",
        entityId: user._id,
        req,
      });

      const token = signToken(user);
      res.status(201).json({
        token,
        user: user.toJSON(),
        organization: org,
        message: "Check your email to verify your account (if SMTP is configured).",
      });
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/login",
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const user = await User.findOne({ email: req.body.email }).populate("organization");
      if (!user || !(await user.comparePassword(req.body.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      await logActivity({
        organization: user.organization?._id,
        user: user._id,
        action: "user.login",
        entity: "User",
        entityId: user._id,
        req,
      });
      res.json({ token: signToken(user), user: user.toJSON(), organization: user.organization });
    } catch (e) {
      next(e);
    }
  }
);

router.get("/verify-email", async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: "Token required" });
    const user = await User.findOne({ verificationToken: token, verificationExpires: { $gt: new Date() } });
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();
    res.json({ message: "Email verified" });
  } catch (e) {
    next(e);
  }
});

router.post("/forgot-password", body("email").isEmail(), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.json({ message: "If an account exists, a reset email was sent." });
    user.resetPasswordToken = randomToken(32);
    user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 60);
    await user.save();
    await sendPasswordResetEmail(user.email, user.resetPasswordToken);
    res.json({ message: "If an account exists, a reset email was sent." });
  } catch (e) {
    next(e);
  }
});

router.post(
  "/reset-password",
  body("token").notEmpty(),
  body("password").isLength({ min: 8 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
      const user = await User.findOne({
        resetPasswordToken: req.body.token,
        resetPasswordExpires: { $gt: new Date() },
      });
      if (!user) return res.status(400).json({ message: "Invalid or expired token" });
      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      res.json({ message: "Password updated" });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
