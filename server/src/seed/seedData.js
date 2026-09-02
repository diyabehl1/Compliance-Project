import "../loadEnv.js";
import mongoose from "mongoose";
import ComplianceStandard from "../models/ComplianceStandard.js";
import Template from "../models/Template.js";
import RegulationUpdate from "../models/RegulationUpdate.js";

const sampleDoc = (title) => ({
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: title }] },
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: "This template is a starting point. Customize jurisdictions, roles, and technical controls before publication.",
        },
      ],
    },
  ],
});

const standards = [
  { code: "GDPR", name: "EU GDPR", description: "EU General Data Protection Regulation", regions: ["EU", "UK"], requiredPolicyTypes: ["privacy_policy", "data_retention"] },
  { code: "ISO_27001", name: "ISO/IEC 27001", description: "Information security management", regions: ["Global"], requiredPolicyTypes: ["cybersecurity", "acceptable_use"] },
  { code: "SOC_2", name: "SOC 2", description: "Trust services criteria", regions: ["US"], requiredPolicyTypes: ["cybersecurity", "password_policy"] },
  { code: "HIPAA", name: "HIPAA", description: "US health information privacy & security", regions: ["US"], requiredPolicyTypes: ["privacy_policy", "cybersecurity"] },
  { code: "PCI_DSS", name: "PCI DSS", description: "Payment card industry data security", regions: ["Global"], requiredPolicyTypes: ["cybersecurity", "password_policy"] },
  { code: "India_DPDP", name: "India DPDP Act", description: "Digital Personal Data Protection Act", regions: ["IN"], requiredPolicyTypes: ["privacy_policy", "data_retention"] },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const stdCount = await ComplianceStandard.countDocuments();
  if (stdCount === 0) {
    await ComplianceStandard.insertMany(standards);
  }

  const count = await Template.countDocuments({ isSystem: true });
  if (count === 0) {
    await Template.insertMany([
      {
        title: "Startup GDPR Privacy Notice",
        description: "Lean privacy notice for EU-facing SaaS.",
        category: "Privacy",
        industry: "Technology",
        country: "EU",
        complianceType: "GDPR",
        department: "Legal",
        policyType: "privacy_policy",
        content: sampleDoc("Privacy Notice"),
        isSystem: true,
      },
      {
        title: "SOC 2 Password & Access Policy",
        description: "Credential hygiene aligned to SOC 2 CC6.",
        category: "Security",
        industry: "Technology",
        country: "US",
        complianceType: "SOC_2",
        department: "IT",
        policyType: "password_policy",
        content: sampleDoc("Password & Access Policy"),
        isSystem: true,
      },
      {
        title: "HIPAA Security Procedures (Lite)",
        description: "Baseline administrative safeguards.",
        category: "Healthcare",
        industry: "Healthcare",
        country: "US",
        complianceType: "HIPAA",
        department: "Security",
        policyType: "cybersecurity",
        content: sampleDoc("HIPAA Security Procedures"),
        isSystem: true,
      },
      {
        title: "India DPDP — Consent & Notice",
        description: "Notice elements for India DPDP readiness.",
        category: "Privacy",
        industry: "General",
        country: "IN",
        complianceType: "India_DPDP",
        department: "Legal",
        policyType: "privacy_policy",
        content: sampleDoc("DPDP Notice"),
        isSystem: true,
      },
      {
        title: "Cybersecurity Incident Playbook",
        description: "Detection, triage, comms, and recovery checklist.",
        category: "Incident",
        industry: "Cybersecurity",
        country: "Global",
        complianceType: "ISO_27001",
        department: "Security",
        policyType: "incident_response",
        content: sampleDoc("Incident Response Playbook"),
        isSystem: true,
      },
    ]);
  }

  const regCount = await RegulationUpdate.countDocuments();
  if (regCount === 0) {
    await RegulationUpdate.insertMany([
      {
        title: "EU: Guidance on AI Act interaction with GDPR",
        summary: "Review automated decision-making clauses in privacy notices.",
        source: "CompliNova Digest",
        severity: "medium",
        affectedStandards: ["GDPR"],
      },
      {
        title: "India DPDP: Data Principal rights operationalization",
        summary: "Ensure grievance officer and consent artifacts are documented.",
        source: "CompliNova Digest",
        severity: "high",
        affectedStandards: ["India_DPDP"],
      },
    ]);
  }

  console.log("Seed complete");
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
