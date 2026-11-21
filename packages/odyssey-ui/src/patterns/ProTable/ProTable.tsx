import {
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  createTableHook,
  functionalUpdate,
  globalFilteringFeature,
  type ReactTable,
  type RowSelectionState,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  type SortingState,
  type TableState,
  tableFeatures,
  type Updater,
} from "@tanstack/react-table";
import { type ForwardedRef, forwardRef, type ReactElement, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  CheckboxIndicator,
  EmptyState,
  EmptyStateTitle,
  Input,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  ToggleButton,
} from "../../primitives";
import { useProLocale } from "../locale";
import { ProTablePagination, partProps } from "./ProTable.parts";

export const proTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  rowSelectionFeature,
  columnVisibilityFeature,
});

export type ProFeatures = typeof proTableFeatures;
const proTableHook = createTableHook({ features: proTableFeatures });
export const createProColumnHelper = proTableHook.createAppColumnHelper;
export type ProTableInstance<TData extends object> = ReactTable<ProFeatures, TData>;
export type ProColumnDef<TData extends object, TValue = unknown> = ColumnDef<ProFeatures, TData, TValue> & { meta?: ProColumnMeta };

export type {
  ProColumnMeta,
  ProTableClassNames,
  ProTableManualConfig,
  ProTableOptions,
  ProTablePaginationConfig,
  ProTablePart,
  ProTableProps,
  ProTableQueryState,
  ProTableSelectionConfig,
  ProTableSelectionState,
  ProTableSlots,
  ProTableStyles,
} from "./ProTable.types";

const initialQuery: ProTableQueryState = { columnFilters: [], globalFilter: "", page: 1, pageSize: 10, sorting: [] };

import { columnLabel, ProTableContext, type ProTableContextValue } from "./ProTable.context";
import type { ProColumnMeta, ProTableClassNames, ProTableProps, ProTableQueryState, ProTableSlots, ProTableStyles } from "./ProTable.types";

const ProTableRoot = "div";
const ProTableToolbarRoot = "div";
const ProTableRegion = "div";
const ProTableSortButton = "button";
const ProTableLoading = "div";

