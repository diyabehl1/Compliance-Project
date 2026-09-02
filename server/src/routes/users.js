import { Router } from "express";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).populate("organization");
    if (!user) return res.status(404).json({ message: "Not found" });
    res.json({ user: user.toJSON(), organization: user.organization });
  } catch (e) {
    next(e);
  }
});

router.patch("/me", requireAuth, async (req, res, next) => {
  try {
    const allowed = ["name", "language", "avatarUrl"];
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "Not found" });
    for (const k of allowed) {
      if (req.body[k] !== undefined) user[k] = req.body[k];
    }
    await user.save();
    res.json({ user: user.toJSON() });
  } catch (e) {
    next(e);
  }
});

export default router;
