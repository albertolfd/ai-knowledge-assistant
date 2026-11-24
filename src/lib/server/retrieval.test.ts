// @vitest-environment node
import { retrieveContext } from "./retrieval";

const { embedMock, rerankMock, queryMock } = vi.hoisted(() => ({
  embedMock: vi.fn(),
  rerankMock: vi.fn(),
  queryMock: vi.fn(),
}));

vi.mock("voyageai", () => ({
  VoyageAIClient: class {
    embed = embedMock;
    rerank = rerankMock;
  },
}));

vi.mock("./db", () => ({ pool: { query: queryMock } }));

const question = "What is the best chunking strategy?";
const rows = [
  {
    id: 1,
    filename: "chunking-strategy.md",
    content: "Several variables ",
    similarity: "0.6",
  },
  {
    id: 2,
    filename: "chunking-strategy.md",
    content: "play a role",
    similarity: "0.54",
  },
];
const rerankRows = [
  {
    index: 0,
    relevanceScore: 3.4,
  },
  {
    index: 1,
    relevanceScore: 4.2,
  },
];

describe("retrieveContext", () => {
  beforeEach(() => {
    embedMock.mockResolvedValue({ data: [{ embedding: [0.1, 0.2, 0.3] }] });
    queryMock.mockResolvedValue({ rows });
    rerankMock.mockResolvedValue({ data: rerankRows });
  });

  it("embeds the question, queries the chunks, reranks the results and returns the documents ordered by relevance score", async () => {
    const response = await retrieveContext(question);

    expect(embedMock).toHaveBeenCalledWith(
      expect.objectContaining({
        input: [`Query: ${question}`],
      })
    );
    expect(queryMock).toHaveBeenCalledWith(expect.anything(), [
      "[0.1,0.2,0.3]",
    ]);
    expect(rerankMock).toHaveBeenCalledWith(
      expect.objectContaining({
        query: question,
        documents: ["Several variables ", "play a role"],
        topK: 2,
      })
    );
    expect(response).toEqual({
      context:
        '<document index="1" source="chunking-strategy.md">\nplay a role\n</document>\n\n<document index="2" source="chunking-strategy.md">\nSeveral variables \n</document>',
      sources: [
        {
          id: 2,
          filename: "chunking-strategy.md",
          similarity: 0.54,
          rerankScore: 4.2,
          excerpt: "play a role",
        },
        {
          id: 1,
          filename: "chunking-strategy.md",
          similarity: 0.6,
          rerankScore: 3.4,
          excerpt: "Several variables ",
        },
      ],
    });
  });

  it("applies a similarity threshold of 0.6 and retrieves chunks split with paragraph strategy", async () => {
    await retrieveContext(question);

    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("1 - (embedding <=> $1) > 0.60"),
      expect.anything()
    );
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining("strategy = 'paragraph'"),
      expect.anything()
    );
  });

  it("returns an empty context and sources without calling the rerank, when no chunk was found", async () => {
    queryMock.mockResolvedValueOnce({ rows: [] });

    const response = await retrieveContext(question);

    expect(response).toEqual({ context: "", sources: [] });
    expect(rerankMock).not.toHaveBeenCalled();
  });
});
