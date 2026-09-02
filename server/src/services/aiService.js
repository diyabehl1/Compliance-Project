import OpenAI from "openai";

const STANDARDS = ["GDPR", "ISO_27001", "SOC_2", "HIPAA", "PCI_DSS", "India_DPDP"];

const POLICY_LABELS = {
  privacy_policy: "Privacy Policy",
  password_policy: "Password Policy",
  incident_response: "Incident Response Policy",
  cybersecurity: "Cybersecurity Policy",
  hr_policy: "HR Policy",
  data_retention: "Data Retention Policy",
  acceptable_use: "Acceptable Use Policy",
};

function toneInstruction(tone) {
  const map = {
    professional: "Use clear, professional enterprise language.",
    startup_friendly: "Use concise, modern startup-friendly language while staying accurate.",
    legal: "Use formal legal style with defined terms and obligations; not a substitute for counsel.",
    technical: "Include technical security and IT operations detail suitable for security teams.",
  };
  return map[tone] || map.professional;
}

function buildFallbackPolicy({ industry, country, companyType, standard, policyType, tone, language }) {
  const title = POLICY_LABELS[policyType] || "Compliance Policy";
  const std = standard.replace(/_/g, " ");
  const langNote = language && language !== "en" ? `\n\n[Draft structure in English; translate fully to ${language} in production with a translator.]` : "";
  return {
    title: `${title} — ${std}`,
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: title }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: `This ${title} applies to ${companyType || "the organization"} operating in ${country || "relevant jurisdictions"}, in the ${industry || "general"} sector. It aligns with ${std} requirements.`,
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Purpose & scope" }],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Define roles, responsibilities, and approved systems." }],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Reference applicable laws, contracts, and risk appetite." }],
                },
              ],
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Controls & procedures" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: `Operational controls should reflect ${std}: data minimization, access control, logging, incident handling, vendor management, and periodic review. Tone: ${tone}.`,
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Review" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "This policy shall be reviewed at least annually or when material changes occur." }],
        },
      ],
    },
    meta: { fallback: true, standard, policyType, tone, language },
    disclaimer:
      "This is AI-assisted draft content for governance workflows only. It is not legal advice. Engage qualified counsel for binding obligations.",
  };
}

let openaiClient;

function getOpenAI() {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!openaiClient) openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openaiClient;
}

export async function generatePolicyDoc(input) {
  const {
    industry = "",
    country = "",
    companyType = "",
    standard = "GDPR",
    policyType = "privacy_policy",
    tone = "professional",
    language = "en",
  } = input;

  const client = getOpenAI();
  const policyName = POLICY_LABELS[policyType] || "Policy";

  if (!client) {
    return buildFallbackPolicy({ industry, country, companyType, standard, policyType, tone, language });
  }

  const sys = `You are a compliance policy drafting assistant. ${toneInstruction(
    tone
  )} Output STRICT JSON with keys: title (string), sections (array of {heading, body markdown string}). No markdown outside JSON.`;

  const user = `Draft ${policyName} for:
- Industry: ${industry}
- Country/region: ${country}
- Company type: ${companyType}
- Primary standard: ${standard.replace(/_/g, " ")}
- Language code: ${language}
Include scope, roles, data handling where relevant, security controls references, breach/incident basics if applicable, retention hints, and review cycle.`;

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
    temperature: 0.4,
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  let parsed;
  try {
    parsed = JSON.parse(raw.replace(/```json\n?|\n?```/g, "").trim());
  } catch {
    return buildFallbackPolicy({ industry, country, companyType, standard, policyType, tone, language });
  }

  const content = {
    type: "doc",
    content: [
      { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: parsed.title || policyName }] },
      ...(parsed.sections || []).flatMap((s) => [
        { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: s.heading || "Section" }] },
        {
          type: "paragraph",
          content: [{ type: "text", text: (s.body || "").replace(/\n+/g, " ").slice(0, 8000) }],
        },
      ]),
    ],
  };

  return {
    title: parsed.title || policyName,
    content,
    meta: { openai: true },
    disclaimer:
      "This is AI-assisted draft content for governance workflows only. It is not legal advice. Engage qualified counsel for binding obligations.",
  };
}

