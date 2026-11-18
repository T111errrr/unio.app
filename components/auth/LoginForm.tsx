"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Link, useRouter } from "@/i18n/navigation";
import { fieldErrors, loginSchema, type FieldErrors } from "@/lib/schemas/auth";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse({ email: data.get("email"), password: data.get("password") });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setFormError(null);
    if (!hasSupabaseEnv()) {
      setFormError("notConfigured");
      return;
    }
    setLoading(true);
    const { error } = await createClient().auth.signInWithPassword(parsed.data);
    if (error) {
      setLoading(false);
      setFormError(error.status && error.status >= 500 ? "network" : "invalidLogin");
      return;
    }
    router.replace("/today");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <TextField
        name="email"
        type="email"
        autoComplete="email"
        label={t("email")}
        placeholder="jeff@email.com"
        error={errors.email ? t(`errors.${errors.email}`) : undefined}
      />
      <TextField
        name="password"
        type="password"
        autoComplete="current-password"
        label={t("password")}
        placeholder="••••••••••"
        error={errors.password ? t(`errors.${errors.password}`) : formError ? t(`errors.${formError}`) : undefined}
      />
      <Link href="/forgot-password" className="t-subheadline relative self-start text-ink-secondary before:absolute before:-inset-3 before:content-['']">
        {t("forgotPassword")}
      </Link>
      <Button type="submit" disabled={loading}>
        {loading ? t("checking") : t("signIn")}
      </Button>
    </form>
  );
}
