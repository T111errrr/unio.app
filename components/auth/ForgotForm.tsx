"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { fieldErrors, forgotSchema, type FieldErrors } from "@/lib/schemas/auth";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { CheckEmailNotice } from "./CheckEmailNotice";

export function ForgotForm() {
  const t = useTranslations("auth");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = forgotSchema.safeParse({ email: new FormData(event.currentTarget).get("email") });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    if (!hasSupabaseEnv()) {
      setErrors({ email: "notConfigured" });
      return;
    }
    setErrors({});
    setLoading(true);
    const { error } = await createClient().auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/settings`,
    });
    setLoading(false);
    // Tampilkan "terkirim" juga bila email tidak terdaftar (jangan bocorkan siapa yang punya akun).
    if (error && error.status !== undefined && error.status >= 500) {
      setErrors({ email: "network" });
      return;
    }
    setSentTo(parsed.data.email);
  }

  if (sentTo) return <CheckEmailNotice email={sentTo} kind="reset" />;

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
      <Button type="submit" disabled={loading}>
        {loading ? t("checking") : t("sendLink")}
      </Button>
    </form>
  );
}
