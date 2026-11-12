import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useChat } from "@/hooks/useChat";
import { makeMessage, makeSource } from "@/test/factories";
import { ChatWindow } from "./ChatWindow";

vi.mock("@/hooks/useChat");

type ChatState = ReturnType<typeof useChat>;

function mockChat(overrides: Partial<ChatState> = {}): ChatState {
  const chat: ChatState = {
    messages: [],
    streamingContent: "",
    sourcesState: { status: "idle" },
    isPending: false,
    isError: false,
    sendMessage: vi.fn(),
    abort: vi.fn(),
    retry: vi.fn(),
    ...overrides,
  };
  vi.mocked(useChat).mockReturnValue(chat);
  return chat;
}

function renderChatWindow(overrides: Partial<ChatState> = {}) {
  const chat = mockChat(overrides);
  const user = userEvent.setup();
  render(<ChatWindow />);
  return { chat, user };
}

const question = "What is the best chunking strategy?";
const answer = "Several variables play a role";

describe("ChatWindow", () => {
  it("sends the typed question through the chat hook", async () => {
    const { chat, user } = renderChatWindow();

    await user.type(
      screen.getByRole("textbox", { name: "Message" }),
      `${question}{Enter}`
    );

    expect(chat.sendMessage).toHaveBeenCalledExactlyOnceWith(question);
  });

  it("shows the conversation from the chat hook", () => {
    renderChatWindow({
      messages: [
        makeMessage({ role: "user", content: question }),
        makeMessage({ role: "assistant", content: answer }),
      ],
    });

    const log = screen.getByRole("log");
    expect(within(log).getByText(question)).toBeInTheDocument();
    expect(within(log).getByText(answer)).toBeInTheDocument();
  });

  it("disables the input while answering and stops through the hook", async () => {
    const { chat, user } = renderChatWindow({
      messages: [makeMessage({ role: "user", content: question })],
      isPending: true,
    });

    expect(screen.getByRole("textbox", { name: "Message" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Stop generating" }));

    expect(chat.abort).toHaveBeenCalledOnce();
  });

  it("shows an error and retries through the hook", async () => {
    const { chat, user } = renderChatWindow({ isError: true });

    const alert = screen.getByRole("alert");
    await user.click(within(alert).getByRole("button", { name: "Retry" }));

    expect(chat.retry).toHaveBeenCalledOnce();
  });

  it("shows the sources from the chat hook in the sources panel", () => {
    renderChatWindow({
      sourcesState: {
        status: "ready",
        sources: [makeSource()],
      },
    });

    const sources = screen.getByRole("complementary", { name: "Sources (1)" });
    expect(
      within(sources).getByRole("heading", {
        name: "Source 1:chunking-strategy.md",
      })
    ).toBeInTheDocument();
  });

  describe("layout and landmarks", () => {
    it("has a main conversation area and a focusable sources panel", () => {
      renderChatWindow();

      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(
        screen.getByRole("complementary", { name: "Sources" })
      ).toHaveAttribute("tabindex", "0");
    });

    it("links the mobile toggle to the sources panel", async () => {
      const { user } = renderChatWindow();
      const sources = screen.getByRole("complementary", { name: "Sources" });
      const toggle = screen.getByRole("button", { name: "Show sources" });

      expect(toggle).toHaveAttribute("aria-controls", sources.id);
      expect(toggle).toHaveAttribute("aria-expanded", "false");

      await user.click(toggle);

      expect(
        screen.getByRole("button", { name: "Back to chat" })
      ).toHaveAttribute("aria-expanded", "true");
    });
  });
});
