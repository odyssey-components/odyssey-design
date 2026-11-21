import { Drawer, DrawerBody, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@odyssey/ui/primitives/drawer";
import { IconButton } from "@odyssey/ui/primitives/icon-button";
import { Stack } from "@odyssey/ui/primitives/stack";
import { ChevronDown, Menu as MenuIcon } from "lucide-react";
import { createElement, forwardRef, type HTMLAttributes, type ReactElement, type ReactNode, useState } from "react";
import { useProLocale } from "../locale";
import { ProAdminThemeMenu } from "../ProAdminThemeMenu";
import { type ProAdminUser, ProAdminUserMenu } from "../ProAdminUserMenu";
import { defineProSemanticParts, mergeClassNames, mergeStyles, type ProSemanticClassNames, type ProSemanticStyles } from "../semantic-parts";
import { styles as anatomy } from "./ProAdminShell.classes";

const ProAdminShellRoot = "div";
const ProAdminShellHeader = "header";
const ProAdminShellHeaderLeading = "div";
const ProAdminShellBrand = "button";
const ProAdminShellNavigation = "nav";
const ProAdminShellNavigationItem = "button";
const ProAdminShellDesktopNavigation = "div";
const ProAdminShellMobileTrigger = IconButton;
const ProAdminShellMobileNavigationSection = "div";
const ProAdminShellNavigationLabel = "span";
const ProAdminShellHeaderActions = Stack;
const ProAdminShellBody = "div";
const ProAdminShellSidebar = "aside";
const ProAdminShellContent = "main";

export interface ProAdminNavigationItem {
  key: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  children?: readonly ProAdminNavigationItem[];
}

export type ProAdminShellUser = ProAdminUser;

export interface ProAdminNavigationItemState {
  active: boolean;
  disabled: boolean;
  mobile: boolean;
  onSelect: () => void;
}

export const proAdminShellParts = defineProSemanticParts({
  root: "pro-admin-shell",
  header: "pro-admin-header",
  headerLeading: "pro-admin-header-leading",
  headerActions: "pro-admin-header-actions",
  brand: "pro-admin-brand",
  desktopNavigation: "pro-admin-desktop-navigation",
  mobileTrigger: "pro-admin-mobile-trigger",
  mobileDrawer: "pro-admin-mobile-drawer",
  mobileSection: "pro-admin-mobile-section",
  navigationLabel: "pro-admin-navigation-label",
  navigation: "pro-admin-navigation",
  navigationItem: "pro-admin-navigation-item",
  body: "pro-admin-body",
  sidebar: "pro-admin-sidebar",
  content: "pro-admin-content",
} as const);
export type ProAdminShellPart = keyof typeof proAdminShellParts;
export type ProAdminShellClassNames = ProSemanticClassNames<ProAdminShellPart>;
export type ProAdminShellStyles = ProSemanticStyles<ProAdminShellPart>;
export interface ProAdminShellSlots {
  brand?: (brand: ReactNode) => ReactNode;
  content?: (children: ReactNode) => ReactNode;
  headerActions?: (actions: ReactNode) => ReactNode;
}

export interface ProAdminShellOptions {
  brand: { name: string; subtitle?: string };
  navigation: {
    items: readonly ProAdminNavigationItem[];
    activeKey: string;
    onChange: (key: string) => void;
    renderItem?: (item: ProAdminNavigationItem, state: ProAdminNavigationItemState) => ReactElement;
  };
  account?: { user: ProAdminShellUser; onLogout: () => Promise<unknown> };
  appearance?: boolean;
  actions?: ReactNode;
  responsive?: boolean;
  contextualNavigation?: readonly ProAdminNavigationItem[];
  contextualActiveKey?: string;
  contextualNavigationLabel?: string;
  contextualNavigationExpandedKeys?: readonly string[];
  onContextualNavigationExpandedChange?: (keys: string[]) => void;
  children: ReactNode;
}
export interface ProAdminShellProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  options: ProAdminShellOptions;
  classNames?: ProAdminShellClassNames;
  styles?: ProAdminShellStyles;
  slots?: ProAdminShellSlots;
}

