import { Button } from "@odyssey/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroupLabel,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuRadioItemIndicator,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@odyssey/ui/dropdown-menu";
import { IconButton } from "@odyssey/ui/icon-button";
import { LogOut, Palette, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { useDocsAppearance } from "../appearance";
import type { NavbarItem } from "../docs/types";
import { useDocsLocale } from "../locale";

export interface DocsAppHeaderProps {
  brandText: string;
  subtitle?: string;
  homeDocId?: string;
  navbar: NavbarItem[];
  activeNavbarItem?: NavbarItem;
  headerActions?: ReactNode;
  username?: string;
  onLogout?: () => Promise<unknown>;
  onSelectHome: () => void;
  onSelectNavbar: (key: string) => void;
}

function AppearanceMenu() {
  const appearance = useDocsAppearance();
  const locale = useDocsLocale();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <IconButton variant="ghost" size="sm" aria-label={locale.appearance.label}>
            <Palette size={18} />
          </IconButton>
        }
      />
      <DropdownMenuPortal>
        <DropdownMenuPositioner align="end">
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value={appearance.colorScheme} onValueChange={(value) => appearance.setColorScheme(value as typeof appearance.colorScheme)}>
              <DropdownMenuGroupLabel>{locale.appearance.colorScheme}</DropdownMenuGroupLabel>
              {(["system", "light", "dark"] as const).map((value) => (
                <DropdownMenuRadioItem key={value} value={value}>
                  {locale.appearance[value]}
                  <DropdownMenuRadioItemIndicator />
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={appearance.density} onValueChange={(value) => appearance.setDensity(value as typeof appearance.density)}>
              <DropdownMenuGroupLabel>{locale.appearance.density}</DropdownMenuGroupLabel>
              {(["standard", "compact"] as const).map((value) => (
                <DropdownMenuRadioItem key={value} value={value}>
                  {locale.appearance[value]}
                  <DropdownMenuRadioItemIndicator />
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenuPositioner>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}

function UserMenu({ onLogout, username }: { onLogout: () => Promise<unknown>; username: string }) {
  const locale = useDocsLocale();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button className="od-Docs-headerUser" variant="ghost" size="sm" aria-label={locale.account.label} />}>
        <UserRound size={18} />
        <span>{username}</span>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuPositioner align="end">
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => void onLogout()}>
              <LogOut size={16} />
              {locale.account.logout}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPositioner>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}

export function DocsAppHeader({
  brandText,
  subtitle,
  homeDocId,
  navbar,
  activeNavbarItem,
  headerActions,
  username,
  onLogout,
  onSelectHome,
  onSelectNavbar,
}: DocsAppHeaderProps) {
  return (
    <header className="od-Docs-header" data-od-slot="docs-header">
      {homeDocId ? (
        <Button className="od-Docs-brand od-Docs-brandAction" type="button" variant="ghost" onClick={onSelectHome}>
          <span className="od-Docs-brandTitle">{brandText}</span>
          {subtitle ? <span className="od-Docs-brandSubtitle">{subtitle}</span> : null}
        </Button>
      ) : (
        <div className="od-Docs-brand">
          <span className="od-Docs-brandTitle">{brandText}</span>
          {subtitle ? <span className="od-Docs-brandSubtitle">{subtitle}</span> : null}
        </div>
      )}
      <nav className="od-Docs-headerNav" aria-label={brandText}>
        {navbar.map((item) => (
          <Button
            key={item.docId}
            type="button"
            variant="ghost"
            size="sm"
            aria-current={activeNavbarItem?.docId === item.docId ? "page" : undefined}
            onClick={() => onSelectNavbar(item.docId)}
          >
            {item.label}
          </Button>
        ))}
      </nav>
      <div className="od-Docs-headerActions">
        {headerActions}
        <AppearanceMenu />
        {username && onLogout ? <UserMenu username={username} onLogout={onLogout} /> : null}
      </div>
    </header>
  );
}
