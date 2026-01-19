export interface AiMatch {
  keyword: string;
  index?: number;
}

// High-precision phrases - avoids bare "ai" to reduce false positives
export const AI_KEYWORDS: string[] = [
  "artificial intelligence",
  "machine learning",
  "deep learning",
  "generative ai",
  "genai",
  "large language model",
  "large-language model",
  "llm",
  "llmops",
  "ai/ml",
  "ai-ml",
  "prompt engineering",
  "prompt engineer",
  "retrieval augmented generation",
  "retrieval-augmented generation",
  "rag",
  "vector database",
  "embedding",
  "fine-tuning",
  "finetuning",
  "model evaluation",
  "evals",
  "transformer model",
  "transformers",
  "natural language processing",
  "nlp",
  "computer vision",
  "pytorch",
  "tensorflow",
  "openai",
  "chatgpt",
  "gpt-4",
  "gpt-3.5",
  "copilot",
  "github copilot",
  "claude",
  "gemini",
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ") // collapse punctuation to spaces
    .replace(/\s+/g, " ")
    .trim();
}

// precompiled regexes for word-boundary matching
const KEYWORD_REGEXES = AI_KEYWORDS.map((k) => {
  const normalized = normalize(k);
  const pattern = `(^|\\s)${normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s|$)`;
  return { keyword: k, regex: new RegExp(pattern, "i") };
});

export function findAiMatches(inputText: string | null | undefined): AiMatch[] {
  if (!inputText) return [];
  const text = normalize(inputText);
  if (!text) return [];

  const matches: AiMatch[] = [];
  for (const { keyword, regex } of KEYWORD_REGEXES) {
    const m = regex.exec(text);
    if (m) {
      matches.push({ keyword, index: m.index });
    }
  }

  // Deduplicate, keep original keyword casing.
  const seen = new Set<string>();
  return matches.filter((m) => {
    const key = m.keyword.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function hasAiMatches(inputText: string | null | undefined): boolean {
  return findAiMatches(inputText).length > 0;
}

// Simple wrapper returning just keyword strings (for Convex actions)
export function findAiKeywords(inputText: string | null | undefined): string[] {
  return findAiMatches(inputText).map((m) => m.keyword);
}

