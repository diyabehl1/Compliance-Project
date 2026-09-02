import mongoose from "mongoose";

const templateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    category: { type: String, index: true },
    industry: { type: String, index: true },
    country: { type: String, index: true },
    complianceType: { type: String, index: true },
    department: { type: String, index: true },
    policyType: { type: String },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    isSystem: { type: Boolean, default: false },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    favoriteCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

templateSchema.index({ title: "text", description: "text" });

export default mongoose.model("Template", templateSchema);
