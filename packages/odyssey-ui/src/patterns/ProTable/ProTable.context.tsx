import { createContext, useContext } from "react";
import type { ProTableInstance } from "./ProTable";
import type { ProColumnMeta, ProTablePaginationConfig, ProTableQueryState } from "./ProTable.types";

export interface ProTableContextValue<TData extends object> {
  pagination: false | ProTablePaginationConfig;
  query: ProTableQueryState;
  selectedRowKeys: string[];
  selectedRows: TData[];
  table: ProTableInstance<TData>;
}

export const ProTableContext = createContext<ProTableContextValue<object> | null>(null);

export function useProTableContext<TData extends object = object>(): ProTableContextValue<TData> {
  const value = useContext(ProTableContext);
  if (!value) throw new Error("ProTable compound components must be rendered inside ProTable.");
  return value as unknown as ProTableContextValue<TData>;
}

export function columnLabel(columnDef: { header?: unknown; meta?: unknown }, fallback: string): string {
  const meta = columnDef.meta as ProColumnMeta | undefined;
  if (typeof meta?.mobileLabel === "string") return meta.mobileLabel;
  if (typeof meta?.label === "string") return meta.label;
  if (typeof columnDef.header === "string") return columnDef.header;
  return fallback;
}
