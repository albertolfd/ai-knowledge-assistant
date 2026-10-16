import { fireEvent, render, screen, within } from "@testing-library/react";
import { MessageList } from "./MessageList";
import { Message } from "@/lib/types";

const userMessage: Message = {
  id: "user message 1",
  role: "user",
  content: "What chunking strategy do you recommend?",
  createdAt: new Date("2026-10-14"),
};
const assitantMessage: Message = {
  id: "assistant message 2",
  role: "assistant",
  content: "It depends on the type of file you are chunking",
  createdAt: new Date("2026-10-14"),
};
const messages: Message[] = [userMessage, assitantMessage];

function renderMessageList(
  props: Partial<React.ComponentProps<typeof MessageList>> = {}
) {
  const { rerender } = render(
    <MessageList
      messages={messages}
      streamingContent="Paragraph chunking"
      isPending={false}
      {...props}
    />
  );

  return {
    converstaion: screen.getByRole("region", { name: "Conversation" }),
    rerender,
  };
}

const VIEWPORT_HEIGHT = 500;
function mockScrollMetrics(el: HTMLElement) {
  const metrics = { scrollHeight: 1000 };
  let scrollTop = 0;

  Object.defineProperty(el, "clientHeight", {
    configurable: true,
    get: () => VIEWPORT_HEIGHT,
  });
  Object.defineProperty(el, "scrollHeight", {
    configurable: true,
    get: () => metrics.scrollHeight,
  });
  Object.defineProperty(el, "scrollTop", {
    configurable: true,
    get: () => scrollTop,
    set: (value: number) => {
      const max = metrics.scrollHeight - VIEWPORT_HEIGHT;
      scrollTop = Math.max(0, Math.min(value, max));
    },
  });

  return metrics;
}

function userScrollsTo(el: HTMLElement, position: number) {
  el.scrollTop = position;
  fireEvent.scroll(el);
}

function maxScrollTop(metrics: { scrollHeight: number }) {
  return metrics.scrollHeight - VIEWPORT_HEIGHT;
}

describe("MessageList", () => {
  it("renders container as region with aria label and 0 tabIndex", () => {
    const { converstaion } = renderMessageList();

    expect(converstaion).toHaveAttribute("tabindex", "0");
  });

  it("shows placeholder when there is no message yet", () => {
    renderMessageList({ messages: [] });

    expect(
      screen.getByText("Ask a question about your notes to get started.")
    ).toBeInTheDocument();
    expect(screen.getByRole("log")).toBeEmptyDOMElement();
  });

  it("shows all messages", () => {
    renderMessageList();

    const log = screen.getByRole("log");
    const rendered = within(log)
      .getAllByText(/chunking strategy|type of file/)
      .map((el) => el.textContent);

    expect(rendered).toEqual([userMessage.content, assitantMessage.content]);
    expect(
      screen.queryByText("Ask a question about your notes to get started.")
    ).not.toBeInTheDocument();
  });

  it("shows streaming content when it is pending and last role was user", () => {
    renderMessageList({
      messages: [
        ...messages,
        {
          id: "user message 2",
          role: "user",
          content: "Give me the details about all chunking strategies",
          createdAt: new Date("2026-10-14"),
        },
      ],
      isPending: true,
    });

    expect(screen.getByText("Paragraph chunking")).toBeInTheDocument();
  });

  it("does not show streaming content when it is not pending anymore", () => {
    renderMessageList({
      messages: [
        ...messages,
        {
          id: "user message 2",
          role: "user",
          content: "Give me the details about all chunking strategies",
          createdAt: new Date("2026-10-14"),
        },
      ],
      isPending: false,
    });

    expect(screen.queryByText("Paragraph chunking")).not.toBeInTheDocument();
  });

  it("does not show streaming content when the last message is already an assitant message", () => {
    renderMessageList({ isPending: true });

    expect(screen.queryByText("Paragraph chunking")).not.toBeInTheDocument();
  });

  it("announces the search while waiting for the first token", () => {
    renderMessageList({
      messages: [userMessage],
      streamingContent: "",
      isPending: true,
    });

    expect(screen.getByRole("status")).toHaveTextContent(
      "Searching your notes..."
    );
  });

  it("does not announce the search as soon as there is streaming content", () => {
    renderMessageList({
      messages: [userMessage],
      streamingContent: "Paragraph chunking",
      isPending: true,
    });

    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("does not announce the search when it is not pending", () => {
    renderMessageList({
      messages: [userMessage],
      streamingContent: "",
      isPending: false,
    });

    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("does not not announce the search when the last message is an assitant message already", () => {
    renderMessageList({
      messages: [assitantMessage],
      streamingContent: "",
      isPending: true,
    });

    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  describe("auto-scroll", () => {
    it("follows the streaming content while the user is at the bottom", () => {
      const { converstaion, rerender } = renderMessageList({
        streamingContent: "",
        isPending: true,
      });

      const metrics = mockScrollMetrics(converstaion);

      userScrollsTo(converstaion, maxScrollTop(metrics));

      metrics.scrollHeight = 1200;
      rerender(
        <MessageList
          messages={messages}
          streamingContent="Paragraph chunking"
          isPending={true}
        />
      );

      expect(converstaion.scrollTop).toBe(maxScrollTop(metrics));
    });

    it("stops following the streaming content once the user scrolls up", () => {
      const { converstaion, rerender } = renderMessageList({
        streamingContent: "",
        isPending: true,
      });

      const metrics = mockScrollMetrics(converstaion);

      userScrollsTo(converstaion, 100);

      metrics.scrollHeight = 1200;
      rerender(
        <MessageList
          messages={messages}
          streamingContent="Paragraph chunking"
          isPending={true}
        />
      );

      expect(converstaion.scrollTop).toBe(100);
    });

    it("jumps to the bottom when the user sends a message, even if scrolled up", () => {
      const { converstaion, rerender } = renderMessageList({
        streamingContent: "",
      });

      const metrics = mockScrollMetrics(converstaion);

      userScrollsTo(converstaion, 100);

      metrics.scrollHeight = 1300;
      rerender(
        <MessageList
          messages={[
            ...messages,
            {
              id: "user message 2",
              role: "user",
              content: "Give me the details about all chunking strategies",
              createdAt: new Date("2026-10-14"),
            },
          ]}
          streamingContent=""
          isPending={false}
        />
      );

      expect(converstaion.scrollTop).toBe(maxScrollTop(metrics));
    });
  });
});
