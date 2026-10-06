import Anthropic from '@anthropic-ai/sdk';
import { retrieveContext } from '@/lib/retrieval';
import type { ChatRequest } from '@/lib/types';

const anthropic = new Anthropic();

export async function POST(request: Request) {
    const body: ChatRequest = await request.json();
    const { message, history } = body;

    const { context, sources } = await retrieveContext(message);

    const systemPrompt = context
        ? `You are a helpful assistant answering questions about a personal knowledge base.
    Answer using ONLY the documents provided. Cite the source filename for each claim.
    If the answer is not in the documents, say so clearly.

    <documents>
    ${context}
    </documents>`
        : `You are a helpful assistant. The knowledge base contains no relevant information for this question. Say so and answer from general knowledge if you can.`;

    const messages: Anthropic.MessageParam[] = [
        ...history.map((msg) => ({ role: msg.role, content: msg.content })),
        { role: 'user', content: message },
    ];

    const stream = await anthropic.messages.stream({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages
    });

    const readable = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();

            controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: "sources", sources })}\n\n`)
            );

            for await (const chunk of stream) {
                if (
                    chunk.type === 'content_block_delta' &&
                    chunk.delta.type === 'text_delta'
                ) {
                    controller.enqueue(
                        encoder.encode(
                            `data: ${JSON.stringify({ type: "token", text: chunk.delta.text })}\n\n`
                        )
                    );
                }
            }

            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
            controller.close();
        },
        cancel() {
            stream.abort();
        }
    });

    return new Response(readable, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        }
    });
}