import { forwardRef, type HTMLAttributes, type ReactNode, type TableHTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { TablePagination, type TablePaginationOptions } from "./TablePagination";
export type { TablePaginationOptions } from "./TablePagination";

const styles = {
  container: "od-Table-container",
  table: "od-Table-table",
  header: "od-Table-header",
  body: "od-Table-body",
  footer: "od-Table-footer",
  row: "od-Table-row",
  head: "od-Table-head",
  cell: "od-Table-cell",
  caption: "od-Table-caption",
} as const;

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  containerClassName?: string;
  /** Pagination controls rendered below the table, outside its scroll region. */
  pagination?: ReactNode | TablePaginationOptions;
  /** Attributes for the scroll container, independent of the table element. */
  containerProps?: Omit<HTMLAttributes<HTMLDivElement>, "children" | "dangerouslySetInnerHTML">;
}
export const Table = forwardRef<HTMLTableElement, TableProps>(function Table({ className, containerClassName, containerProps, pagination, ...props }, ref) {
  const scrollRegion = (
    <div {...containerProps} data-od-slot="table-container" className={cn(styles.container, containerClassName, containerProps?.className)}>
      <table ref={ref} data-od-slot="table" className={cn(styles.table, className)} {...props} />
    </div>
  );
  if (!pagination) return scrollRegion;
  return (
    <div data-od-slot="table-paginated">
      {scrollRegion}
      <div data-od-slot="table-pagination">
        {typeof pagination === "object" && "onPageChange" in pagination ? <TablePagination {...pagination} /> : pagination}
      </div>
    </div>
  );
});
export const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(function TableHeader({ className, ...props }, ref) {
  return <thead ref={ref} data-od-slot="table-header" className={cn(styles.header, className)} {...props} />;
});
export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(function TableBody({ className, ...props }, ref) {
  return <tbody ref={ref} data-od-slot="table-body" className={cn(styles.body, className)} {...props} />;
});
export const TableFooter = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(function TableFooter({ className, ...props }, ref) {
  return <tfoot ref={ref} data-od-slot="table-footer" className={cn(styles.footer, className)} {...props} />;
});
export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(function TableRow({ className, ...props }, ref) {
  return <tr ref={ref} data-od-slot="table-row" className={cn(styles.row, className)} {...props} />;
});
export const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(function TableHead({ className, ...props }, ref) {
  return <th ref={ref} data-od-slot="table-head" className={cn(styles.head, className)} {...props} />;
});
export const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(function TableCell({ className, ...props }, ref) {
  return <td ref={ref} data-od-slot="table-cell" className={cn(styles.cell, className)} {...props} />;
});
export const TableCaption = forwardRef<HTMLTableCaptionElement, HTMLAttributes<HTMLTableCaptionElement>>(function TableCaption({ className, ...props }, ref) {
  return <caption ref={ref} data-od-slot="table-caption" className={cn(styles.caption, className)} {...props} />;
});
