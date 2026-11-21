import { Combobox, ComboboxContent, ComboboxInput, ComboboxItem, ComboboxList, ComboboxPortal, ComboboxPositioner } from "@odyssey/ui/combobox";
import { OdysseyProvider } from "@odyssey/ui/provider";

export function ComboboxFixture() {
  return <OdysseyProvider><Combobox items={["One"]}><ComboboxInput /><ComboboxPortal><ComboboxPositioner><ComboboxContent><ComboboxList><ComboboxItem value="One">One</ComboboxItem></ComboboxList></ComboboxContent></ComboboxPositioner></ComboboxPortal></Combobox></OdysseyProvider>;
}