export async function rewritePolicyDoc({ content, tone = "professional" }) {
  const client = getOpenAI();
  if (!client) {
    return { content, note: "OpenAI not configured; returning original." };
  }
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Rewrite policy JSON (TipTap-like doc root type doc). ${toneInstruction(tone)} Return ONLY valid JSON: { "type":"doc","content":[...] }`,
      },
      { role: "user", content: JSON.stringify(content).slice(0, 120000) },
    ],
    temperature: 0.3,
  });
  const raw = completion.choices[0]?.message?.content || "";
  try {
    const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return { content: parsed };
  } catch {
    return { content, note: "Rewrite parse failed; original kept." };
  }
}

export async function chatCompliance(messages) {
  const client = getOpenAI();
  if (!client) {
    const last = messages[messages.length - 1]?.content || "";
    return {
      reply: `CompliNova AI (offline mode): I can help with GDPR, SOC 2, ISO 27001, HIPAA, PCI DSS, and India DPDP at a high level. You asked: "${String(
        last
      ).slice(0, 200)}". Configure OPENAI_API_KEY for full AI answers.`,
    };
  }
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are CompliNova AI, a compliance assistant. Give accurate, cautious guidance; remind users legal advice requires counsel. Be concise.",
      },
      ...messages.slice(-12).map((m) => ({ role: m.role, content: m.content })),
    ],
    temperature: 0.35,
  });
  return { reply: completion.choices[0]?.message?.content || "" };
}

