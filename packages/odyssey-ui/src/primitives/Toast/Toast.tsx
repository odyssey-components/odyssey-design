import { Toast as BaseToast } from "@base-ui/react/toast";
import { type ComponentPropsWithoutRef, type ComponentRef, forwardRef, type ReactNode, useMemo } from "react";
import { cn } from "../../lib/cn";
import { useOdysseyLocale } from "../../locale";
import { useOdysseyPortalContainer } from "../../OdysseyProvider";

const styles = {
  viewport: "od-Toast-viewport",
  root: "od-Toast-root",
  content: "od-Toast-content",
  title: "od-Toast-title",
  description: "od-Toast-description",
  action: "od-Toast-action",
  close: "od-Toast-close",
} as const;

export type ToastTone = "neutral" | "info" | "success" | "warning" | "danger";
export interface ToastInput {
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  tone?: ToastTone;
  timeout?: number;
  priority?: "low" | "high";
  actionProps?: ComponentPropsWithoutRef<"button">;
  onClose?: () => void;
  onRemove?: () => void;
}
export interface ToastRecord extends Omit<ToastInput, "id"> {
  id: string;
}
export type ToastUpdate = Partial<Omit<ToastInput, "id">>;
export interface ToastPromiseOptions<TValue> {
  loading: string | ToastUpdate;
  success: string | ToastUpdate | ((value: TValue) => string | ToastUpdate);
  error: string | ToastUpdate | ((error: unknown) => string | ToastUpdate);
}
export interface ToastApi {
  toasts: ToastRecord[];
  show: (toast: ToastInput) => string;
  update: (id: string, toast: ToastUpdate) => void;
  dismiss: (id?: string) => void;
  promise: <TValue>(promise: Promise<TValue>, options: ToastPromiseOptions<TValue>) => Promise<TValue>;
}

function normalizeUpdate(value: string | ToastUpdate): ToastUpdate {
  return typeof value === "string" ? { title: value } : value;
}
function managerOptions(input: ToastInput | ToastUpdate) {
  const { tone, ...rest } = input;
  return { ...rest, type: tone ?? "neutral" };
}

export type ToastProviderProps = ComponentPropsWithoutRef<typeof BaseToast.Provider>;
export function ToastProvider(props: ToastProviderProps) {
  return <BaseToast.Provider {...props} />;
}
export type ToastPortalProps = ComponentPropsWithoutRef<typeof BaseToast.Portal>;
export function ToastPortal({ container, ...props }: ToastPortalProps) {
  const inherited = useOdysseyPortalContainer();
  return <BaseToast.Portal data-od-slot="toast-portal" data-od-portal="" container={container ?? inherited ?? undefined} {...props} />;
}
export type ToastViewportProps = ComponentPropsWithoutRef<typeof BaseToast.Viewport>;
export const ToastViewport = forwardRef<ComponentRef<typeof BaseToast.Viewport>, ToastViewportProps>(function ToastViewport({ className, ...props }, ref) {
  return <BaseToast.Viewport ref={ref} data-od-slot="toast-viewport" className={cn(styles.viewport, className)} {...props} />;
});
export type ToastRootProps = ComponentPropsWithoutRef<typeof BaseToast.Root>;
export const ToastRoot = forwardRef<ComponentRef<typeof BaseToast.Root>, ToastRootProps>(function ToastRoot(
  { className, swipeDirection = ["left", "right", "down"], ...props },
  ref,
) {
  return <BaseToast.Root ref={ref} data-od-slot="toast" className={cn(styles.root, className)} swipeDirection={swipeDirection} {...props} />;
});
export type ToastContentProps = ComponentPropsWithoutRef<typeof BaseToast.Content>;
export const ToastContent = forwardRef<ComponentRef<typeof BaseToast.Content>, ToastContentProps>(function ToastContent({ className, ...props }, ref) {
  return <BaseToast.Content ref={ref} data-od-slot="toast-content" className={cn(styles.content, className)} {...props} />;
});
export type ToastTitleProps = ComponentPropsWithoutRef<typeof BaseToast.Title>;
export const ToastTitle = forwardRef<ComponentRef<typeof BaseToast.Title>, ToastTitleProps>(function ToastTitle({ className, ...props }, ref) {
  return <BaseToast.Title ref={ref} data-od-slot="toast-title" className={cn(styles.title, className)} {...props} />;
});
export type ToastDescriptionProps = ComponentPropsWithoutRef<typeof BaseToast.Description>;
export const ToastDescription = forwardRef<ComponentRef<typeof BaseToast.Description>, ToastDescriptionProps>(function ToastDescription(
  { className, ...props },
  ref,
) {
  return <BaseToast.Description ref={ref} data-od-slot="toast-description" className={cn(styles.description, className)} {...props} />;
});
export type ToastActionProps = ComponentPropsWithoutRef<typeof BaseToast.Action>;
export const ToastAction = forwardRef<ComponentRef<typeof BaseToast.Action>, ToastActionProps>(function ToastAction({ className, ...props }, ref) {
  return <BaseToast.Action ref={ref} data-od-slot="toast-action" className={cn(styles.action, className)} {...props} />;
});
export type ToastCloseProps = ComponentPropsWithoutRef<typeof BaseToast.Close>;
export const ToastClose = forwardRef<ComponentRef<typeof BaseToast.Close>, ToastCloseProps>(function ToastClose(
  { "aria-label": ariaLabel, className, children, ...props },
  ref,
) {
  const locale = useOdysseyLocale();
  return (
    <BaseToast.Close ref={ref} data-od-slot="toast-close" aria-label={ariaLabel ?? locale.toast.close} className={cn(styles.close, className)} {...props}>
      {children ?? "×"}
    </BaseToast.Close>
  );
});

