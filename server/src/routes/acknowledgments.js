import { Router } from "express";
import EmployeeAcknowledgment from "../models/EmployeeAcknowledgment.js";
import Policy from "../models/Policy.js";
import User from "../models/User.js";
import { requireAuth, requireRoles, loadUserOrg } from "../middleware/auth.js";
import { logActivity } from "../utils/activity.js";

const router = Router();

router.post("/assign", requireAuth, requireRoles("admin", "compliance_manager"), loadUserOrg, async (req, res, next) => {
  try {
    const { policyId, userIds } = req.body;
    if (!policyId || !Array.isArray(userIds)) return res.status(400).json({ message: "policyId and userIds required" });
    const policy = await Policy.findOne({ _id: policyId, organization: req.organizationId });
    if (!policy) return res.status(404).json({ message: "Policy not found" });
    const docs = [];
    for (const uid of userIds) {
      const u = await User.findOne({ _id: uid, organization: req.organizationId });
      if (!u) continue;
      docs.push({
        policy: policyId,
        user: uid,
        organization: req.organizationId,
        status: "pending",
      });
    }
    for (const d of docs) {
      await EmployeeAcknowledgment.findOneAndUpdate(
        { policy: d.policy, user: d.user },
        { $setOnInsert: d },
        { upsert: true }
      );
    }
    await logActivity({
      organization: req.organizationId,
      user: req.userId,
      action: "ack.assigned",
      entity: "Policy",
      entityId: policyId,
      req,
    });
    res.json({ assigned: docs.length });
  } catch (e) {
    next(e);
  }
});

router.get("/my", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const list = await EmployeeAcknowledgment.find({ user: req.userId }).populate("policy");
    res.json({ acknowledgments: list });
  } catch (e) {
    next(e);
  }
});

router.post("/sign/:ackId", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const me = await User.findById(req.userId);
    const ack = await EmployeeAcknowledgment.findOne({
      _id: req.params.ackId,
      user: req.userId,
      organization: req.organizationId,
    }).populate("policy");
    if (!ack) return res.status(404).json({ message: "Not found" });
    ack.status = "signed";
    ack.signedAt = new Date();
    ack.signature = req.body.signature || `typed:${me?.email || req.userId}:${ack.signedAt.toISOString()}`;
    ack.ip = req.ip;
    ack.userAgent = req.headers["user-agent"];
    await ack.save();
    await logActivity({
      organization: req.organizationId,
      user: req.userId,
      action: "ack.signed",
      entity: "EmployeeAcknowledgment",
      entityId: ack._id,
      req,
    });
    res.json({ acknowledgment: ack });
  } catch (e) {
    next(e);
  }
});

router.get("/admin/:policyId", requireAuth, requireRoles("admin", "compliance_manager"), loadUserOrg, async (req, res, next) => {
  try {
    const policy = await Policy.findOne({ _id: req.params.policyId, organization: req.organizationId });
    if (!policy) return res.status(404).json({ message: "Policy not found" });
    const rows = await EmployeeAcknowledgment.find({ policy: policy._id }).populate("user", "name email role");
    res.json({
      policy: { id: policy._id, title: policy.title },
      rows: rows.map((r) => ({
        id: r._id,
        user: r.user,
        status: r.status,
        signedAt: r.signedAt,
        signature: r.signature,
        createdAt: r.createdAt,
      })),
    });
  } catch (e) {
    next(e);
  }
});

router.get("/admin/:policyId/export", requireAuth, requireRoles("admin", "compliance_manager"), loadUserOrg, async (req, res, next) => {
  try {
    const policy = await Policy.findOne({ _id: req.params.policyId, organization: req.organizationId });
    if (!policy) return res.status(404).json({ message: "Policy not found" });
    const rows = await EmployeeAcknowledgment.find({ policy: policy._id }).populate("user", "name email role");
    const csv = [
      ["user", "email", "role", "status", "signedAt", "signature"].join(","),
      ...rows.map((r) =>
        [
          `"${(r.user?.name || "").replace(/"/g, '""')}"`,
          `"${r.user?.email || ""}"`,
          r.user?.role,
          r.status,
          r.signedAt?.toISOString() || "",
          `"${(r.signature || "").replace(/"/g, '""')}"`,
        ].join(",")
      ),
    ].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="ack-${policy._id}.csv"`);
    res.send(csv);
  } catch (e) {
    next(e);
  }
});

export default router;
