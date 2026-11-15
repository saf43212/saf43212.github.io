/**
 * Падежные формы названий города и региона.
 *
 * В настройках админки город и регион хранятся в именительном падеже
 * («Кисловодск», «Кавказские Минеральные Воды»), а в текстах сайта нужны
 * предложный («в Кисловодске», «на Кавказских Минеральных Водах») и
 * родительный («в пределах Кавказских Минеральных Вод») падежи.
 * Склоняем в одном месте, чтобы правка настроек не ломала грамматику.
 */

const CITY_PREPOSITIONAL: Record<string, string> = {
  кисловодск: "Кисловодске",
  пятигорск: "Пятигорске",
  железноводск: "Железноводске",
  ессентуки: "Ессентуках",
  "минеральные воды": "Минеральных Водах",
};

const REGION_PREPOSITIONAL: Record<string, string> = {
  "кавказские минеральные воды": "Кавказских Минеральных Водах",
  "кавказские минеральные воды (кмв)": "Кавказских Минеральных Водах",
  кмв: "Кавказских Минеральных Водах",
};

const REGION_GENITIVE: Record<string, string> = {
  "кавказские минеральные воды": "Кавказских Минеральных Вод",
  "кавказские минеральные воды (кмв)": "Кавказских Минеральных Вод",
  кмв: "Кавказских Минеральных Вод",
};

const norm = (value: string) => value.trim().toLowerCase().replace(/ё/g, "е");

/** «в Кисловодске» — предложный падеж для города. */
export function cityIn(city: string): string {
  const value = city.trim();
  const known = CITY_PREPOSITIONAL[norm(value)];
  if (known) return known;
  if (/(ск|цк)$/i.test(value)) return `${value}е`;
  return value;
}

/** «на Кавказских Минеральных Водах» — предложный падеж для региона. */
export function regionOn(region: string): string {
  const value = region.trim();
  return REGION_PREPOSITIONAL[norm(value)] ?? value;
}

/** «в пределах Кавказских Минеральных Вод» — родительный падеж. */
export function regionOf(region: string): string {
  const value = region.trim();
  return REGION_GENITIVE[norm(value)] ?? value;
}
