import type { Message, Source } from "@/lib/types";

let nextId = 1;

export function makeSource(overrides: Partial<Source> = {}): Source {
  const id = nextId++;
  return {
    id,
    filename: "chunking-strategy.md",
    similarity: 0.7,
    rerankScore: 4.5,
    excerpt:
      "Several variables play a role in determining the best chunking strategy, and these variables vary depending on the use case. Here are some key aspects to keep in mind...",
    ...overrides,
  };
}

export function makeMessage(overrides: Partial<Message> = {}): Message {
  const id = nextId++;
  return {
    id: String(id),
    role: "user",
    content: `Message ${id}`,
    createdAt: new Date(),
    ...overrides,
  };
}
