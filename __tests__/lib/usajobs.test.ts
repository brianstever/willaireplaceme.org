import { describe, it, expect } from "vitest";
import {
  computeAiPressureFromSearchItems,
  type UsaJobsSearchItem,
} from "@/lib/usajobs";

function makeItem(matchText: string, title?: string): UsaJobsSearchItem {
  return {
    matchText,
    positionTitle: title ?? "Test Position",
    organizationName: "Test Agency",
  };
}

describe("computeAiPressureFromSearchItems", () => {
  it("returns zero counts for empty items", () => {
    const result = computeAiPressureFromSearchItems({ items: [] });
    expect(result.total).toBe(0);
    expect(result.aiCount).toBe(0);
    expect(result.aiShare).toBe(null);
    expect(result.topKeywords).toEqual([]);
    expect(result.examples).toEqual([]);
  });

  it("counts items with AI keywords", () => {
    const items = [
      makeItem("Experience with machine learning required"),
      makeItem("General administrative work"),
      makeItem("Pytorch and tensorflow skills"),
    ];
    const result = computeAiPressureFromSearchItems({ items });
    expect(result.total).toBe(3);
    expect(result.aiCount).toBe(2);
  });

  it("returns aiShare as null when sample too small", () => {
    const items = [
      makeItem("machine learning"),
      makeItem("deep learning"),
    ];
    const result = computeAiPressureFromSearchItems({
      items,
      minSampleForShare: 20,
    });
    expect(result.aiShare).toBe(null);
    expect(result.note).toContain("Low sample");
  });

  it("returns aiShare when sample is large enough", () => {
    const items = Array(25).fill(null).map((_, i) =>
      makeItem(i < 10 ? "machine learning" : "no keywords", `Position ${i}`)
    );
    const result = computeAiPressureFromSearchItems({
      items,
      minSampleForShare: 20,
    });
    expect(result.aiShare).toBe(10 / 25);
    expect(result.note).toBeUndefined();
  });

  it("extracts top keywords sorted by count", () => {
    const items = [
      makeItem("machine learning and pytorch"),
      makeItem("machine learning and tensorflow"),
      makeItem("machine learning"),
      makeItem("pytorch"),
    ];
    const result = computeAiPressureFromSearchItems({ items });
    expect(result.topKeywords[0].keyword).toBe("machine learning");
    expect(result.topKeywords[0].count).toBe(3);
  });

  it("limits examples to maxExamples", () => {
    const items = Array(10).fill(null).map((_, i) =>
      makeItem("llm experience", `Position ${i}`)
    );
    const result = computeAiPressureFromSearchItems({
      items,
      maxExamples: 3,
    });
    expect(result.examples.length).toBe(3);
  });

  it("includes matched keywords in examples", () => {
    const items = [makeItem("pytorch and tensorflow", "ML Engineer")];
    const result = computeAiPressureFromSearchItems({ items });
    expect(result.examples[0].matchedKeywords).toContain("pytorch");
    expect(result.examples[0].matchedKeywords).toContain("tensorflow");
  });

  it("skips items without positionTitle for examples", () => {
    const items: UsaJobsSearchItem[] = [
      { matchText: "llm experience" }, // no title
      { matchText: "llm experience", positionTitle: "Has Title" },
    ];
    const result = computeAiPressureFromSearchItems({ items });
    expect(result.examples.length).toBe(1);
    expect(result.examples[0].title).toBe("Has Title");
  });

  it("includes agency info in examples", () => {
    const items: UsaJobsSearchItem[] = [{
      matchText: "machine learning",
      positionTitle: "Data Scientist",
      organizationName: "NASA",
      departmentName: "Science Division",
    }];
    const result = computeAiPressureFromSearchItems({ items });
    expect(result.examples[0].agency).toBe("NASA");
    expect(result.examples[0].department).toBe("Science Division");
  });

  it("limits topKeywords to 8", () => {
    // Create items with many different keywords
    const items = [
      makeItem("machine learning deep learning pytorch tensorflow openai chatgpt claude gemini llm nlp computer vision"),
    ];
    const result = computeAiPressureFromSearchItems({ items });
    expect(result.topKeywords.length).toBeLessThanOrEqual(8);
  });
});
