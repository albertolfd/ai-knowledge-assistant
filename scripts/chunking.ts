const MIN_CHUNK_LENGTH = 30;
const MAX_CHUNK_LENGTH = 1000;
const OVERLAP = 50;

export function splitFixed(
  text: string,
  size: number,
  overlap: number
): string[] {
  const parts: string[] = [];
  for (let start = 0; start < text.length; start += size - overlap) {
    parts.push(text.slice(start, start + size));
  }
  return parts;
}

export function chunkParagraphs(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > MIN_CHUNK_LENGTH)
    .flatMap((paragraph) =>
      paragraph.length > MAX_CHUNK_LENGTH
        ? splitFixed(paragraph, MAX_CHUNK_LENGTH, OVERLAP)
        : [paragraph]
    );
}
