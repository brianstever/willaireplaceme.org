const KEYWORD_ALIASES: Record<string, string[]> = {
  "artificial intelligence": ["artificial intelligence"],
  "machine learning": ["machine learning", "ai/ml", "ai-ml"],
  "deep learning": ["deep learning"],
  "generative ai": ["generative ai", "genai"],
  "large language model": [
    "large language model",
    "large language models",
    "large-language model",
    "llm",
    "llms",
  ],
  llmops: ["llmops"],
  "prompt engineering": ["prompt engineering", "prompt engineer"],
  "retrieval augmented generation": [
    "retrieval augmented generation",
    "retrieval-augmented generation",
  ],
  "vector database": ["vector database", "vector databases"],
  "natural language processing": ["natural language processing"],
  "computer vision": ["computer vision"],
  pytorch: ["pytorch"],
  tensorflow: ["tensorflow"],
  openai: ["openai"],
  chatgpt: ["chatgpt"],
  "github copilot": ["github copilot"],
};

function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function findAiKeywords(input: string): string[] {
  const text = ` ${normalize(input)} `;
  return Object.entries(KEYWORD_ALIASES)
    .filter(([, aliases]) =>
      aliases.some((alias) => text.includes(` ${normalize(alias)} `)),
    )
    .map(([keyword]) => keyword);
}
