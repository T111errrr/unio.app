import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { BROWSER_THEME_COLOR, DEFAULT_THEME, THEME_STORAGE_KEY, isTheme, themeInitScript } from "./theme";

const tokens = readFileSync(join(__dirname, "..", "styles", "tokens.css"), "utf8");

function tokenValue(block: string, name: string) {
  const match = block.match(new RegExp(`--${name}:\\s*([^;]+);`));
  return match?.[1].trim().toLowerCase();
}

function runInitScript(stored: string | null) {
  const attributes: Record<string, string> = { "data-theme": DEFAULT_THEME };
  const localStorage = { getItem: (key: string) => (key === THEME_STORAGE_KEY ? stored : null) };
  const document = {
    documentElement: { setAttribute: (name: string, value: string) => (attributes[name] = value) },
  };
  new Function("localStorage", "document", themeInitScript)(localStorage, document);
  return attributes["data-theme"];
}

describe("tema", () => {
  it("mengenali nilai tema yang valid", () => {
    expect(isTheme("light")).toBe(true);
    expect(isTheme("dark")).toBe(true);
    expect(isTheme("system")).toBe(true);
    expect(isTheme("sepia")).toBe(false);
    expect(isTheme(null)).toBe(false);
  });

  it("skrip awal memasang tema tersimpan sebelum halaman digambar", () => {
    expect(runInitScript("dark")).toBe("dark");
    expect(runInitScript("light")).toBe("light");
  });

  it("skrip awal mengabaikan nilai kosong atau tidak dikenal", () => {
    expect(runInitScript(null)).toBe(DEFAULT_THEME);
    expect(runInitScript("<script>")).toBe(DEFAULT_THEME);
  });

  it("warna bilah status sama dengan token --unio-background", () => {
    const light = tokens.slice(0, tokens.indexOf('[data-theme="dark"]'));
    const dark = tokens.slice(tokens.indexOf('[data-theme="dark"]'));
    expect(tokenValue(light, "unio-background")).toBe(BROWSER_THEME_COLOR.light);
    expect(tokenValue(dark, "unio-background")).toBe(BROWSER_THEME_COLOR.dark);
  });
});
