import mongoose from "mongoose";

const versionSchema = new mongoose.Schema(
  {
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    label: { type: String, default: "v1" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
    comment: { type: String },
  },
  { _id: true }
);

const policySchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: [
        "privacy_policy",
        "password_policy",
        "incident_response",
        "cybersecurity",
        "hr_policy",
        "data_retention",
        "acceptable_use",
        "custom",
      ],
      default: "custom",
    },
    complianceStandards: [{ type: String }],
    content: { type: mongoose.Schema.Types.Mixed, default: { type: "doc", content: [] } },
    status: { type: String, enum: ["draft", "review", "published", "archived"], default: "draft" },
    expiresAt: { type: Date },
    versions: [versionSchema],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        body: { type: String, required: true },
        anchor: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    missingClauseHints: [{ type: String }],
    aiSuggestions: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sourceTemplate: { type: mongoose.Schema.Types.ObjectId, ref: "Template" },
    tone: { type: String },
    language: { type: String, default: "en" },
  },
  { timestamps: true }
);

policySchema.index({ organization: 1, title: 1 });
policySchema.index({ organization: 1, status: 1 });

export default mongoose.model("Policy", policySchema);
