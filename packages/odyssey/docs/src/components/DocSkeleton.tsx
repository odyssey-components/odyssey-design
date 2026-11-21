import { Skeleton } from "@odyssey/ui/skeleton";

const paragraphLines = [
  ["primary-1", "100%"],
  ["primary-2", "100%"],
  ["primary-3", "65%"],
  ["primary-4", "100%"],
  ["primary-5", "80%"],
  ["primary-6", "45%"],
] as const;

export function DocSkeleton() {
  return (
    <div className="od-Docs-skeleton">
      <Skeleton className="od-Docs-skeletonTitle" />
      {paragraphLines.map(([key, width]) => (
        <Skeleton key={key} className="od-Docs-skeletonLine" style={{ width }} />
      ))}
      <Skeleton className="od-Docs-skeletonHeading" />
      {paragraphLines.slice(0, 4).map(([key, width]) => (
        <Skeleton key={`secondary-${key}`} className="od-Docs-skeletonLine" style={{ width }} />
      ))}
    </div>
  );
}
