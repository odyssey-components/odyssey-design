import { AIThread } from "@odyssey/ui/ai/thread";
import { Button } from "@odyssey/ui/button";
import { Drawer, DrawerBody, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@odyssey/ui/drawer";
import type { ReactElement, ReactNode } from "react";
import { useMemo } from "react";
import { AssistantComposer } from "./internal/assistant-composer";
import { AssistantHeader } from "./internal/assistant-header";
import { AssistantMessages } from "./internal/assistant-messages";
import { assistantPresets, defineAssistantOptions } from "./internal/assistant-options";
import { type OdysseyAILocale, useOdysseyAILocale } from "./locale";
import { OdysseyAIProvider } from "./react";
import type { AssistantRuntimeOptions } from "./types";
import type { AssistantOptions } from "./ui-types";

export type { AssistantModelOption, AssistantOptions, AttachmentAdapter } from "./ui-types";
export { assistantPresets, defineAssistantOptions };

export interface AssistantWorkspaceProps {
  options?: AssistantOptions;
  className?: string;
}
export function AssistantWorkspace({ options: input, className }: AssistantWorkspaceProps) {
  const options = useMemo(() => defineAssistantOptions(input), [input]);
  return (
    <AIThread className={className}>
      <AssistantHeader options={options} />
      <AssistantMessages options={options} />
      <AssistantComposer options={options} />
    </AIThread>
  );
}

export function Assistant({ runtime, options, locale }: { runtime: AssistantRuntimeOptions; options?: AssistantOptions; locale?: OdysseyAILocale }) {
  return (
    <OdysseyAIProvider config={runtime} locale={locale}>
      <AssistantWorkspace options={options} />
    </OdysseyAIProvider>
  );
}

export function AssistantTrigger({ children, ...props }: { children?: ReactNode } & React.ComponentProps<typeof Button>) {
  const locale = useOdysseyAILocale();
  return <Button {...props}>{children ?? locale.assistant.trigger}</Button>;
}

export function AssistantDrawer({
  runtime,
  options,
  defaultOpen = false,
  trigger,
  locale,
}: {
  runtime: AssistantRuntimeOptions;
  options?: AssistantOptions;
  defaultOpen?: boolean;
  trigger?: ReactElement;
  locale?: OdysseyAILocale;
}) {
  const inherited = useOdysseyAILocale();
  const resolved = assistantPresets.drawer(options);
  return (
    <Drawer defaultOpen={defaultOpen}>
      <DrawerTrigger render={trigger ?? <AssistantTrigger />} />
      <DrawerContent
        // The assistant is a side panel, not a content drawer. Its thread is
        // capped at 48rem, so the shared 1280px default would only add empty
        // margins around the conversation.
        style={{ inlineSize: "min(26rem, calc(100vw - 2rem))" }}
      >
        <DrawerHeader>
          <DrawerTitle>{inherited.assistant.title}</DrawerTitle>
          <DrawerDescription>{inherited.assistant.drawerDescription}</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <OdysseyAIProvider config={runtime} locale={locale}>
            <AssistantWorkspace options={resolved} />
          </OdysseyAIProvider>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
