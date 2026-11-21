import { type AnchorHTMLAttributes, type ButtonHTMLAttributes, forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { useOdysseyLocale } from "../../locale";
import type { OdysseySize } from "../../types";
import { Button } from "../Button";

const styles = {
  root: "od-Pagination-root",
  content: "od-Pagination-content",
  item: "od-Pagination-item",
  link: "od-Pagination-link",
  button: "od-Pagination-button",
  status: "od-Pagination-status",
  ellipsis: "od-Pagination-ellipsis",
  actionLabel: "od-Pagination-actionLabel",
  directionIcon: "od-Pagination-directionIcon",
} as const;

export interface PaginationProps extends HTMLAttributes<HTMLElement> {
  responsive?: boolean;
  simple?: boolean;
  size?: OdysseySize;
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  { "aria-label": ariaLabel, className, responsive = true, simple = false, size = "md", ...props },
  ref,
) {
  const locale = useOdysseyLocale();
  return (
    <nav
      ref={ref}
      aria-label={ariaLabel ?? locale.pagination.label}
      data-od-slot="pagination"
      data-responsive={responsive || undefined}
      data-simple={simple || undefined}
      data-size={size}
      className={cn(styles.root, className)}
      {...props}
    />
  );
});

export interface PaginationContentProps extends HTMLAttributes<HTMLUListElement> {}
export const PaginationContent = forwardRef<HTMLUListElement, PaginationContentProps>(function PaginationContent({ className, ...props }, ref) {
  return <ul ref={ref} data-od-slot="pagination-content" className={cn(styles.content, className)} {...props} />;
});

export interface PaginationItemProps extends HTMLAttributes<HTMLLIElement> {
  collapsible?: boolean;
}
export const PaginationItem = forwardRef<HTMLLIElement, PaginationItemProps>(function PaginationItem({ className, collapsible = false, ...props }, ref) {
  return <li ref={ref} data-od-slot="pagination-item" data-collapsible={collapsible || undefined} className={cn(styles.item, className)} {...props} />;
});

interface PaginationCurrentProps {
  current?: boolean;
}

export interface PaginationLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement>, PaginationCurrentProps {
  disabled?: boolean;
}
export const PaginationLink = forwardRef<HTMLAnchorElement, PaginationLinkProps>(function PaginationLink(
  { "aria-current": ariaCurrent, "aria-disabled": ariaDisabled, className, current = false, disabled = false, href, onClick, tabIndex, ...props },
  ref,
) {
  return (
    <a
      ref={ref}
      aria-current={ariaCurrent ?? (current ? "page" : undefined)}
      aria-disabled={ariaDisabled ?? (disabled || undefined)}
      data-active={current || undefined}
      data-disabled={disabled || undefined}
      data-od-slot="pagination-link"
      className={cn(styles.link, className)}
      href={disabled ? undefined : href}
      tabIndex={disabled ? -1 : tabIndex}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      {...props}
    />
  );
});

export interface PaginationButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, PaginationCurrentProps {}
export const PaginationButton = forwardRef<HTMLButtonElement, PaginationButtonProps>(function PaginationButton(
  { "aria-current": ariaCurrent, className, current = false, type = "button", ...props },
  ref,
) {
  return (
    <Button
      ref={ref}
      aria-current={ariaCurrent ?? (current ? "page" : undefined)}
      data-active={current || undefined}
      data-od-slot="pagination-button"
      className={cn(styles.button, className)}
      type={type}
      {...props}
    />
  );
});

export interface PaginationStatusProps extends HTMLAttributes<HTMLSpanElement> {
  responsiveOnly?: boolean;
}
export const PaginationStatus = forwardRef<HTMLSpanElement, PaginationStatusProps>(function PaginationStatus(
  { "aria-live": ariaLive = "polite", className, responsiveOnly = false, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      aria-live={ariaLive}
      data-od-slot="pagination-status"
      data-responsive-only={responsiveOnly || undefined}
      className={cn(styles.status, className)}
      {...props}
    />
  );
});

export const PaginationEllipsis = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(function PaginationEllipsis(
  { children = "…", className, ...props },
  ref,
) {
  return (
    <span ref={ref} aria-hidden="true" data-od-slot="pagination-ellipsis" className={cn(styles.ellipsis, className)} {...props}>
      {children}
    </span>
  );
});

function PreviousContent({ label }: { label: string }) {
  return (
    <>
      <span className={styles.directionIcon} aria-hidden="true">
        ‹
      </span>
      <span className={styles.actionLabel}>{label}</span>
    </>
  );
}
function NextContent({ label }: { label: string }) {
  return (
    <>
      <span className={styles.actionLabel}>{label}</span>
      <span className={styles.directionIcon} aria-hidden="true">
        ›
      </span>
    </>
  );
}

export const PaginationPreviousLink = forwardRef<HTMLAnchorElement, PaginationLinkProps>(function PaginationPreviousLink({ children, ...props }, ref) {
  const locale = useOdysseyLocale();
  const label = props["aria-label"] ?? locale.pagination.previous;
  return (
    <PaginationLink ref={ref} aria-label={label} data-od-slot="pagination-previous-link" {...props}>
      {children ?? <PreviousContent label={locale.pagination.previous} />}
    </PaginationLink>
  );
});
export const PaginationNextLink = forwardRef<HTMLAnchorElement, PaginationLinkProps>(function PaginationNextLink({ children, ...props }, ref) {
  const locale = useOdysseyLocale();
  const label = props["aria-label"] ?? locale.pagination.next;
  return (
    <PaginationLink ref={ref} aria-label={label} data-od-slot="pagination-next-link" {...props}>
      {children ?? <NextContent label={locale.pagination.next} />}
    </PaginationLink>
  );
});
export const PaginationPreviousButton = forwardRef<HTMLButtonElement, PaginationButtonProps>(function PaginationPreviousButton({ children, ...props }, ref) {
  const locale = useOdysseyLocale();
  const label = props["aria-label"] ?? locale.pagination.previous;
  return (
    <PaginationButton ref={ref} aria-label={label} data-od-slot="pagination-previous-button" {...props}>
      {children ?? <PreviousContent label={locale.pagination.previous} />}
    </PaginationButton>
  );
});
export const PaginationNextButton = forwardRef<HTMLButtonElement, PaginationButtonProps>(function PaginationNextButton({ children, ...props }, ref) {
  const locale = useOdysseyLocale();
  const label = props["aria-label"] ?? locale.pagination.next;
  return (
    <PaginationButton ref={ref} aria-label={label} data-od-slot="pagination-next-button" {...props}>
      {children ?? <NextContent label={locale.pagination.next} />}
    </PaginationButton>
  );
});
