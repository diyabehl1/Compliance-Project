import { Router } from "express";
import Workflow from "../models/Workflow.js";
import { requireAuth, requireRoles, loadUserOrg } from "../middleware/auth.js";
import { logActivity } from "../utils/activity.js";

const router = Router();

router.get("/", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const workflows = await Workflow.find({ organization: req.organizationId }).sort({ updatedAt: -1 });
    res.json({ workflows });
  } catch (e) {
    next(e);
  }
});

router.post("/", requireAuth, requireRoles("admin", "compliance_manager"), loadUserOrg, async (req, res, next) => {
  try {
    const w = await Workflow.create({
      ...req.body,
      organization: req.organizationId,
      createdBy: req.userId,
    });
    await logActivity({
      organization: req.organizationId,
      user: req.userId,
      action: "workflow.created",
      entity: "Workflow",
      entityId: w._id,
      req,
    });
    res.status(201).json({ workflow: w });
  } catch (e) {
    next(e);
  }
});

router.patch("/:id", requireAuth, requireRoles("admin", "compliance_manager"), loadUserOrg, async (req, res, next) => {
  try {
    const w = await Workflow.findOne({ _id: req.params.id, organization: req.organizationId });
    if (!w) return res.status(404).json({ message: "Not found" });
    Object.assign(w, req.body);
    await w.save();
    res.json({ workflow: w });
  } catch (e) {
    next(e);
  }
});

router.post("/:id/run-step", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const w = await Workflow.findOne({ _id: req.params.id, organization: req.organizationId });
    if (!w) return res.status(404).json({ message: "Not found" });
    const idx = req.body.stepIndex ?? 0;
    if (w.steps[idx]) {
      w.steps[idx].completed = true;
      w.steps[idx].completedAt = new Date();
    }
    await w.save();
    res.json({ workflow: w });
  } catch (e) {
    next(e);
  }
});

export default router;
