import { Button } from "@odyssey/ui/button";
import { OdysseyProvider } from "@odyssey/ui/provider";

export function ButtonFixture() {
  return <OdysseyProvider><Button>Save</Button></OdysseyProvider>;
}
