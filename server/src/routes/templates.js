import { Router } from "express";
import Template from "../models/Template.js";
import User from "../models/User.js";
import { requireAuth, loadUserOrg } from "../middleware/auth.js";
import { logActivity } from "../utils/activity.js";

const router = Router();

router.get("/public", async (req, res, next) => {
  try {
    const { q, category, industry, country, complianceType, department } = req.query;
    const parts = [{ isSystem: true }];
    if (category) parts.push({ category });
    if (industry) parts.push({ industry });
    if (country) parts.push({ country });
    if (complianceType) parts.push({ complianceType });
    if (department) parts.push({ department });
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      parts.push({ $or: [{ title: rx }, { description: rx }] });
    }
    const filter = parts.length === 1 ? parts[0] : { $and: parts };
    const templates = await Template.find(filter).sort({ updatedAt: -1 }).limit(100);
    res.json({ templates });
  } catch (e) {
    next(e);
  }
});

router.get("/", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const { q, category, industry, country, complianceType, department } = req.query;
    const scope = { $or: [{ isSystem: true }, { organization: req.organizationId }] };
    const parts = [scope];
    if (category) parts.push({ category });
    if (industry) parts.push({ industry });
    if (country) parts.push({ country });
    if (complianceType) parts.push({ complianceType });
    if (department) parts.push({ department });
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      parts.push({ $or: [{ title: rx }, { description: rx }] });
    }
    const filter = parts.length === 1 ? parts[0] : { $and: parts };
    const templates = await Template.find(filter).sort({ updatedAt: -1 }).limit(200);
    const user = await User.findById(req.userId).select("favoriteTemplates");
    const favSet = new Set((user?.favoriteTemplates || []).map((id) => id.toString()));
    res.json({
      templates: templates.map((t) => ({
        ...t.toObject(),
        isFavorite: favSet.has(t._id.toString()),
      })),
    });
  } catch (e) {
    next(e);
  }
});

router.get("/:id", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const tpl = await Template.findOne({
      _id: req.params.id,
      $or: [{ isSystem: true }, { organization: req.organizationId }],
    });
    if (!tpl) return res.status(404).json({ message: "Not found" });
    res.json({ template: tpl });
  } catch (e) {
    next(e);
  }
});

router.post("/", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const tpl = await Template.create({
      ...req.body,
      organization: req.organizationId,
      createdBy: req.userId,
      isSystem: false,
    });
    await logActivity({
      organization: req.organizationId,
      user: req.userId,
      action: "template.created",
      entity: "Template",
      entityId: tpl._id,
      req,
    });
    res.status(201).json({ template: tpl });
  } catch (e) {
    next(e);
  }
});

router.patch("/:id", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const tpl = await Template.findOne({ _id: req.params.id, organization: req.organizationId });
    if (!tpl) return res.status(404).json({ message: "Not found" });
    Object.assign(tpl, req.body);
    await tpl.save();
    res.json({ template: tpl });
  } catch (e) {
    next(e);
  }
});

router.post("/:id/duplicate", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const src = await Template.findOne({
      _id: req.params.id,
      $or: [{ isSystem: true }, { organization: req.organizationId }],
    });
    if (!src) return res.status(404).json({ message: "Not found" });
    const copy = await Template.create({
      title: `${src.title} (copy)`,
      description: src.description,
      category: src.category,
      industry: src.industry,
      country: src.country,
      complianceType: src.complianceType,
      department: src.department,
      policyType: src.policyType,
      content: src.content,
      organization: req.organizationId,
      createdBy: req.userId,
      isSystem: false,
    });
    res.status(201).json({ template: copy });
  } catch (e) {
    next(e);
  }
});

router.post("/:id/favorite", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    const id = req.params.id;
    const idx = user.favoriteTemplates.map(String).indexOf(id);
    if (idx >= 0) user.favoriteTemplates.splice(idx, 1);
    else user.favoriteTemplates.push(id);
    await user.save();
    res.json({ favorites: user.favoriteTemplates });
  } catch (e) {
    next(e);
  }
});

export default router;
