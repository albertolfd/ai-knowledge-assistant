import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatInput } from "./ChatInput";

function renderChatInput(
  props: Partial<React.ComponentProps<typeof ChatInput>> = {}
) {
  const onSend = vi.fn();
  const onStop = vi.fn();
  const user = userEvent.setup();

  const chatInput = render(
    <ChatInput onSend={onSend} onStop={onStop} isStreaming={false} {...props} />
  );

  return {
    chatInput,
    user,
    onSend,
    onStop,
    textbox: screen.getByRole("textbox", { name: "Message" }),
    getSendButton: () => screen.getByRole("button", { name: "Send message" }),
    getStopButton: () =>
      screen.getByRole("button", { name: "Stop generating" }),
  };
}

describe("ChatInput", () => {
  it("renders send button when it is not streaming", () => {
    const { getSendButton } = renderChatInput();

    expect(getSendButton).toBeTruthy();
  });

  it("renders stop button when it is streaming", () => {
    const { getStopButton } = renderChatInput({ isStreaming: true });

    expect(getStopButton()).toBeTruthy();
  });

  it("updates the value and submits it", async () => {
    const { user, onSend, textbox, getSendButton } = renderChatInput();

    await user.type(textbox, "What day is today?   ");

    await user.click(getSendButton());

    expect(onSend).toHaveBeenCalledExactlyOnceWith("What day is today?");
    expect(textbox).toHaveValue("");
  });

  it("submits on Enter", async () => {
    const { user, onSend, textbox } = renderChatInput();

    await user.type(textbox, "What day is today? {Enter}");

    expect(onSend).toHaveBeenCalledExactlyOnceWith("What day is today?");
  });

  it("inserts a new line on Shift+Enter instead of sending", async () => {
    const { user, textbox } = renderChatInput();

    await user.type(textbox, "line one{Shift>}{Enter}{/Shift}line two");

    expect(textbox).toHaveValue("line one\nline two");
  });

  it("does not submit when there is no message", async () => {
    const { user, onSend, getSendButton } = renderChatInput();

    await user.click(getSendButton());

    expect(onSend).not.toHaveBeenCalled();
  });

  it("stops streaming when stop button is clicked", async () => {
    const { user, onStop, getStopButton } = renderChatInput({
      isStreaming: true,
    });

    await user.click(getStopButton());

    expect(onStop).toHaveBeenCalled();
  });

  it("disables textarea when it is streaming", () => {
    const { textbox } = renderChatInput({ isStreaming: true });

    expect(textbox).toBeTruthy();
  });

  it("disables submit button when there is no message", () => {
    const { getSendButton } = renderChatInput();

    expect(getSendButton()).toBeDisabled();
  });
});
