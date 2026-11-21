import { ProAdminLogin } from "@odyssey/pro/admin-login";
import { ProAdminProvider } from "@odyssey/pro/admin-provider";
import { ProAdminShell } from "@odyssey/pro/admin-shell";
import { ProAdminThemeMenu } from "@odyssey/pro/admin-theme-menu";
import { ProAdminUserMenu } from "@odyssey/pro/admin-user-menu";
import { ProConfirm } from "@odyssey/pro/confirm";
import { ProForm } from "@odyssey/pro/form";
import { ProIconPicker } from "@odyssey/pro/icon-picker";
import { ProNumberField } from "@odyssey/pro/number-field";
import { ProOtpField } from "@odyssey/pro/otp-field";
import { ProPageState } from "@odyssey/pro/page-state";
import { ProSelect } from "@odyssey/pro/select";
import { ProTable } from "@odyssey/pro/table";

describe("UI Pro package exports", () => {
  it("resolves every public component subpath", () => {
    expect(
      [
        ProAdminProvider,
        ProAdminShell,
        ProAdminThemeMenu,
        ProAdminUserMenu,
        ProAdminLogin,
        ProSelect,
        ProConfirm,
        ProTable,
        ProForm,
        ProPageState,
        ProIconPicker,
        ProNumberField,
        ProOtpField,
      ].every((component) => typeof component === "function" || typeof component === "object"),
    ).toBe(true);
  });
});
