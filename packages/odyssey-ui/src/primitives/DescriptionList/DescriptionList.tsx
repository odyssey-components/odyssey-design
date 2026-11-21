import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

const styles = {
  list: "od-DescriptionList-list",
  item: "od-DescriptionList-item",
  term: "od-DescriptionList-term",
  detail: "od-DescriptionList-detail",
} as const;

export interface DescriptionListProps extends HTMLAttributes<HTMLDListElement> {
  columns?: number;
  layout?: "vertical" | "horizontal" | "responsive";
  size?: "sm" | "md" | "lg";
}
export const DescriptionList = forwardRef<HTMLDListElement, DescriptionListProps>(function DescriptionList(
  { className, columns = 2, layout = "vertical", size = "md", style, ...props },
  ref,
) {
  return (
    <dl
      ref={ref}
      data-od-slot="description-list"
      data-columns={columns}
      data-layout={layout}
      data-size={size}
      className={cn(styles.list, className)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, ...style }}
      {...props}
    />
  );
});
export interface DescriptionItemProps extends HTMLAttributes<HTMLDivElement> {}
export const DescriptionItem = forwardRef<HTMLDivElement, DescriptionItemProps>(function DescriptionItem({ className, ...props }, ref) {
  return <div ref={ref} data-od-slot="description-item" className={cn(styles.item, className)} {...props} />;
});
export interface DescriptionTermProps extends HTMLAttributes<HTMLElement> {}
export const DescriptionTerm = forwardRef<HTMLElement, DescriptionTermProps>(function DescriptionTerm({ className, ...props }, ref) {
  return <dt ref={ref} data-od-slot="description-term" className={cn(styles.term, className)} {...props} />;
});
export interface DescriptionDetailProps extends HTMLAttributes<HTMLElement> {}
export const DescriptionDetail = forwardRef<HTMLElement, DescriptionDetailProps>(function DescriptionDetail({ className, ...props }, ref) {
  return <dd ref={ref} data-od-slot="description-detail" className={cn(styles.detail, className)} {...props} />;
});
