import { Router } from "express";
import ActivityLog from "../models/ActivityLog.js";
import { requireAuth, requireRoles, loadUserOrg } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, requireRoles("admin", "compliance_manager"), loadUserOrg, async (req, res, next) => {
  try {
    const logs = await ActivityLog.find({ organization: req.organizationId })
      .sort({ createdAt: -1 })
      .limit(200)
      .populate("user", "name email");
    res.json({ logs });
  } catch (e) {
    next(e);
  }
});

export default router;
