import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProOtpField } from ".";

describe("ProOtpField", () => {
  it("defaults to six numeric slots and forwards changes", () => {
    const onChange = vi.fn();
    render(<ProOtpField label="Verification code" value="" onChange={onChange} />);
    expect(document.querySelectorAll('[data-od-slot="pro-otp-field-slot"]')).toHaveLength(6);
    fireEvent.change(screen.getByRole("textbox", { name: "Verification code" }), { target: { value: "123456" } });
    expect(onChange).toHaveBeenCalledWith("123456");
  });
});
