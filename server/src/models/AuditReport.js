import mongoose from "mongoose";

const issueSchema = new mongoose.Schema(
  {
    category: { type: String },
    severity: { type: String, enum: ["critical", "warning", "info"], default: "warning" },
    message: { type: String, required: true },
    fix: { type: String },
  },
  { _id: false }
);

const passedCheckSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    detail: { type: String },
  },
  { _id: false }
);

const auditReportSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String },
    mimeType: { type: String },
    extractedText: { type: String },
    complianceScore: { type: Number, min: 0, max: 100 },
    grade: { type: String, enum: ["A", "B", "C", "D", "F"] },
    summary: { type: String },
    passedChecks: [passedCheckSchema],
    issues: [issueSchema],
    missingSections: [{ type: String }],
    outdatedReferences: [{ type: String }],
    securityGaps: [{ type: String }],
    suggestions: [{ type: String }],
    standardsUsed: [{ type: String }],
    rawAnalysis: { type: mongoose.Schema.Types.Mixed },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("AuditReport", auditReportSchema);
