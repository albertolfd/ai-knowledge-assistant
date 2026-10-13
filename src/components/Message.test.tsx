import { render, screen, getDefaultNormalizer } from "@testing-library/react";
import { Streamdown } from "streamdown";
import { Message } from "./Message";

vi.mock("streamdown", () => ({
  Streamdown: vi.fn(({ children }: { children: string }) => (
    <div data-testid="markdown">{children}</div>
  )),
}));
vi.mock("@streamdown/code", () => ({ code: {} }));

const streamdownMock = vi.mocked(Streamdown);

function lastSreamdownProps() {
  return streamdownMock.mock.lastCall?.[0];
}

function getBubble(speakerLabel: string) {
  return screen.getByText(speakerLabel).closest("[aria-busy]");
}

function renderMessage(
  props: Partial<React.ComponentProps<typeof Message>> = {}
) {
  render(<Message content="A message" {...props} />);
}

describe("Message", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("labels and renders user messages", () => {
    renderMessage();

    expect(screen.getByText("You said:")).toBeInTheDocument();
    expect(screen.getByText("A message")).toBeInTheDocument();
  });

  it("labels and renders assistant messages as markdown", () => {
    renderMessage({ content: "**Hi**", role: "assistant" });

    expect(screen.getByText("Assistant said:")).toBeInTheDocument();
    expect(screen.getByTestId("markdown")).toHaveTextContent("**Hi**");
  });

  it("renders user content as plain text, not markdown", () => {
    renderMessage({ content: "*not italic*" });

    expect(streamdownMock).not.toHaveBeenCalled();
    expect(screen.getByText("*not italic*")).toBeInTheDocument();
  });

  it("marks the message as busy and animating while streaming", () => {
    renderMessage({ role: "assistant", isStreaming: true });

    expect(getBubble("Assistant said:")).toHaveAttribute("aria-busy", "true");
    expect(lastSreamdownProps()).toMatchObject({ isAnimating: true });
  });

  it("is not busy once streaming has finished", () => {
    renderMessage({ role: "assistant" });

    expect(getBubble("Assistant said:")).toHaveAttribute("aria-busy", "false");
    expect(lastSreamdownProps()).toMatchObject({ isAnimating: false });
  });
});
