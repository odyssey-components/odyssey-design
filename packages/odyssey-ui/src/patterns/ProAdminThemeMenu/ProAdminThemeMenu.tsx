import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroupLabel,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuRadioItemIndicator,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@odyssey/ui/primitives/dropdown-menu";
import { IconButton } from "@odyssey/ui/primitives/icon-button";
import { Palette } from "lucide-react";
import { type ComponentPropsWithoutRef, Fragment, forwardRef, type ReactNode } from "react";
import { useProLocale } from "../locale";
import { useProAdminAppearance } from "../ProAdminProvider";
import { defineProSemanticParts, mergeClassNames, mergeStyles, type ProSemanticClassNames, type ProSemanticStyles, semanticPartProps } from "../semantic-parts";

export const proAdminThemeMenuParts = defineProSemanticParts({
  root: "pro-admin-theme-menu-trigger",
  content: "pro-admin-theme-menu-content",
  section: "pro-admin-theme-menu-section",
  label: "pro-admin-theme-menu-label",
  item: "pro-admin-theme-menu-item",
  indicator: "pro-admin-theme-menu-indicator",
  separator: "pro-admin-theme-menu-separator",
} as const);
export type ProAdminThemeMenuPart = keyof typeof proAdminThemeMenuParts;
export type ProAdminThemeMenuClassNames = ProSemanticClassNames<ProAdminThemeMenuPart>;
export type ProAdminThemeMenuStyles = ProSemanticStyles<ProAdminThemeMenuPart>;
export interface ProAdminThemeMenuSlots {
  content?: (content: ReactNode) => ReactNode;
  trigger?: (trigger: ReactNode) => ReactNode;
}

export interface ProAdminThemeMenuProps extends Omit<ComponentPropsWithoutRef<typeof IconButton>, "aria-label" | "children"> {
  "aria-label"?: string;
  classNames?: ProAdminThemeMenuClassNames;
  slots?: ProAdminThemeMenuSlots;
  styles?: ProAdminThemeMenuStyles;
}

interface ThemeMenuSectionProps {
  classNames?: ProAdminThemeMenuClassNames;
  label: string;
  onValueChange: (value: string) => void;
  options: ReadonlyArray<{ label: string; value: string }>;
  styles?: ProAdminThemeMenuStyles;
  value: string;
}

function ThemeMenuSection({ classNames, label, onValueChange, options, styles, value }: ThemeMenuSectionProps) {
  return (
    <DropdownMenuRadioGroup
      {...semanticPartProps("section", classNames, styles)}
      data-od-slot="pro-admin-theme-menu-section"
      value={value}
      onValueChange={onValueChange}
    >
      <DropdownMenuGroupLabel {...semanticPartProps("label", classNames, styles)} data-od-slot="pro-admin-theme-menu-label">
        {label}
      </DropdownMenuGroupLabel>
      {options.map((option) => (
        <DropdownMenuRadioItem
          {...semanticPartProps("item", classNames, styles)}
          data-od-slot="pro-admin-theme-menu-item"
          key={option.value}
          value={option.value}
        >
          {option.label}
          <DropdownMenuRadioItemIndicator {...semanticPartProps("indicator", classNames, styles)} data-od-slot="pro-admin-theme-menu-indicator" />
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  );
}

export const ProAdminThemeMenu = forwardRef<HTMLButtonElement, ProAdminThemeMenuProps>(function ProAdminThemeMenu(
  { "aria-label": ariaLabel, className, classNames, slots, style, styles, size = "sm", variant = "ghost", ...props },
  ref,
) {
  const appearance = useProAdminAppearance();
  const locale = useProLocale();

  const trigger = <Palette />;
  const sections: ThemeMenuSectionProps[] = [
    {
      label: locale.adminShell.colorScheme,
      onValueChange: (value) => appearance.setColorScheme(value as typeof appearance.colorScheme),
      options: Object.entries(locale.adminShell.scheme).map(([value, label]) => ({ label, value })),
      value: appearance.colorScheme,
    },
    {
      label: locale.adminShell.visualPreset,
      onValueChange: appearance.setThemeId,
      options: appearance.themes.map((option) => ({ label: option.label, value: option.id })),
      value: appearance.themeId,
    },
    {
      label: locale.adminShell.interfaceDensity,
      onValueChange: (value) => appearance.setDensity(value as typeof appearance.density),
      options: Object.entries(locale.adminShell.density).map(([value, label]) => ({ label, value })),
      value: appearance.density,
    },
  ];
  const content = sections.map((section, index) => (
    <Fragment key={section.label}>
      {index > 0 && <DropdownMenuSeparator {...semanticPartProps("separator", classNames, styles)} data-od-slot="pro-admin-theme-menu-separator" />}
      <ThemeMenuSection {...section} classNames={classNames} styles={styles} />
    </Fragment>
  ));

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        render={
          <IconButton
            {...props}
            ref={ref}
            className={mergeClassNames(classNames?.root, className)}
            style={mergeStyles(styles?.root, style)}
            variant={variant}
            size={size}
            aria-label={ariaLabel ?? locale.adminShell.themeSettings}
            data-od-slot="pro-admin-theme-menu-trigger"
          >
            {slots?.trigger?.(trigger) ?? trigger}
          </IconButton>
        }
      />
      <DropdownMenuPortal>
        <DropdownMenuPositioner align="end">
          <DropdownMenuContent {...semanticPartProps("content", classNames, styles)} data-od-slot="pro-admin-theme-menu-content">
            {slots?.content?.(content) ?? content}
          </DropdownMenuContent>
        </DropdownMenuPositioner>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
});
