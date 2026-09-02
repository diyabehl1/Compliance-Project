import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import mammoth from "mammoth";
import { createRequire } from "module";
import AuditReport from "../models/AuditReport.js";
import { requireAuth, loadUserOrg } from "../middleware/auth.js";
import { analyzeDocumentText } from "../services/aiService.js";
import { uploadFilePath, isCloudinaryConfigured } from "../services/cloudinaryService.js";
import { logActivity } from "../utils/activity.js";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "../../uploads");

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safe = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    cb(null, safe);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = [".pdf", ".docx", ".txt"].some((ext) => file.originalname.toLowerCase().endsWith(ext));
    if (!ok) return cb(new Error("Only PDF, DOCX, TXT allowed"));
    cb(null, true);
  },
});

const router = Router();

router.post("/audit", requireAuth, loadUserOrg, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: "file required" });
    const filePath = req.file.path;
    let text = "";
    const lower = req.file.originalname.toLowerCase();
    if (lower.endsWith(".txt")) {
      text = await fs.readFile(filePath, "utf8");
    } else if (lower.endsWith(".docx")) {
      const buf = await fs.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer: buf });
      text = result.value || "";
    } else if (lower.endsWith(".pdf")) {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      text = data.text || "";
    }

    let fileUrl = `/uploads/${req.file.filename}`;
    if (isCloudinaryConfigured()) {
      const cloud = await uploadFilePath(filePath, "complinova/audits");
      if (cloud) fileUrl = cloud;
    }

    const analysis = await analyzeDocumentText(text, req.body.standards ? JSON.parse(req.body.standards) : []);

    const report = await AuditReport.create({
      organization: req.organizationId,
      fileName: req.file.originalname,
      fileUrl,
      mimeType: req.file.mimetype,
      extractedText: text.slice(0, 50000),
      complianceScore: analysis.complianceScore,
      grade: analysis.grade,
      summary: analysis.summary,
      passedChecks: analysis.passedChecks || [],
      issues: analysis.issues || [],
      missingSections: analysis.missingSections,
      outdatedReferences: analysis.outdatedReferences || [],
      securityGaps: analysis.securityGaps,
      suggestions: analysis.suggestions,
      standardsUsed: analysis.standardsUsed || [],
      rawAnalysis: analysis,
      createdBy: req.userId,
    });

    await logActivity({
      organization: req.organizationId,
      user: req.userId,
      action: "audit.uploaded",
      entity: "AuditReport",
      entityId: report._id,
      req,
    });

    res.status(201).json({ report });
  } catch (e) {
    next(e);
  }
});

router.get("/audit/reports", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const reports = await AuditReport.find({ organization: req.organizationId }).sort({ createdAt: -1 }).limit(50);
    res.json({ reports });
  } catch (e) {
    next(e);
  }
});

router.get("/audit/reports/:id", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const report = await AuditReport.findOne({ _id: req.params.id, organization: req.organizationId });
    if (!report) return res.status(404).json({ message: "Not found" });
    res.json({ report });
  } catch (e) {
    next(e);
  }
});

export default router;
