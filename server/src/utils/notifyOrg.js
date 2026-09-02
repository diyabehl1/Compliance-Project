import Notification from "../models/Notification.js";
import User from "../models/User.js";
import Organization from "../models/Organization.js";
import { sendMail } from "../services/emailService.js";

export async function notifyOrganization(organizationId, { title, message, type = "regulation", link, meta }) {
  const users = await User.find({ organization: organizationId });
  if (!users.length) return;
  await Notification.insertMany(
    users.map((u) => ({
      user: u._id,
      organization: organizationId,
      type,
      title,
      message,
      link,
      meta,
    }))
  );
  const org = await Organization.findById(organizationId);
  const admin = users.find((u) => u.role === "admin");
  if (admin && org?.settings?.notifyEmail !== false) {
    await sendMail({
      to: admin.email,
      subject: `[CompliNova] ${title}`,
      text: message,
      html: `<p>${message}</p>${link ? `<p><a href="${link}">Open dashboard</a></p>` : ""}`,
    }).catch(() => {});
  }
}
