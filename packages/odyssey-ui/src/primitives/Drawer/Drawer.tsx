import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import type { ComponentPropsWithoutRef, HTMLAttributes, ReactNode } from "react";
import { OverlayLayerProvider, useOverlayLayerStyle } from "../../internal/overlay-layer";
import { cn } from "../../lib/cn";
import { useOdysseyLocale } from "../../locale";
import { useOdysseyPortalContainer } from "../../OdysseyProvider";
import { IconButton } from "../IconButton";

const styles = {
  backdrop: "od-Drawer-backdrop",
  viewport: "od-Drawer-viewport",
  popup: "od-Drawer-popup",
  header: "od-Drawer-header",
  title: "od-Drawer-title",
  description: "od-Drawer-description",
  body: "od-Drawer-body",
  titlebar: "od-Drawer-titlebar",
  footer: "od-Drawer-footer",
} as const;

export type DrawerProps = ComponentPropsWithoutRef<typeof BaseDrawer.Root>;
export function Drawer({ swipeDirection = "right", ...props }: DrawerProps) {
  return (
    <OverlayLayerProvider layerRole="container">
      <BaseDrawer.Root {...props} swipeDirection={swipeDirection} />
    </OverlayLayerProvider>
  );
}
export type DrawerTriggerProps = ComponentPropsWithoutRef<typeof BaseDrawer.Trigger>;
export function DrawerTrigger(props: DrawerTriggerProps) {
  return <BaseDrawer.Trigger data-od-slot="drawer-trigger" {...props} />;
}
export type DrawerPortalProps = ComponentPropsWithoutRef<typeof BaseDrawer.Portal>;
export function DrawerPortal({ container, ...props }: DrawerPortalProps) {
  const inherited = useOdysseyPortalContainer();
  return <BaseDrawer.Portal container={container ?? inherited ?? undefined} {...props} />;
}
export type DrawerBackdropProps = ComponentPropsWithoutRef<typeof BaseDrawer.Backdrop>;
export function DrawerBackdrop({ className, style, ...props }: DrawerBackdropProps) {
  return (
    <BaseDrawer.Backdrop
      data-od-slot="drawer-backdrop"
      data-od-portal=""
      className={cn(styles.backdrop, className)}
      style={useOverlayLayerStyle(style)}
      {...props}
    />
  );
}
export type DrawerViewportProps = ComponentPropsWithoutRef<typeof BaseDrawer.Viewport>;
export function DrawerViewport({ className, style, ...props }: DrawerViewportProps) {
  return <BaseDrawer.Viewport data-od-slot="drawer-viewport" className={cn(styles.viewport, className)} style={useOverlayLayerStyle(style)} {...props} />;
}
export type DrawerPopupProps = ComponentPropsWithoutRef<typeof BaseDrawer.Popup>;
export function DrawerPopup({ className, ...props }: DrawerPopupProps) {
  return <BaseDrawer.Popup data-od-slot="drawer-popup" data-od-portal="" className={cn(styles.popup, className)} {...props} />;
}
export type DrawerTitleProps = ComponentPropsWithoutRef<typeof BaseDrawer.Title>;
export function DrawerTitle({ className, ...props }: DrawerTitleProps) {
  return <BaseDrawer.Title data-od-slot="drawer-title" className={cn(styles.title, className)} {...props} />;
}
export type DrawerDescriptionProps = ComponentPropsWithoutRef<typeof BaseDrawer.Description>;
export function DrawerDescription({ className, ...props }: DrawerDescriptionProps) {
  return <BaseDrawer.Description data-od-slot="drawer-description" className={cn(styles.description, className)} {...props} />;
}
export type DrawerCloseProps = ComponentPropsWithoutRef<typeof BaseDrawer.Close>;
export function DrawerClose(props: DrawerCloseProps) {
  return <BaseDrawer.Close data-od-slot="drawer-close" {...props} />;
}
export function DrawerHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-od-slot="drawer-header" className={cn(styles.header, className)} {...props} />;
}
export function DrawerBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-od-slot="drawer-body" className={cn(styles.body, className)} {...props} />;
}
export function DrawerFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-od-slot="drawer-footer" className={cn(styles.footer, className)} {...props} />;
}
export interface DrawerContentProps extends Omit<DrawerPopupProps, "title"> {
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  headerActions?: ReactNode;
  closeLabel?: string;
  /**
   * Whether a drag inside the drawer may swipe the drawer away.
   *
   * Off by default. A drag inside the drawer belongs to the content — selecting
   * text, scrolling a log, resizing a terminal — and must not move the drawer
   * with it. The drawer still answers a swipe from outside its own surface.
   */
  swipeDismissal?: boolean;
  /**
   * @deprecated Use `swipeDismissal` instead. It can only turn the swipe off,
   * which is now the default, so it changes nothing.
   */
  disableSwipeDismissal?: boolean;
}
export function DrawerContent({
  children,
  closeLabel,
  description,
  disableSwipeDismissal = false,
  headerActions,
  swipeDismissal = false,
  title,
  ...popupProps
}: DrawerContentProps) {
  const locale = useOdysseyLocale();
  // The whole popup opts out of the swipe gesture: every control inside the
  // drawer — the tab list, a log, a terminal — owns its own drags.
  const swipeAllowed = swipeDismissal && !disableSwipeDismissal;
  return (
    <DrawerPortal>
      <DrawerBackdrop />
      <DrawerViewport>
        <DrawerPopup {...popupProps} data-base-ui-swipe-ignore={swipeAllowed ? undefined : ""}>
          {title !== undefined && (
            <div data-od-slot="drawer-titlebar" className={cn(styles.header, styles.titlebar)}>
              <div data-od-slot="drawer-titlebar-content">
                <DrawerTitle>{title}</DrawerTitle>
                {description !== undefined && <DrawerDescription>{description}</DrawerDescription>}
              </div>
              <div data-od-slot="drawer-titlebar-actions">
                {headerActions}
                <DrawerClose
                  render={
                    <IconButton variant="ghost" aria-label={closeLabel ?? locale.drawer.close}>
                      ×
                    </IconButton>
                  }
                />
              </div>
            </div>
          )}
          {children}
        </DrawerPopup>
      </DrawerViewport>
    </DrawerPortal>
  );
}
