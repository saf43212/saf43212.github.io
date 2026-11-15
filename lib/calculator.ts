/**
 * Калькулятор предварительной стоимости ремонта.
 *
 * Считает ДИАПАЗОН, а не точную цену: точная стоимость — только по смете
 * после замера. Ставки (₽/м²) редактируются в админке (таблица
 * calculator_rates) и кэшируются в settings как calc_*.
 *
 * Формула: площадь × ставка × коэффициент типа помещения.
 * Все ставки — ПРЕДПОЛОЖЕНИЯ (data-assumed), пока заказчик не подтвердит.
 */

export type WorkType = "cosmetic" | "capital" | "designer";

export type RoomType = "flat" | "house" | "bathroom" | "kitchen";

export type CalculatorInput = {
  workType: WorkType;
  roomType: RoomType;
  area: number;
};

export type CalculatorResult = {
  /** Минимум диапазона, ₽ */
  min: number;
  /** Максимум диапазона, ₽ */
  max: number;
  /** Ставка за м², ₽ */
  ratePerM2: number;
  /** Коэффициент типа помещения */
  roomFactor: number;
  /** Подпись диапазона для интерфейса */
  label: string;
};

export const WORK_TYPES: { value: WorkType; label: string; hint: string }[] = [
  {
    value: "cosmetic",
    label: "Косметический",
    hint: "Стены, потолки, полы, двери — без перепланировки",
  },
  {
    value: "capital",
    label: "Капитальный",
    hint: "Демонтаж, инженерия, стяжка, штукатурка, отделка",
  },
  {
    value: "designer",
    label: "Дизайнерский",
    hint: "Сложные решения, авторский надзор, премиальные материалы",
  },
];

export const ROOM_TYPES: { value: RoomType; label: string; factor: number }[] = [
  { value: "flat", label: "Квартира", factor: 1 },
  { value: "house", label: "Дом", factor: 1.1 },
  { value: "bathroom", label: "Ванная и санузел", factor: 1.35 },
  { value: "kitchen", label: "Кухня", factor: 1.2 },
];

/** Дефолтные ставки ₽/м² — предположения, редактируются в админке. */
export const DEFAULT_RATES: Record<WorkType, number> = {
  cosmetic: 4500,
  capital: 9500,
  designer: 14000,
};

/** Разброс диапазона: ±15% от средней ставки. */
const SPREAD = 0.15;

export function roomFactor(roomType: RoomType): number {
  return ROOM_TYPES.find((r) => r.value === roomType)?.factor ?? 1;
}

export function isWorkType(value: unknown): value is WorkType {
  return value === "cosmetic" || value === "capital" || value === "designer";
}

export function isRoomType(value: unknown): value is RoomType {
  return (
    value === "flat" ||
    value === "house" ||
    value === "bathroom" ||
    value === "kitchen"
  );
}

/** Округление до 1000 ₽ — честнее, чем «до рубля». */
function roundTo(n: number, step = 1000): number {
  return Math.round(n / step) * step;
}

export function calculate(
  input: CalculatorInput,
  rates: Record<WorkType, number> = DEFAULT_RATES
): CalculatorResult {
  const base = rates[input.workType] ?? DEFAULT_RATES[input.workType];
  const factor = roomFactor(input.roomType);
  const ratePerM2 = base * factor;
  const area = Math.max(0, input.area);

  const min = roundTo(area * ratePerM2 * (1 - SPREAD));
  const max = roundTo(area * ratePerM2 * (1 + SPREAD));

  return {
    min,
    max,
    ratePerM2: Math.round(ratePerM2),
    roomFactor: factor,
    label: `${formatMoney(min)} — ${formatMoney(max)}`,
  };
}

/** 1234567 → «1 234 567 ₽» */
export function formatMoney(value: number): string {
  return `${Math.round(value).toLocaleString("ru-RU")} ₽`;
}

/** Разбор ставок из настроек (ключи calc_cosmetic и т.п.). */
export function ratesFromSettings(
  settings: Record<string, string>
): Record<WorkType, number> {
  const pick = (key: string, fallback: number) => {
    const n = Number(settings[key]);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };
  return {
    cosmetic: pick("calc_cosmetic", DEFAULT_RATES.cosmetic),
    capital: pick("calc_capital", DEFAULT_RATES.capital),
    designer: pick("calc_designer", DEFAULT_RATES.designer),
  };
}
