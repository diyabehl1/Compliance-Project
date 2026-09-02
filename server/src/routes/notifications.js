import { Router } from "express";
import Notification from "../models/Notification.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const items = await Notification.find({ user: req.userId }).sort({ createdAt: -1 }).limit(100);
    res.json({ notifications: items });
  } catch (e) {
    next(e);
  }
});

router.patch("/:id/read", requireAuth, async (req, res, next) => {
  try {
    const n = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.userId }, { read: true }, { new: true });
    if (!n) return res.status(404).json({ message: "Not found" });
    res.json({ notification: n });
  } catch (e) {
    next(e);
  }
});

router.post("/mark-all-read", requireAuth, async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.userId, read: false }, { read: true });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
