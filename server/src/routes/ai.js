import { Router } from "express";
import Policy from "../models/Policy.js";
import { requireAuth, loadUserOrg } from "../middleware/auth.js";
import { generatePolicyDoc, rewritePolicyDoc, chatCompliance } from "../services/aiService.js";
import { logActivity } from "../utils/activity.js";

const router = Router();

router.post("/generate-policy", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const doc = await generatePolicyDoc(req.body);
    await logActivity({
      organization: req.organizationId,
      user: req.userId,
      action: "ai.policy_generated",
      entity: "AI",
      meta: { title: doc.title },
      req,
    });
    res.json(doc);
  } catch (e) {
    next(e);
  }
});

router.post("/rewrite-policy", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const out = await rewritePolicyDoc({ content: req.body.content, tone: req.body.tone });
    res.json(out);
  } catch (e) {
    next(e);
  }
});

router.post("/save-generated", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const { title, content, type, complianceStandards, tone, language } = req.body;
    const policy = await Policy.create({
      organization: req.organizationId,
      title: title || "Generated policy",
      type: type || "custom",
      content: content || { type: "doc", content: [] },
      status: "draft",
      complianceStandards: complianceStandards || [],
      tone,
      language: language || "en",
      createdBy: req.userId,
      lastEditedBy: req.userId,
      versions: [{ content, label: "ai-generated", createdBy: req.userId }],
    });
    await logActivity({
      organization: req.organizationId,
      user: req.userId,
      action: "policy.created_ai",
      entity: "Policy",
      entityId: policy._id,
      req,
    });
    res.status(201).json({ policy });
  } catch (e) {
    next(e);
  }
});

router.post("/chat", requireAuth, async (req, res, next) => {
  try {
    const { messages = [] } = req.body;
    const out = await chatCompliance(messages);
    res.json(out);
  } catch (e) {
    next(e);
  }
});

router.post("/missing-clauses", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const { content, standard = "GDPR" } = req.body;
    const text = JSON.stringify(content || {}).toLowerCase();
    const checks = [
      { key: "retention", label: "Data retention / deletion" },
      { key: "breach", label: "Incident / breach notification" },
      { key: "access", label: "Access rights / DSAR" },
      { key: "lawful", label: "Lawful basis / purpose limitation" },
      { key: "vendor", label: "Sub-processors / vendors" },
    ];
    const missing = checks.filter((c) => !text.includes(c.key)).map((c) => c.label);
    res.json({ missing, standard });
  } catch (e) {
    next(e);
  }
});

export default router;
