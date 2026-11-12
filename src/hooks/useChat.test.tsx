import { renderHook, waitFor } from "@testing-library/react";
import { useChat } from "./useChat";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Source, StreamEvent } from "@/lib/types";
import { act, ReactNode } from "react";
import { makeSource } from "@/test/factories";

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

function requestBody(callIndex: number) {
  const init = vi.mocked(fetch).mock.calls[callIndex][1]!;
  return JSON.parse(init.body as string);
}

function renderUseChat() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

  return renderHook(() => useChat(), { wrapper });
}

const source = makeSource();
const question = "What is the best chunking strategy?";

describe("useChat", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("streams an answer and saves it with its sources", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      answer(["Several variables ", "play a role"], [source])
    );
    const { result } = renderUseChat();

    act(() => result.current.sendMessage(question));
    await waitFor(() => expect(result.current.messages).toHaveLength(2));

    expect(requestBody(0)).toEqual({
      message: question,
      history: [],
    });
    expect(result.current.messages[1]).toMatchObject({
      role: "assistant",
      content: "Several variables play a role",
      sources: [source],
    });
    expect(result.current.sourcesState).toEqual({
      status: "ready",
      sources: [source],
    });
  });

  it("sends earlier messages as history", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(answer(["First answer"]))
      .mockResolvedValueOnce(answer(["Second answer"]));
    const { result } = renderUseChat();

    act(() => result.current.sendMessage("First question"));
    await waitFor(() => expect(result.current.messages).toHaveLength(2));
    act(() => result.current.sendMessage("Second question"));
    await waitFor(() => expect(result.current.messages).toHaveLength(4));

    expect(requestBody(1)).toEqual({
      message: "Second question",
      history: [
        { role: "user", content: "First question" },
        { role: "assistant", content: "First answer" },
      ],
    });
  });

  it("shows the loading state and ignores new messages while in progress", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      streamResponse([], { keepOpen: true })
    );
    const { result } = renderUseChat();

    act(() => result.current.sendMessage("First question"));
    await waitFor(() => expect(result.current.isPending).toBeTruthy());
    expect(result.current.sourcesState).toEqual({ status: "loading" });

    act(() => result.current.sendMessage("Second question"));

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result.current.messages).toHaveLength(1);
  });

  it("keeps the partial answer when stopped, without an error", async () => {
    vi.mocked(fetch).mockImplementationOnce(async (_url, init) =>
      streamResponse([sse({ type: "token", text: "Several " })], {
        keepOpen: true,
        signal: init?.signal,
      })
    );
    const { result } = renderUseChat();

    act(() => result.current.sendMessage(question));
    await waitFor(() =>
      expect(result.current.streamingContent).toBe("Several ")
    );
    act(() => result.current.abort());
    await waitFor(() => expect(result.current.isPending).toBeFalsy());

    expect(result.current.isError).toBeFalsy();
    expect(result.current.messages[1]).toMatchObject({
      role: "assistant",
      content: "Several ",
    });
  });

  it("aborts the request on unmount", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      streamResponse([], { keepOpen: true })
    );
    const { result, unmount } = renderUseChat();

    act(() => result.current.sendMessage(question));
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    unmount();

    const init = vi.mocked(fetch).mock.calls[0][1]!;
    expect(init.signal!.aborted).toBeTruthy();
  });

  it("falgs errors and retries the same question", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(null, { status: 500 }))
      .mockResolvedValueOnce(answer(["Several variables ", "play a role"]));
    const { result } = renderUseChat();

    act(() => result.current.sendMessage(question));
    await waitFor(() => expect(result.current.isError).toBeTruthy());
    expect(result.current.messages).toHaveLength(1);

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.messages).toHaveLength(2));

    expect(requestBody(1)).toEqual({ message: question, history: [] });
    expect(result.current.isError).toBeFalsy();
  });

  it("treats a stream that ends without 'done' as an error", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      streamResponse([sse({ type: "token", text: "Trunc" })])
    );
    const { result } = renderUseChat();

    act(() => result.current.sendMessage("Q"));
    await waitFor(() => expect(result.current.isError).toBeTruthy());

    expect(result.current.messages).toHaveLength(1);
  });
});
