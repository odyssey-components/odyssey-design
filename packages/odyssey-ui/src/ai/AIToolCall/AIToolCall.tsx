import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Button } from "../../primitives/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../primitives/Card";
import { useAILocale } from "../locale";
import type { ToolCallPart, ToolResultPart } from "../types";
import { styles } from "./AIToolCall.classes";

const Code = "pre";
const ErrorText = "p";

export interface AIToolCallProps extends Omit<HTMLAttributes<HTMLDivElement>, "part"> {
  part: ToolCallPart;
  onApprove?(approvalId: string): void;
  onReject?(approvalId: string): void;
}
export function AIToolCall({ part, onApprove, onReject, className, ...props }: AIToolCallProps) {
  return (
    <Card data-od-slot="ai-tool-call" className={cn(styles.root, className)} {...props}>
      <CardHeader>
        <CardTitle>{part.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Code data-od-slot="ai-tool-call-input">{JSON.stringify(part.input, null, 2)}</Code>
      </CardContent>
      {part.approvalId && onApprove && onReject ? <AIToolApproval approvalId={part.approvalId} onApprove={onApprove} onReject={onReject} /> : null}
    </Card>
  );
}

export interface AIToolApprovalProps {
  approvalId: string;
  onApprove(approvalId: string): void;
  onReject(approvalId: string): void;
}
export function AIToolApproval({ approvalId, onApprove, onReject }: AIToolApprovalProps) {
  const locale = useAILocale();
  return (
    <CardFooter data-od-slot="ai-tool-approval">
      <Button size="sm" onClick={() => onApprove(approvalId)}>
        {locale.tool.approve}
      </Button>
      <Button size="sm" variant="outline" onClick={() => onReject(approvalId)}>
        {locale.tool.reject}
      </Button>
    </CardFooter>
  );
}

export function AIToolCallResult({ part }: { part: ToolResultPart }) {
  return <Code data-od-slot="ai-tool-call-result">{typeof part.output === "string" ? part.output : JSON.stringify(part.output, null, 2)}</Code>;
}

export function AIToolCallError({ children }: { children: ReactNode }) {
  return (
    <ErrorText role="alert" data-od-slot="ai-tool-call-error">
      {children}
    </ErrorText>
  );
}
