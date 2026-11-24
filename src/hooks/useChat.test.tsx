import { renderHook, waitFor } from "@testing-library/react";
import { useChat } from "./useChat";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, ReactNode } from "react";
import { makeSource } from "@/test/factories";
import { streamAnswer } from "@/lib/client/chatStream";

vi.mock("@/lib/client/chatStream", () => ({ streamAnswer: vi.fn() }));

const neverSettles = () => new Promise<never>(() => {});

function requestBody(callIndex: number) {
  return vi.mocked(streamAnswer).mock.calls[callIndex][0];
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
  it("saves the answer with its sources", async () => {
    vi.mocked(streamAnswer).mockImplementationOnce(
      async (_body, _signal, { onSources }) => {
        onSources([source]);
        return { content: "Several variables play a role", sources: [source] };
      }
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
    vi.mocked(streamAnswer)
      .mockResolvedValueOnce({ content: "First answer", sources: [] })
      .mockResolvedValueOnce({ content: "Second answer", sources: [] });
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
    vi.mocked(streamAnswer).mockImplementationOnce(neverSettles);
    const { result } = renderUseChat();

    act(() => result.current.sendMessage("First question"));
    await waitFor(() => expect(result.current.isPending).toBeTruthy());
    expect(result.current.sourcesState).toEqual({ status: "loading" });

    act(() => result.current.sendMessage("Second question"));

    expect(streamAnswer).toHaveBeenCalledTimes(1);
    expect(result.current.messages).toHaveLength(1);
  });

  it("keeps the partial answer when stopped, without an error", async () => {
    vi.mocked(streamAnswer).mockImplementationOnce(
      (_body, signal, { onToken }) => {
        onToken("Several ");
        return new Promise((resolve) => {
          signal.addEventListener("abort", () =>
            resolve({ content: "Several ", sources: [] })
          );
        });
      }
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
    vi.mocked(streamAnswer).mockImplementationOnce(neverSettles);
    const { result, unmount } = renderUseChat();

    act(() => result.current.sendMessage(question));
    await waitFor(() => expect(streamAnswer).toHaveBeenCalled());
    unmount();

    const signal = vi.mocked(streamAnswer).mock.calls[0][1]!;
    expect(signal.aborted).toBeTruthy();
  });

  it("falgs errors and retries the same question", async () => {
    vi.mocked(streamAnswer)
      .mockRejectedValueOnce(new Error("Request failed with status 500"))
      .mockResolvedValueOnce({
        content: "Several variables play a role",
        sources: [],
      });
    const { result } = renderUseChat();

    act(() => result.current.sendMessage(question));
    await waitFor(() => expect(result.current.isError).toBeTruthy());
    expect(result.current.messages).toHaveLength(1);

    act(() => result.current.retry());
    await waitFor(() => expect(result.current.messages).toHaveLength(2));

    expect(requestBody(1)).toEqual({ message: question, history: [] });
    expect(result.current.isError).toBeFalsy();
  });
});
