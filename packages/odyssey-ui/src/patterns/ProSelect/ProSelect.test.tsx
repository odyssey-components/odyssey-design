import { OdysseyProvider } from "@odyssey/ui";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { ProSelect } from "./ProSelect";

describe("ProSelect", () => {
  it("merges native root and semantic part customization", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLInputElement>();
    render(
      <OdysseyProvider>
        <ProSelect
          ref={ref}
          label="门店"
          className="root-class"
          style={{ width: 160 }}
          contentProps={{ width: "22rem" }}
          classNames={{ content: "content-class", option: "option-class", trigger: "trigger-class" }}
          styles={{ option: { opacity: 0.9 } }}
          options={[{ value: "shanghai", label: "上海店" }]}
        />
      </OdysseyProvider>,
    );
    expect(ref.current).toHaveClass("root-class");
    expect(ref.current).toHaveStyle({ width: "160px" });
    expect(ref.current).toHaveAttribute("data-od-slot", "pro-select");
    await user.click(ref.current as HTMLInputElement);
    expect(await screen.findByRole("option", { name: "上海店" })).toHaveClass("option-class");
    const content = document.querySelector<HTMLElement>('[data-od-slot="pro-select-content"]');
    expect(content).toHaveClass("content-class");
    expect(content).toHaveAttribute("data-width", "custom");
    // jsdom 30 resolves logical properties in the computed style to a used value,
    // so the declared inline value is what this assertion checks.
    expect(content?.style.inlineSize).toBe("22rem");
  });

  it("selects from a props-driven option list", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <OdysseyProvider>
        <ProSelect label="门店" options={[{ value: "shanghai", label: "上海店" }]} onValueChange={onValueChange} />
      </OdysseyProvider>,
    );
    await user.click(screen.getByRole("combobox", { name: "门店" }));
    await user.click(await screen.findByRole("option", { name: "上海店" }));
    expect(onValueChange).toHaveBeenCalledWith("shanghai");
  });

  it("preserves object values", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const shanghai = { id: "shanghai", label: "上海店" };
    render(
      <OdysseyProvider>
        <ProSelect label="门店" options={[{ value: shanghai, label: shanghai.label }]} itemToStringValue={(value) => value.id} onValueChange={onValueChange} />
      </OdysseyProvider>,
    );
    await user.click(screen.getByRole("combobox", { name: "门店" }));
    await user.click(await screen.findByRole("option", { name: "上海店" }));
    expect(onValueChange).toHaveBeenCalledWith(shanghai);
  });

  it("reports search text without filtering in remote mode", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(
      <OdysseyProvider>
        <ProSelect label="门店" searchable filterOption={false} options={[{ value: "shanghai", label: "上海店" }]} onSearch={onSearch} />
      </OdysseyProvider>,
    );
    await user.type(screen.getByRole("combobox", { name: "门店" }), "remote");
    expect(onSearch).toHaveBeenLastCalledWith("remote");
  });

  it("infers and emits multiple values", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <OdysseyProvider>
        <ProSelect
          multiple
          label="门店"
          options={[
            { value: "shanghai", label: "上海店" },
            { value: "hangzhou", label: "杭州店" },
          ]}
          onValueChange={onValueChange}
        />
      </OdysseyProvider>,
    );
    await user.click(screen.getByRole("combobox", { name: "门店" }));
    await user.click(await screen.findByRole("option", { name: "上海店" }));
    await user.click(screen.getByRole("option", { name: "杭州店" }));
    expect(onValueChange).toHaveBeenLastCalledWith(["shanghai", "hangzhou"]);
  });
});
