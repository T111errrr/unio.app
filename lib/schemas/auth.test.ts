import { describe, expect, it } from "vitest";
import { fieldErrors, forgotSchema, loginSchema, signupSchema } from "./auth";

describe("skema auth", () => {
  it("menerima data login yang benar", () => {
    expect(loginSchema.safeParse({ email: "jeff@email.com", password: "x" }).success).toBe(true);
  });

  it("menolak email kosong dan format salah", () => {
    const empty = loginSchema.safeParse({ email: "", password: "x" });
    const bad = forgotSchema.safeParse({ email: "bukan-email" });
    expect(empty.success || fieldErrors(empty.error).email).toBe("emailRequired");
    expect(bad.success || fieldErrors(bad.error).email).toBe("emailInvalid");
  });

  it("password daftar minimal 8 karakter, huruf dan angka", () => {
    const base = { name: "Jeff", email: "jeff@email.com" };
    const short = signupSchema.safeParse({ ...base, password: "abc123" });
    const letters = signupSchema.safeParse({ ...base, password: "abcdefghij" });
    const ok = signupSchema.safeParse({ ...base, password: "abcdefg123" });
    expect(short.success || fieldErrors(short.error).password).toBe("passwordShort");
    expect(letters.success || fieldErrors(letters.error).password).toBe("passwordWeak");
    expect(ok.success).toBe(true);
  });

  it("nama wajib diisi", () => {
    const r = signupSchema.safeParse({ name: "  ", email: "jeff@email.com", password: "abcdefg123" });
    expect(r.success || fieldErrors(r.error).name).toBe("nameRequired");
  });
});
