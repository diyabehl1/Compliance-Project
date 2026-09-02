import { Router } from "express";
import Organization from "../models/Organization.js";
import User from "../models/User.js";
import { requireAuth, requireRoles, loadUserOrg } from "../middleware/auth.js";
import { logActivity } from "../utils/activity.js";

const router = Router();

router.get("/", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const org = await Organization.findById(req.organizationId);
    res.json({ organization: org });
  } catch (e) {
    next(e);
  }
});

router.patch("/", requireAuth, requireRoles("admin", "compliance_manager"), loadUserOrg, async (req, res, next) => {
  try {
    const org = await Organization.findById(req.organizationId);
    if (!org) return res.status(404).json({ message: "Organization not found" });
    const { name, industry, country, companyType, settings } = req.body;
    if (name) org.name = name;
    if (industry !== undefined) org.industry = industry;
    if (country !== undefined) org.country = country;
    if (companyType !== undefined) org.companyType = companyType;
    if (settings) org.settings = { ...org.settings?.toObject?.(), ...settings };
    await org.save();
    await logActivity({
      organization: org._id,
      user: req.userId,
      action: "org.updated",
      entity: "Organization",
      entityId: org._id,
      req,
    });
    res.json({ organization: org });
  } catch (e) {
    next(e);
  }
});

router.post(
  "/invite",
  requireAuth,
  requireRoles("admin", "compliance_manager"),
  loadUserOrg,
  async (req, res, next) => {
    try {
      const { email, name, role = "employee" } = req.body;
      if (!email || !name) return res.status(400).json({ message: "email and name required" });
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) return res.status(409).json({ message: "User already exists" });
      const tempPassword = Math.random().toString(36).slice(-10) + "Aa1!";
      const user = await User.create({
        email: email.toLowerCase(),
        password: tempPassword,
        name,
        role: ["admin", "compliance_manager", "employee"].includes(role) ? role : "employee",
        organization: req.organizationId,
        emailVerified: false,
      });
      await logActivity({
        organization: req.organizationId,
        user: req.userId,
        action: "user.invited",
        entity: "User",
        entityId: user._id,
        meta: { email },
        req,
      });
      res.status(201).json({
        user: user.toJSON(),
        temporaryPassword: tempPassword,
        message: "Share temporary password securely; user should reset on first login.",
      });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
