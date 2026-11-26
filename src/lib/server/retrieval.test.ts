// @vitest-environment node
import {
  MIN_RERANK_SCORE,
  RERANK_TOP_K,
  retrieveContext,
  SIMILARITY_THRESHOLD,
  VECTOR_SEARCH_LIMIT,
} from "./retrieval";

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

function rerankScores(...scores: number[]) {
  return {
    data: scores.map((relevanceScore, index) => ({ index, relevanceScore })),
  };
}

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
      SIMILARITY_THRESHOLD,
      VECTOR_SEARCH_LIMIT,
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

  it("returns an empty context and sources without calling the rerank, when no chunk was found", async () => {
    queryMock.mockResolvedValueOnce({ rows: [] });

    const response = await retrieveContext(question);

    expect(response).toEqual({ context: "", sources: [] });
    expect(rerankMock).not.toHaveBeenCalled();
  });

  it("drops chunks below the minimum rerank score", async () => {
    rerankMock.mockResolvedValueOnce(
      rerankScores(MIN_RERANK_SCORE - 0.01, MIN_RERANK_SCORE)
    );

    const { sources } = await retrieveContext(question);

    expect(sources.map((source) => source.id)).toEqual([2]);
  });

  it("returns an empty context and sources when the reranker rejects every chunk", async () => {
    rerankMock.mockResolvedValueOnce(rerankScores(0.2, 0.1));

    const response = await retrieveContext(question);

    expect(response).toEqual({ context: "", sources: [] });
  });

  it("keeps at most the top results after reranking", async () => {
    const manyRows = Array.from({ length: RERANK_TOP_K + 2 }, (_, i) => ({
      id: i + 1,
      filename: `note-${i + 1}.md`,
      content: `Content of note ${i + 1}`,
      similarity: 0.5,
    }));
    queryMock.mockResolvedValueOnce({ rows: manyRows });
    rerankMock.mockResolvedValueOnce(
      rerankScores(...manyRows.map((_, i) => 0.9 - i * 0.02))
    );

    const { sources } = await retrieveContext(question);

    expect(sources).toHaveLength(RERANK_TOP_K);
    expect(sources[0].id).toBe(1);
  });
});
