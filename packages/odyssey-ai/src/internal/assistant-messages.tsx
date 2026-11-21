import { MarkdownTextPart } from "@odyssey/ai/ui/markdown";
import {
  AIMessageActions,
  AIMessageBranchPicker,
  AIMessageBody,
  AIMessageCopy,
  AIMessageDelete,
  AIMessageParts,
  AIMessageRegenerate,
  AIMessage,
} from "@odyssey/ui/ai/message";
import { AIRendererRegistryProvider, createAIRendererRegistry } from "@odyssey/ui/ai/renderers";
import { AISuggestionList, AISuggestionTrigger } from "@odyssey/ui/ai/suggestion";
import { AIThreadViewport } from "@odyssey/ui/ai/thread";
import { AlertDialog, AlertDialogClose, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle } from "@odyssey/ui/alert-dialog";
import { Button } from "@odyssey/ui/button";
import { EmptyState, EmptyStateActions, EmptyStateDescription, EmptyStateTitle } from "@odyssey/ui/empty-state";
import { Spinner } from "@odyssey/ui/spinner";
import { Stack } from "@odyssey/ui/stack";
import { type ReactNode, useLayoutEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useOdysseyAILocale } from "../locale";
import { useThreadRuntime } from "../react";
import type { AssistantOptions } from "../ui-types";

const List = styled(Stack)`width:min(48rem,100%);margin-inline:auto`;
const WorkspaceState = styled(EmptyState)`
  min-height: 0;
  flex: 1 1 auto;
`;
const CollapsibleUserContent = styled(AIMessageBody)`
  position: relative;
`;
const UserContentViewport = styled.div`
  position: relative;
  max-height: 12rem;
  overflow: hidden;

  &[data-expanded="true"] {
    max-height: none;
    overflow: visible;
  }

  &[data-overflowing="true"][data-expanded="false"]::after {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    height: var(--od-space-8);
    background: linear-gradient(transparent, var(--od-primary));
    content: "";
    pointer-events: none;
  }

  @media (max-width: 760px) {
    max-height: 10rem;
  }
`;
const UserContentToggle = styled(Button)`
  && {
    min-height: var(--od-control-height-sm);
    margin-top: var(--od-space-1);
    padding-inline: var(--od-space-2);
    color: var(--od-primary-foreground);
  }

  &&:hover:not(:disabled) {
    background: color-mix(in srgb, var(--od-primary-foreground) 12%, transparent);
    color: var(--od-primary-foreground);
  }
`;
const defaultAssistantRenderers = createAIRendererRegistry({ parts: { text: MarkdownTextPart } });

