import mongoose from "mongoose";

export async function connectDB() {
  const uri = (process.env.MONGODB_URI || "").trim();
  if (!uri) {
    console.error(
      "MONGODB_URI is missing. Create `server/.env` from `server/.env.example`.\n" +
        "If values look correct but still fail, quote any value with spaces (e.g. EMAIL_FROM=\"...\").\n" +
        "Env is loaded from `server/.env` regardless of your shell cwd."
    );
    throw new Error("MONGODB_URI is required");
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("MongoDB connected");
}
