import mongoose from "mongoose";

const regulationUpdateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    summary: { type: String },
    source: { type: String },
    url: { type: String },
    affectedStandards: [{ type: String }],
    publishedAt: { type: Date, default: Date.now },
    severity: { type: String, enum: ["info", "low", "medium", "high"], default: "medium" },
  },
  { timestamps: true }
);

export default mongoose.model("RegulationUpdate", regulationUpdateSchema);
