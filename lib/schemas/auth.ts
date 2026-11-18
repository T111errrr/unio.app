import { z } from "zod";

/** Pesan galat berupa kunci di messages `auth.errors.*` (diterjemahkan di UI). */
const email = z.string().trim().min(1, "emailRequired").email("emailInvalid");
const password = z
  .string()
  .min(8, "passwordShort")
  .regex(/[A-Za-z]/, "passwordWeak")
  .regex(/[0-9]/, "passwordWeak");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "passwordRequired"),
});

export const signupSchema = z.object({
  name: z.string().trim().min(1, "nameRequired").max(60, "nameLong"),
  email,
  password,
});

export const forgotSchema = z.object({ email });

export type FieldErrors = Partial<Record<string, string>>;

/** Ubah hasil zod menjadi { namaKolom: kunciPesan } (galat pertama per kolom). */
export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
