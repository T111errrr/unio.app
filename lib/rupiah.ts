/** Format bilangan bulat rupiah, mis. 1650000 -> "Rp1.650.000". */
export function formatRupiah(amount: number): string {
  if (!Number.isInteger(amount)) {
    throw new Error("Rupiah harus bilangan bulat");
  }
  const sign = amount < 0 ? "-" : "";
  const digits = new Intl.NumberFormat("id-ID").format(Math.abs(amount));
  return `${sign}Rp${digits}`;
}
