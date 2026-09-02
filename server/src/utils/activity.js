import ActivityLog from "../models/ActivityLog.js";

export async function logActivity({ organization, user, action, entity, entityId, meta, req }) {
  try {
    await ActivityLog.create({
      organization,
      user,
      action,
      entity,
      entityId,
      meta,
      ip: req?.ip || req?.headers?.["x-forwarded-for"],
    });
  } catch (e) {
    console.warn("activity log failed", e.message);
  }
}
