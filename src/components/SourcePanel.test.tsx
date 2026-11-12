import { render, screen, within } from "@testing-library/react";
import { SourcePanel } from "./SourcePanel";
import { SourcesState } from "@/lib/types";
import { makeSource } from "@/test/factories";

const sourcesState: SourcesState = {
  status: "ready",
  sources: [makeSource()],
};

function renderSourcePanel(
  props: Partial<React.ComponentProps<typeof SourcePanel>> = {}
) {
  const { container } = render(
    <SourcePanel
      sourcesState={sourcesState}
      headingId="Source panel"
      {...props}
    />
  );

  return {
    container,
  };
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

    const header = screen.getByRole("heading", { level: 2, name: "Sources" });
    expect(header).toBeInTheDocument();
    expect(header).toHaveAttribute("id", "Source panel");
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
      state: { status: "ready", sources: [makeSource()] },
      expected: "1 source found",
    },
    {
      name: "ready with two sources",
      state: {
        status: "ready",
        sources: [makeSource(), makeSource({ id: 2 })],
      },
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
    const { container } = renderSourcePanel({
      sourcesState: { status: "loading" },
    });

    expect(container.querySelector("[aria-busy]")).toHaveAttribute(
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
});
