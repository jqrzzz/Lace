export function formatPrice(cents: number): string {
  return `$${cents.toFixed(0)}`;
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
