export type Role = "user" | "assistant";

export interface Source {
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