function ProTableImplementation<TData extends object>({ options, className, style, ...props }: ProTableProps<TData>, ref: ForwardedRef<HTMLDivElement>) {
  const {
    columnVisibility,
    columns,
    dataSource,
    defaultColumnVisibility,
    defaultQuery,
    emptyContent,
    loading = false,
    loadingRows = 3,
    manual = {},
    onColumnVisibilityChange,
    onQueryChange,
    pagination = {},
    query,
    responsive = "scroll",
    rowKey,
    selection = false,
    toolbar,
    filters = [],
    rowActions = [],
    bulkActions = [],
    renderCell,
  } = options;
  const classNames: ProTableClassNames = {};
  const styles: ProTableStyles = {};
  const slots: ProTableSlots<TData> | undefined =
    toolbar || renderCell
      ? {
          toolbar: toolbar ? (table) => (typeof toolbar === "function" ? toolbar(table) : toolbar) : undefined,
          cell: renderCell,
        }
      : undefined;
  const locale = useProLocale();
  const defaultState = useMemo(() => ({ ...initialQuery, ...defaultQuery }), [defaultQuery]);
  const [localQuery, setLocalQuery] = useState(defaultState);
  const resolvedQuery = query ?? localQuery;
  const [localVisibility, setLocalVisibility] = useState(defaultColumnVisibility ?? {});
  const resolvedVisibility = columnVisibility ?? localVisibility;
  const [localSelection, setLocalSelection] = useState<RowSelectionState>(() =>
    Object.fromEntries((selection === false ? [] : (selection.defaultSelectedRowKeys ?? [])).map((key) => [key, true])),
  );
  const resolvedSelection: RowSelectionState =
    selection !== false && selection.selectedRowKeys ? Object.fromEntries(selection.selectedRowKeys.map((key) => [key, true])) : localSelection;

  const updateQuery = <K extends keyof ProTableQueryState>(key: K, updater: Updater<ProTableQueryState[K]>) => {
    const value = functionalUpdate(updater, resolvedQuery[key]);
    const next = { ...resolvedQuery, [key]: value, ...(key === "page" || key === "pageSize" ? {} : { page: 1 }) };
    if (!query) setLocalQuery(next);
    onQueryChange?.(next);
  };

  const selectColumn: ProColumnDef<TData> = {
    id: "__selection",
    enableHiding: false,
    enableSorting: false,
    meta: { label: locale.table.selectAll, mobileLabel: "" },
    header: ({ table }) => (
      <Checkbox
        aria-label={locale.table.selectAll}
        aria-checked={table.getIsSomePageRowsSelected() ? "mixed" : table.getIsAllPageRowsSelected()}
        checked={table.getIsAllPageRowsSelected()}
        disabled={selection !== false && selection.disabled}
        onCheckedChange={(checked) => table.toggleAllPageRowsSelected(Boolean(checked))}
      >
        <CheckboxIndicator />
      </Checkbox>
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={locale.table.selectRow(row.index + 1)}
        checked={row.getIsSelected()}
        disabled={(selection !== false && selection.disabled) || !row.getCanSelect()}
        onCheckedChange={(checked) => row.toggleSelected(Boolean(checked))}
      >
        <CheckboxIndicator />
      </Checkbox>
    ),
  };

  const actionsColumn: ProColumnDef<TData> = {
    id: "__actions",
    header: locale.table.actions,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => (
      <Stack direction="row" gap={1}>
        {rowActions
          .filter((action) => !(typeof action.hidden === "function" ? action.hidden(row.original) : action.hidden))
          .map((action) => (
            <Button
              key={action.key}
              type="button"
              size="sm"
              variant="ghost"
              tone={action.destructive ? "danger" : "neutral"}
              loading={action.loading}
              disabled={typeof action.disabled === "function" ? action.disabled(row.original) : action.disabled}
              onClick={() => void action.onAction(row.original)}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
      </Stack>
    ),
  };
  const dataColumns = rowActions.length ? [...columns, actionsColumn] : [...columns];
  const resolvedColumns = selection === false ? dataColumns : [selectColumn, ...dataColumns];
  // The row model is memoized on the identity of the data. A fresh array on
  // every render makes the table believe the data changed and reset the page
  // back to the first one, so the copy is kept for as long as the source is.
  const tableData = useMemo(() => [...dataSource], [dataSource]);
  const table = proTableHook.useAppTable<TData>({
    columns: resolvedColumns,
    data: tableData,
    getRowId: (row, index) => String(typeof rowKey === "function" ? rowKey(row, index) : row[rowKey]),
    manualFiltering: manual.filtering,
    manualPagination: pagination === false || manual.pagination,
    manualSorting: manual.sorting,
    onColumnFiltersChange: (updater) => updateQuery("columnFilters", updater),
    onColumnVisibilityChange: (updater) => {
      const next = functionalUpdate(updater, resolvedVisibility);
      if (!columnVisibility) setLocalVisibility(next);
      onColumnVisibilityChange?.(next);
    },
    onGlobalFilterChange: (updater) => updateQuery("globalFilter", updater),
    onPaginationChange: (updater) => {
      const nextPagination = functionalUpdate(updater, { pageIndex: resolvedQuery.page - 1, pageSize: resolvedQuery.pageSize });
      const next = { ...resolvedQuery, page: nextPagination.pageIndex + 1, pageSize: nextPagination.pageSize };
      if (!query) setLocalQuery(next);
      onQueryChange?.(next);
    },
    onRowSelectionChange: (updater) => {
      const next = functionalUpdate(updater, resolvedSelection);
      if (selection === false || !selection.selectedRowKeys) setLocalSelection(next);
      if (selection !== false) {
        const selectedRows = dataSource.filter((row, index) => next[String(typeof rowKey === "function" ? rowKey(row, index) : row[rowKey])]);
        selection.onChange?.({ selectedRowKeys: Object.keys(next) }, selectedRows);
      }
    },
    onSortingChange: (updater) => updateQuery("sorting", updater),
    pageCount: pagination === false || pagination.total === undefined ? undefined : Math.max(1, Math.ceil(pagination.total / resolvedQuery.pageSize)),
    state: {
      columnFilters: resolvedQuery.columnFilters,
      columnVisibility: resolvedVisibility,
      globalFilter: resolvedQuery.globalFilter,
      pagination: { pageIndex: resolvedQuery.page - 1, pageSize: resolvedQuery.pageSize },
      rowSelection: resolvedSelection,
      sorting: resolvedQuery.sorting,
    } as TableState<ProFeatures>,
  });
  const rows = table.getRowModel().rows;
  const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);
  const context = {
    pagination,
    query: resolvedQuery,
    selectedRowKeys: Object.keys(resolvedSelection),
    selectedRows,
    table,
  } satisfies ProTableContextValue<TData>;
  const configuredToolbar =
    toolbar || filters.length || bulkActions.length ? (
      <Stack direction="row" gap={2} align="center" wrap>
        {filters.map((filter) =>
          filter.type === "toggle" ? (
            <ToggleButton key={filter.key} pressed={Boolean(filter.value)} onPressedChange={(value) => filter.onChange(value)}>
              {filter.label}
            </ToggleButton>
          ) : (
            <Input
              key={filter.key}
              type="search"
              aria-label={String(filter.label)}
              placeholder={filter.placeholder}
              value={String(filter.value ?? "")}
              onChange={(event) => filter.onChange(event.currentTarget.value)}
            />
          ),
        )}
        {typeof toolbar === "function" ? toolbar(table) : toolbar}
        {selectedRows.length
          ? bulkActions
              .filter((action) => !(typeof action.hidden === "function" ? action.hidden(selectedRows) : action.hidden))
              .map((action) => (
                <Button
                  key={action.key}
                  type="button"
                  size="sm"
                  variant="ghost"
                  tone={action.destructive ? "danger" : "neutral"}
                  loading={action.loading}
                  disabled={typeof action.disabled === "function" ? action.disabled(selectedRows) : action.disabled}
                  onClick={() => void action.onAction(selectedRows)}
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))
          : null}
      </Stack>
    ) : null;

  return (
    <ProTableContext.Provider value={context as unknown as ProTableContextValue<object>}>
      <table.AppTable>
        <ProTableRoot
          ref={ref}
          {...props}
          data-od-slot="pro-table"
          data-responsive={responsive}
          aria-busy={loading || undefined}
          className={[classNames?.root, className].filter(Boolean).join(" ") || undefined}
          style={{ ...styles?.root, ...style }}
        >
          {configuredToolbar && (
            <ProTableToolbarRoot data-od-slot="pro-table-toolbar" {...partProps("toolbar", classNames, styles)}>
              {configuredToolbar}
            </ProTableToolbarRoot>
          )}
          <ProTableRegion data-od-slot="pro-table-region" {...partProps("region", classNames, styles)}>
            <Table {...partProps("table", classNames, styles)}>
              <TableHeader {...partProps("header", classNames, styles)}>
                {table.getHeaderGroups().map((group) => (
                  <TableRow key={group.id}>
                    {group.headers.map((header) => {
                      const content = header.isPlaceholder ? null : <table.FlexRender header={header} />;
                      const sorted = header.column.getIsSorted();
                      const meta = header.column.columnDef.meta as ProColumnMeta | undefined;
                      return (
                        <TableHead
                          key={header.id}
                          aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}
                          data-align={meta?.align}
                          data-hide-below={meta?.hideBelow}
                          {...partProps("headerCell", classNames, styles)}
                        >
                          {header.column.getCanSort() ? (
                            <ProTableSortButton data-od-slot="pro-table-sort-button" type="button" onClick={header.column.getToggleSortingHandler()}>
                              {slots?.header?.(header.column.id, content) ?? content}
                              <span aria-hidden="true">{sorted === "asc" ? "↑" : sorted === "desc" ? "↓" : "↕"}</span>
                            </ProTableSortButton>
                          ) : (
                            (slots?.header?.(header.column.id, content) ?? content)
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} data-selected={row.getIsSelected() || undefined} {...partProps("row", classNames, styles)}>
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta as ProColumnMeta | undefined;
                      const content = <table.FlexRender cell={cell} />;
                      return (
                        <TableCell
                          key={cell.id}
                          data-align={meta?.align}
                          data-hide-below={meta?.hideBelow}
                          data-label={columnLabel(cell.column.columnDef, cell.column.id)}
                          {...partProps("cell", classNames, styles)}
                        >
                          {slots?.cell?.(row, cell.column.id, content) ?? content}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {rows.length === 0 && !loading && (
              <div data-od-slot="pro-table-empty" {...partProps("empty", classNames, styles)}>
                {slots?.empty?.(table) ?? (
                  <EmptyState>
                    <EmptyStateTitle>{emptyContent ?? locale.table.empty}</EmptyStateTitle>
                  </EmptyState>
                )}
              </div>
            )}
          </ProTableRegion>
          {loading && (
            <ProTableLoading role="status" aria-label={locale.table.loading} data-od-slot="pro-table-loading" {...partProps("loading", classNames, styles)}>
              {slots?.loading?.(table) ??
                Array.from({ length: loadingRows }, (_, index) => `loading-row-${index + 1}`).map((key) => <Skeleton key={key} style={{ height: 40 }} />)}
            </ProTableLoading>
          )}
          {slots?.pagination ? slots.pagination(table) : <ProTablePagination {...partProps("pagination", classNames, styles)} />}
        </ProTableRoot>
      </table.AppTable>
    </ProTableContext.Provider>
  );
}

export const ProTable = forwardRef(ProTableImplementation) as <TData extends object>(
  props: ProTableProps<TData> & { ref?: ForwardedRef<HTMLDivElement> },
) => ReactElement;

export type { ColumnFiltersState, ColumnVisibilityState, RowSelectionState, SortingState };
