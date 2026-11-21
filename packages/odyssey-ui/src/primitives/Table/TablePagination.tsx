import { useState } from "react";
import { useOdysseyLocale } from "../../locale";
import { Button } from "../Button";
import { Input } from "../Input";
import { Select, SelectContent, SelectItem, SelectItemText, SelectIcon, SelectList, SelectPortal, SelectPositioner, SelectTrigger, SelectValue } from "../Select";

export interface TablePaginationOptions {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
  disabled?: boolean;
}

export function TablePagination({ page, pageSize, total, onPageChange, onPageSizeChange, pageSizeOptions = [10, 20, 50, 100], disabled }: TablePaginationOptions) {
  const { pagination: labels } = useOdysseyLocale();
  const last = Math.max(1, Math.ceil(total / pageSize));
  const sizes = [...new Set([...pageSizeOptions, pageSize])].sort((a, b) => a - b);
  const [jump, setJump] = useState("");
  const target = Number(jump);
  const canJump = Number.isSafeInteger(target) && target >= 1 && target <= last && target !== page;
  return <nav aria-label={labels.label} className="od-Table-pagination" data-od-slot="table-pagination-controls">
    <span className="od-Table-pagination-total">{labels.totalRows(total)}</span>
    <Select value={String(pageSize)} onValueChange={(value) => { if (value !== null) onPageSizeChange(Number(value)); }}>
      <SelectTrigger aria-label={labels.pageSize} className="h-8 px-2 text-sm" disabled={disabled}><SelectValue>{labels.rowsPerPage(pageSize)}</SelectValue><SelectIcon /></SelectTrigger>
      <SelectPortal><SelectPositioner><SelectContent><SelectList>
        {sizes.map(size => <SelectItem key={size} value={String(size)}><SelectItemText>{labels.rowsPerPage(size)}</SelectItemText></SelectItem>)}
      </SelectList></SelectContent></SelectPositioner></SelectPortal>
    </Select>
    <Button size="sm" variant="outline" disabled={disabled || page <= 1} onClick={() => onPageChange(page - 1)}>{labels.previous}</Button>
    <span aria-live="polite">{labels.page(page)}</span>
    <Button size="sm" variant="outline" disabled={disabled || page >= last} onClick={() => onPageChange(page + 1)}>{labels.next}</Button>
    <form className="od-Table-pagination-jump" onSubmit={event => {
      event.preventDefault();
      if (!disabled && canJump) { onPageChange(target); setJump(""); }
    }}>
      <Input size="sm" type="number" min={1} max={last} step={1} value={jump} onChange={event => setJump(event.currentTarget.value)}
        aria-label={labels.pageNumber} placeholder={labels.pagePlaceholder} disabled={disabled || last === 1} />
      <Button size="sm" variant="outline" type="submit" disabled={disabled || !canJump}>{labels.jump}</Button>
    </form>
  </nav>;
}
