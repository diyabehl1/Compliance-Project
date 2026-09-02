import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, sparse: true },
    industry: { type: String },
    country: { type: String },
    companyType: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    settings: {
      theme: { type: String, default: "system" },
      notifyEmail: { type: Boolean, default: true },
      notifyDashboard: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Organization", organizationSchema);
