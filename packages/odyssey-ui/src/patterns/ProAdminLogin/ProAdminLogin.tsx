import { Alert, AlertDescription } from "@odyssey/ui/primitives/alert";
import { Button } from "@odyssey/ui/primitives/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@odyssey/ui/primitives/card";
import { Field, FieldLabel } from "@odyssey/ui/primitives/field";
import { Input } from "@odyssey/ui/primitives/input";
import { OtpGroup, OtpInput, OtpSlot, REGEXP_ONLY_DIGITS } from "@odyssey/ui/primitives/otp-input";
import { type FormEvent, forwardRef, type HTMLAttributes, type ReactNode, useId, useState } from "react";
import { useProLocale } from "../locale";
import { defineProSemanticParts, mergeClassNames, mergeStyles, type ProSemanticClassNames, type ProSemanticStyles, semanticPartProps } from "../semantic-parts";
import { styles as anatomy } from "./ProAdminLogin.classes";

export type ProAdminLoginPhase = "credentials" | "totp" | "password-change";

export interface ProAdminLoginValue {
  username: string;
  password: string;
  totpCode?: string;
  newPassword?: string;
}

export const proAdminLoginParts = defineProSemanticParts({
  root: "pro-admin-login",
  card: "pro-admin-login-card",
  header: "pro-admin-login-header",
  title: "pro-admin-login-title",
  description: "pro-admin-login-description",
  form: "pro-admin-login-form",
  field: "pro-admin-login-field",
  error: "pro-admin-login-error",
  notice: "pro-admin-login-notice",
  actions: "pro-admin-login-actions",
  submit: "pro-admin-login-submit",
  back: "pro-admin-login-back",
} as const);
export type ProAdminLoginPart = keyof typeof proAdminLoginParts;
export type ProAdminLoginClassNames = ProSemanticClassNames<ProAdminLoginPart>;
export type ProAdminLoginStyles = ProSemanticStyles<ProAdminLoginPart>;
export interface ProAdminLoginSlots {
  actions?: (actions: ReactNode) => ReactNode;
  description?: (description: ReactNode) => ReactNode;
  title?: (title: ReactNode) => ReactNode;
}

export interface ProAdminLoginProps extends Omit<HTMLAttributes<HTMLElement>, "onSubmit"> {
  appName: string;
  description?: string;
  phase?: ProAdminLoginPhase;
  defaultUsername?: string;
  busy?: boolean;
  error?: string;
  notice?: ReactNode;
  onSubmit: (value: ProAdminLoginValue) => void | Promise<void>;
  onBack?: () => void;
  classNames?: ProAdminLoginClassNames;
  slots?: ProAdminLoginSlots;
  styles?: ProAdminLoginStyles;
}

