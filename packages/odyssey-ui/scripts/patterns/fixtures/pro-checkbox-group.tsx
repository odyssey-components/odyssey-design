import { ProCheckboxGroup } from "@odyssey/ui/patterns/checkbox-group";

export function Fixture() {
  return <ProCheckboxGroup aria-label="Topics" options={[{ value: "design", label: "Design" }]} />;
}
