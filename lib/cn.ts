type ClassValue = string | false | null | undefined | 0;

/** Une clases condicionales: cn("a", cond && "b") */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
