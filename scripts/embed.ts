import { EMBEDDING_MODEL } from "../src/lib/embedding";
import { VoyageAIClient } from "voyageai";

export const DEFAULT_BATCH_SIZE = 64;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function embedAll(
  voyage: VoyageAIClient,
  inputs: string[],
  { batchSize = DEFAULT_BATCH_SIZE, delayMs = 0 } = {}
): Promise<number[][]> {
  const embeddings: number[][] = [];
  for (let start = 0; start < inputs.length; start += batchSize) {
    if (start > 0 && delayMs > 0) await sleep(delayMs);
    const response = await voyage.embed({
      input: inputs.slice(start, start + batchSize),
      model: EMBEDDING_MODEL,
    });
    embeddings.push(...response.data!.map((item) => item.embedding!));
    console.log(
      `  embedded ${Math.min(start + batchSize, inputs.length)}/${inputs.length}`
    );
  }
  return embeddings;
}
