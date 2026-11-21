import { ProAdminShell } from "@odyssey/ui/patterns/admin-shell";

export const fixture = (
  <ProAdminShell
    appName="Odyssey"
    activeKey="home"
    navigation={[{ key: "home", label: "Home" }]}
    onNavigate={() => undefined}
    user={{ displayName: "Ada", roleLabel: "Admin" }}
    onLogout={() => Promise.resolve()}
  >
    Fixture
  </ProAdminShell>
);
