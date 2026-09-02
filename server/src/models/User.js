import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["admin", "compliance_manager", "employee"],
      default: "employee",
    },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    emailVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    avatarUrl: { type: String },
    favoriteTemplates: [{ type: mongoose.Schema.Types.ObjectId, ref: "Template" }],
    language: { type: String, default: "en" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verificationToken;
  delete obj.resetPasswordToken;
  return obj;
};

export default mongoose.model("User", userSchema);
