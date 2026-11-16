/** Русская форма множественного числа: plural(3, ["рендер","рендера","рендеров"]). */
export function plural(n: number, forms: [string, string, string]): string {
  const n100 = n % 100;
  const n10 = n % 10;
  if (n100 >= 11 && n100 <= 14) return forms[2];
  if (n10 === 1) return forms[0];
  if (n10 >= 2 && n10 <= 4) return forms[1];
  return forms[2];
}
