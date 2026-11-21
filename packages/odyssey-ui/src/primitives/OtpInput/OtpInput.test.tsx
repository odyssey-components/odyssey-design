import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { OtpGroup, OtpInput, OtpSlot, REGEXP_ONLY_DIGITS } from ".";

describe("OtpInput", () => {
  it("supports controlled input and full-code paste semantics", () => {
    function Example() {
      const [value, setValue] = useState("");
      return (
        <OtpInput aria-label="Code" maxLength={6} value={value} onChange={setValue} pattern={REGEXP_ONLY_DIGITS}>
          <OtpGroup>
            {["one", "two", "three", "four", "five", "six"].map((key, index) => (
              <OtpSlot key={key} index={index} />
            ))}
          </OtpGroup>
        </OtpInput>
      );
    }
    render(<Example />);
    fireEvent.change(screen.getByRole("textbox", { name: "Code" }), { target: { value: "123456" } });
    expect(screen.getByRole("textbox", { name: "Code" })).toHaveValue("123456");
    expect(document.querySelectorAll('[data-od-slot="otp-slot"]')).toHaveLength(6);
  });

  it("uses mobile one-time-code defaults", () => {
    render(
      <OtpInput aria-label="OTP" maxLength={1}>
        <OtpGroup>
          <OtpSlot index={0} />
        </OtpGroup>
      </OtpInput>,
    );
    expect(screen.getByRole("textbox", { name: "OTP" })).toHaveAttribute("autocomplete", "one-time-code");
    expect(screen.getByRole("textbox", { name: "OTP" })).toHaveAttribute("inputmode", "numeric");
    expect(screen.getByRole("textbox", { name: "OTP" })).toHaveAttribute("spellcheck", "false");
  });

  it("forwards invalid, disabled, size, and decorative semantics", () => {
    render(
      <OtpInput aria-label="Secure code" maxLength={1} invalid disabled size="lg">
        <OtpGroup>
          <OtpSlot index={0} />
        </OtpGroup>
      </OtpInput>,
    );
    const input = screen.getByRole("textbox", { name: "Secure code" });
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(document.querySelector(".od-OtpInput-container")).toHaveClass("od-OtpInput-lg", "od-OtpInput-invalid", "od-OtpInput-disabled");
    expect(document.querySelector('[data-od-slot="otp-slot"]')).toHaveAttribute("aria-hidden", "true");
  });
});
