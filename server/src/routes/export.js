import { Router } from "express";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import PDFDocument from "pdfkit";
import Policy from "../models/Policy.js";
import { requireAuth, loadUserOrg } from "../middleware/auth.js";

const router = Router();

function tiptapToPlainBlocks(content) {
  const blocks = [];
  function collectText(node) {
    if (!node) return "";
    if (node.text) return node.text;
    if (node.content) return node.content.map(collectText).join("");
    return "";
  }
  function walk(node) {
    if (!node) return;
    if (node.type === "heading") {
      const level = node.attrs?.level || 2;
      blocks.push({ type: "heading", level, text: collectText(node) });
      return;
    }
    if (node.type === "paragraph") {
      blocks.push({ type: "paragraph", text: collectText(node) });
      return;
    }
    if (node.type === "bulletList" || node.type === "orderedList") {
      (node.content || []).forEach((li) => {
        (li.content || []).forEach((p) => walk(p));
      });
      return;
    }
    if (node.content) node.content.forEach(walk);
  }
  if (content?.content) content.content.forEach(walk);
  return blocks;
}

router.get("/policy/:id/:format", requireAuth, loadUserOrg, async (req, res, next) => {
  try {
    const policy = await Policy.findOne({ _id: req.params.id, organization: req.organizationId });
    if (!policy) return res.status(404).json({ message: "Not found" });
    const format = req.params.format;
    const blocks = tiptapToPlainBlocks(policy.content);

    if (format === "docx") {
      const children = [
        new Paragraph({
          text: policy.title,
          heading: HeadingLevel.TITLE,
        }),
        ...blocks.flatMap((b) => {
          if (b.type === "heading") {
            return [
              new Paragraph({
                text: b.text,
                heading: b.level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
              }),
            ];
          }
          return [new Paragraph({ children: [new TextRun(b.text || " ")] })];
        }),
      ];
      const doc = new Document({ sections: [{ children }] });
      const buffer = await Packer.toBuffer(doc);
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", `attachment; filename="${policy.title.replace(/[^\w.-]/g, "_")}.docx"`);
      return res.send(buffer);
    }

    if (format === "pdf") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${policy.title.replace(/[^\w.-]/g, "_")}.pdf"`);
      const doc = new PDFDocument({ margin: 50 });
      doc.pipe(res);
      doc.fontSize(20).text(policy.title, { underline: true });
      doc.moveDown();
      blocks.forEach((b) => {
        if (b.type === "heading") {
          doc.moveDown(0.5).fontSize(14).text(b.text, { continued: false });
        } else {
          doc.fontSize(11).text(b.text || "", { align: "left" });
          doc.moveDown(0.3);
        }
      });
      doc.end();
      return;
    }

    res.status(400).json({ message: "format must be docx or pdf" });
  } catch (e) {
    next(e);
  }
});

export default router;
