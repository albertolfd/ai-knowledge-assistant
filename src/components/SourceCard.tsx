import { Source } from "@/lib/types";

interface SourceCardProps {
  source: Source;
  rank: number;
}

function formatScore(score: number): string {
  return score.toFixed(2);
}

export function SourceCard({ source, rank }: SourceCardProps) {
  const { filename, rerankScore, similarity, excerpt } = source;

  return (
    <article className="rounded-lg border border-gray-200 p-3 text-sm">
      <header className="flex items-baseline gap-2">
        <span
          aria-hidden="true"
          className="text-xs font-semibold text-gray-400 tabular-nums"
        >
          #{rank}
        </span>
        <h3
          title={filename}
          className="min-w-0 flex-1 truncate font-medium text-gray-900"
        >
          <span className="sr-only">Source {rank}: </span>
          {filename}
        </h3>
      </header>

      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
        <dt className="text-gray-500">Relevance</dt>
        <dd className="font-semibold text-gray-900 tabular-nums">
          {formatScore(rerankScore)}
        </dd>
        <dt className="text-gray-500">Similarity</dt>
        <dd className="text-gray-700 tabular-nums">
          {formatScore(similarity)}
        </dd>
      </dl>

      <blockquote className="mt-2 line-clamp-4 border-l-2 border-gray-200 pl-2 text-xs text-gray-600">
        {excerpt}
      </blockquote>
    </article>
  );
}