function DefaultMessageContent({ role, children }: { role: "system" | "user" | "assistant"; children: ReactNode }) {
  const locale = useOdysseyAILocale();
  const viewport = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  useLayoutEffect(() => {
    if (role !== "user" || expanded) return;
    const node = viewport.current;
    if (!node) return;
    const measure = () => setOverflowing(node.scrollHeight > node.clientHeight + 1);
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [expanded, role]);
  useLayoutEffect(() => {
    const node = viewport.current;
    if (!node || role !== "user" || expanded || !overflowing) return;
    const boundary = node.getBoundingClientRect().bottom;
    const focusable = node.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const changed = new Map<HTMLElement, string | null>();
    for (const element of focusable) {
      if (element.getBoundingClientRect().bottom <= boundary + 1) continue;
      changed.set(element, element.getAttribute("tabindex"));
      element.setAttribute("tabindex", "-1");
    }
    return () => {
      for (const [element, tabIndex] of changed) {
        if (tabIndex === null) element.removeAttribute("tabindex");
        else element.setAttribute("tabindex", tabIndex);
      }
    };
  }, [expanded, overflowing, role]);
  if (role !== "user") return <AIMessageBody>{children}</AIMessageBody>;
  return (
    <CollapsibleUserContent data-od-slot="ai-collapsible-user-message">
      <UserContentViewport ref={viewport} data-expanded={expanded} data-overflowing={overflowing}>
        {children}
      </UserContentViewport>
      {overflowing ? (
        <UserContentToggle type="button" size="sm" variant="ghost" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>
          {expanded ? (locale.message.collapse ?? "Collapse message") : (locale.message.expand ?? "Expand message")}
        </UserContentToggle>
      ) : null}
    </CollapsibleUserContent>
  );
}

export function AssistantMessages({ options }: { options: AssistantOptions }) {
  const locale = useOdysseyAILocale();
  const chat = useThreadRuntime();
  const [deleteId, setDeleteId] = useState<string>();
  const messages = options.messages || undefined;
  const actions = messages?.actions || undefined;
  const order = actions?.order ?? ["copy", "delete", "regenerate"];
  const header = options.header || undefined;
  const welcome = options.welcome || undefined;
  if (!chat.hydrated) {
    return (
      <WorkspaceState data-od-slot="ai-assistant-loading" aria-busy="true">
        <Spinner />
        <EmptyStateDescription>{locale.thread.loading}</EmptyStateDescription>
      </WorkspaceState>
    );
  }
  return (
    <>
      {chat.messages.length ? (
        <AIThreadViewport messages={chat.messages} autoScroll={options.layout?.autoScroll !== false}>
          <AIRendererRegistryProvider registry={defaultAssistantRenderers}>
            <List gap={6}>
              {chat.messages
                .filter((message) => message.role !== "system")
                .map((message) => (
                  <AIMessage key={message.id} message={message} isLast={chat.messages.at(-1)?.id === message.id}>
                    <DefaultMessageContent role={message.role}>
                      <AIMessageParts showStatus={messages?.status !== false} onApprove={(id) => void chat.approve(id)} onReject={(id) => void chat.reject(id)} />
                    </DefaultMessageContent>
                    {actions ? (
                      <AIMessageActions autohide={actions.visibility === "always" ? "never" : actions.visibility === "never" ? "always" : "not-last"}>
                        {order.map((action) =>
                          action === "copy" ? (
                            <AIMessageCopy key={action} />
                          ) : action === "delete" ? (
                            <AIMessageDelete
                              key={action}
                              onDelete={() => (actions.confirmDelete === false ? void chat.removeMessage(message.id) : setDeleteId(message.id))}
                            />
                          ) : (
                            <AIMessageRegenerate
                              key={action}
                              available={[...chat.messages].reverse().find((item) => item.role === "assistant")?.id === message.id}
                              running={chat.isLoading}
                              onRegenerate={() => void chat.regenerate()}
                            />
                          ),
                        )}
                      </AIMessageActions>
                    ) : null}
                    {messages?.branches ? <AIMessageBranchPicker message={message} onSwitch={(id) => void chat.switchBranch(id)} /> : null}
                    {options.renderMessageExtra?.(message)}
                  </AIMessage>
                ))}
            </List>
          </AIRendererRegistryProvider>
        </AIThreadViewport>
      ) : welcome ? (
        <WorkspaceState data-od-slot="ai-assistant-welcome">
          <EmptyStateTitle>{welcome.title ?? header?.title ?? locale.assistant.title}</EmptyStateTitle>
          <EmptyStateDescription>{welcome.description ?? header?.description ?? locale.assistant.description}</EmptyStateDescription>
          {welcome.suggestions?.length ? (
            <EmptyStateActions>
              <AISuggestionList suggestions={welcome.suggestions}>
                {() => (
                  <AISuggestionTrigger
                    loading={chat.isLoading}
                    onSelect={(prompt) => (welcome.suggestionBehavior === "send" ? void chat.send(prompt) : chat.setInput(prompt))}
                  />
                )}
              </AISuggestionList>
            </EmptyStateActions>
          ) : null}
          {options.renderWelcomeExtra?.()}
        </WorkspaceState>
      ) : null}
      {chat.error ? <p role="alert">{chat.error.message}</p> : null}
      <AlertDialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(undefined)}>
        <AlertDialogContent>
          <AlertDialogTitle>{locale.message.deleteTitle ?? "Delete this message?"}</AlertDialogTitle>
          <AlertDialogDescription>{locale.message.deleteDescription ?? "This action cannot be undone."}</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogClose render={<Button variant="outline" />}>{locale.message.cancel ?? "Cancel"}</AlertDialogClose>
            <Button
              tone="danger"
              variant="solid"
              onClick={() => {
                if (deleteId) void chat.removeMessage(deleteId);
                setDeleteId(undefined);
              }}
            >
              {locale.message.delete}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
