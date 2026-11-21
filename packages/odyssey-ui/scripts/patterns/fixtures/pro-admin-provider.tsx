import { ProAdminProvider } from "@odyssey/ui/patterns/admin-provider";

export const fixture = (
  <ProAdminProvider appearance={{ storageKey: "fixture:appearance" }}>
    <div>Fixture</div>
  </ProAdminProvider>
);
