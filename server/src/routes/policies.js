import { Router } from "express";
import Policy from "../models/Policy.js";
import Template from "../models/Template.js";
import { requireAuth, loadUserOrg } from "../middleware/auth.js";
import { logActivity } from "../utils/activity.js";
import { clauseRecommendations } from "../services/aiService.js";

const router = Router();

router.get("/", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const q = { organization: req.organizationId };
    if (status) q.status = status;
    if (type) q.type = type;
    const policies = await Policy.find(q).sort({ updatedAt: -1 }).limit(200);
    res.json({ policies });
  } catch (e) {
    next(e);
  }
});

router.get("/:id", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const policy = await Policy.findOne({ _id: req.params.id, organization: req.organizationId });
    if (!policy) return res.status(404).json({ message: "Not found" });
    res.json({ policy });
  } catch (e) {
    next(e);
  }
});

router.post("/", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const { title, type, content, status, complianceStandards, expiresAt, sourceTemplate } = req.body;
    const policy = await Policy.create({
      organization: req.organizationId,
      title: title || "Untitled policy",
      type: type || "custom",
      content: content || { type: "doc", content: [] },
      status: status || "draft",
      complianceStandards: complianceStandards || [],
      expiresAt,
      sourceTemplate,
      createdBy: req.userId,
      lastEditedBy: req.userId,
      versions: [{ content: content || { type: "doc", content: [] }, label: "v1", createdBy: req.userId }],
    });
    await logActivity({
      organization: req.organizationId,
      user: req.userId,
      action: "policy.created",
      entity: "Policy",
      entityId: policy._id,
      req,
    });
    res.status(201).json({ policy });
  } catch (e) {
    next(e);
  }
});

router.patch("/:id", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const policy = await Policy.findOne({ _id: req.params.id, organization: req.organizationId });
    if (!policy) return res.status(404).json({ message: "Not found" });
    const { title, content, status, complianceStandards, expiresAt, comments, missingClauseHints } = req.body;
    if (title !== undefined) policy.title = title;
    if (status !== undefined) policy.status = status;
    if (complianceStandards !== undefined) policy.complianceStandards = complianceStandards;
    if (expiresAt !== undefined) policy.expiresAt = expiresAt;
    if (comments !== undefined) policy.comments = comments;
    if (missingClauseHints !== undefined) policy.missingClauseHints = missingClauseHints;
    if (content !== undefined) {
      policy.content = content;
      policy.lastEditedBy = req.userId;
    }
    await policy.save();
    await logActivity({
      organization: req.organizationId,
      user: req.userId,
      action: "policy.updated",
      entity: "Policy",
      entityId: policy._id,
      req,
    });
    res.json({ policy });
  } catch (e) {
    next(e);
  }
});

router.post("/:id/snapshot", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const policy = await Policy.findOne({ _id: req.params.id, organization: req.organizationId });
    if (!policy) return res.status(404).json({ message: "Not found" });
    const label = req.body.label || `v${(policy.versions?.length || 0) + 1}`;
    policy.versions.push({
      content: policy.content,
      label,
      createdBy: req.userId,
      comment: req.body.comment,
    });
    await policy.save();
    res.json({ policy });
  } catch (e) {
    next(e);
  }
});

router.post("/:id/restore/:versionId", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const policy = await Policy.findOne({ _id: req.params.id, organization: req.organizationId });
    if (!policy) return res.status(404).json({ message: "Not found" });
    const v = policy.versions.id(req.params.versionId);
    if (!v) return res.status(404).json({ message: "Version not found" });
    policy.content = v.content;
    policy.lastEditedBy = req.userId;
    await policy.save();
    res.json({ policy });
  } catch (e) {
    next(e);
  }
});

router.post("/:id/comment", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const policy = await Policy.findOne({ _id: req.params.id, organization: req.organizationId });
    if (!policy) return res.status(404).json({ message: "Not found" });
    policy.comments.push({ user: req.userId, body: req.body.body, anchor: req.body.anchor });
    await policy.save();
    res.json({ policy });
  } catch (e) {
    next(e);
  }
});

router.get("/:id/clause-suggestions", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const policy = await Policy.findOne({ _id: req.params.id, organization: req.organizationId });
    if (!policy) return res.status(404).json({ message: "Not found" });
    const std = policy.complianceStandards?.[0] || "GDPR";
    const recs = clauseRecommendations(policy.type, std);
    res.json({ suggestions: recs });
  } catch (e) {
    next(e);
  }
});

router.post("/from-template/:templateId", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const tpl = await Template.findById(req.params.templateId);
    if (!tpl) return res.status(404).json({ message: "Template not found" });
    const policy = await Policy.create({
      organization: req.organizationId,
      title: tpl.title,
      type: tpl.policyType || "custom",
      content: tpl.content,
      status: "draft",
      complianceStandards: tpl.complianceType ? [tpl.complianceType] : [],
      sourceTemplate: tpl._id,
      createdBy: req.userId,
      lastEditedBy: req.userId,
      versions: [{ content: tpl.content, label: "from-template", createdBy: req.userId }],
    });
    await logActivity({
      organization: req.organizationId,
      user: req.userId,
      action: "policy.from_template",
      entity: "Policy",
      entityId: policy._id,
      req,
    });
    res.status(201).json({ policy });
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const policy = await Policy.findOneAndDelete({ _id: req.params.id, organization: req.organizationId });
    if (!policy) return res.status(404).json({ message: "Not found" });
    await logActivity({
      organization: req.organizationId,
      user: req.userId,
      action: "policy.deleted",
      entity: "Policy",
      entityId: policy._id,
      req,
    });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
