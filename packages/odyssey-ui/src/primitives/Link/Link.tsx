import { type AnchorHTMLAttributes, forwardRef, type ReactNode } from "react";
import { cn } from "../../lib/cn";

const styles = {
  link: "od-Link-link",
  primary: "od-Link-primary",
  muted: "od-Link-muted",
  ellipsis: "od-Link-ellipsis",
  label: "od-Link-label",
  icon: "od-Link-icon",
} as const;

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Controls the semantic link color. @defaultValue "primary" */
  tone?: "primary" | "muted" | "inherit";
  /** Controls when the link is underlined. @defaultValue "hover" */
  underline?: "hover" | "always" | "none";
  /** Truncates the label to one line when the available width is constrained. @defaultValue false */
  ellipsis?: boolean;
  /** Decorative content rendered before the label. */
  leadingIcon?: ReactNode;
  /** Decorative content rendered after the label. */
  trailingIcon?: ReactNode;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { children, className, ellipsis = false, leadingIcon, rel, target, tone = "primary", trailingIcon, underline = "hover", ...props },
  ref,
) {
  const mergedRel = rel === undefined && target === "_blank" ? "noopener noreferrer" : rel;
  return (
    <a
      ref={ref}
      data-od-slot="link"
      data-tone={tone}
      data-underline={underline}
      data-ellipsis={ellipsis || undefined}
      className={cn(styles.link, tone === "primary" && styles.primary, tone === "muted" && styles.muted, ellipsis && styles.ellipsis, className)}
      rel={mergedRel}
      target={target}
      {...props}
    >
      {leadingIcon !== undefined && (
        <span data-od-slot="link-leading-icon" className={styles.icon} aria-hidden="true">
          {leadingIcon}
        </span>
      )}
      <span data-od-slot="link-label" className={cn(styles.label, ellipsis && styles.ellipsis)}>
        {children}
      </span>
      {trailingIcon !== undefined && (
        <span data-od-slot="link-trailing-icon" className={styles.icon} aria-hidden="true">
          {trailingIcon}
        </span>
      )}
    </a>
  );
});
