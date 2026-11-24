import { Source, StreamEvent } from "@/lib/types";
import { makeSource } from "@/test/factories";
import { streamAnswer } from "@/lib/client/chatStream";

const encoder = new TextEncoder();

const sse = (event: StreamEvent) => `data: ${JSON.stringify(event)}\n\n`;

function abortError() {
  return Object.assign(new Error("Aborted"), { name: "AbortError" });
}

function streamResponse(
  chunks: (string | Uint8Array)[],
  options: { keepOpen?: boolean; signal?: AbortSignal | null } = {}
) {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(
          typeof chunk === "string" ? encoder.encode(chunk) : chunk
        );
      }
      if (!options.keepOpen) controller.close();
      options.signal?.addEventListener("abort", () =>
        controller.error(abortError())
      );
    },
  });
  return new Response(stream);
}

function answer(tokens: string[], sources: Source[] = []) {
  return streamResponse([
    sse({ type: "sources", sources }),
    ...tokens.map((token) => sse({ type: "token", text: token })),
    sse({ type: "done" }),
  ]);
}

function handlers() {
  return { onSources: vi.fn(), onToken: vi.fn() };
}

const source = makeSource();
const body = { message: "What is the best chunking strategy?", history: [] };

describe("streamAnswer", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("sends the request and returns the answer, reporting progress", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      answer(["Several variables ", "play a role"], [source])
    );
    const { onSources, onToken } = handlers();

    const result = await streamAnswer(body, new AbortController().signal, {
      onSources,
      onToken,
    });

    expect(result).toEqual({
      content: "Several variables play a role",
      sources: [source],
    });
    expect(
      JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string)
    ).toEqual(body);
    expect(onSources).toHaveBeenCalledWith([source]);
    expect(onToken).toHaveBeenLastCalledWith("Several variables play a role");
  });

  it("returns the partial answer when stopped", async () => {
    vi.mocked(fetch).mockImplementationOnce(async (_url, init) =>
      streamResponse([sse({ type: "token", text: "Several " })], {
        keepOpen: true,
        signal: init?.signal,
      })
    );
    const controller = new AbortController();
    const { onSources, onToken } = handlers();

    const result = streamAnswer(body, controller.signal, {
      onSources,
      onToken,
    });
    await vi.waitFor(() => expect(onToken).toHaveBeenCalledWith("Several "));
    controller.abort();

    await expect(result).resolves.toEqual({ content: "Several ", sources: [] });
  });

  it("throws when the server responds with an error", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 500 }));

    await expect(
      streamAnswer(body, new AbortController().signal, handlers())
    ).rejects.toThrow();
  });

  it("treats a stream that ends without 'done' as an error", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      streamResponse([sse({ type: "token", text: "Trunc" })])
    );

    await expect(
      streamAnswer(body, new AbortController().signal, handlers())
    ).rejects.toThrow(/ended unexpectedly/);
  });
});
