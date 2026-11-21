import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as z from "zod/v4";
import { ProForm } from "./ProForm";

describe("ProForm", () => {
  it("builds fields from options", async () => {
    const submit = vi.fn(async () => undefined);
    const schema = z.object({ name: z.string().min(1) });
    render(<ProForm options={{ schema, defaultValues: { name: "" }, fields: [{ name: "name", type: "text", label: "Name" }], onSubmit: submit }} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), { target: { value: "Ada" } });
    fireEvent.click(screen.getByRole("button", { name: "提交" }));
    await waitFor(() => expect(submit).toHaveBeenCalledWith({ name: "Ada" }));
  });
});
