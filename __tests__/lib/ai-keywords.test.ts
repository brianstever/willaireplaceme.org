import { describe, it, expect } from "vitest";
import {
  AI_KEYWORDS,
  findAiMatches,
  findAiKeywords,
  hasAiMatches,
} from "@/lib/ai-keywords";

describe("AI_KEYWORDS", () => {
  it("contains core AI terms", () => {
    expect(AI_KEYWORDS).toContain("machine learning");
    expect(AI_KEYWORDS).toContain("artificial intelligence");
    expect(AI_KEYWORDS).toContain("llm");
    expect(AI_KEYWORDS).toContain("prompt engineering");
  });

  it("does not contain bare 'ai' to avoid false positives", () => {
    // Bare "ai" matches too many unrelated terms
    expect(AI_KEYWORDS).not.toContain("ai");
  });
});

describe("findAiMatches", () => {
  it("returns empty array for null/undefined input", () => {
    expect(findAiMatches(null)).toEqual([]);
    expect(findAiMatches(undefined)).toEqual([]);
    expect(findAiMatches("")).toEqual([]);
  });

  it("finds exact keyword matches", () => {
    const matches = findAiMatches("Experience with machine learning required");
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.map(m => m.keyword)).toContain("machine learning");
  });

  it("is case insensitive", () => {
    const matches = findAiMatches("MACHINE LEARNING experience needed");
    expect(matches.map(m => m.keyword)).toContain("machine learning");
  });

  it("matches keywords with punctuation around them", () => {
    const matches = findAiMatches("Skills: machine learning, deep learning.");
    const keywords = matches.map(m => m.keyword);
    expect(keywords).toContain("machine learning");
    expect(keywords).toContain("deep learning");
  });

  it("finds multiple keywords in one text", () => {
    const text = "Looking for expertise in pytorch, tensorflow, and llm development";
    const matches = findAiMatches(text);
    const keywords = matches.map(m => m.keyword);
    expect(keywords).toContain("pytorch");
    expect(keywords).toContain("tensorflow");
    expect(keywords).toContain("llm");
  });

  it("deduplicates matches", () => {
    const text = "machine learning machine learning machine learning";
    const matches = findAiMatches(text);
    expect(matches.filter(m => m.keyword === "machine learning").length).toBe(1);
  });

  it("does not match partial words", () => {
    // "rag" should not match "storage"
    const matches = findAiMatches("data storage solutions");
    expect(matches.map(m => m.keyword)).not.toContain("rag");
  });

  it("matches hyphenated variants", () => {
    const matches = findAiMatches("Experience with fine-tuning models");
    expect(matches.map(m => m.keyword)).toContain("fine-tuning");
  });

  it("returns match indices", () => {
    const matches = findAiMatches("We need machine learning skills");
    const mlMatch = matches.find(m => m.keyword === "machine learning");
    expect(mlMatch?.index).toBeDefined();
    expect(typeof mlMatch?.index).toBe("number");
  });
});

describe("findAiKeywords", () => {
  it("returns just keyword strings", () => {
    const keywords = findAiKeywords("pytorch and tensorflow experience");
    expect(keywords).toContain("pytorch");
    expect(keywords).toContain("tensorflow");
    expect(keywords.every(k => typeof k === "string")).toBe(true);
  });

  it("returns empty array for no matches", () => {
    const keywords = findAiKeywords("Administrative assistant needed");
    expect(keywords).toEqual([]);
  });
});

describe("hasAiMatches", () => {
  it("returns true when keywords found", () => {
    expect(hasAiMatches("Experience with llm required")).toBe(true);
  });

  it("returns false when no keywords found", () => {
    expect(hasAiMatches("General office work")).toBe(false);
  });

  it("returns false for empty input", () => {
    expect(hasAiMatches("")).toBe(false);
    expect(hasAiMatches(null)).toBe(false);
  });
});
