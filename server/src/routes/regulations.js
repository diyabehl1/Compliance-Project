import { Router } from "express";
import RegulationUpdate from "../models/RegulationUpdate.js";
import { requireAuth, loadUserOrg } from "../middleware/auth.js";
import { notifyOrganization } from "../utils/notifyOrg.js";

const router = Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const items = await RegulationUpdate.find().sort({ publishedAt: -1 }).limit(100);
    res.json({ updates: items });
  } catch (e) {
    next(e);
  }
});

router.post("/", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    if (req.userRole !== "admin" && req.userRole !== "compliance_manager") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const u = await RegulationUpdate.create(req.body);
    await notifyOrganization(req.organizationId, {
      title: `Regulation update: ${u.title}`,
      message: u.summary || "",
      type: "regulation",
      link: "/app/regulations",
      meta: { regulationId: u._id },
    });
    res.status(201).json({ update: u });
  } catch (e) {
    next(e);
  }
});

export default router;
