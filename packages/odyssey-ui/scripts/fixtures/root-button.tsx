import { Button, OdysseyProvider } from "@odyssey/ui";

export function RootButtonFixture() {
  return (
    <OdysseyProvider>
      <Button>Save</Button>
    </OdysseyProvider>
  );
}
