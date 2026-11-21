import { createFormHook, createFormHookContexts, revalidateLogic } from "@tanstack/react-form";
import type { z } from "zod";

const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();
const proFormHook = createFormHook({ fieldComponents: {}, formComponents: {}, fieldContext, formContext });

export interface UseProFormOptions<TSchema extends z.ZodType<Record<string, unknown>, Record<string, unknown>>> {
  defaultValues: z.input<TSchema>;
  onSubmit: (value: z.output<TSchema>) => void | Promise<void>;
  onSubmitError?: (error: unknown) => void;
  schema: TSchema;
}

export function useProForm<TSchema extends z.ZodType<Record<string, unknown>, Record<string, unknown>>>(options: UseProFormOptions<TSchema>) {
  let parsedInput: z.input<TSchema> | undefined;
  let parsedOutput: z.output<TSchema> | undefined;
  return proFormHook.useAppForm({
    defaultValues: options.defaultValues,
    validationLogic: revalidateLogic({ mode: "submit", modeAfterSubmission: "change" }),
    validators: {
      onDynamicAsync: async ({ value }) => {
        const result = await options.schema.safeParseAsync(value);
        if (result.success) {
          parsedInput = value;
          parsedOutput = result.data;
          return undefined;
        }
        const fields: Record<string, string> = {};
        const formIssues: string[] = [];
        for (const issue of result.error.issues) {
          const path = issue.path.join(".");
          if (path) fields[path] = issue.message;
          else formIssues.push(issue.message);
        }
        return { fields, form: formIssues.join("；") || undefined };
      },
    },
    onSubmit: async ({ value }) => {
      try {
        const output = value === parsedInput && parsedOutput !== undefined ? parsedOutput : await options.schema.parseAsync(value);
        await options.onSubmit(output);
      } catch (error) {
        options.onSubmitError?.(error);
      }
    },
  });
}

export interface ProFormInstance<TSchema extends z.ZodType<Record<string, unknown>, Record<string, unknown>>> {
  handleSubmit: () => Promise<unknown>;
  reset: () => void;
  readonly __schema?: TSchema;
}
export const withProForm = proFormHook.withForm;
export const useProFormContext = useFormContext;
export const useProFieldContext = useFieldContext;
