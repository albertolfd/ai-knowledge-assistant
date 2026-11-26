// @vitest-environment node
import type { VoyageAIClient } from "voyageai";
import { DEFAULT_BATCH_SIZE, embedAll } from "./embed";

function fakeVoyage() {
  const embed = vi.fn(async ({ input }: { input: string[] }) => ({
    data: input.map((text) => ({ embedding: [Number(text)] })),
  }));
  return { client: { embed } as unknown as VoyageAIClient, embed };
}

function numberedInputs(count: number) {
  return Array.from({ length: count }, (_, i) => String(i));
}

describe("embedAll", () => {
  it("sends inputs in batches of the default size and keeps embeddings in input order", async () => {
    const inputs = numberedInputs(DEFAULT_BATCH_SIZE * 2 + 5);
    const { client, embed } = fakeVoyage();

    const embeddings = await embedAll(client, inputs);

    expect(embed.mock.calls.map(([args]) => args.input.length)).toEqual([
      DEFAULT_BATCH_SIZE,
      DEFAULT_BATCH_SIZE,
      5,
    ]);
    expect(embeddings).toEqual(inputs.map((text) => [Number(text)]));
  });

  it("uses the given batch size", async () => {
    const inputs = numberedInputs(10);
    const { client, embed } = fakeVoyage();

    const embeddings = await embedAll(client, inputs, { batchSize: 4 });

    expect(embed.mock.calls.map(([args]) => args.input.length)).toEqual([
      4, 4, 2,
    ]);
    expect(embeddings).toEqual(inputs.map((text) => [Number(text)]));
  });
});
