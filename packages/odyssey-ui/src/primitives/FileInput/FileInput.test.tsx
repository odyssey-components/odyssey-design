import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { FileInput } from "./FileInput";

describe("FileInput", () => {
  it("fixes the file type while forwarding native properties, ref and change events", () => {
    const ref = createRef<HTMLInputElement>();
    const onChange = vi.fn();
    render(<FileInput ref={ref} aria-label="Document" accept="image/png" multiple disabled aria-invalid="true" className="px-4" onChange={onChange} />);
    const input = screen.getByLabelText("Document");
    expect(input).toHaveAttribute("type", "file");
    expect(input).toHaveAttribute("accept", "image/png");
    expect(input).toBeDisabled();
    expect(input).toHaveClass("w-full", "disabled:cursor-not-allowed", "aria-[invalid=true]:border-[var(--od-destructive)]", "px-4");
    expect(ref.current).toBe(input);
    fireEvent.change(input);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
