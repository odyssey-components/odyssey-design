import { InputGroup, InputGroupAddon, InputGroupInput } from "@odyssey/ui/input-group";
import { OdysseyProvider } from "@odyssey/ui/provider";

export function InputGroupFixture() {
  return <OdysseyProvider><InputGroup><InputGroupAddon>https://</InputGroupAddon><InputGroupInput /></InputGroup></OdysseyProvider>;
}
