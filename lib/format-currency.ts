/** Kazakhstani tenge (₸) for storefront and admin. */
export function formatTenge(
  amount: number | string | null | undefined
): string {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "—";

  // Intl can differ between server/client runtimes and cause hydration mismatch.
  // Keep this formatter fully deterministic.
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  const fixed = abs.toFixed(2);
  const [intRaw, fracRaw] = fixed.split(".");
  const intPart = intRaw.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const fracPart = fracRaw === "00" ? "" : `.${fracRaw.replace(/0+$/, "")}`;
  const formatted = `${sign}${intPart}${fracPart}`;

  return `${formatted} ₸`;
}
