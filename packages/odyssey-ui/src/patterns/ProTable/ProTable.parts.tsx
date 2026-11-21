import type { ComponentProps, HTMLAttributes } from "react";
import { forwardRef } from "react";
import { Checkbox, CheckboxIndicator, Input } from "../../primitives";
import { useProLocale } from "../locale";
import { ProPagination } from "../ProPagination";
import { semanticPartProps } from "../semantic-parts";
import { columnLabel, useProTableContext } from "./ProTable.context";
import type { ProTableClassNames, ProTablePart, ProTableStyles } from "./ProTable.types";

const ProTableToolbarRoot = "div";
const ProTableToolbarGroup = "div";
const ProTableVisibility = "details";
const ProTableVisibilityMenu = "div";
const ProTablePaginationRoot = "div";

export function partProps(part: ProTablePart, classNames?: ProTableClassNames, styles?: ProTableStyles) {
  return semanticPartProps(part, classNames, styles);
}

export const ProTableToolbar = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function ProTableToolbar(props, ref) {
  useProTableContext();
  return <ProTableToolbarRoot ref={ref} data-od-slot="pro-table-toolbar" {...props} />;
});

export interface ProTableSearchProps extends Omit<ComponentProps<typeof Input>, "value" | "onChange"> {
  onValueChange?: (value: string) => void;
}

export const ProTableSearch = forwardRef<HTMLInputElement, ProTableSearchProps>(function ProTableSearch({ onValueChange, ...props }, ref) {
  const { query, table } = useProTableContext();
  return (
    <Input
      ref={ref}
      type="search"
      data-od-slot="pro-table-search"
      value={query.globalFilter}
      onChange={(event) => {
        table.setGlobalFilter(event.currentTarget.value);
        onValueChange?.(event.currentTarget.value);
      }}
      {...props}
    />
  );
});

export const ProTableColumnVisibility = forwardRef<HTMLDetailsElement, HTMLAttributes<HTMLDetailsElement>>(function ProTableColumnVisibility(
  { children, ...props },
  ref,
) {
  const { table } = useProTableContext();
  const locale = useProLocale();
  return (
    <ProTableVisibility ref={ref} data-od-slot="pro-table-column-visibility" {...props}>
      <summary>{children ?? locale.table.columns}</summary>
      <ProTableVisibilityMenu data-od-slot="pro-table-visibility-menu">
        {table
          .getAllLeafColumns()
          .filter((column) => column.getCanHide())
          .map((column) => (
            <div key={column.id}>
              <Checkbox
                aria-label={columnLabel(column.columnDef, column.id)}
                checked={column.getIsVisible()}
                onCheckedChange={(checked) => column.toggleVisibility(Boolean(checked))}
              >
                <CheckboxIndicator />
              </Checkbox>{" "}
              {columnLabel(column.columnDef, column.id)}
            </div>
          ))}
      </ProTableVisibilityMenu>
    </ProTableVisibility>
  );
});

export const ProTableBulkActions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function ProTableBulkActions({ children, ...props }, ref) {
  const { selectedRowKeys } = useProTableContext();
  const locale = useProLocale();
  if (selectedRowKeys.length === 0) return null;
  return (
    <ProTableToolbarGroup ref={ref} data-od-slot="pro-table-bulk-actions" {...props}>
      <span>{locale.table.selectedRows(selectedRowKeys.length)}</span>
      {children}
    </ProTableToolbarGroup>
  );
});

export const ProTablePagination = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function ProTablePagination(props, ref) {
  const { pagination, query, table } = useProTableContext();
  if (pagination === false || table.getPageCount() <= 1) return null;
  return (
    <ProTablePaginationRoot ref={ref} data-od-slot="pro-table-pagination" {...props}>
      <ProPagination
        page={query.page}
        pageSize={query.pageSize}
        pageSizeOptions={pagination.pageSizeOptions}
        showPageSize={pagination.showPageSize}
        showQuickJumper={pagination.showQuickJumper}
        showTotal={pagination.showTotal}
        total={pagination.total ?? table.getRowCount()}
        onPageChange={(page) => table.setPageIndex(page - 1)}
        onPageSizeChange={(pageSize) => table.setPageSize(pageSize)}
      />
    </ProTablePaginationRoot>
  );
});
