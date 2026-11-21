import type { AssistantOptions } from "../ui-types";

const defaults: AssistantOptions = {
  header: {},
  welcome: { suggestionBehavior: "fill" },
  composer: { attachments: false, speech: false, modelSelector: false },
  messages: { actions: { order: ["copy", "delete", "regenerate"], visibility: "not-last", confirmDelete: true }, branches: {}, status: {} },
  layout: { autoScroll: {} },
};

export function defineAssistantOptions(options: AssistantOptions = {}): AssistantOptions {
  return {
    ...defaults,
    ...options,
    header: options.header === false ? false : { ...(defaults.header as object), ...options.header },
    welcome: options.welcome === false ? false : { ...(defaults.welcome as object), ...options.welcome },
    composer: options.composer === false ? false : { ...(defaults.composer as object), ...options.composer },
    messages: options.messages === false ? false : { ...(defaults.messages as object), ...options.messages },
    layout: { ...defaults.layout, ...options.layout },
  };
}

export const assistantPresets = {
  workspace: (options: AssistantOptions = {}) => defineAssistantOptions(options),
  compact: (options: AssistantOptions = {}) => defineAssistantOptions({ header: false, ...options }),
  drawer: (options: AssistantOptions = {}) => defineAssistantOptions({ header: false, ...options }),
};
