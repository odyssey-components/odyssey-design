import { Button } from "@odyssey/ui/button";
import { OdysseyProvider } from "@odyssey/ui/provider";
import { Select, SelectContent, SelectItem, SelectList, SelectPortal, SelectPositioner, SelectTrigger, SelectValue } from "@odyssey/ui/select";

export function ButtonSelectFixture() {
  return <OdysseyProvider><Button>Save</Button><Select><SelectTrigger><SelectValue /></SelectTrigger><SelectPortal><SelectPositioner><SelectContent><SelectList><SelectItem value="one">One</SelectItem></SelectList></SelectContent></SelectPositioner></SelectPortal></Select></OdysseyProvider>;
}
