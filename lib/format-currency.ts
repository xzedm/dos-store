/** Kazakhstani tenge (₸) for storefront and admin. */
export function formatTenge(
  amount: number | string | null | undefined
): string {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";
  // Use a consistent formatting to avoid hydration mismatches
  const formatted = new Intl.NumberFormat("kk-KZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
  return `${formatted} ₸`;
}
