import { Router } from "express";
import { requireAuth, loadUserOrg } from "../middleware/auth.js";
import { gapAnalysisFromAnswers } from "../services/aiService.js";
import Policy from "../models/Policy.js";
import { logActivity } from "../utils/activity.js";

const router = Router();

router.post("/gap-analyzer", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const answers = {
      collectsCustomerData: Boolean(req.body.collectsCustomerData),
      processesPayments: Boolean(req.body.processesPayments),
      remoteWork: Boolean(req.body.remoteWork),
      usesCloud: Boolean(req.body.usesCloud),
      healthData: Boolean(req.body.healthData),
    };
    const result = gapAnalysisFromAnswers(answers);
    await logActivity({
      organization: req.organizationId,
      user: req.userId,
      action: "compliance.gap_analyzed",
      entity: "Compliance",
      meta: answers,
      req,
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post("/checklist", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const standards = req.body.standards || ["GDPR"];
    const items = [
      { id: "1", label: "Records of processing / RoPA", standards: ["GDPR", "India_DPDP"] },
      { id: "2", label: "Privacy notice published", standards: ["GDPR", "India_DPDP", "HIPAA"] },
      { id: "3", label: "Access control & MFA for admins", standards: ["ISO_27001", "SOC_2", "PCI_DSS"] },
      { id: "4", label: "Incident response runbooks tested", standards: ["ISO_27001", "SOC_2", "GDPR"] },
      { id: "5", label: "Vendor DPAs / BAAs executed", standards: ["GDPR", "SOC_2", "HIPAA"] },
    ].filter((i) => i.standards.some((s) => standards.includes(s)));
    res.json({ checklist: items });
  } catch (e) {
    next(e);
  }
});

router.get("/score-prediction", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const orgId = req.organizationId;
    const policies = await Policy.find({ organization: orgId });
    const published = policies.filter((p) => p.status === "published").length;
    const base = 45 + Math.min(40, published * 8);
    const variance = policies.length ? Math.min(15, policies.filter((p) => p.versions?.length > 2).length * 3) : 0;
    res.json({
      predictedScore: Math.min(98, base + variance),
      drivers: [
        { label: "Published policies", value: published },
        { label: "Version discipline", value: variance ? "strong" : "improve" },
      ],
    });
  } catch (e) {
    next(e);
  }
});

export default router;
