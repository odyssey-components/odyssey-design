import type { ColumnFiltersState, ColumnVisibilityState, Row, SortingState } from "@tanstack/react-table";
import type { HTMLAttributes, ReactNode } from "react";
import type { ProActionOption, ProFilterOption } from "../options";
import { defineProSemanticParts, type ProSemanticClassNames, type ProSemanticStyles } from "../semantic-parts";
import type { ProColumnDef, ProFeatures, ProTableInstance } from "./ProTable";

export interface ProColumnMeta {
  align?: "start" | "center" | "end";
  hideBelow?: "sm" | "md" | "lg";
  label?: ReactNode;
  mobileLabel?: string;
}

export interface ProTableQueryState {
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  page: number;
  pageSize: number;
  sorting: SortingState;
}

export interface ProTableSelectionState {
  selectedRowKeys: string[];
}

export const proTableParts = defineProSemanticParts({
  root: "pro-table",
  toolbar: "pro-table-toolbar",
  region: "pro-table-region",
  table: "table",
  header: "table-header",
  headerCell: "table-head",
  row: "table-row",
  cell: "table-cell",
  loading: "pro-table-loading",
  empty: "pro-table-empty",
  pagination: "pro-table-pagination",
} as const);
export type ProTablePart = keyof typeof proTableParts;
export type ProTableClassNames = ProSemanticClassNames<ProTablePart>;
export type ProTableStyles = ProSemanticStyles<ProTablePart>;

export interface ProTableSlots<TData extends object> {
  cell?: (row: Row<ProFeatures, TData>, columnId: string, content: ReactNode) => ReactNode;
  empty?: (table: ProTableInstance<TData>) => ReactNode;
  header?: (columnId: string, content: ReactNode) => ReactNode;
  loading?: (table: ProTableInstance<TData>) => ReactNode;
  pagination?: (table: ProTableInstance<TData>) => ReactNode;
  toolbar?: (table: ProTableInstance<TData>) => ReactNode;
}

export interface ProTableManualConfig {
  filtering?: boolean;
  pagination?: boolean;
  sorting?: boolean;
}

export interface ProTablePaginationConfig {
  pageSizeOptions?: readonly number[];
  showQuickJumper?: boolean;
  showPageSize?: boolean;
  showTotal?: boolean;
  total?: number;
}

export interface ProTableSelectionConfig<TData extends object> {
  defaultSelectedRowKeys?: readonly string[];
  disabled?: boolean;
  onChange?: (selection: ProTableSelectionState, selectedRows: TData[]) => void;
  selectedRowKeys?: readonly string[];
}

export interface ProTableOptions<TData extends object> {
  columnVisibility?: ColumnVisibilityState;
  columns: readonly ProColumnDef<TData>[];
  dataSource: readonly TData[];
  defaultColumnVisibility?: ColumnVisibilityState;
  defaultQuery?: Partial<ProTableQueryState>;
  emptyContent?: ReactNode;
  loading?: boolean;
  loadingRows?: number;
  manual?: ProTableManualConfig;
  onColumnVisibilityChange?: (visibility: ColumnVisibilityState) => void;
  onQueryChange?: (query: ProTableQueryState) => void;
  pagination?: false | ProTablePaginationConfig;
  query?: ProTableQueryState;
  responsive?: "scroll" | "stack";
  rowKey: keyof TData | ((row: TData, index: number) => string | number);
  selection?: false | ProTableSelectionConfig<TData>;
  toolbar?: ReactNode | ((table: ProTableInstance<TData>) => ReactNode);
  filters?: readonly ProFilterOption[];
  rowActions?: readonly ProActionOption<TData>[];
  bulkActions?: readonly ProActionOption<readonly TData[]>[];
  renderCell?: (row: Row<ProFeatures, TData>, columnId: string, content: ReactNode) => ReactNode;
}
export interface ProTableProps<TData extends object> extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  options: ProTableOptions<TData>;
}
