import styled from "styled-components";
import { useOdysseyAILocale } from "../locale";
import type { AssistantOptions } from "../ui-types";

const Root = styled.header`display:flex;align-items:center;justify-content:space-between;gap:var(--od-space-3);padding:var(--od-space-4);border-bottom:var(--od-line-width) solid var(--od-border)`;

export function AssistantHeader({ options }: { options: AssistantOptions }) {
  const locale = useOdysseyAILocale();
  if (!options.header) return null;
  return (
    <Root data-od-slot="ai-assistant-header">
      <div>
        <strong>{options.header.title ?? locale.assistant.title}</strong>
        {options.header.description ? <div>{options.header.description}</div> : null}
      </div>
      {options.renderHeaderAction?.()}
    </Root>
  );
}
