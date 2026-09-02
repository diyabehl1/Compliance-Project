import mongoose from "mongoose";

const employeeAcknowledgmentSchema = new mongoose.Schema(
  {
    policy: { type: mongoose.Schema.Types.ObjectId, ref: "Policy", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    status: { type: String, enum: ["pending", "signed", "declined"], default: "pending" },
    signedAt: { type: Date },
    signature: { type: String },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

employeeAcknowledgmentSchema.index({ policy: 1, user: 1 }, { unique: true });

export default mongoose.model("EmployeeAcknowledgment", employeeAcknowledgmentSchema);
