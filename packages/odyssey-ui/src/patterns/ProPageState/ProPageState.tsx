import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle, Button, EmptyState, EmptyStateDescription, EmptyStateTitle, Skeleton, Spinner, Stack } from "../../primitives";
import { useProLocale } from "../locale";
import { defineProSemanticParts, mergeClassNames, mergeStyles, type ProSemanticClassNames, type ProSemanticStyles } from "../semantic-parts";
export interface ProPageStateSlots {
  loading?: (loading: ReactNode) => ReactNode;
  empty?: (empty: ReactNode) => ReactNode;
  error?: (error: ReactNode) => ReactNode;
}
export const proPageStateParts = defineProSemanticParts({
  root: "pro-page-state",
  title: "empty-state-title",
  description: "empty-state-description",
  action: "pro-page-state-action",
} as const);
export type ProPageStatePart = keyof typeof proPageStateParts;
export type ProPageStateClassNames = ProSemanticClassNames<ProPageStatePart>;
export type ProPageStateStyles = ProSemanticStyles<ProPageStatePart>;
export interface ProPageStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  classNames?: ProPageStateClassNames;
  state: "loading" | "empty" | "error";
  title?: ReactNode;
  description?: ReactNode;
  retryLabel?: ReactNode;
  onRetry?: () => void;
  skeletons?: number;
  slots?: ProPageStateSlots;
  styles?: ProPageStateStyles;
}
export const ProPageState = forwardRef<HTMLDivElement, ProPageStateProps>(function ProPageState(
  { className, classNames, state, style, styles, title, description, retryLabel, onRetry, skeletons = 0, slots, ...props },
  ref,
) {
  const locale = useProLocale();
  const skeletonKeys = Array.from({ length: skeletons }, (_, index) => `skeleton-${index + 1}`);
  if (state === "loading") {
    const loading = skeletons ? (
      skeletonKeys.map((key) => <Skeleton key={key} style={{ height: 40 }} />)
    ) : (
      <>
        <Spinner size="lg" />
        <span className={classNames?.title} style={styles?.title}>
          {title ?? locale.pageState.loading}
        </span>
      </>
    );
    return (
      <div
        ref={ref}
        {...props}
        data-od-slot="pro-page-state"
        data-state={state}
        className={mergeClassNames(classNames?.root, className)}
        style={mergeStyles(styles?.root, style)}
      >
        <Stack gap={2}>{slots?.loading?.(loading) ?? loading}</Stack>
      </div>
    );
  }
  if (state === "error") {
    const errorContent = (
      <>
        <AlertTitle className={classNames?.title} style={styles?.title}>
          {title ?? locale.pageState.error}
        </AlertTitle>
        {description && (
          <AlertDescription className={classNames?.description} style={styles?.description}>
            {description}
          </AlertDescription>
        )}
        {onRetry && (
          <Button className={classNames?.action} style={styles?.action} size="sm" onClick={onRetry}>
            {retryLabel ?? locale.pageState.retry}
          </Button>
        )}
      </>
    );
    return (
      <div
        ref={ref}
        {...props}
        data-od-slot="pro-page-state"
        data-state={state}
        className={mergeClassNames(classNames?.root, className)}
        style={mergeStyles(styles?.root, style)}
      >
        <Alert tone="danger">{slots?.error?.(errorContent) ?? errorContent}</Alert>
      </div>
    );
  }
  const emptyContent = (
    <>
      <EmptyStateTitle className={classNames?.title} style={styles?.title}>
        {title ?? locale.pageState.empty}
      </EmptyStateTitle>
      {description && (
        <EmptyStateDescription className={classNames?.description} style={styles?.description}>
          {description}
        </EmptyStateDescription>
      )}
    </>
  );
  return (
    <div
      ref={ref}
      {...props}
      data-od-slot="pro-page-state"
      data-state={state}
      className={mergeClassNames(classNames?.root, className)}
      style={mergeStyles(styles?.root, style)}
    >
      <EmptyState>{slots?.empty?.(emptyContent) ?? emptyContent}</EmptyState>
    </div>
  );
});
