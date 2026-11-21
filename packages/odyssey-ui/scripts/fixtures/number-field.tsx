import { NumberField, NumberFieldDecrement, NumberFieldGroup, NumberFieldIncrement, NumberFieldInput } from "@odyssey/ui/number-field";
import { createRoot } from "react-dom/client";

createRoot(document.body).render(<NumberField defaultValue={1}><NumberFieldGroup><NumberFieldInput aria-label="Amount" /><NumberFieldIncrement /><NumberFieldDecrement /></NumberFieldGroup></NumberField>);
