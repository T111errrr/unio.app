import { describe, expect, it } from "vitest";
import { formatRupiah } from "./rupiah";

describe("formatRupiah", () => {
  it("memberi pemisah ribuan titik", () => {
    expect(formatRupiah(1650000)).toBe("Rp1.650.000");
  });
  it("menangani nol dan negatif", () => {
    expect(formatRupiah(0)).toBe("Rp0");
    expect(formatRupiah(-275000)).toBe("-Rp275.000");
  });
  it("menolak angka pecahan", () => {
    expect(() => formatRupiah(10.5)).toThrow();
  });
});
