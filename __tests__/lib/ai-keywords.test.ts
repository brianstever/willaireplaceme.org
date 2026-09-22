import { expect, it } from "vitest";
import { findAiKeywords } from "@/lib/ai-keywords";

it.each([
  "Repair electrical transformers",
  "Use a clean rag to wipe surfaces",
  "Experience embedding tissue samples",
  "Fine-tuning industrial equipment",
  "LL.M. degree in law",
  "Copilot of a transport aircraft",
  "General administrative work",
])("does not match unrelated text: %s", (text) =>
  expect(findAiKeywords(text)).toEqual([]),
);

it("normalizes aliases and repeated mentions into a single term", () => {
  expect(
    findAiKeywords(
      "LLMs, large-language models and a large language model; AI/ML and machine learning",
    ),
  ).toEqual(["machine learning", "large language model"]);
});
it("counts a mention even when the skill is explicitly not required", () => {
  expect(
    findAiKeywords("Artificial intelligence experience is not required"),
  ).toEqual(["artificial intelligence"]);
});
it("recognizes explicit tools and phrases across punctuation and case", () => {
  expect(
    findAiKeywords(
      "Skills: PyTorch; RETRIEVAL-AUGMENTED GENERATION; GitHub Copilot",
    ),
  ).toEqual(["retrieval augmented generation", "pytorch", "github copilot"]);
});

it.each([
  {
    id: "885021600",
    text: "Applying statistical methods, predictive modeling, machine learning, natural language processing, generative artificial intelligence",
    mentionsAi: true,
  },
  {
    id: "884783000",
    text: "Maintaining machine learning, natural language processing, and/or artificial intelligence systems in production",
    mentionsAi: true,
  },
  {
    id: "884227600",
    text: "Generative AI & LLM Frameworks: Experience developing, configuring, or integrating machine learning models",
    mentionsAi: true,
  },
  {
    id: "883858400",
    text: "Work includes branch circuits, panels, switchgear, transformers, motor-control circuits, emergency-power and generator systems",
    mentionsAi: false,
  },
  {
    id: "885342600",
    text: "Installs, modifies, tests, repairs, and maintains transformers, converters, regulators, cables, switches, circuit breakers",
    mentionsAi: false,
  },
  {
    id: "884392000",
    text: "Applicants must possess a Bachelor of Law (LL.B), Master of Law (LL.M), or Juris Doctor (J.D.) law degree",
    mentionsAi: false,
  },
  {
    id: "853385500",
    text: "Education: Applicants must possess a LL.B., J.D., or LL.M. degree.",
    mentionsAi: false,
  },
])("classifies source excerpt $id", ({ text, mentionsAi }) => {
  expect(findAiKeywords(text).length > 0).toBe(mentionsAi);
});
