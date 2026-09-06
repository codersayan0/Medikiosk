type ClassValue = string | number | bigint | false | null | undefined;

/** Joins truthy class names together. A tiny dependency-free stand-in for clsx. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
