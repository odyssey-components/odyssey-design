import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import { type ComponentPropsWithoutRef, type ComponentRef, forwardRef, type HTMLAttributes } from "react";
import { OverlayLayerProvider, useOverlayLayerStyle } from "../../internal/overlay-layer";
import { cn } from "../../lib/cn";
import { useOdysseyPortalContainer } from "../../OdysseyProvider";

const styles = {
  backdrop: "od-AlertDialog-backdrop",
  popup: "od-AlertDialog-popup",
  title: "od-AlertDialog-title",
  description: "od-AlertDialog-description",
  footer: "od-AlertDialog-footer",
} as const;

export type AlertDialogProps = ComponentPropsWithoutRef<typeof BaseAlertDialog.Root>;
export function AlertDialog(props: AlertDialogProps) {
  return (
    <OverlayLayerProvider layerRole="container">
      <BaseAlertDialog.Root {...props} />
    </OverlayLayerProvider>
  );
}
export type AlertDialogTriggerProps = ComponentPropsWithoutRef<typeof BaseAlertDialog.Trigger>;
export function AlertDialogTrigger(props: AlertDialogTriggerProps) {
  return <BaseAlertDialog.Trigger data-od-slot="alert-dialog-trigger" {...props} />;
}
export type AlertDialogPortalProps = ComponentPropsWithoutRef<typeof BaseAlertDialog.Portal>;
export function AlertDialogPortal({ container, ...props }: AlertDialogPortalProps) {
  const inherited = useOdysseyPortalContainer();
  return <BaseAlertDialog.Portal container={container ?? inherited ?? undefined} {...props} />;
}
export type AlertDialogBackdropProps = ComponentPropsWithoutRef<typeof BaseAlertDialog.Backdrop>;
export function AlertDialogBackdrop({ className, style, ...props }: AlertDialogBackdropProps) {
  return (
    <BaseAlertDialog.Backdrop
      data-od-slot="alert-dialog-backdrop"
      data-od-portal=""
      className={cn(styles.backdrop, className)}
      style={useOverlayLayerStyle(style)}
      {...props}
    />
  );
}
export type AlertDialogPopupProps = ComponentPropsWithoutRef<typeof BaseAlertDialog.Popup>;
export const AlertDialogPopup = forwardRef<ComponentRef<typeof BaseAlertDialog.Popup>, AlertDialogPopupProps>(function AlertDialogPopup(
  { className, style, ...props },
  ref,
) {
  return (
    <BaseAlertDialog.Popup
      ref={ref}
      data-od-slot="alert-dialog-popup"
      data-od-portal=""
      className={cn(styles.popup, className)}
      style={useOverlayLayerStyle(style)}
      {...props}
    />
  );
});
export type AlertDialogContentProps = AlertDialogPopupProps;
export const AlertDialogContent = forwardRef<ComponentRef<typeof BaseAlertDialog.Popup>, AlertDialogContentProps>(function AlertDialogContent(
  { children, className, style, ...props },
  ref,
) {
  return (
    <AlertDialogPortal>
      <AlertDialogBackdrop />
      <AlertDialogPopup ref={ref} className={className} style={style} {...props}>
        {children}
      </AlertDialogPopup>
    </AlertDialogPortal>
  );
});
export type AlertDialogTitleProps = ComponentPropsWithoutRef<typeof BaseAlertDialog.Title>;
export function AlertDialogTitle({ className, ...props }: AlertDialogTitleProps) {
  return <BaseAlertDialog.Title data-od-slot="alert-dialog-title" className={cn(styles.title, className)} {...props} />;
}
export type AlertDialogDescriptionProps = ComponentPropsWithoutRef<typeof BaseAlertDialog.Description>;
export function AlertDialogDescription({ className, ...props }: AlertDialogDescriptionProps) {
  return <BaseAlertDialog.Description data-od-slot="alert-dialog-description" className={cn(styles.description, className)} {...props} />;
}
export type AlertDialogCloseProps = ComponentPropsWithoutRef<typeof BaseAlertDialog.Close>;
export function AlertDialogClose(props: AlertDialogCloseProps) {
  return <BaseAlertDialog.Close data-od-slot="alert-dialog-close" {...props} />;
}
export function AlertDialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-od-slot="alert-dialog-footer" className={cn(styles.footer, className)} {...props} />;
}
