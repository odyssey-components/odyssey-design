import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { type ComponentPropsWithoutRef, type ComponentRef, type CSSProperties, type HTMLAttributes, forwardRef, type ReactElement, type ReactNode, type RefAttributes, useState } from "react";
import { OverlayLayerProvider, useOverlayLayerStyle } from "../../internal/overlay-layer";
import { useProLocale } from "../../internal/pro-locale";
import { cn } from "../../lib/cn";
import { useOdysseyPortalContainer } from "../../OdysseyProvider";
import { Button } from "../Button/Button";

const styles = {
  backdrop: "od-Dialog-backdrop",
  popup: "od-Dialog-popup",
  dialog: "od-Dialog-dialog",
  title: "od-Dialog-title",
  header: "od-Dialog-header",
  description: "od-Dialog-description",
  actions: "od-Dialog-actions",
} as const;

interface DialogOptionsProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactElement;
  title: ReactNode;
  description?: ReactNode;
  descriptionClassName?: string;
  content?: ReactNode;
  form?: ReactNode;
  confirm?: false | { label?: ReactNode; onConfirm(): void | Promise<void>; disabled?: boolean };
  cancel?: false | { label?: ReactNode };
  pending?: boolean;
  destructive?: boolean;
  error?: ReactNode;
  footer?: ReactNode;
  closeButton?: ReactElement;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  style?: CSSProperties;
  disablePointerDismissal?: boolean;
}

