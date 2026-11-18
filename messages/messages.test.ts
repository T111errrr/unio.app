import { describe, expect, it } from "vitest";
import id from "./id.json";
import en from "./en.json";

function flatten(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object") Object.assign(out, flatten(value as Record<string, unknown>, path));
    else out[path] = String(value);
  }
  return out;
}

const placeholders = (text: string) => (text.match(/\{[^}]+\}/g) ?? []).sort();

describe("terjemahan", () => {
  const a = flatten(id);
  const b = flatten(en);

  it("ID dan EN punya kunci yang sama persis", () => {
    expect(Object.keys(a).sort()).toEqual(Object.keys(b).sort());
  });

  it("tidak ada teks kosong", () => {
    for (const [key, value] of [...Object.entries(a), ...Object.entries(b)]) {
      expect(value.trim(), key).not.toBe("");
    }
  });

  it("placeholder {…} sama di kedua bahasa", () => {
    for (const key of Object.keys(a)) {
      expect(placeholders(b[key] ?? ""), key).toEqual(placeholders(a[key] ?? ""));
    }
  });
});
