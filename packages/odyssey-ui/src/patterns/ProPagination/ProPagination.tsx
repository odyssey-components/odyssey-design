import { useOdysseyLocale } from "@odyssey/ui/locale";
import { Button } from "@odyssey/ui/primitives/button";
import { Input } from "@odyssey/ui/primitives/input";
import {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNextButton,
  PaginationPreviousButton,
  type PaginationProps,
  PaginationStatus,
} from "@odyssey/ui/primitives/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectPortal,
  SelectPositioner,
  SelectTrigger,
  SelectValue,
} from "@odyssey/ui/primitives/select";
import { type FormEvent, type ForwardedRef, forwardRef, type ReactNode, useState } from "react";
import { useProLocale } from "../locale";
import {
  defineProSemanticParts,
  mergeClassNames,
  mergeStyles,
  type ProSemanticClassNamesFor,
  type ProSemanticPart,
  type ProSemanticStylesFor,
  semanticPartProps,
} from "../semantic-parts";

export const proPaginationParts = defineProSemanticParts({
  root: "pro-pagination",
  content: "pro-pagination-content",
  item: "pro-pagination-item",
  action: "pro-pagination-action",
  status: "pro-pagination-status",
  ellipsis: "pro-pagination-ellipsis",
  controls: "pro-pagination-controls",
  total: "pro-pagination-total",
  pageSize: "pro-pagination-page-size",
  quickJumper: "pro-pagination-quick-jumper",
  quickInput: "pro-pagination-quick-input",
  quickButton: "pro-pagination-quick-button",
} as const);
export type ProPaginationPart = ProSemanticPart<typeof proPaginationParts>;
export type ProPaginationClassNames = ProSemanticClassNamesFor<typeof proPaginationParts>;
export type ProPaginationStyles = ProSemanticStylesFor<typeof proPaginationParts>;

export interface ProPaginationProps extends Omit<PaginationProps, "children"> {
  /** How the bar sits inside its container. Ant Design calls this `align`. */
  align?: "start" | "center" | "end";
  boundaryCount?: number;
  classNames?: ProPaginationClassNames;
  defaultPage?: number;
  defaultPageSize?: number;
  disabled?: boolean;
  /**
   * Whether more rows exist beyond the ones the total counts.
   *
   * A cursor list knows neither the total nor the last page: Kubernetes
   * hands out a continue token instead. With `hasMore` the next button stays
   * live on the last known page and reports the page after it, which is how
   * the caller learns that another chunk has to be fetched.
   */
  hasMore?: boolean;
  /** Keep the next control focusable while an asynchronous page request is pending. */
  nextPending?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  page?: number;
  pageSize?: number;
  pageSizeOptions?: readonly number[];
  renderTotal?: (total: number, range: [number, number]) => ReactNode;
  showPageSize?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
  siblingCount?: number;
  styles?: ProPaginationStyles;
  total: number;
}

type PageToken = number | "start-ellipsis" | "end-ellipsis";
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function createPaginationRange(page: number, pageCount: number, boundaryCount = 1, siblingCount = 1): PageToken[] {
  const total = Math.max(1, Math.trunc(pageCount));
  const current = clamp(Math.trunc(page), 1, total);
  const boundary = Math.max(0, Math.trunc(boundaryCount));
  const sibling = Math.max(0, Math.trunc(siblingCount));
  const selected = new Set<number>();
  for (let value = 1; value <= Math.min(boundary, total); value += 1) selected.add(value);
  for (let value = Math.max(1, total - boundary + 1); value <= total; value += 1) selected.add(value);
  for (let value = Math.max(1, current - sibling); value <= Math.min(total, current + sibling); value += 1) selected.add(value);
  selected.add(current);
  const values = [...selected].sort((a, b) => a - b);
  const result: PageToken[] = [];
  for (const value of values) {
    const previous = result.at(-1);
    const previousPage = typeof previous === "number" ? previous : undefined;
    if (previousPage !== undefined && value - previousPage === 2) result.push(previousPage + 1);
    else if (previousPage !== undefined && value - previousPage > 2) result.push(previousPage < current ? "start-ellipsis" : "end-ellipsis");
    result.push(value);
  }
  return result;
}

/**
 * ProPagination renders the paging bar of a list.
 *
 * The bar follows Ant Design's reading order: the total first, then the page
 * buttons, then the options — page size and quick jump. Everything sits in
 * one row so the eye reads the summary, the position and the controls in that
 * order.
 *
 * Changing the page size keeps the operator on the rows they were looking at
 * rather than sending them back to the first page.
 */
