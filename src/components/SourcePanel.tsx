import { SourcesState } from "@/lib/types";
import { SourceCard } from "./SourceCard";
import { useId } from "react";

interface SourcePanelProps {
  sourcesState: SourcesState;
  headingId?: string;
}

function getStatusMessage(sourcesState: SourcesState) {
  if (sourcesState.status !== "ready") return "";
  const count = sourcesState.sources.length;
  if (count === 0) return "No relevant sources found in your notes.";
  return `${count} ${count === 1 ? "source" : "sources"} found`;
}

export function SourcePanel({ sourcesState, headingId }: SourcePanelProps) {
  const fallbackId = useId();
  const id = headingId ?? fallbackId;
  const count =
    sourcesState.status === "ready" ? sourcesState.sources.length : null;

  const renderContent = () => {
    switch (sourcesState.status) {
      case "idle":
        return (
          <p className="text-sm text-gray-500">
            The notes used for each answer will appear here.
          </p>
        );

      case "loading":
        return <SourcesSkeleton />;

      case "ready":
        if (sourcesState.sources.length === 0) {
          return (
            <p className="text-sm text-gray-700">
              No relevant sources were found in your notes. The answer is not
              based on them.
            </p>
          );
        }
        return (
          <ol className="flex flex-col gap-3">
            {sourcesState.sources.map((source, index) => (
              <li key={source.id}>
                <SourceCard rank={index + 1} source={source} />
              </li>
            ))}
          </ol>
        );

      default: {
        const unhandled: never = sourcesState;
        return unhandled;
      }
    }
  };

  return (
    <div>
      <h2
        id={id}
        className="sticky top-0 border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900"
      >
        Sources{count !== null && ` (${count})`}
      </h2>

      <div aria-busy={sourcesState.status === "loading"} className="p-4">
        {renderContent()}
      </div>

      <p role="status" className="sr-only">
        {getStatusMessage(sourcesState)}
      </p>
    </div>
  );
}

function SourcesSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-24 rounded-lg bg-gray-100 motion-safe:animate-pulse"
        />
      ))}
    </div>
  );
}
