import { type ComponentProps, type ComponentRef, type CSSProperties, forwardRef, type ReactNode, useState } from "react";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  type ButtonProps,
} from "../../primitives";
import { useProLocale } from "../locale";
import {
  defineProSemanticParts,
  mergeClassNames,
  mergeStatefulClassNames,
  mergeStatefulStyles,
  mergeStyles,
  type ProSemanticClassNames,
  type ProSemanticStyles,
} from "../semantic-parts";

export const proConfirmParts = defineProSemanticParts({
  content: "pro-confirm",
  title: "alert-dialog-title",
  description: "alert-dialog-description",
  error: "pro-confirm-error",
  footer: "alert-dialog-footer",
  cancel: "alert-dialog-close",
  confirm: "button",
} as const);
export type ProConfirmPart = keyof typeof proConfirmParts;
export type ProConfirmClassNames = ProSemanticClassNames<ProConfirmPart>;
export type ProConfirmStyles = ProSemanticStyles<ProConfirmPart>;
export interface ProConfirmSlots {
  description?: (description: ReactNode) => ReactNode;
  error?: (error: ReactNode) => ReactNode;
  footer?: (actions: ReactNode) => ReactNode;
  title?: (title: ReactNode) => ReactNode;
}

export interface ProConfirmProps {
  "aria-describedby"?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  cancelLabel?: ReactNode;
  className?: string;
  classNames?: ProConfirmClassNames;
  confirmButtonProps?: ButtonProps;
  confirmLabel?: ReactNode;
  danger?: boolean;
  description?: ReactNode;
  disabled?: boolean;
  error?: ReactNode;
  contentProps?: ComponentProps<typeof AlertDialogContent>;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  slots?: ProConfirmSlots;
  style?: CSSProperties;
  styles?: ProConfirmStyles;
  title: ReactNode;
  trigger?: ReactNode;
}

export const ProConfirm = forwardRef<ComponentRef<typeof AlertDialogContent>, ProConfirmProps>(function ProConfirm(
  {
    "aria-describedby": ariaDescribedby,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    cancelLabel,
    className,
    classNames,
    confirmButtonProps,
    confirmLabel,
    danger = false,
    description,
    disabled,
    error,
    contentProps,
    loading: controlledLoading,
    onConfirm,
    onOpenChange,
    open,
    slots,
    style,
    styles,
    title,
    trigger,
  }: ProConfirmProps,
  ref,
) {
  const locale = useProLocale();
  const [localOpen, setLocalOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const loading = controlledLoading || pending;
  const resolvedOpen = open ?? localOpen;
  // base-ui wires aria-labelledby and aria-describedby to the dialog title and
  // description itself. Handing it an explicit undefined overwrites that wiring,
  // so only pass the attributes the caller actually owns.
  const {
    "aria-describedby": contentAriaDescribedby,
    "aria-label": contentAriaLabel,
    "aria-labelledby": contentAriaLabelledby,
    ...contentRest
  } = contentProps ?? {};
  const resolvedAriaDescribedby = ariaDescribedby ?? contentAriaDescribedby;
  const resolvedAriaLabel = ariaLabel ?? contentAriaLabel;
  const resolvedAriaLabelledby = ariaLabelledby ?? contentAriaLabelledby;
  const changeOpen = (next: boolean) => {
    setLocalOpen(next);
    onOpenChange?.(next);
  };
  async function confirm() {
    setPending(true);
    try {
      await onConfirm();
      changeOpen(false);
    } catch {
      // The caller owns error presentation through the error prop.
    } finally {
      setPending(false);
    }
  }
  const actions = (
    <>
      <AlertDialogClose className={classNames?.cancel} style={styles?.cancel} render={<Button type="button" variant="outline" />} disabled={loading}>
        {cancelLabel ?? locale.confirm.cancel}
      </AlertDialogClose>
      <Button
        {...confirmButtonProps}
        className={mergeClassNames(classNames?.confirm, confirmButtonProps?.className)}
        style={mergeStyles(styles?.confirm, confirmButtonProps?.style)}
        type="button"
        variant="solid"
        tone={danger ? "danger" : "neutral"}
        loading={loading}
        disabled={disabled || loading}
        onClick={() => void confirm()}
      >
        {confirmLabel ?? locale.confirm.confirm}
      </Button>
    </>
  );
  return (
    <AlertDialog open={resolvedOpen} onOpenChange={changeOpen}>
      {trigger && <AlertDialogTrigger render={trigger as React.ReactElement} />}
      <AlertDialogContent
        ref={ref}
        {...contentRest}
        {...(resolvedAriaDescribedby !== undefined ? { "aria-describedby": resolvedAriaDescribedby } : {})}
        {...(resolvedAriaLabel !== undefined ? { "aria-label": resolvedAriaLabel } : {})}
        {...(resolvedAriaLabelledby !== undefined ? { "aria-labelledby": resolvedAriaLabelledby } : {})}
        className={mergeStatefulClassNames(classNames?.content, contentProps?.className, className)}
        style={mergeStatefulStyles(styles?.content, contentProps?.style, style)}
        data-od-slot="pro-confirm"
      >
        <AlertDialogTitle className={classNames?.title} style={styles?.title}>
          {slots?.title?.(title) ?? title}
        </AlertDialogTitle>
        {description && (
          <AlertDialogDescription className={classNames?.description} style={styles?.description}>
            {slots?.description?.(description) ?? description}
          </AlertDialogDescription>
        )}
        {error && (
          <div data-od-slot="pro-confirm-error" className={classNames?.error} style={styles?.error}>
            {slots?.error?.(error) ?? error}
          </div>
        )}
        <AlertDialogFooter className={classNames?.footer} style={styles?.footer}>
          {slots?.footer?.(actions) ?? actions}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});
