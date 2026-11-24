// @vitest-environment node
import { POST } from "./route";
import { retrieveContext } from "@/lib/server/retrieval";
import { StreamEvent } from "@/lib/types";
import { makeSource } from "@/test/factories";

const { streamMock } = vi.hoisted(() => ({ streamMock: vi.fn() }));

vi.mock("@/lib/server/retrieval", () => ({ retrieveContext: vi.fn() }));
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { stream: streamMock };
  },
}));

function assistantStream(texts: string[]) {
  const chunks = texts.map((text) => ({
    type: "content_block_delta",
    delta: { type: "text_delta", text },
  }));
  return Object.assign(chunks, { abort: vi.fn() });
}

function neverEndingAssistantStream() {
  async function* waitForever() {
    await new Promise(() => {});
  }
  return Object.assign(waitForever(), { abort: vi.fn() });
}

const history = [
  { role: "user", content: "First message" },
  { role: "assistant", content: "Second message" },
];
const source = makeSource();
function chatRequest() {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "What is the best chunking strategy?",
      history,
    }),
  });
}
async function readEvents(response: Response): Promise<StreamEvent[]> {
  const text = await response.text();
  return text
    .split("\n\n")
    .filter(Boolean)
    .map((raw) => JSON.parse(raw.replace(/^data: /, "")));
}

describe("POST /api/chat", () => {
  beforeEach(() => {
    vi.mocked(retrieveContext).mockResolvedValue({
      context:
        '<document index="1" source="chunking-strategy.md">Several variables play a role</document>',
      sources: [source],
    });
    streamMock.mockReturnValue(
      assistantStream(["Several variables ", "play a role"])
    );
  });

  it("sends the question with the history and retrieved documents and streams the answer with sources", async () => {
    const response = await POST(chatRequest());

    expect(retrieveContext).toHaveBeenCalledWith(
      "What is the best chunking strategy?"
    );

    const params = streamMock.mock.calls[0][0];
    expect(params.messages).toEqual([
      ...history,
      { role: "user", content: "What is the best chunking strategy?" },
    ]);
    expect(params.system).toContain("<documents>");
    expect(params.system).toContain("Several variables play a role");

    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
    expect(await readEvents(response)).toEqual([
      { type: "sources", sources: [source] },
      { type: "token", text: "Several variables " },
      { type: "token", text: "play a role" },
      { type: "done" },
    ]);
  });

  it("points out when no relevant document was found", async () => {
    vi.mocked(retrieveContext).mockResolvedValue({
      context: "",
      sources: [],
    });

    const response = await POST(chatRequest());

    const params = streamMock.mock.calls[0][0];
    expect(params.system).not.toContain("<documents>");
    expect(params.system).toMatch(/no relevant information/i);
    expect((await readEvents(response))[0]).toEqual({
      type: "sources",
      sources: [],
    });
  });

  it("stops streaming when the client disconnects", async () => {
    const assistant = neverEndingAssistantStream();
    streamMock.mockReturnValue(assistant);

    const response = await POST(chatRequest());
    const reader = response.body!.getReader();
    await reader.read();
    await reader.cancel();

    expect(assistant.abort).toHaveBeenCalledOnce();
  });
});
