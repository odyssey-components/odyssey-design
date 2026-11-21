import { Button } from "@odyssey/ui/button";
import { OdysseyProvider } from "@odyssey/ui/provider";
import { Toaster, useToast } from "@odyssey/ui/toast";

function Trigger() { const toast = useToast(); return <Button onClick={() => toast.show({ title: "Saved" })}>Show</Button>; }
export function ToastFixture() { return <OdysseyProvider><Toaster><Trigger /></Toaster></OdysseyProvider>; }