function ProPaginationImplementation(
  {
    align = "start",
    boundaryCount = 1,
    className,
    classNames,
    defaultPage = 1,
    defaultPageSize = 10,
    disabled = false,
    hasMore = false,
    nextPending = false,
    onPageChange,
    onPageSizeChange,
    page,
    pageSize,
    pageSizeOptions = [10, 20, 50],
    renderTotal,
    showPageSize = false,
    showQuickJumper = false,
    showTotal = false,
    siblingCount = 1,
    style,
    styles,
    total,
    ...props
  }: ProPaginationProps,
  ref: ForwardedRef<HTMLElement>,
) {
  const locale = useProLocale();
  const coreLocale = useOdysseyLocale();
  const [internalPage, setInternalPage] = useState(defaultPage);
  const [internalPageSize, setInternalPageSize] = useState(defaultPageSize);
  const [jumpValue, setJumpValue] = useState("");
  const resolvedTotal = Math.max(0, Math.trunc(total));
  const resolvedPageSize = Math.max(1, Math.trunc(pageSize ?? internalPageSize));
  const resolvedPageSizeOptions = [
    ...new Set([...pageSizeOptions, resolvedPageSize].filter((option) => Number.isFinite(option) && option > 0).map((option) => Math.trunc(option))),
  ];
  const pageCount = Math.max(1, Math.ceil(resolvedTotal / resolvedPageSize));
  const current = clamp(Math.trunc(page ?? internalPage), 1, pageCount);
  const range: [number, number] = resolvedTotal === 0 ? [0, 0] : [(current - 1) * resolvedPageSize + 1, Math.min(current * resolvedPageSize, resolvedTotal)];
  const setPage = (next: number) => {
    const target = Math.trunc(next);
    // A cursor list may hold rows the total does not count yet, so the next
    // button may move past the last known page to ask for another chunk.
    const resolved = target > pageCount && hasMore ? target : clamp(target, 1, pageCount);
    if (page === undefined) setInternalPage(resolved);
    if (resolved !== current) onPageChange?.(resolved);
  };
  const commitJump = () => {
    if (!jumpValue.trim()) return;
    const parsed = Number(jumpValue);
    if (!Number.isFinite(parsed)) return;
    const next = clamp(Math.trunc(parsed), 1, pageCount);
    setJumpValue(String(next));
    setPage(next);
  };
  const submitJump = (event: FormEvent) => {
    event.preventDefault();
    commitJump();
  };

  return (
    <Pagination
      ref={ref}
      data-od-slot={proPaginationParts.root}
      data-align={align}
      data-has-total={showTotal || undefined}
      className={mergeClassNames(
        "flex flex-wrap items-center gap-2",
        align === "center" && "justify-center",
        align === "end" && "justify-end",
        showTotal && "justify-between max-[640px]:items-start",
        classNames?.root,
        className,
      )}
      style={mergeStyles(styles?.root, style)}
      {...props}
    >
      {showTotal && (
        <span
          {...semanticPartProps("total", classNames, styles)}
          className={mergeClassNames("whitespace-nowrap text-sm text-muted-foreground", classNames?.total)}
          data-od-slot={proPaginationParts.total}
        >
          {renderTotal?.(resolvedTotal, range) ?? locale.pagination.total(resolvedTotal, range)}
        </span>
      )}
      <div
        className={mergeClassNames(
          "inline-flex min-w-0 flex-[0_1_auto] flex-wrap items-center gap-2",
          showTotal && "max-[640px]:w-full max-[640px]:justify-end",
        )}
        data-od-slot="pro-pagination-control-group"
      >
        <PaginationContent {...semanticPartProps("content", classNames, styles)} data-od-slot={proPaginationParts.content}>
          <PaginationItem {...semanticPartProps("item", classNames, styles)} data-od-slot={proPaginationParts.item}>
            <PaginationPreviousButton
              {...semanticPartProps("action", classNames, styles)}
              data-od-slot={proPaginationParts.action}
              disabled={disabled || current === 1}
              onClick={() => setPage(current - 1)}
            />
          </PaginationItem>
          {createPaginationRange(current, pageCount, boundaryCount, siblingCount).map((token) => (
            <PaginationItem key={token} collapsible {...semanticPartProps("item", classNames, styles)} data-od-slot={proPaginationParts.item}>
              {typeof token === "number" ? (
                <PaginationButton
                  {...semanticPartProps("action", classNames, styles)}
                  aria-label={coreLocale.pagination.page(token)}
                  current={token === current}
                  data-od-slot={proPaginationParts.action}
                  disabled={disabled}
                  onClick={() => setPage(token)}
                >
                  {token}
                </PaginationButton>
              ) : (
                <PaginationEllipsis {...semanticPartProps("ellipsis", classNames, styles)} data-od-slot={proPaginationParts.ellipsis} />
              )}
            </PaginationItem>
          ))}
          <PaginationItem {...semanticPartProps("item", classNames, styles)} data-od-slot={proPaginationParts.item}>
            <PaginationStatus responsiveOnly {...semanticPartProps("status", classNames, styles)} data-od-slot={proPaginationParts.status}>
              {coreLocale.pagination.summary(current, pageCount)}
            </PaginationStatus>
          </PaginationItem>
          <PaginationItem {...semanticPartProps("item", classNames, styles)} data-od-slot={proPaginationParts.item}>
            <PaginationNextButton
              {...semanticPartProps("action", classNames, styles)}
              data-od-slot={proPaginationParts.action}
              aria-disabled={nextPending || undefined}
              data-disabled={nextPending || undefined}
              disabled={disabled || (!nextPending && current === pageCount && !hasMore)}
              onClick={nextPending ? undefined : () => setPage(current + 1)}
            />
          </PaginationItem>
        </PaginationContent>
        {(showPageSize || showQuickJumper) && (
          <div
            {...semanticPartProps("controls", classNames, styles)}
            className={mergeClassNames("inline-flex flex-wrap items-center gap-2", classNames?.controls)}
            data-od-slot={proPaginationParts.controls}
          >
            {showPageSize && (
              <label
                {...semanticPartProps("pageSize", classNames, styles)}
                className={mergeClassNames("inline-flex items-center gap-1 whitespace-nowrap text-sm", classNames?.pageSize)}
                data-od-slot={proPaginationParts.pageSize}
              >
                <span>{locale.pagination.pageSize}</span>
                <Select
                  modal={false}
                  value={String(resolvedPageSize)}
                  onValueChange={(value) => {
                    if (value === null) return;
                    const nextSize = Math.max(1, Number(value));
                    if (pageSize === undefined) setInternalPageSize(nextSize);
                    if (nextSize !== resolvedPageSize) onPageSizeChange?.(nextSize);
                    // Ant Design keeps the operator on the rows they were
                    // looking at: the page that still holds the first visible
                    // row after the change wins, instead of jumping back to one.
                    const preserved = Math.floor(((current - 1) * resolvedPageSize) / nextSize) + 1;
                    if (preserved !== current) {
                      if (page === undefined) setInternalPage(preserved);
                      onPageChange?.(preserved);
                    }
                  }}
                >
                  <SelectTrigger className="h-8 min-w-[3.25rem] px-2 text-sm" aria-label={locale.pagination.pageSize} disabled={disabled}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectPositioner>
                      <SelectContent width="trigger">
                        <SelectList>
                          {resolvedPageSizeOptions.map((option) => (
                            <SelectItem key={option} value={String(option)}>
                              <SelectItemIndicator />
                              <SelectItemText>{option}</SelectItemText>
                            </SelectItem>
                          ))}
                        </SelectList>
                      </SelectContent>
                    </SelectPositioner>
                  </SelectPortal>
                </Select>
              </label>
            )}
            {showQuickJumper && (
              <form onSubmit={submitJump} {...semanticPartProps("quickJumper", classNames, styles)} data-od-slot={proPaginationParts.quickJumper}>
                <Input
                  {...semanticPartProps("quickInput", classNames, styles)}
                  data-od-slot={proPaginationParts.quickInput}
                  aria-label={locale.pagination.jumpTo}
                  disabled={disabled}
                  inputMode="numeric"
                  min={1}
                  max={pageCount}
                  type="number"
                  value={jumpValue}
                  onChange={(event) => setJumpValue(event.currentTarget.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      commitJump();
                    }
                  }}
                />
                <Button
                  {...semanticPartProps("quickButton", classNames, styles)}
                  data-od-slot={proPaginationParts.quickButton}
                  disabled={disabled}
                  size="sm"
                  type="submit"
                >
                  {locale.pagination.go}
                </Button>
              </form>
            )}
          </div>
        )}
      </div>
    </Pagination>
  );
}

export const ProPagination = forwardRef(ProPaginationImplementation);