function Navigation({
  activeKey,
  ariaLabel,
  items,
  mobile = false,
  onNavigate,
  onNavigated,
  renderNavigationItem,
  semanticClassNames,
  semanticStyles,
  expandedKeys = [],
  onExpandedChange,
  surface,
}: {
  activeKey: string;
  ariaLabel: string;
  items: readonly ProAdminNavigationItem[];
  mobile?: boolean;
  onNavigate: (key: string) => void;
  onNavigated?: () => void;
  renderNavigationItem?: ProAdminShellOptions["navigation"]["renderItem"];
  semanticClassNames?: ProAdminShellClassNames;
  semanticStyles?: ProAdminShellStyles;
  expandedKeys?: readonly string[];
  onExpandedChange?: (keys: string[]) => void;
  surface?: "desktop" | "mobile" | "sidebar";
}) {
  const renderItems = (navigationItems: readonly ProAdminNavigationItem[], depth = 0): ReactNode =>
    navigationItems.map((item) => {
      const hasChildren = Boolean(item.children?.length);
      const expanded = expandedKeys.includes(item.key);
      const onSelect = () => {
        if (hasChildren) {
          onExpandedChange?.(expanded ? expandedKeys.filter((key) => key !== item.key) : [...expandedKeys, item.key]);
          return;
        }
        onNavigate(item.key);
        onNavigated?.();
      };
      const state = { active: item.key === activeKey, disabled: Boolean(item.disabled), mobile, onSelect } satisfies ProAdminNavigationItemState;
      const rendered = renderNavigationItem?.(item, state) as ReactElement<HTMLAttributes<HTMLElement>> | undefined;
      const itemClassName = mergeClassNames(anatomy.navigationItem, semanticClassNames?.navigationItem, rendered?.props.className);
      const itemStyle = mergeStyles(semanticStyles?.navigationItem, rendered?.props.style);
      return (
        <div key={item.key} data-od-slot="pro-admin-navigation-item-container" data-od-navigation-depth={depth}>
          {rendered ? (
            createElement(rendered.type, {
              ...rendered.props,
              className: itemClassName,
              style: itemStyle,
              title: rendered.props.title ?? item.label,
              "aria-current": rendered.props["aria-current"] ?? (state.active ? "page" : undefined),
              "aria-disabled": rendered.props["aria-disabled"] ?? (state.disabled || undefined),
              "aria-expanded": hasChildren ? (rendered.props["aria-expanded"] ?? expanded) : undefined,
              "data-od-navigation-surface": surface,
              "data-od-slot": "pro-admin-navigation-item",
            })
          ) : (
            <ProAdminShellNavigationItem
              type="button"
              className={itemClassName}
              style={itemStyle}
              title={item.label}
              disabled={item.disabled}
              aria-current={state.active ? "page" : undefined}
              aria-expanded={hasChildren ? expanded : undefined}
              data-od-navigation-surface={surface}
              data-od-slot="pro-admin-navigation-item"
              onClick={onSelect}
            >
              {item.icon}
              <span>{item.label}</span>
              {hasChildren && <ChevronDown size={16} data-od-slot="pro-admin-navigation-disclosure" />}
            </ProAdminShellNavigationItem>
          )}
          {hasChildren ? (
            <div data-od-slot="pro-admin-navigation-submenu" data-state={expanded ? "open" : "closed"} aria-hidden={!expanded} inert={!expanded}>
              <div>{renderItems(item.children ?? [], depth + 1)}</div>
            </div>
          ) : null}
        </div>
      );
    });

  return (
    <ProAdminShellNavigation
      className={mergeClassNames(anatomy.navigation, semanticClassNames?.navigation)}
      style={semanticStyles?.navigation}
      aria-label={ariaLabel}
      data-od-slot="pro-admin-navigation"
      data-od-navigation-surface={surface}
    >
      {renderItems(items)}
    </ProAdminShellNavigation>
  );
}

