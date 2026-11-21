import {
  AIComposerAttachment,
  AIComposerAttachments,
  AIComposerAttachmentTrigger,
  AIComposerCancel,
  AIComposerInput,
  AIComposerPrefix,
  AIComposer,
  AIComposerSend,
  AIComposerSuffix,
  AIComposerToolbar,
  useAIComposerAttachments,
} from "@odyssey/ui/ai/composer";
import { AIModelSelector } from "@odyssey/ui/ai/model-selector";
import { useSpeechInput } from "@odyssey/ai/ui/speech";
import { IconButton } from "@odyssey/ui/icon-button";
import { Mic, MicOff } from "lucide-react";
import { useEffect, useRef } from "react";
import styled from "styled-components";
import { useOdysseyAILocale } from "../locale";
import { useThreadRuntime } from "../react";
import type { AssistantOptions } from "../ui-types";

const Root = styled(AIComposer)`width:min(48rem,calc(100% - var(--od-space-8)));margin:0 auto var(--od-space-4)`;

export function AssistantComposer({ options }: { options: AssistantOptions }) {
  const composer = options.composer || undefined;
  const attachmentOptions = composer?.attachments || undefined;
  const modelSelector = composer?.modelSelector || undefined;
  const locale = useOdysseyAILocale();
  const chat = useThreadRuntime();
  const attachments = useAIComposerAttachments({ sessionId: chat.sessionId, adapter: attachmentOptions?.adapter, validate: attachmentOptions?.validate });
  const speech = useSpeechInput({ language: composer?.speech ? composer.speech.locale : undefined });
  const speechBase = useRef("");
  useEffect(() => {
    if (speech.isListening || speech.transcript) chat.setInput([speechBase.current, speech.transcript].filter(Boolean).join(" "));
  }, [speech.isListening, speech.transcript, chat.setInput]);
  if (!composer) return null;
  const selectedModel = modelSelector?.options.find((model) => model.id === modelSelector.value);
  const addFiles = attachmentOptions
    ? (files: File[]) => attachments.addFiles(attachmentOptions.maxCount === undefined ? files : files.slice(0, attachmentOptions.maxCount))
    : undefined;
  return (
    <Root
      onFiles={addFiles}
      onSubmit={(event) => {
        event.preventDefault();
        if ((!chat.input.trim() && !attachments.readyIds.length) || attachments.uploading) return;
        void chat.send(chat.input.trim(), { attachmentIds: attachments.readyIds }).then(() => attachments.clear());
        speech.resetTranscript();
        speechBase.current = "";
      }}
    >
      {attachments.attachments.length ? (
        <AIComposerAttachments>
          {attachments.attachments.map((item) => (
            <AIComposerAttachment key={item.id} attachment={item} onRemove={() => attachments.remove(item.id)} />
          ))}
        </AIComposerAttachments>
      ) : null}
      <AIComposerInput
        placeholder={composer.placeholder}
        onFiles={addFiles}
        minRows={1}
        maxRows={normalizeMaxRows(composer.maxRows)}
        value={chat.input}
        onChange={(event) => chat.setInput(event.target.value)}
      />
      <AIComposerToolbar>
        <AIComposerPrefix>
          {attachmentOptions ? (
            <AIComposerAttachmentTrigger
              accept={attachmentOptions.accept}
              multiple={attachmentOptions.multiple ?? true}
              onFiles={addFiles ?? attachments.addFiles}
              label={locale.composer.attach ?? "Attach files"}
              inputLabel={locale.composer.addAttachment ?? locale.composer.attach ?? "Attach files"}
            />
          ) : null}
        </AIComposerPrefix>
        <AIComposerSuffix>
          {modelSelector ? (
            <AIModelSelector
              models={modelSelector.options}
              value={modelSelector.value}
              onValueChange={modelSelector.onChange}
              details={options.renderModelDetails?.(selectedModel)}
              label={locale.composer.model ?? "Model"}
            />
          ) : null}
          {chat.isLoading ? (
            <AIComposerCancel onClick={chat.stop} />
          ) : speech.isListening ? (
            <IconButton
              type="button"
              size="sm"
              shape="circular"
              variant="soft"
              aria-label={locale.composer.stopSpeech ?? locale.composer.stop}
              title={locale.composer.stopSpeech ?? locale.composer.stop}
              aria-pressed="true"
              onClick={speech.stop}
            >
              <MicOff size={16} />
            </IconButton>
          ) : chat.input.trim() || attachments.readyIds.length ? (
            <AIComposerSend disabled={attachments.uploading} canSubmit={Boolean(chat.input.trim() || attachments.readyIds.length)} loading={chat.isLoading} />
          ) : composer.speech && speech.supported && attachments.attachments.length === 0 ? (
            <IconButton
              type="button"
              size="sm"
              shape="circular"
              variant="solid"
              aria-label={locale.composer.speech ?? "Speech"}
              title={locale.composer.speech ?? "Speech"}
              aria-pressed="false"
              onClick={() => {
                speechBase.current = chat.input;
                speech.start();
              }}
            >
              <Mic size={16} />
            </IconButton>
          ) : (
            <AIComposerSend disabled />
          )}
        </AIComposerSuffix>
      </AIComposerToolbar>
      {attachments.error ? <p role="status">{attachments.error}</p> : null}
      {speech.error ? <p role="status">{speech.error}</p> : null}
    </Root>
  );
}

function normalizeMaxRows(value: number | undefined) {
  return value === undefined || !Number.isFinite(value) ? 6 : Math.max(1, Math.floor(value));
}
