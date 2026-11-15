/**
 * Тесты калькулятора: арифметика, округление, коэффициенты, границы.
 * Запуск: node --test tests/
 */
import test from "node:test";
import assert from "node:assert/strict";

import {
  calculate,
  formatMoney,
  isRoomType,
  isWorkType,
  ratesFromSettings,
  roomFactor,
  DEFAULT_RATES,
  ROOM_TYPES,
  WORK_TYPES,
} from "../lib/calculator.ts";

test("calculate: диапазон симметричен вокруг ставки ±15%", () => {
  const result = calculate({ workType: "capital", roomType: "flat", area: 100 });
  assert.equal(result.ratePerM2, 9500);
  assert.equal(result.min, 808000); // 100 * 9500 * 0.85 = 807500 → 808000
  assert.equal(result.max, 1093000); // 100 * 9500 * 1.15 = 1092500 → 1093000
});

test("calculate: коэффициент ванной увеличивает ставку", () => {
  const flat = calculate({ workType: "cosmetic", roomType: "flat", area: 10 });
  const bath = calculate({ workType: "cosmetic", roomType: "bathroom", area: 10 });
  assert.equal(flat.ratePerM2, 4500);
  assert.equal(bath.ratePerM2, 6075); // 4500 * 1.35
  assert.ok(bath.min > flat.min);
});

test("calculate: нулевая площадь даёт нулевой диапазон", () => {
  const result = calculate({ workType: "capital", roomType: "flat", area: 0 });
  assert.equal(result.min, 0);
  assert.equal(result.max, 0);
});

test("calculate: отрицательная площадь не уходит в минус", () => {
  const result = calculate({ workType: "capital", roomType: "flat", area: -50 });
  assert.equal(result.min, 0);
  assert.equal(result.max, 0);
});

test("calculate: ставки из настроек подменяют дефолт", () => {
  const result = calculate(
    { workType: "capital", roomType: "flat", area: 100 },
    { ...DEFAULT_RATES, capital: 10000 }
  );
  assert.equal(result.ratePerM2, 10000);
  assert.equal(result.min, 850000);
});

test("calculate: label содержит оба конца диапазона", () => {
  const result = calculate({ workType: "capital", roomType: "flat", area: 100 });
  assert.match(result.label, /^[\d\s]+ ₽ — [\d\s]+ ₽$/);
});

test("formatMoney: разделитель тысяч и знак рубля", () => {
  // ru-RU разделяет разряды неразрывным пробелом (U+00A0), а не обычным.
  const nbsp = "\u00a0";
  assert.equal(formatMoney(1234567), `1${nbsp}234${nbsp}567 ₽`);
  assert.equal(formatMoney(0), "0 ₽");
  // Знак рубля отделён обычным пробелом.
  assert.ok(formatMoney(1000).endsWith(" ₽"));
});

test("roomFactor: все типы помещений имеют коэффициент", () => {
  for (const room of ROOM_TYPES) {
    assert.ok(roomFactor(room.value) > 0);
  }
  assert.equal(roomFactor("flat"), 1);
  assert.equal(roomFactor("bathroom"), 1.35);
});

test("isWorkType / isRoomType: отсекают мусор", () => {
  assert.ok(isWorkType("cosmetic"));
  assert.ok(isWorkType("capital"));
  assert.ok(isWorkType("designer"));
  assert.ok(!isWorkType("free"));
  assert.ok(!isWorkType(null));

  assert.ok(isRoomType("flat"));
  assert.ok(isRoomType("bathroom"));
  assert.ok(!isRoomType("garage"));
  assert.ok(!isRoomType(undefined));
});

test("ratesFromSettings: пустые и мусорные значения дают дефолт", () => {
  const rates = ratesFromSettings({
    calc_cosmetic: "",
    calc_capital: "abc",
    calc_designer: "-5",
  });
  assert.deepEqual(rates, DEFAULT_RATES);
});

test("ratesFromSettings: корректные значения читаются", () => {
  const rates = ratesFromSettings({
    calc_cosmetic: "5000",
    calc_capital: "10000",
    calc_designer: "15000",
  });
  assert.deepEqual(rates, { cosmetic: 5000, capital: 10000, designer: 15000 });
});

test("WORK_TYPES: у каждого варианта есть подпись и подсказка", () => {
  for (const w of WORK_TYPES) {
    assert.ok(w.label.length > 0);
    assert.ok(w.hint.length > 0);
  }
});
