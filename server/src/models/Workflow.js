import mongoose from "mongoose";

const workflowSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    name: { type: String, required: true },
    description: { type: String },
    kind: {
      type: String,
      enum: ["onboarding", "approval", "renewal", "audit_reminder", "ack_tracking", "custom"],
      default: "custom",
    },
    steps: [
      {
        title: { type: String, required: true },
        assigneeRole: { type: String },
        dueInDays: { type: Number, default: 7 },
        completed: { type: Boolean, default: false },
        completedAt: { type: Date },
      },
    ],
    triggers: [{ type: String }],
    active: { type: Boolean, default: true },
    nextRunAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Workflow", workflowSchema);
