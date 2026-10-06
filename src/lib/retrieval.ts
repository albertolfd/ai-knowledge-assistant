import { VoyageAIClient } from 'voyageai';
import { pool } from './db';
import type { Source } from './types';

const voyage = new VoyageAIClient({ apiKey: process.env.VOYAGEAI_API_KEY });

interface RetrievalResult {
    context: string;
    sources: Source[];
}

export async function retrieveContext(question: string): Promise<RetrievalResult> {
    const embedResponse = await voyage.embed({
        input: [`Query: ${question}`],
        model: 'voyage-code-3'
    });
    const embedding = embedResponse.data![0].embedding!;

    const result = await pool.query(
        `SELECT id, content, filename, 1 - (embedding <=> $1) AS similarity
        FROM chunks
        WHERE 1 - (embedding <=> $1) > 0.60
        AND strategy = 'paragraph'
        ORDER BY embedding <=> $1
        LIMIT 10`,
        [JSON.stringify(embedding)]
    );

    if (result.rows.length === 0) {
        return { context: '', sources: [] };
    }

    const rerankResponse = await voyage.rerank({
        query: question,
        documents: result.rows.map((row) => row.content),
        model: 'rerank-2.5',
        topK: result.rows.length
    });

    const reranked = rerankResponse.data!
    .map((row) => ({
        ...result.rows[row.index!],
        rerankResponse: row.relevanceScore
    }))
    .sort((a, b) => b.rerankResponse - a.rerankResponse)
    .slice(0, 5);

    const sources: Source[] = reranked.map((row) => ({
        filename: row.filename,
        similarity: Number(row.similarity),
        rerankScore: row.rerankScore,
        excerpt: (row.content as string).slice(0, 200),
    }));

    const context = reranked
    .map(
        (row, index) =>
            `<document index="${index + 1}" source="${row.filename}">\n${row.content}\n</document>`
    )
    .join('\n\n');

    return { context, sources };
}