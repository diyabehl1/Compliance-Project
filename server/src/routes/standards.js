import { Router } from "express";
import ComplianceStandard from "../models/ComplianceStandard.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const list = await ComplianceStandard.find().sort({ code: 1 });
    res.json({ standards: list });
  } catch (e) {
    next(e);
  }
});

export default router;
