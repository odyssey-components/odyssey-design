import type { ReactNode } from "react";
import type {
  AIMessage,
  AssistantModelOption,
  AttachmentAdapter,
  Suggestion,
} from "@odyssey/ui/ai/types";

export type { AssistantModelOption, AttachmentAdapter } from "@odyssey/ui/ai/types";

export interface AssistantOptions {
  header?: false | { title?: ReactNode; description?: ReactNode };
  welcome?:
    | false
    | {
        title?: ReactNode;
        description?: ReactNode;
        suggestions?: readonly Suggestion[];
        suggestionBehavior?: "fill" | "send";
      };
  composer?:
    | false
    | {
        placeholder?: string;
        maxRows?: number;
        attachments?:
          | false
          | {
              adapter: AttachmentAdapter;
              accept?: string;
              validate?: (file: File) => string | undefined;
              multiple?: boolean;
              maxCount?: number;
            };
        speech?: false | { locale?: string };
        modelSelector?:
          | false
          | {
              options: readonly AssistantModelOption[];
              value?: string;
              onChange?: (modelId: string) => void;
            };
      };
  messages?:
    | false
    | {
        actions?:
          | false
          | {
              order?: readonly ("copy" | "delete" | "regenerate")[];
              visibility?: "always" | "not-last" | "never";
              confirmDelete?: boolean;
            };
        branches?: false | Record<string, never>;
        status?: false | Record<string, never>;
      };
  layout?: { autoScroll?: false | { behavior?: ScrollBehavior } };
  renderHeaderAction?: () => ReactNode;
  renderModelDetails?: (model: AssistantModelOption | undefined) => ReactNode;
  renderMessageExtra?: (message: AIMessage) => ReactNode;
  renderWelcomeExtra?: () => ReactNode;
}
