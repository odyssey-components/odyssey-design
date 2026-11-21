import { Button } from "@odyssey/ui/primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@odyssey/ui/primitives/dropdown-menu";
import { ChevronDown, CircleUserRound, LogOut } from "lucide-react";
import { type ComponentPropsWithoutRef, forwardRef, type ReactNode, useState } from "react";
import { useProLocale } from "../locale";
import { defineProSemanticParts, mergeClassNames, type ProSemanticClassNames, type ProSemanticStyles, semanticPartProps } from "../semantic-parts";
import { styles as anatomy } from "./ProAdminUserMenu.classes";

export interface ProAdminUser {
  displayName: string;
  roleLabel: string;
  secondaryText?: string;
}

export const proAdminUserMenuParts = defineProSemanticParts({
  root: "pro-admin-user-menu-trigger",
  content: "pro-admin-user-menu-content",
  identity: "pro-admin-user-menu-identity",
  secondary: "pro-admin-user-menu-secondary",
  error: "pro-admin-user-menu-error",
  actions: "pro-admin-user-menu-actions",
  logout: "pro-admin-user-menu-logout",
} as const);
export type ProAdminUserMenuPart = keyof typeof proAdminUserMenuParts;
export type ProAdminUserMenuClassNames = ProSemanticClassNames<ProAdminUserMenuPart>;
export type ProAdminUserMenuStyles = ProSemanticStyles<ProAdminUserMenuPart>;
export interface ProAdminUserMenuSlots {
  actions?: (actions: ReactNode) => ReactNode;
  identity?: (identity: ReactNode) => ReactNode;
  trigger?: (trigger: ReactNode) => ReactNode;
}

export interface ProAdminUserMenuProps extends Omit<ComponentPropsWithoutRef<typeof Button>, "children" | "onClick"> {
  user: ProAdminUser;
  onLogout: () => Promise<unknown>;
  menuContent?: ReactNode;
  classNames?: ProAdminUserMenuClassNames;
  slots?: ProAdminUserMenuSlots;
  styles?: ProAdminUserMenuStyles;
}

export const ProAdminUserMenu = forwardRef<HTMLButtonElement, ProAdminUserMenuProps>(function ProAdminUserMenu(
  { user, onLogout, menuContent, "aria-label": ariaLabel, className, classNames, slots, style, styles, size = "sm", variant = "ghost", ...props },
  ref,
) {
  const locale = useProLocale();
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState(false);
  const logout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    setError(false);
    try {
      await onLogout();
    } catch {
      setError(true);
    } finally {
      setLoggingOut(false);
    }
  };

  const trigger = (
    <>
      <CircleUserRound size={18} />
      <span className={anatomy.displayName}>{user.displayName}</span>
      <span className={anatomy.chevron}>
        <ChevronDown size={14} />
      </span>
    </>
  );
  const identity = (
    <>
      <DropdownMenuGroupLabel {...semanticPartProps("identity", classNames, styles)} data-od-slot="pro-admin-user-menu-identity">
        {user.displayName}
      </DropdownMenuGroupLabel>
      <DropdownMenuGroupLabel {...semanticPartProps("secondary", classNames, styles)} data-od-slot="pro-admin-user-menu-secondary">
        {user.roleLabel}
        {user.secondaryText ? ` · ${user.secondaryText}` : ""}
      </DropdownMenuGroupLabel>
    </>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            {...props}
            ref={ref}
            className={mergeClassNames(anatomy.userTrigger, classNames?.root, className)}
            style={{ ...styles?.root, ...style }}
            variant={variant}
            size={size}
            aria-label={ariaLabel ?? locale.adminShell.userMenu}
            data-od-slot="pro-admin-user-menu-trigger"
          />
        }
      >
        {slots?.trigger?.(trigger) ?? trigger}
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuPositioner align="end">
          <DropdownMenuContent {...semanticPartProps("content", classNames, styles)} data-od-slot="pro-admin-user-menu-content">
            <DropdownMenuGroup>
              {slots?.identity?.(identity) ?? identity}
              {error && (
                <DropdownMenuGroupLabel {...semanticPartProps("error", classNames, styles, anatomy.menuError)} data-od-slot="pro-admin-user-menu-error">
                  {locale.adminShell.logoutFailed}
                </DropdownMenuGroupLabel>
              )}
            </DropdownMenuGroup>
            {menuContent && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup {...semanticPartProps("actions", classNames, styles)} data-od-slot="pro-admin-user-menu-actions">
                  {slots?.actions?.(menuContent) ?? menuContent}
                </DropdownMenuGroup>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              {...semanticPartProps("logout", classNames, styles)}
              data-od-slot="pro-admin-user-menu-logout"
              closeOnClick={false}
              disabled={loggingOut}
              onClick={() => void logout()}
            >
              <LogOut size={16} />
              {loggingOut ? locale.adminShell.loggingOut : locale.adminShell.logout}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPositioner>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
});
