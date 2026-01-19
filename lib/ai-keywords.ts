export type AiMatch = {
  /** Canonical keyword/phrase label */
  keyword: string;
  /** Optional: where we found it (for debugging / UI snippets) */
  index?: number;
};

/**
 * High-precision phrases. We intentionally avoid matching bare `ai` to reduce
 * false positives.
 */
const AI_KEYWORDS: string[] = [
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
    // collapse punctuation to spaces (keeps matching simple)
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Precompile regexes once.
const KEYWORD_REGEXES: Array<{ keyword: string; regex: RegExp }> = AI_KEYWORDS.map((k) => {
  const normalized = normalize(k);
  // Word-boundary-ish matching on normalized text (spaces around tokens).
  // Example: "llm" should match as a token.
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