const OptionsDialog = forwardRef<ComponentRef<typeof BaseDialog.Popup>, DialogOptionsProps>(function OptionsDialog(
  {
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
    trigger,
    title,
    description,
    descriptionClassName,
    content,
    form,
    confirm,
    cancel,
    pending: externalPending,
    destructive,
    error,
    footer,
    closeButton,
    className,
    headerClassName,
    bodyClassName,
    footerClassName,
    style,
    disablePointerDismissal,
  },
  ref,
) {
  const locale = useProLocale();
  const [internalPending, setInternalPending] = useState(false);
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const open = controlledOpen ?? internalOpen;
  const pending = externalPending || internalPending;

  function changeOpen(next: boolean) {
    if (controlledOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  }
  async function confirmDialog() {
    if (!confirm || pending) return;
    setInternalPending(true);
    try {
      await confirm.onConfirm();
      changeOpen(false);
    } catch {
      // The caller owns error presentation through the error prop.
    } finally {
      setInternalPending(false);
    }
  }

  return (
    <OverlayLayerProvider layerRole="container">
      <BaseDialog.Root open={open} onOpenChange={changeOpen} disablePointerDismissal={disablePointerDismissal}>
        {trigger && <BaseDialog.Trigger data-od-slot="dialog-trigger" render={trigger} />}
        <DialogContent ref={ref} className={className} style={style}>
          <div className={headerClassName}>
            <div data-od-slot="dialog-header" className={styles.header}>
              <BaseDialog.Title data-od-slot="dialog-title" className={styles.title}>
                {title}
              </BaseDialog.Title>
              {description != null && (
                <BaseDialog.Description data-od-slot="dialog-description" className={cn(styles.description, descriptionClassName)}>
                  {description}
                </BaseDialog.Description>
              )}
            </div>
            {closeButton && <BaseDialog.Close data-od-slot="dialog-close" render={closeButton} disabled={pending} />}
          </div>
          <div data-od-slot="dialog-body" className={bodyClassName}>
            {form ?? content}
          </div>
          {error && (
            <div role="alert" data-od-slot="dialog-error">
              {error}
            </div>
          )}
          {footer !== undefined || cancel !== false || confirm ? (
            <div data-od-slot="dialog-footer" className={cn(styles.actions, footerClassName)}>
              {footer ?? (
                <>
                  {cancel !== false && (
                    <BaseDialog.Close data-od-slot="dialog-close" render={<Button type="button" variant="outline" />} disabled={pending}>
                      {cancel?.label ?? locale.dialog.cancel}
                    </BaseDialog.Close>
                  )}
                  {confirm && (
                    <Button
                      type="button"
                      variant="solid"
                      tone={destructive ? "danger" : "neutral"}
                      loading={pending}
                      disabled={pending || confirm.disabled}
                      onClick={() => void confirmDialog()}
                    >
                      {confirm.label ?? locale.confirm.confirm}
                    </Button>
                  )}
                </>
              )}
            </div>
          ) : null}
        </DialogContent>
      </BaseDialog.Root>
    </OverlayLayerProvider>
  );
});

export type DialogPortalProps = ComponentPropsWithoutRef<typeof BaseDialog.Portal>;
export function DialogPortal({ container, ...props }: DialogPortalProps) {
  const inheritedContainer = useOdysseyPortalContainer();
  return <BaseDialog.Portal container={container ?? inheritedContainer ?? undefined} {...props} />;
}
export type DialogOverlayProps = ComponentPropsWithoutRef<typeof BaseDialog.Backdrop>;
export function DialogOverlay({ className, style, ...props }: DialogOverlayProps) {
  return (
    <BaseDialog.Backdrop
      data-od-slot="dialog-overlay"
      data-od-portal=""
      className={cn(styles.backdrop, className)}
      style={useOverlayLayerStyle(style)}
      {...props}
    />
  );
}
export interface DialogContentProps extends ComponentPropsWithoutRef<typeof BaseDialog.Popup> {
  showOverlay?: boolean;
}
export const DialogContent = forwardRef<ComponentRef<typeof BaseDialog.Popup>, DialogContentProps>(function DialogContent(
  { children, className, showOverlay = true, style, ...props },
  ref,
) {
  return (
    <DialogPortal>
      {showOverlay && <DialogOverlay />}
      <BaseDialog.Popup
        ref={ref}
        data-od-slot="dialog-content"
        data-od-portal=""
        className={cn(styles.popup, styles.dialog, className)}
        style={useOverlayLayerStyle(style)}
        {...props}
      >
        {children}
      </BaseDialog.Popup>
    </DialogPortal>
  );
});


type DialogRootProps = ComponentPropsWithoutRef<typeof BaseDialog.Root>;
export type DialogProps = DialogOptionsProps | DialogRootProps;
const DialogImpl = forwardRef<ComponentRef<typeof BaseDialog.Popup>, DialogProps>(function Dialog(props, ref) {
  if ("title" in props) return <OptionsDialog ref={ref} {...props} />;
  return (
    <OverlayLayerProvider layerRole="container">
      <BaseDialog.Root {...props} />
    </OverlayLayerProvider>
  );
});

export const Dialog = DialogImpl as {
  (props: DialogOptionsProps & RefAttributes<ComponentRef<typeof BaseDialog.Popup>>): ReactElement | null;
  (props: DialogRootProps): ReactElement | null;
};

export type DialogTriggerProps = ComponentPropsWithoutRef<typeof BaseDialog.Trigger>;
export function DialogTrigger(props: DialogTriggerProps) {
  return <BaseDialog.Trigger data-od-slot="dialog-trigger" {...props} />;
}
export type DialogCloseProps = ComponentPropsWithoutRef<typeof BaseDialog.Close>;
export function DialogClose(props: DialogCloseProps) {
  return <BaseDialog.Close data-od-slot="dialog-close" {...props} />;
}
export function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-od-slot="dialog-header" className={cn(styles.header, className)} {...props} />;
}
export function DialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-od-slot="dialog-footer" className={cn(styles.actions, className)} {...props} />;
}
export type DialogTitleProps = ComponentPropsWithoutRef<typeof BaseDialog.Title>;
export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return <BaseDialog.Title data-od-slot="dialog-title" className={cn(styles.title, className)} {...props} />;
}
export type DialogDescriptionProps = ComponentPropsWithoutRef<typeof BaseDialog.Description>;
export function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return <BaseDialog.Description data-od-slot="dialog-description" className={cn(styles.description, className)} {...props} />;
}
