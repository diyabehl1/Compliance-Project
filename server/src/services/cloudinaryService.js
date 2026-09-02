import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
  );
}

export function configureCloudinary() {
  if (!isCloudinaryConfigured()) return false;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return true;
}

/** Upload local file path; returns secure_url or null */
export async function uploadFilePath(filePath, folder = "complinova") {
  if (!isCloudinaryConfigured()) return null;
  configureCloudinary();
  const res = await cloudinary.uploader.upload(filePath, { folder, resource_type: "auto" });
  try {
    await fs.unlink(filePath);
  } catch {
    /* ignore */
  }
  return res.secure_url;
}
