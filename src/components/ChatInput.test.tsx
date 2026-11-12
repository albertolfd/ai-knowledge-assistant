import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatInput } from "./ChatInput";

const onSend = vi.fn();
const onStop = vi.fn();
const onRetry = vi.fn();

function renderChatInput(
  props: Partial<React.ComponentProps<typeof ChatInput>> = {}
) {
  const user = userEvent.setup();
  const defaults = {
    onSend,
    onStop,
    onRetry,
    isStreaming: false,
    isError: false,
  };

  const chatInput = render(<ChatInput {...defaults} {...props} />);

  return {
    chatInput,
    user,
    textbox: screen.getByRole("textbox", { name: "Message" }),
    getSendButton: () => screen.getByRole("button", { name: "Send message" }),
    getStopButton: () =>
      screen.getByRole("button", { name: "Stop generating" }),
    setProps: (next: Partial<React.ComponentProps<typeof ChatInput>>) =>
      chatInput.rerender(<ChatInput {...defaults} {...props} {...next} />),
  };
}

describe("ChatInput", () => {
  it("renders send button when it is not streaming", () => {
    const { getSendButton } = renderChatInput();

    expect(getSendButton()).toBeTruthy();
  });

  it("renders stop button when it is streaming", () => {
    const { getStopButton } = renderChatInput({ isStreaming: true });

    expect(getStopButton()).toBeTruthy();
  });

  it("updates the value and submits it", async () => {
    const { user, textbox, getSendButton } = renderChatInput();

    await user.type(textbox, "What day is today?   ");

    await user.click(getSendButton());

    expect(onSend).toHaveBeenCalledExactlyOnceWith("What day is today?");
    expect(textbox).toHaveValue("");
  });

  it("submits on Enter", async () => {
    const { user, textbox } = renderChatInput();

    await user.type(textbox, "What day is today? {Enter}");

    expect(onSend).toHaveBeenCalledExactlyOnceWith("What day is today?");
  });

  it("inserts a new line on Shift+Enter instead of sending", async () => {
    const { user, textbox } = renderChatInput();

    await user.type(textbox, "line one{Shift>}{Enter}{/Shift}line two");

    expect(textbox).toHaveValue("line one\nline two");
    expect(onSend).not.toHaveBeenCalled();
  });

  it("does not submit when there is no message", async () => {
    const { user, textbox } = renderChatInput();

    await user.type(textbox, "   {Enter}");

    expect(onSend).not.toHaveBeenCalled();
  });

  it("stops streaming when stop button is clicked", async () => {
    const { user, getStopButton } = renderChatInput({
      isStreaming: true,
    });

    await user.click(getStopButton());

    expect(onStop).toHaveBeenCalled();
  });

  it("disables textarea when it is streaming", () => {
    const { textbox } = renderChatInput({ isStreaming: true });

    expect(textbox).toBeDisabled();
  });

  it("disables submit button when there is no message", () => {
    const { getSendButton } = renderChatInput();

    expect(getSendButton()).toBeDisabled();
  });

  describe("error", () => {
    it("does not show an error when the request has not failed", () => {
      renderChatInput();

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("shows the error with a retry button while the input is empty", async () => {
      const { user } = renderChatInput({ isError: true });

      const alert = screen.getByRole("alert");
      expect(
        within(alert).getByText("The answer could not be generated.")
      ).toBeInTheDocument();

      await user.click(within(alert).getByRole("button", { name: "Retry" }));
      expect(onRetry).toHaveBeenCalledOnce();
    });
  });

  describe("focus", () => {
    it("focuses the input when it first renders", () => {
      const { textbox } = renderChatInput();

      expect(textbox).toHaveFocus();
    });

    it("returns focus to the input when streaming ends", () => {
      const { textbox, setProps } = renderChatInput({ isStreaming: true });
      expect(textbox).not.toHaveFocus();

      setProps({ isStreaming: false });

      expect(textbox).toHaveFocus();
    });

    it("does not take focus back if the user moved it elsewhere", () => {
      const elsewhere = document.createElement("button");
      document.body.appendChild(elsewhere);

      const { textbox, setProps } = renderChatInput({ isStreaming: true });
      elsewhere.focus();

      setProps({ isStreaming: false });

      expect(elsewhere).toHaveFocus();
      expect(textbox).not.toHaveFocus();

      elsewhere.remove();
    });
  });
});
