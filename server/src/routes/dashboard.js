import { Router } from "express";
import Policy from "../models/Policy.js";
import EmployeeAcknowledgment from "../models/EmployeeAcknowledgment.js";
import AuditReport from "../models/AuditReport.js";
import Workflow from "../models/Workflow.js";
import { requireAuth, loadUserOrg } from "../middleware/auth.js";

const router = Router();

router.get("/health", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const orgId = req.organizationId;
    const policies = await Policy.find({ organization: orgId });
    const published = policies.filter((p) => p.status === "published").length;
    const drafts = policies.filter((p) => p.status === "draft").length;
    const now = new Date();
    const thirty = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30);
    const expiring = policies.filter((p) => p.expiresAt && p.expiresAt < thirty && p.expiresAt > now).length;

    const acks = await EmployeeAcknowledgment.find({ organization: orgId });
    const signed = acks.filter((a) => a.status === "signed").length;
    const pendingAck = acks.filter((a) => a.status === "pending").length;

    const reports = await AuditReport.find({ organization: orgId }).sort({ createdAt: -1 }).limit(5);
    const avgAudit =
      reports.length > 0 ? Math.round(reports.reduce((s, r) => s + (r.complianceScore || 0), 0) / reports.length) : null;

    const requiredTypes = [
      "privacy_policy",
      "password_policy",
      "incident_response",
      "cybersecurity",
      "acceptable_use",
    ];
    const haveTypes = new Set(policies.map((p) => p.type));
    const missingPolicies = requiredTypes.filter((t) => !haveTypes.has(t));

    const complianceScore = Math.min(
      100,
      Math.round(35 + published * 10 + (avgAudit || 70) * 0.25 - missingPolicies.length * 5)
    );
    const auditReadiness = Math.min(100, Math.round(complianceScore * 0.92 + (signed > 0 ? 5 : 0)));
    const riskLevel =
      complianceScore > 80 ? "low" : complianceScore > 60 ? "medium" : "high";

    res.json({
      complianceScore,
      missingPolicies,
      expiringDocuments: expiring,
      signedPolicies: signed,
      pendingAcknowledgments: pendingAck,
      riskLevel,
      auditReadinessPercentage: auditReadiness,
      draftPolicies: drafts,
      publishedPolicies: published,
      heatmap: [
        { area: "Privacy", value: haveTypes.has("privacy_policy") ? 88 : 40 },
        { area: "Security", value: haveTypes.has("cybersecurity") ? 82 : 45 },
        { area: "HR / AUP", value: haveTypes.has("acceptable_use") ? 75 : 50 },
        { area: "Incident", value: haveTypes.has("incident_response") ? 80 : 42 },
      ],
      recentAuditScores: reports.map((r) => ({
        id: r._id,
        fileName: r.fileName,
        score: r.complianceScore,
        grade: r.grade,
        date: r.createdAt,
        issueCount: (r.issues?.length || 0) + (r.missingSections?.length || 0),
        passedCount: r.passedChecks?.length || 0,
      })),
      uploadedPolicyScores: reports.map((r) => ({
        id: r._id,
        fileName: r.fileName,
        score: r.complianceScore,
        grade: r.grade,
        summary: r.summary,
        passedCount: r.passedChecks?.length || 0,
        issueCount: r.issues?.length || 0,
        createdAt: r.createdAt,
      })),
    });
  } catch (e) {
    next(e);
  }
});

router.get("/calendar", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const policies = await Policy.find({
      organization: req.organizationId,
      expiresAt: { $exists: true, $ne: null },
    });
    const workflows = await Workflow.find({ organization: req.organizationId, active: true });
    const events = [
      ...policies.map((p) => ({
        id: p._id,
        title: `Renew: ${p.title}`,
        date: p.expiresAt,
        type: "renewal",
      })),
      ...workflows
        .filter((w) => w.nextRunAt)
        .map((w) => ({
          id: w._id,
          title: w.name,
          date: w.nextRunAt,
          type: "workflow",
        })),
    ];
    res.json({ events });
  } catch (e) {
    next(e);
  }
});

export default router;
