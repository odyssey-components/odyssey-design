import { createContext, type ReactNode, useContext } from "react";
import { cn } from "../../lib/cn";
import {
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectPortal,
  SelectPositioner,
  SelectTrigger,
  SelectValue,
} from "../../primitives/Select";
import { useAILocale } from "../locale";
import type { AssistantModelOption } from "../types";
import { styles } from "./AIModelSelector.classes";

const Trigger = SelectTrigger;

interface ModelSelectorState {
  models: readonly AssistantModelOption[];
  value?: string;
  onValueChange?(value: string): void;
  /**
   * Label of the option that keeps whatever the session already uses. The
   * option is offered first and is shown while nothing is picked.
   */
  placeholder?: string;
}
const ModelSelectorContext = createContext<ModelSelectorState | null>(null);

export interface AIModelSelectorRootProps extends ModelSelectorState {
  children: ReactNode;
}
export function AIModelSelectorRoot({ models, value, onValueChange, placeholder, children }: AIModelSelectorRootProps) {
  return (
    <ModelSelectorContext.Provider value={{ models, value, onValueChange, placeholder }}>
      <Select value={value} onValueChange={(next) => onValueChange?.(String(next ?? ""))}>
        {children}
      </Select>
    </ModelSelectorContext.Provider>
  );
}

function useModelSelector() {
  const value = useContext(ModelSelectorContext);
  if (!value) throw new Error("AIModelSelector primitives must be used inside AIModelSelectorRoot");
  return value;
}

export function AIModelSelectorTrigger({ children, className, "aria-label": ariaLabel, ...props }: React.ComponentProps<typeof SelectTrigger>) {
  const locale = useAILocale();
  return (
    <Trigger
      variant="ghost"
      aria-label={ariaLabel ?? locale.composer.model}
      data-od-slot="ai-model-selector-trigger"
      className={cn(styles.trigger, className)}
      {...props}
    >
      {children ?? (
        <>
          <AIModelSelectorValue />
          <SelectIcon />
        </>
      )}
    </Trigger>
  );
}

export function AIModelSelectorValue() {
  const { models, value, placeholder } = useModelSelector();
  return <SelectValue>{models.find((model) => model.id === value)?.label ?? placeholder}</SelectValue>;
}

export function AIModelSelectorContent({ children, className, ...props }: React.ComponentProps<typeof SelectContent>) {
  return (
    <SelectPortal>
      <SelectPositioner>
        <SelectContent data-od-slot="ai-model-selector-content" className={cn(styles.content, className)} {...props}>
          <AIModelSelectorList>{children}</AIModelSelectorList>
        </SelectContent>
      </SelectPositioner>
    </SelectPortal>
  );
}

export function AIModelSelectorList({ children, className, ...props }: React.ComponentProps<typeof SelectList>) {
  const { models, placeholder } = useModelSelector();
  return (
    <SelectList data-od-slot="ai-model-selector-list" className={cn(styles.list, className)} {...props}>
      {children ?? (
        <>
          {placeholder ? <AIModelSelectorPlaceholder /> : null}
          {models.map((model) => (
            <AIModelSelectorItem key={model.id} model={model} />
          ))}
        </>
      )}
    </SelectList>
  );
}

/** The option that keeps whatever the session already uses. */
export function AIModelSelectorPlaceholder() {
  const { placeholder } = useModelSelector();
  if (!placeholder) return null;
  return (
    <SelectItem value="" data-od-slot="ai-model-selector-placeholder" className={styles.item}>
      <SelectItemIndicator />
      <SelectItemText>{placeholder}</SelectItemText>
    </SelectItem>
  );
}

export function AIModelSelectorItem({ model }: { model: AssistantModelOption }) {
  const locale = useAILocale();
  return (
    <SelectItem value={model.id} disabled={model.disabled} data-od-slot="ai-model-selector-item" className={styles.item}>
      <SelectItemIndicator />
      <SelectItemText>{model.label}</SelectItemText>
      {model.isDefault && locale.composer.modelDefault ? <span className={styles.badge}>{locale.composer.modelDefault}</span> : null}
    </SelectItem>
  );
}

export interface AIModelSelectorProps extends ModelSelectorState {
  details?: ReactNode;
  label?: string;
}
export function AIModelSelector({ models, value, onValueChange, details, label, placeholder }: AIModelSelectorProps) {
  if (!models.length) return null;
  return (
    <AIModelSelectorRoot models={models} value={value} onValueChange={onValueChange} placeholder={placeholder}>
      {details}
      <AIModelSelectorTrigger aria-label={label} />
      <AIModelSelectorContent />
    </AIModelSelectorRoot>
  );
}
