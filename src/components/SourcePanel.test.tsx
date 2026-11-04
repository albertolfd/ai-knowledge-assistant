import { render, screen, within } from "@testing-library/react";
import { SourcePanel } from "./SourcePanel";
import { Source, SourcesState } from "@/lib/types";

const source: Source = {
  id: 1,
  filename: "chunking-strategy.md",
  similarity: 0.7,
  rerankScore: 4.5,
  excerpt:
    "Several variables play a role in determining the best chunking strategy, and these variables vary depending on the use case. Here are some key aspects to keep in mind...",
};

const sourcesState: SourcesState = {
  status: "ready",
  sources: [source],
};

function renderSourcePanel(
  props: Partial<React.ComponentProps<typeof SourcePanel>> = {}
) {
  render(<SourcePanel sourcesState={sourcesState} {...props} />);
}

describe("SourcePanel", () => {
  it("displays header with amount of sources", () => {
    renderSourcePanel();

    expect(
      screen.getByRole("heading", { level: 2, name: "Sources (1)" })
    ).toBeInTheDocument();
  });

  it("displays header with no source count when sources state is not ready", () => {
    renderSourcePanel({ sourcesState: { status: "idle" } });

    expect(
      screen.getByRole("heading", { level: 2, name: "Sources" })
    ).toBeInTheDocument();
  });

  test.each<{ name: string; state: SourcesState; expected: string }>([
    { name: "idle", state: { status: "idle" }, expected: "" },
    { name: "loading", state: { status: "loading" }, expected: "" },
    {
      name: "ready with no sources",
      state: { status: "ready", sources: [] },
      expected: "No relevant sources found in your notes.",
    },
    {
      name: "ready with one source",
      state: { status: "ready", sources: [source] },
      expected: "1 source found",
    },
    {
      name: "ready with two sources",
      state: { status: "ready", sources: [source, { ...source, id: 2 }] },
      expected: "2 sources found",
    },
  ])("announces '$expected' when $name", ({ state, expected }) => {
    renderSourcePanel({ sourcesState: state });

    expect(screen.getByRole("status").textContent).toBe(expected);
  });

  it("explains the purpose of the panel when sources state is idle", () => {
    renderSourcePanel({ sourcesState: { status: "idle" } });

    expect(
      screen.getByText("The notes used for each answer will appear here.")
    ).toBeInTheDocument();
  });

  it("marks the panel as busy while sources are being retrieved", () => {
    renderSourcePanel({ sourcesState: { status: "loading" } });

    expect(screen.getByRole("complementary")).toHaveAttribute(
      "aria-busy",
      "true"
    );
  });

  it("tells no source was found when state is ready and there is no source", () => {
    renderSourcePanel({ sourcesState: { status: "ready", sources: [] } });

    expect(
      screen.getByText(
        "No relevant sources were found in your notes. The answer is not based on them."
      )
    ).toBeInTheDocument();
  });

  it("displays sources when state is ready and there are sources", () => {
    renderSourcePanel();

    const sourceList = screen.getByRole("list");
    expect(within(sourceList).getAllByRole("listitem")).toHaveLength(1);

    const cardHeadings = within(sourceList)
      .getAllByRole("heading", { level: 3 })
      .map((heading) => heading.textContent);
    expect(cardHeadings).toEqual(["Source 1: chunking-strategy.md"]);
  });

  it("is a keyboard-focusable landmark", () => {
    renderSourcePanel({ sourcesState: { status: "idle" } });

    const panel = screen.getByRole("complementary");
    expect(panel.tagName).toBe("ASIDE");
    expect(panel).toHaveAttribute("tabindex", "0");
  });
});
