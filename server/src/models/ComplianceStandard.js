import mongoose from "mongoose";

const complianceStandardSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    regions: [{ type: String }],
    requiredPolicyTypes: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model("ComplianceStandard", complianceStandardSchema);