export const ProAdminLogin = forwardRef<HTMLElement, ProAdminLoginProps>(function ProAdminLogin(
  {
    appName,
    description,
    phase = "credentials",
    defaultUsername = "",
    busy = false,
    error,
    notice,
    onSubmit,
    onBack,
    className,
    classNames,
    slots,
    style,
    styles,
    ...props
  },
  ref,
) {
  const locale = useProLocale();
  const [username, setUsername] = useState(defaultUsername);
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [validationError, setValidationError] = useState("");
  const totpId = useId();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (phase === "password-change" && newPassword !== confirmation) {
      setValidationError(locale.adminLogin.passwordMismatch);
      return;
    }
    setValidationError("");
    void onSubmit({ username: username.trim(), password, totpCode: totpCode.trim(), newPassword });
  };

  const actions = (
    <>
      <Button
        {...semanticPartProps("submit", classNames, styles)}
        data-od-slot="pro-admin-login-submit"
        type="submit"
        variant="solid"
        tone="accent"
        loading={busy}
      >
        {phase === "credentials" ? locale.adminLogin.login : phase === "totp" ? locale.adminLogin.verify : locale.adminLogin.updatePassword}
      </Button>
      {phase !== "credentials" && onBack && (
        <Button {...semanticPartProps("back", classNames, styles)} data-od-slot="pro-admin-login-back" type="button" onClick={onBack}>
          {locale.adminLogin.back}
        </Button>
      )}
    </>
  );

  return (
    <main
      {...props}
      ref={ref}
      className={mergeClassNames(anatomy.page, classNames?.root, className)}
      style={mergeStyles(styles?.root, style)}
      data-od-slot="pro-admin-login"
    >
      <Card className={mergeClassNames(anatomy.card, classNames?.card)} style={styles?.card} data-od-slot="pro-admin-login-card">
        <CardHeader {...semanticPartProps("header", classNames, styles)} data-od-slot="pro-admin-login-header">
          <CardTitle {...semanticPartProps("title", classNames, styles)} data-od-slot="pro-admin-login-title">
            {slots?.title?.(appName) ?? appName}
          </CardTitle>
          <CardDescription {...semanticPartProps("description", classNames, styles)} data-od-slot="pro-admin-login-description">
            {slots?.description?.(description ?? locale.adminLogin.description) ?? description ?? locale.adminLogin.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className={mergeClassNames(anatomy.form, classNames?.form)} style={styles?.form} data-od-slot="pro-admin-login-form" onSubmit={submit}>
            {(error || validationError) && (
              <Alert {...semanticPartProps("error", classNames, styles)} tone="danger" data-od-slot="pro-admin-login-error">
                <AlertDescription>{error || validationError}</AlertDescription>
              </Alert>
            )}
            {notice && (
              <Alert {...semanticPartProps("notice", classNames, styles)} tone="info" data-od-slot="pro-admin-login-notice">
                <AlertDescription>{notice}</AlertDescription>
              </Alert>
            )}
            {phase === "credentials" && (
              <>
                <Field {...semanticPartProps("field", classNames, styles)} data-od-slot="pro-admin-login-field">
                  <FieldLabel>{locale.adminLogin.username}</FieldLabel>
                  <Input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required autoFocus />
                </Field>
                <Field {...semanticPartProps("field", classNames, styles)} data-od-slot="pro-admin-login-field">
                  <FieldLabel>{locale.adminLogin.password}</FieldLabel>
                  <Input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                </Field>
              </>
            )}
            {phase === "totp" && (
              <Field {...semanticPartProps("field", classNames, styles)} data-od-slot="pro-admin-login-field">
                <FieldLabel htmlFor={totpId}>{locale.adminLogin.verificationCode}</FieldLabel>
                <OtpInput
                  id={totpId}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  pattern={REGEXP_ONLY_DIGITS}
                  maxLength={6}
                  value={totpCode}
                  onChange={(value) => setTotpCode(value.replace(/\D/g, ""))}
                  required
                  autoFocus
                >
                  <OtpGroup>
                    {["one", "two", "three", "four", "five", "six"].map((key, index) => (
                      <OtpSlot key={key} index={index} />
                    ))}
                  </OtpGroup>
                </OtpInput>
              </Field>
            )}
            {phase === "password-change" && (
              <>
                <Field {...semanticPartProps("field", classNames, styles)} data-od-slot="pro-admin-login-field">
                  <FieldLabel>{locale.adminLogin.newPassword}</FieldLabel>
                  <Input
                    autoComplete="new-password"
                    type="password"
                    minLength={12}
                    maxLength={128}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    required
                    autoFocus
                  />
                </Field>
                <Field {...semanticPartProps("field", classNames, styles)} data-od-slot="pro-admin-login-field">
                  <FieldLabel>{locale.adminLogin.confirmPassword}</FieldLabel>
                  <Input
                    autoComplete="new-password"
                    type="password"
                    minLength={12}
                    maxLength={128}
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                    required
                  />
                </Field>
              </>
            )}
            <div className={mergeClassNames(anatomy.actions, classNames?.actions)} style={styles?.actions} data-od-slot="pro-admin-login-actions">
              {slots?.actions?.(actions) ?? actions}
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
});