export function useToast(): ToastApi {
  const manager = BaseToast.useToastManager();
  const locale = useOdysseyLocale();
  return useMemo(() => {
    const show = (input: ToastInput) => manager.add(managerOptions(input));
    const update = (id: string, input: ToastUpdate) => manager.update(id, managerOptions(input));
    const promise = async <TValue,>(source: Promise<TValue>, options: ToastPromiseOptions<TValue>) => {
      const loading = normalizeUpdate(options.loading);
      const id = show({ title: loading.title ?? locale.toast.loading, ...loading, tone: loading.tone ?? "info", timeout: 0 });
      try {
        const value = await source;
        const success = normalizeUpdate(typeof options.success === "function" ? options.success(value) : options.success);
        update(id, { ...success, tone: success.tone ?? "success", timeout: success.timeout ?? 4000 });
        return value;
      } catch (error) {
        const failure = normalizeUpdate(typeof options.error === "function" ? options.error(error) : options.error);
        update(id, { ...failure, tone: failure.tone ?? "danger", timeout: failure.timeout ?? 6000 });
        throw error;
      }
    };
    return {
      toasts: manager.toasts.map((toast) => ({
        id: toast.id,
        title: toast.title ?? "",
        description: toast.description,
        tone: (toast.type as ToastTone | undefined) ?? "neutral",
        timeout: toast.timeout,
        priority: toast.priority,
        actionProps: toast.actionProps,
        onClose: toast.onClose,
        onRemove: toast.onRemove,
      })),
      show,
      update,
      dismiss: manager.close,
      promise,
    };
  }, [locale.toast.loading, manager]);
}

export function ToastList() {
  const manager = BaseToast.useToastManager();
  return manager.toasts.map((toast) => (
    <ToastRoot key={toast.id} toast={toast}>
      <ToastContent>
        <div style={{ flex: "1 1 auto", minWidth: 0 }}>
          <ToastTitle />
          <ToastDescription />
        </div>
        <ToastAction />
        <ToastClose />
      </ToastContent>
    </ToastRoot>
  ));
}

export interface ToasterProps extends ToastProviderProps {
  children?: ReactNode;
}
export function Toaster({ children, ...props }: ToasterProps) {
  return (
    <ToastProvider {...props}>
      {children}
      <ToastPortal>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}
