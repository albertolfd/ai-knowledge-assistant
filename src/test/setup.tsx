import "@testing-library/jest-dom/vitest";

vi.mock("streamdown", () => ({
  Streamdown: vi.fn(({ children }: { children: string }) => (
    <div data-testid="markdown">{children}</div>
  )),
}));
vi.mock("@streamdown/code", () => ({ code: {} }));
