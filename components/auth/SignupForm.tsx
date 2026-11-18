"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Link, useRouter } from "@/i18n/navigation";
import { fieldErrors, signupSchema, type FieldErrors } from "@/lib/schemas/auth";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { CheckEmailNotice } from "./CheckEmailNotice";

export function SignupForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const parsed = signupSchema.safeParse({
      name: data.get("name"),
      email: data.get("email"),
      password: data.get("password"),
    });
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
    const { name, email, password } = parsed.data;
    const { data: result, error } = await createClient().auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    setLoading(false);
    if (error) {
      setErrors({ email: error.code === "user_already_exists" ? "emailTaken" : "network" });
      return;
    }
    // Supabase tidak melapor galat untuk email yang sudah ada; ciri-cirinya: daftar identitas kosong.
    if (result.user && result.user.identities?.length === 0) {
      setErrors({ email: "emailTaken" });
      return;
    }
    if (!result.session) {
      setConfirmEmail(email); // Konfirmasi email aktif di Supabase: minta pengguna cek email.
      return;
    }
    router.replace("/today");
    router.refresh();
  }

  if (confirmEmail) return <CheckEmailNotice email={confirmEmail} kind="confirm" />;

  const emailError = errors.email ? t(`errors.${errors.email}`) : undefined;
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <TextField
        name="name"
        autoComplete="name"
        label={t("name")}
        placeholder="Jeff"
        error={errors.name ? t(`errors.${errors.name}`) : undefined}
      />
      <TextField
        name="email"
        type="email"
        autoComplete="email"
        label={t("email")}
        placeholder="jeff@email.com"
        error={emailError}
      />
      {errors.email === "emailTaken" && (
        <Link href="/login" className="t-subheadline-em relative -mt-2 self-start before:absolute before:-inset-3 before:content-['']">
          {t("signIn")}
        </Link>
      )}
      <TextField
        name="password"
        type="password"
        autoComplete="new-password"
        label={t("password")}
        placeholder={t("passwordPlaceholder")}
        helper={t("passwordHint")}
        error={errors.password ? t(`errors.${errors.password}`) : undefined}
      />
      <Button type="submit" disabled={loading}>
        {loading ? t("checking") : t("signUp")}
      </Button>
    </form>
  );
}
