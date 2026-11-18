import { describe, expect, it } from "vitest";
import { guessExpenseCategory, parseCapture } from "./parse";

describe("parseCapture", () => {
  it("membaca rb / ribu / k", () => {
    expect(parseCapture("kopi 25rb")).toEqual({ amount: 25000, note: "kopi" });
    expect(parseCapture("makan 12 ribu").amount).toBe(12000);
    expect(parseCapture("parkir 5k").amount).toBe(5000);
  });
  it("membaca juta dengan desimal", () => {
    expect(parseCapture("gaji 4,5jt").amount).toBe(4_500_000);
    expect(parseCapture("bonus 2jt").amount).toBe(2_000_000);
  });
  it("membaca angka dengan titik ribuan", () => {
    expect(parseCapture("beli sesuatu di indomaret 48.000")).toEqual({ amount: 48000, note: "beli sesuatu di indomaret" });
  });
  it("tanpa angka", () => {
    expect(parseCapture("kopi susu").amount).toBeNull();
  });
  it("menebak kategori", () => {
    expect(guessExpenseCategory("kopi susu")).toBe("coffee");
    expect(guessExpenseCategory("xyz")).toBeNull();
  });
});
