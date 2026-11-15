/**
 * Расширение калькулятора под бриф лендинга.
 *
 * Базовую математику (площадь × ставка × коэффициент помещения) считает
 * lib/calculator.ts — её не трогаем, на ней висят тесты и админка.
 *
 * Здесь только то, чего в базовой модели не было:
 *   - тип объекта (квартира / дом / коммерция);
 *   - расширенный набор помещений (вся квартира, комната, несколько помещений);
 *   - дополнительные работы (электрика, сантехника, плитка, стяжка, демонтаж…).
 *
 * ВАЖНО: доп. работы НЕ умножают ставку на выдуманный коэффициент. Они
 * добавляют к диапазону отдельную строку «оценка доп. работ», рассчитанную
 * как доля от базовой стоимости. Доли — прозрачные и перечислены в
 * ADDON_SHARE, чтобы их можно было объяснить пользователю и поправить.
 */

import type { WorkType } from "./calculator";

/* ------------------------------------------------------------------ */
/* Тип объекта                                                         */
/* ------------------------------------------------------------------ */

export type ObjectType = "flat" | "house" | "commercial";

export const OBJECT_TYPES: {
  value: ObjectType;
  label: string;
  hint: string;
}[] = [
  { value: "flat", label: "Квартира", hint: "Жилое помещение в многоквартирном доме" },
  { value: "house", label: "Частный дом", hint: "Отдельно стоящий дом или коттедж" },
  {
    value: "commercial",
    label: "Коммерческое",
    hint: "Офис, салон, помещение под аренду",
  },
];

/**
 * Надбавка к ставке за тип объекта.
 * Коммерция дороже из-за требований к инженерии и срокам.
 */
export const OBJECT_FACTOR: Record<ObjectType, number> = {
  flat: 1,
  house: 1.08,
  commercial: 1.15,
};

/* ------------------------------------------------------------------ */
/* Тип помещения (расширенный)                                         */
/* ------------------------------------------------------------------ */

export type RoomScope =
  | "whole-flat"
  | "room"
  | "kitchen"
  | "bathroom"
  | "several"
  | "house";

export const ROOM_SCOPES: {
  value: RoomScope;
  label: string;
  hint: string;
}[] = [
  { value: "whole-flat", label: "Вся квартира", hint: "Все помещения целиком" },
  { value: "room", label: "Комната", hint: "Одна жилая комната" },
  { value: "kitchen", label: "Кухня", hint: "Кухня или кухня-гостиная" },
  { value: "bathroom", label: "Ванная", hint: "Санузел или ванная комната" },
  { value: "several", label: "Несколько помещений", hint: "Часть квартиры" },
  { value: "house", label: "Дом", hint: "Частный дом целиком" },
];

/**
 * Коэффициент по помещению. Совпадает по смыслу с ROOM_TYPES из
 * lib/calculator.ts, но покрывает больше вариантов.
 */
export const SCOPE_FACTOR: Record<RoomScope, number> = {
  "whole-flat": 1,
  room: 1.05,
  kitchen: 1.2,
  bathroom: 1.35,
  several: 1.05,
  house: 1.1,
};

/* ------------------------------------------------------------------ */
/* Дополнительные работы                                               */
/* ------------------------------------------------------------------ */

export type AddonKey =
  | "electric"
  | "plumbing"
  | "tile"
  | "walls"
  | "screed"
  | "demolition"
  | "ceiling";

export const ADDONS: {
  key: AddonKey;
  label: string;
  hint: string;
  /** Доля от базовой стоимости работ, 0–1 */
  share: number;
}[] = [
  {
    key: "electric",
    label: "Электрика",
    hint: "Замена проводки, щиток, розетки",
    share: 0.09,
  },
  {
    key: "plumbing",
    label: "Сантехника",
    hint: "Разводка труб, приборы, стояки",
    share: 0.08,
  },
  {
    key: "tile",
    label: "Плиточные работы",
    hint: "Укладка плитки, керамогранита",
    share: 0.1,
  },
  {
    key: "walls",
    label: "Выравнивание стен",
    hint: "Штукатурка по маякам, шпаклёвка",
    share: 0.07,
  },
  {
    key: "screed",
    label: "Стяжка пола",
    hint: "Полусухая или наливная стяжка",
    share: 0.06,
  },
  {
    key: "demolition",
    label: "Демонтаж",
    hint: "Снос перегородок, вывоз мусора",
    share: 0.05,
  },
  {
    key: "ceiling",
    label: "Потолки",
    hint: "Натяжные или гипсокартон",
    share: 0.05,
  },
];

export const ADDON_SHARE: Record<AddonKey, number> = Object.fromEntries(
  ADDONS.map((a) => [a.key, a.share])
) as Record<AddonKey, number>;

export function isAddonKey(value: unknown): value is AddonKey {
  return typeof value === "string" && value in ADDON_SHARE;
}

export function isObjectType(value: unknown): value is ObjectType {
  return value === "flat" || value === "house" || value === "commercial";
}

export function isRoomScope(value: unknown): value is RoomScope {
  return (
    value === "whole-flat" ||
    value === "room" ||
    value === "kitchen" ||
    value === "bathroom" ||
    value === "several" ||
    value === "house"
  );
}

/* ------------------------------------------------------------------ */
/* Расчёт                                                              */
/* ------------------------------------------------------------------ */

export type FullCalcInput = {
  objectType: ObjectType;
  workType: WorkType;
  scope: RoomScope;
  area: number;
  addons: AddonKey[];
};

export type FullCalcResult = {
  /** Базовая стоимость работ (без допов), диапазон */
  baseMin: number;
  baseMax: number;
  /** Оценка доп. работ, диапазон */
  addonMin: number;
  addonMax: number;
  /** Итог, диапазон */
  totalMin: number;
  totalMax: number;
  /** Ставка ₽/м² с учётом типа объекта и помещения */
  ratePerM2: number;
  /** Сколько процентов даёт каждый доп. блок */
  addonSharePct: number;
};

function roundTo(n: number, step = 1000): number {
  return Math.round(n / step) * step;
}

/**
 * Считает полный диапазон. Базой служит существующая формула
 * (площадь × ставка ×±15%), к ней добавляется надбавка за тип объекта
 * и за выбранные доп. работы.
 */
export function calculateFull(
  input: FullCalcInput,
  rates: Record<WorkType, number>
): FullCalcResult {
  const area = Math.max(0, Number.isFinite(input.area) ? input.area : 0);
  const baseRate = rates[input.workType] ?? 0;
  const objectFactor = OBJECT_FACTOR[input.objectType] ?? 1;
  const scopeFactor = SCOPE_FACTOR[input.scope] ?? 1;

  const ratePerM2 = baseRate * objectFactor * scopeFactor;
  const base = area * ratePerM2;

  const baseMin = roundTo(base * 0.85);
  const baseMax = roundTo(base * 1.15);

  const addonSharePct = input.addons.reduce(
    (sum, key) => sum + (ADDON_SHARE[key] ?? 0),
    0
  );

  const addonMin = roundTo(base * addonSharePct * 0.85);
  const addonMax = roundTo(base * addonSharePct * 1.15);

  return {
    baseMin,
    baseMax,
    addonMin,
    addonMax,
    totalMin: baseMin + addonMin,
    totalMax: baseMax + addonMax,
    ratePerM2: Math.round(ratePerM2),
    addonSharePct: Math.round(addonSharePct * 100),
  };
}
