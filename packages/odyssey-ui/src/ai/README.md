# Odyssey UI · AI components

`src/ai/` is a peer of `src/primitives/` and `src/patterns/`. It contains **provider-neutral AI interaction presentation components**, not an Agent runtime.

## Public entry points

- `@odyssey/ui/ai` — every AI presentation component.
- `@odyssey/ui/ai/composer` — `AIComposer`, `AIComposerInput`, `AIComposerToolbar`, `AIComposerPrefix`, `AIComposerSuffix`, `AIComposerFooter`, `AIComposerAttachments`, `AIComposerAttachment`, `AIComposerAddAttachment`, `AIComposerAttachmentTrigger`, `AIComposerSend`, `AIComposerCancel`, `useAIComposerAttachments`. Enter sends, Shift+Enter inserts a newline, IME composition and repeated Enter are not submitted.
- `@odyssey/ui/ai/message` — `AIMessage`, `AIMessageHeader`, `AIMessageBody`, `AIMessageFooter`, `AIMessageAvatar`, `AIMessageExtra`, `AIMessageParts`, `AIMessagePart`, `AIMessageStatus`, `AIMessageActions`, `AIMessageAction`, `AIMessageCopy`, `AIMessageDelete`, `AIMessageRegenerate`, `AIMessageStop`, `AIMessageBranchPicker*`, `useAIMessageState`.
- `@odyssey/ui/ai/tool-call` — `AIToolCall`, `AIToolCallResult`, `AIToolCallError`, `AIToolApproval`.
- `@odyssey/ui/ai/thread` — `AIThread`, `AIThreadViewport`, `AIThreadMessages`, `AIThreadEmpty`, `AIThreadIf`, `AIThreadScrollToBottom`.
- `@odyssey/ui/ai/thread-list` — `AIThreadList`, `AIThreadListItems`, `AIThreadListItem`, `AIThreadListNew`, `useAIThreadList`.
- `@odyssey/ui/ai/suggestion` — `AISuggestionList`, `AISuggestionTrigger`, `AISuggestionTitle`, `AISuggestionDescription`.
- `@odyssey/ui/ai/model-selector` — `AIModelSelector`, `AIModelSelectorRoot`, `AIModelSelectorTrigger`, `AIModelSelectorValue`, `AIModelSelectorContent`, `AIModelSelectorList`, `AIModelSelectorItem`.
- `@odyssey/ui/ai/renderers` — `createAIRendererRegistry`, `AIRendererRegistryProvider`, `useAIRendererRegistry`, `AIUnknownPartFallback`.
- `@odyssey/ui/ai/timeline` — `AITimeline`, `AITimelineItem`.
- `@odyssey/ui/ai/approval` — `AIApproval`, `AIApprovalTitle`, `AIApprovalDescription`, `AIApprovalActions`.
- `@odyssey/ui/ai/locale` — `AILocale`, `AILocaleProvider`, `useAILocale`, `createAILocale`, `aiLocales`.
- `@odyssey/ui/ai/types` — the presentation-layer contracts (`MessagePart`, `AIMessage`, `ThreadSummary`, `Suggestion`, `ComposerAttachment`, `AssistantModelOption`, `AttachmentAdapter`, …).

The group is **composition only**. It may depend on `primitives`, token/theme and accessibility helpers. Neither `primitives` nor `patterns` may import it. It must not depend on OdyAgent, Provider JSON-RPC/ACP, permissions, Session/Turn models, transport, event cursors, mutation, fetching, persistence or model credentials.

The caller owns source data and action eligibility. `AIApproval` visually presents decisions but does not authorize them; the caller renders only genuinely offered options and handles TTL, stale request and native acknowledgement. `AIComposer` only calls `onSend` when the action is enabled; the caller must recheck ownership and capability before dispatch.

Provider-native Plan/Diff and rich timelines remain in OdyAgent until a second Web consumer proves shared semantics. This is a narrow initial slice: no syntax highlighter, Markdown parser, HTML rendering, virtualizer or workflow engine.

Components use public Odyssey tokens (`odysseyTokenVars`), `od-*` CSS classes and `data-od-slot` anatomy, and follow `OdysseyProvider` light/dark + density. Text passed as ordinary React children is safely escaped by React; any future Markdown/highlighting pipeline must sanitize its input separately.

Each component directory owns exactly four files: `<Name>.tsx`, `<Name>.classes.ts` (stable class names), `index.ts` and `<Name>.test.tsx`. Static anatomy rules live in the shared `src/components.css`; theme and density values come from the `--od-*` variables. Component class maps stay private: a component may import another component, never its `.classes`.

## Consumer

OdyAgent Control Web is the first consumer: it renders the thread, message, tool-call and composer surfaces of the console workspace. The `@odyssey/ai` runtime package keeps only transport and persistence, and reaches these components through `@odyssey/ui/ai/*`.
