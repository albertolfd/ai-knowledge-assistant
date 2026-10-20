import { render, screen } from "@testing-library/react";
import { SourceCard } from "./SourceCard";
import { Source } from "@/lib/types";

const source: Source = {
  filename: "chunking-strategy.md",
  similarity: 0.7,
  rerankScore: 4.5,
  excerpt:
    "Several variables play a role in determining the best chunking strategy, and these variables vary depending on the use case. Here are some key aspects to keep in mind...",
};

function renderSourceCard(
  props: Partial<React.ComponentProps<typeof SourceCard>> = {}
) {
  render(<SourceCard rank={1} source={source} {...props} />);
}

describe("SourceCard", () => {
  it("displays rank, filename, relevance, similarity and the excerpt without repeating information to screen readers", () => {
    renderSourceCard();

    expect(screen.getByText("#1")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("chunking-strategy.md")).toBeInTheDocument();
    expect(screen.getByText("Relevance").nextElementSibling).toHaveTextContent(
      "4.5"
    );
    expect(screen.getByText("Similarity").nextElementSibling).toHaveTextContent(
      "0.7"
    );
    expect(
      screen.getByText(
        "Several variables play a role in determining the best chunking strategy, and these variables vary depending on the use case. Here are some key aspects to keep in mind..."
      )
    ).toBeInTheDocument();
  });

  it("identifies the source by rank and filename for screen readers", () => {
    renderSourceCard();

    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Source 1:chunking-strategy.md",
      })
    ).toBeInTheDocument();
  });
});