export const ProAdminShell = forwardRef<HTMLDivElement, ProAdminShellProps>(function ProAdminShell(
  { options, className, classNames, style, styles: semanticStyles, slots, ...props },
  ref,
) {
  const {
    brand: { name: appName, subtitle: appSubtitle },
    navigation: { items: navigation, activeKey, onChange: onNavigate, renderItem: renderNavigationItem },
    account,
    appearance = true,
    contextualNavigation = [],
    contextualActiveKey = "",
    contextualNavigationLabel,
    contextualNavigationExpandedKeys,
    onContextualNavigationExpandedChange,
    actions: headerActions,
    children,
  } = options;
  const locale = useProLocale();
  const resolvedContextualNavigationLabel = contextualNavigationLabel ?? locale.adminShell.currentModule;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [uncontrolledContextualExpandedKeys, setUncontrolledContextualExpandedKeys] = useState<string[]>(() =>
    contextualNavigation.filter((item) => item.children?.length).map((item) => item.key),
  );
  const contextualExpandedKeys = contextualNavigationExpandedKeys ?? uncontrolledContextualExpandedKeys;
  const setContextualExpandedKeys = (keys: string[]) => {
    if (contextualNavigationExpandedKeys === undefined) setUncontrolledContextualExpandedKeys(keys);
    onContextualNavigationExpandedChange?.(keys);
  };
  const brand = (
    <>
      <span>{appName}</span>
      {appSubtitle && <small>{appSubtitle}</small>}
    </>
  );

  return (
    <ProAdminShellRoot
      {...props}
      ref={ref}
      className={mergeClassNames(anatomy.root, classNames?.root, className)}
      style={mergeStyles(semanticStyles?.root, style)}
      data-od-slot="pro-admin-shell"
    >
      <ProAdminShellHeader className={mergeClassNames(anatomy.header, classNames?.header)} style={semanticStyles?.header} data-od-slot="pro-admin-header">
        <ProAdminShellHeaderLeading
          className={mergeClassNames(anatomy.headerLeading, classNames?.headerLeading)}
          style={semanticStyles?.headerLeading}
          data-od-slot="pro-admin-header-leading"
        >
          <Drawer open={mobileOpen} onOpenChange={setMobileOpen} swipeDirection={props.dir === "rtl" ? "right" : "left"}>
            <DrawerTrigger
              render={
                <ProAdminShellMobileTrigger
                  className={mergeClassNames(anatomy.mobileTrigger, "min-[961px]:hidden", classNames?.mobileTrigger)}
                  style={semanticStyles?.mobileTrigger}
                  variant="ghost"
                  size="sm"
                  aria-label={locale.adminShell.openMenu}
                  data-od-slot="pro-admin-mobile-trigger"
                >
                  <MenuIcon size={19} />
                </ProAdminShellMobileTrigger>
              }
            />
            <DrawerContent
              className={mergeClassNames(anatomy.mobileDrawer, classNames?.mobileDrawer)}
              style={semanticStyles?.mobileDrawer}
              dir={props.dir}
              data-od-slot="pro-admin-mobile-drawer"
            >
              <DrawerHeader>
                <DrawerTitle>
                  {appName}
                  {appSubtitle ? ` · ${appSubtitle}` : ""}
                </DrawerTitle>
                <DrawerClose
                  render={
                    <IconButton variant="ghost" aria-label={locale.adminShell.closeMenu}>
                      ×
                    </IconButton>
                  }
                />
              </DrawerHeader>
              <DrawerBody>
                <ProAdminShellMobileNavigationSection
                  className={mergeClassNames(anatomy.mobileNavigationSection, classNames?.mobileSection)}
                  style={semanticStyles?.mobileSection}
                  data-od-slot="pro-admin-mobile-section"
                >
                  <ProAdminShellNavigationLabel
                    className={mergeClassNames(anatomy.navigationLabel, classNames?.navigationLabel)}
                    style={semanticStyles?.navigationLabel}
                    data-od-slot="pro-admin-navigation-label"
                  >
                    {locale.adminShell.modules}
                  </ProAdminShellNavigationLabel>
                  <Navigation
                    activeKey={activeKey}
                    ariaLabel={locale.adminShell.moduleNavigation}
                    items={navigation}
                    mobile
                    onNavigate={onNavigate}
                    onNavigated={() => setMobileOpen(false)}
                    renderNavigationItem={renderNavigationItem}
                    semanticClassNames={classNames}
                    semanticStyles={semanticStyles}
                    surface="mobile"
                  />
                </ProAdminShellMobileNavigationSection>
                {contextualNavigation.length > 0 && (
                  <ProAdminShellMobileNavigationSection
                    className={mergeClassNames(anatomy.mobileNavigationSection, classNames?.mobileSection)}
                    style={semanticStyles?.mobileSection}
                    data-od-slot="pro-admin-mobile-section"
                  >
                    <Navigation
                      activeKey={contextualActiveKey}
                      ariaLabel={locale.adminShell.featureNavigation(resolvedContextualNavigationLabel)}
                      items={contextualNavigation}
                      mobile
                      onNavigate={onNavigate}
                      onNavigated={() => setMobileOpen(false)}
                      renderNavigationItem={renderNavigationItem}
                      semanticClassNames={classNames}
                      semanticStyles={semanticStyles}
                      expandedKeys={contextualExpandedKeys}
                      onExpandedChange={setContextualExpandedKeys}
                      surface="mobile"
                    />
                  </ProAdminShellMobileNavigationSection>
                )}
              </DrawerBody>
            </DrawerContent>
          </Drawer>
          <ProAdminShellBrand
            type="button"
            className={mergeClassNames(anatomy.brand, classNames?.brand)}
            style={semanticStyles?.brand}
            data-od-slot="pro-admin-brand"
            onClick={() => navigation[0] && onNavigate(navigation[0].key)}
          >
            {slots?.brand?.(brand) ?? brand}
          </ProAdminShellBrand>
          <ProAdminShellDesktopNavigation
            className={mergeClassNames(anatomy.desktopNavigation, classNames?.desktopNavigation)}
            style={semanticStyles?.desktopNavigation}
            data-od-slot="pro-admin-desktop-navigation"
          >
            <Navigation
              activeKey={activeKey}
              ariaLabel={locale.adminShell.moduleNavigation}
              items={navigation}
              onNavigate={onNavigate}
              renderNavigationItem={renderNavigationItem}
              semanticClassNames={classNames}
              semanticStyles={semanticStyles}
              surface="desktop"
            />
          </ProAdminShellDesktopNavigation>
        </ProAdminShellHeaderLeading>
        <ProAdminShellHeaderActions
          className={mergeClassNames(anatomy.headerActions, classNames?.headerActions)}
          style={semanticStyles?.headerActions}
          direction="row"
          gap={1}
          align="center"
          data-od-slot="pro-admin-header-actions"
        >
          {slots?.headerActions?.(headerActions) ?? headerActions}
          {appearance ? <ProAdminThemeMenu /> : null}
          {account ? <ProAdminUserMenu user={account.user} onLogout={account.onLogout} /> : null}
        </ProAdminShellHeaderActions>
      </ProAdminShellHeader>
      <ProAdminShellBody className={mergeClassNames(anatomy.body, classNames?.body)} style={semanticStyles?.body} data-od-slot="pro-admin-body">
        {contextualNavigation.length > 0 && (
          <ProAdminShellSidebar
            className={mergeClassNames(anatomy.sidebar, classNames?.sidebar)}
            style={semanticStyles?.sidebar}
            data-od-slot="pro-admin-sidebar"
          >
            <Navigation
              activeKey={contextualActiveKey}
              ariaLabel={locale.adminShell.featureNavigation(resolvedContextualNavigationLabel)}
              items={contextualNavigation}
              onNavigate={onNavigate}
              renderNavigationItem={renderNavigationItem}
              semanticClassNames={classNames}
              semanticStyles={semanticStyles}
              expandedKeys={contextualExpandedKeys}
              onExpandedChange={setContextualExpandedKeys}
              surface="sidebar"
            />
          </ProAdminShellSidebar>
        )}
        <ProAdminShellContent
          className={mergeClassNames(anatomy.content, classNames?.content)}
          style={semanticStyles?.content}
          data-od-slot="pro-admin-content"
        >
          {slots?.content?.(children) ?? children}
        </ProAdminShellContent>
      </ProAdminShellBody>
    </ProAdminShellRoot>
  );
});
