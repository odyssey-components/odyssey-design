import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

const styles = {
  page: "od-Page-page",
  header: "od-Page-header",
  title: "od-Page-title",
  description: "od-Page-description",
  actions: "od-Page-actions",
  content: "od-Page-content",
} as const;
export interface PageProps extends HTMLAttributes<HTMLElement> {}
export interface PageHeaderProps extends HTMLAttributes<HTMLElement> {}
export interface PageTitleProps extends HTMLAttributes<HTMLHeadingElement> {}
export interface PageDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}
export interface PageActionsProps extends HTMLAttributes<HTMLDivElement> {}
export interface PageContentProps extends HTMLAttributes<HTMLDivElement> {}

export const Page = forwardRef<HTMLElement, PageProps>(function Page({ className, ...props }, ref) {
  return <section ref={ref} data-od-slot="page" className={cn(styles.page, className)} {...props} />;
});
export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(function PageHeader({ className, ...props }, ref) {
  return <header ref={ref} data-od-slot="page-header" className={cn(styles.header, className)} {...props} />;
});
export const PageTitle = forwardRef<HTMLHeadingElement, PageTitleProps>(function PageTitle({ className, ...props }, ref) {
  return <h1 ref={ref} data-od-slot="page-title" className={cn(styles.title, className)} {...props} />;
});
export const PageDescription = forwardRef<HTMLParagraphElement, PageDescriptionProps>(function PageDescription({ className, ...props }, ref) {
  return <p ref={ref} data-od-slot="page-description" className={cn(styles.description, className)} {...props} />;
});
export const PageActions = forwardRef<HTMLDivElement, PageActionsProps>(function PageActions({ className, ...props }, ref) {
  return <div ref={ref} data-od-slot="page-actions" className={cn(styles.actions, className)} {...props} />;
});
export const PageContent = forwardRef<HTMLDivElement, PageContentProps>(function PageContent({ className, ...props }, ref) {
  return <div ref={ref} data-od-slot="page-content" className={cn(styles.content, className)} {...props} />;
});
