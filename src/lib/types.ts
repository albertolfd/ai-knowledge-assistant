export type Role = "user" | "assistant";

export interface Source {
  id: number;
  filename: string;
  similarity: number;
  rerankScore: number;
  excerpt: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  sources?: Source[];
  createdAt: Date;
}

export interface ChatRequest {
  message: string;
  history: Pick<Message, "role" | "content">[];
}


export type SourcesState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; sources: Source[] };