export function scoreToGrade(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

const POLICY_CHECKS = [
  { id: "purpose", label: "Purpose & scope defined", keywords: ["purpose", "scope", "applies to", "objective"], weight: 12 },
  { id: "roles", label: "Roles & responsibilities", keywords: ["responsible", "role", "accountable", "owner", "duties"], weight: 10 },
  { id: "data", label: "Data handling & privacy", keywords: ["data", "personal", "privacy", "processing", "collection"], weight: 14 },
  { id: "security", label: "Security controls", keywords: ["security", "encryption", "access control", "mfa", "authentication"], weight: 14 },
  { id: "breach", label: "Incident / breach response", keywords: ["breach", "incident", "notification", "response"], weight: 12 },
  { id: "retention", label: "Retention & deletion", keywords: ["retention", "delete", "deletion", "archive", "dispose"], weight: 10 },
  { id: "vendor", label: "Vendor / third-party management", keywords: ["vendor", "third party", "subprocessor", "supplier"], weight: 10 },
  { id: "training", label: "Training & awareness", keywords: ["training", "awareness", "education", "onboarding"], weight: 8 },
  { id: "review", label: "Review & update cycle", keywords: ["review", "annual", "update", "revision", "maintain"], weight: 10 },
];

function heuristicPolicyAnalysis(text, standardHints = []) {
  const lower = (text || "").toLowerCase();
  const passedChecks = [];
  const issues = [];
  let earned = 0;
  let totalWeight = 0;

  for (const check of POLICY_CHECKS) {
    totalWeight += check.weight;
    const hit = check.keywords.some((k) => lower.includes(k));
    if (hit) {
      earned += check.weight;
      passedChecks.push({ label: check.label, detail: "Required language detected in document." });
    } else {
      issues.push({
        category: check.label,
        severity: check.weight >= 12 ? "critical" : "warning",
        message: `Missing or weak coverage: ${check.label.toLowerCase()}.`,
        fix: `Add a dedicated section covering ${check.label.toLowerCase()} with clear obligations.`,
      });
    }
  }

  const outdatedPatterns = [
    { pattern: /eu directive 95\/46|safe harbor(?! framework)/i, msg: "References pre-GDPR EU Directive 95/46 or Safe Harbor — update to GDPR/ePrivacy." },
    { pattern: /password.*6 character/i, msg: "Weak password minimum (6 chars) — align with NIST/SOC 2 (12+ chars, MFA)." },
  ];
  const outdatedReferences = [];
  for (const o of outdatedPatterns) {
    if (o.pattern.test(text || "")) outdatedReferences.push(o.msg);
  }
  outdatedReferences.forEach((ref) => {
    issues.push({ category: "Outdated reference", severity: "warning", message: ref, fix: "Replace with current regulatory language." });
  });

  const securityGaps = [];
  if (!lower.includes("encrypt")) securityGaps.push("No explicit encryption requirements for data at rest or in transit.");
  if (!lower.includes("mfa") && !lower.includes("multi-factor")) securityGaps.push("Multi-factor authentication not mandated for privileged access.");
  securityGaps.forEach((gap) => {
    issues.push({ category: "Security gap", severity: "critical", message: gap, fix: "Document technical and administrative safeguards." });
  });

  const complianceScore = Math.min(100, Math.max(25, Math.round((earned / totalWeight) * 100) - outdatedReferences.length * 5));
  const missingSections = issues.filter((i) => i.severity === "critical").map((i) => i.message);
  const suggestions = [
    "Add a RACI matrix for policy ownership.",
    "Cross-reference related policies (privacy, security, HR).",
    "Define measurable review KPIs and audit evidence.",
  ];

  return {
    complianceScore,
    grade: scoreToGrade(complianceScore),
    summary: complianceScore >= 80
      ? "Policy is largely compliant with core governance clauses; minor improvements recommended."
      : complianceScore >= 60
        ? "Policy has gaps — address missing sections before audit or publication."
        : "Policy needs significant revision to meet baseline compliance expectations.",
    passedChecks,
    issues,
    missingSections,
    outdatedReferences,
    securityGaps,
    suggestions,
    standardsUsed: standardHints.length ? standardHints : ["General"],
    note: "Rule-based scan (configure OPENAI_API_KEY for deeper AI review).",
  };
}

export async function analyzeDocumentText(text, standardHints = []) {
  const client = getOpenAI();
  const excerpt = (text || "").slice(0, 24000);

  if (!client) {
    return heuristicPolicyAnalysis(excerpt, standardHints);
  }

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a compliance policy auditor. Return JSON only:
{
  "complianceScore": number 0-100,
  "grade": "A"|"B"|"C"|"D"|"F",
  "summary": string (1-2 sentences),
  "passedChecks": [{"label": string, "detail": string}],
  "issues": [{"category": string, "severity": "critical"|"warning"|"info", "message": string, "fix": string}],
  "missingSections": string[],
  "outdatedReferences": string[],
  "securityGaps": string[],
  "suggestions": string[]
}
Standards context: ${standardHints.join(", ") || "general"}`,
      },
      { role: "user", content: excerpt || "Empty document" },
    ],
    temperature: 0.2,
  });

  const raw = completion.choices[0]?.message?.content || "{}";
  try {
    const parsed = JSON.parse(raw.replace(/```json\n?|\n?```/g, "").trim());
    const score = Math.min(100, Math.max(0, Number(parsed.complianceScore) || 0));
    return {
      complianceScore: score,
      grade: parsed.grade || scoreToGrade(score),
      summary: parsed.summary || "",
      passedChecks: parsed.passedChecks || [],
      issues: parsed.issues || [],
      missingSections: parsed.missingSections || [],
      outdatedReferences: parsed.outdatedReferences || [],
      securityGaps: parsed.securityGaps || [],
      suggestions: parsed.suggestions || [],
      standardsUsed: standardHints,
    };
  } catch {
    return heuristicPolicyAnalysis(excerpt, standardHints);
  }
}

export function gapAnalysisFromAnswers(answers) {
  const applicable = new Set();
  const policies = new Set();
  let risk = 20;

  if (answers.collectsCustomerData) {
    applicable.add("GDPR");
    applicable.add("India_DPDP");
    policies.add("privacy_policy");
    policies.add("data_retention");
    risk += 15;
  }
  if (answers.processesPayments) {
    applicable.add("PCI_DSS");
    policies.add("cybersecurity");
    risk += 20;
  }
  if (answers.remoteWork) {
    applicable.add("ISO_27001");
    policies.add("acceptable_use");
    policies.add("password_policy");
    risk += 10;
  }
  if (answers.usesCloud) {
    applicable.add("SOC_2");
    applicable.add("ISO_27001");
    policies.add("cybersecurity");
    risk += 10;
  }
  if (answers.healthData) {
    applicable.add("HIPAA");
    policies.add("privacy_policy");
    risk += 25;
  }

  const roadmap = [
    { phase: "Discover", tasks: ["Data inventory", "Vendor list", "Systems map"] },
    { phase: "Design", tasks: Array.from(policies).map((p) => `Draft ${POLICY_LABELS[p] || p}`) },
    { phase: "Operate", tasks: ["Training", "Acknowledgments", "Continuous monitoring"] },
    { phase: "Assess", tasks: ["Internal audit", "Pen test coordination", "Gap remediation"] },
  ];

  return {
    applicableStandards: Array.from(applicable),
    suggestedPolicies: Array.from(policies),
    riskScore: Math.min(100, risk),
    roadmap,
  };
}

export function clauseRecommendations(policyType, standard) {
  const base = [
    "Define data categories and lawful basis (where GDPR/DPDP applies).",
    "Document retention schedules and secure deletion.",
    "Mandate MFA for privileged access.",
    "Require security review for new vendors.",
  ];
  if (standard?.includes("HIPAA")) base.push("HIPAA: BAAs, minimum necessary, audit controls.");
  if (standard?.includes("PCI")) base.push("PCI: segmentation, PAN handling prohibition, ASV scanning.");
  return base;
}

export { STANDARDS, POLICY_LABELS };
