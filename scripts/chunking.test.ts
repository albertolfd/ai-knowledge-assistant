// @vitest-environment node
import { chunkParagraphs, splitFixed } from "./chunking";

const paragraph = (text: string) => text.padEnd(40, ".");

describe("chunkParagraphs", () => {
  it("splits on blank lines and trims each paragraph", () => {
    const text = `  ${paragraph("First")}  \n\n${paragraph("Second")}\n\n\n${paragraph("Third")}`;

    expect(chunkParagraphs(text)).toEqual([
      paragraph("First"),
      paragraph("Second"),
      paragraph("Third"),
    ]);
  });

  it("drops paragraphs too short to be useful", () => {
    expect(
      chunkParagraphs(`## Heading\n\n${paragraph("Body")}\n\n---`)
    ).toEqual([paragraph("Body")]);
  });

  it("splits paragraphs longer than the maximum into overlapping pieces", () => {
    const long = "a".repeat(2500);

    const chunks = chunkParagraphs(long);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.length <= 1000)).toBe(true);
  });

  it("handles Windows line endings", () => {
    const text = `${paragraph("First")}\r\n\r\n${paragraph("Second")}`;

    expect(chunkParagraphs(text)).toHaveLength(2);
  });
});

describe("splitFixed", () => {
  it("overlaps consecutive pieces", () => {
    const text = "abcdefghij";

    expect(splitFixed(text, 4, 1)).toEqual(["abcd", "defg", "ghij", "j"]);
  });
});
