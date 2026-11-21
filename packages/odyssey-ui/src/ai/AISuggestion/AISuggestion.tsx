import { createContext, type HTMLAttributes, type ReactNode, useContext } from "react";
import { cn } from "../../lib/cn";
import { Button } from "../../primitives/Button";
import { Stack } from "../../primitives/Stack";
import type { Suggestion } from "../types";
import { styles } from "./AISuggestion.classes";

const Trigger = Button;
const Title = "strong";
const Description = "small";

const SuggestionContext = createContext<Suggestion | null>(null);

export interface AISuggestionListProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "onSelect"> {
  suggestions: readonly Suggestion[];
  onSelect?(prompt: string): void;
  loading?: boolean;
  children?: (item: Suggestion) => ReactNode;
}

export function AISuggestionList({ suggestions, onSelect, loading, children, className, ...props }: AISuggestionListProps) {
  return (
    <Stack direction="row" gap={2} wrap data-od-slot="ai-suggestion-list" className={cn(styles.list, className)} {...props}>
      {suggestions.map((item) => (
        <SuggestionContext.Provider key={item.id} value={item}>
          {children ? children(item) : <AISuggestionTrigger onSelect={onSelect ?? (() => undefined)} loading={loading} />}
        </SuggestionContext.Provider>
      ))}
    </Stack>
  );
}

export interface AISuggestionTriggerProps extends Omit<React.ComponentProps<typeof Button>, "onSelect"> {
  suggestion?: Suggestion;
  onSelect(prompt: string): void;
  loading?: boolean;
}

export function AISuggestionTrigger({ suggestion, onSelect, loading = false, children, className, ...props }: AISuggestionTriggerProps) {
  const contextual = useContext(SuggestionContext);
  const item = suggestion ?? contextual;
  if (!item) throw new Error("AISuggestionTrigger must receive a suggestion or be used inside AISuggestionList");
  return (
    <SuggestionContext.Provider value={item}>
      <Trigger
        type="button"
        variant="soft"
        data-od-slot="ai-suggestion-trigger"
        className={cn(styles.trigger, className)}
        {...props}
        disabled={props.disabled || loading}
        onClick={(event) => {
          props.onClick?.(event);
          if (event.defaultPrevented) return;
          onSelect(item.prompt);
        }}
      >
        {children ?? (
          <span>
            <AISuggestionTitle />
            {item.description ? <AISuggestionDescription /> : null}
          </span>
        )}
      </Trigger>
    </SuggestionContext.Provider>
  );
}

export function AISuggestionTitle({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  const item = useContext(SuggestionContext);
  return (
    <Title data-od-slot="ai-suggestion-title" className={cn(styles.title, className)} {...props}>
      {props.children ?? item?.title}
    </Title>
  );
}

export function AISuggestionDescription({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  const item = useContext(SuggestionContext);
  return (
    <Description data-od-slot="ai-suggestion-description" className={cn(styles.description, className)} {...props}>
      {props.children ?? item?.description}
    </Description>
  );
}
