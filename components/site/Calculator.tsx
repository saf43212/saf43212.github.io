"use client";

/**
 * Калькулятор ремонта — все шаги на одном экране.
 *
 * Математика базовая из lib/calculator.ts (площадь × ставка × коэффициент),
 * расширения — lib/calc-extra.ts. Ставки приходят из настроек (settings),
 * поэтому в админке их можно менять без правки кода.
 *
 * Результат пересчитывается мгновенно, без перезагрузки. Кнопка
 * «Получить точный расчёт» открывает форму с уже заполненным расчётом.
 */
import { useCallback, useMemo, useState } from "react";
import { formatMoney, type WorkType } from "@/lib/calculator";
import {
  ADDONS,
  OBJECT_TYPES,
  ROOM_SCOPES,
  calculateFull,
  type AddonKey,
  type ObjectType,
  type RoomScope,
} from "@/lib/calc-extra";

type Props = {
  rates: Record<WorkType, number>;
  /** Режим «ставки не настроены» — показываем честное предупреждение */
  ratesMissing?: boolean;
};

const WORK_LABELS: Record<WorkType, string> = {
  cosmetic: "Косметический",
  capital: "Капитальный",
  designer: "Под ключ",
};

const WORK_HINTS: Record<WorkType, string> = {
  cosmetic: "Стены, потолки, полы, двери",
  capital: "Демонтаж, инженерия, стяжка, отделка",
  designer: "Сложные решения и авторский надзор",
};

const WORK_ORDER: WorkType[] = ["cosmetic", "capital", "designer"];

const AREA_MIN = 5;
const AREA_MAX = 500;

export function Calculator({ rates, ratesMissing = false }: Props) {
  const [objectType, setObjectType] = useState<ObjectType>("flat");
  const [workType, setWorkType] = useState<WorkType>("capital");
  const [scope, setScope] = useState<RoomScope>("whole-flat");
  const [area, setArea] = useState("54");
  const [addons, setAddons] = useState<AddonKey[]>(["electric", "plumbing"]);

  const parsedArea = useMemo(() => {
    const raw = Number(area.replace(",", "."));
    return Number.isFinite(raw) ? raw : NaN;
  }, [area]);

  const areaValid =
    Number.isFinite(parsedArea) && parsedArea >= AREA_MIN && parsedArea <= AREA_MAX;

  const result = useMemo(
    () =>
      areaValid
        ? calculateFull(
            { objectType, workType, scope, area: parsedArea, addons },
            rates
          )
        : null,
    [areaValid, objectType, workType, scope, parsedArea, addons, rates]
  );

  const toggleAddon = useCallback((key: AddonKey) => {
    setAddons((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const objectLabel =
    OBJECT_TYPES.find((o) => o.value === objectType)?.label ?? "";
  const scopeLabel = ROOM_SCOPES.find((s) => s.value === scope)?.label ?? "";

  const totalLabel = result
    ? `${formatMoney(result.totalMin)} — ${formatMoney(result.totalMax)}`
    : "—";

  return (
    <div className="calc">
      {/* ---------------- Левая колонка: шаги ---------------- */}
      <div className="calc__panel">
        {/* Шаг 1. Тип объекта */}
        <fieldset className="calc__step">
          <legend className="calc__legend">
            <b>01</b> Тип объекта
          </legend>
          <div className="calc__options">
            {OBJECT_TYPES.map((o) => (
              <button
                key={o.value}
                type="button"
                className="calc__option"
                aria-pressed={objectType === o.value}
                onClick={() => setObjectType(o.value)}
              >
                <span className="calc__option-label">{o.label}</span>
                <span className="calc__option-hint">{o.hint}</span>
              </button>
            ))}
          </div>
        </fieldset>

        {/* Шаг 2. Тип ремонта */}
        <fieldset className="calc__step">
          <legend className="calc__legend">
            <b>02</b> Тип ремонта
          </legend>
          <div className="calc__options">
            {WORK_ORDER.map((w) => (
              <button
                key={w}
                type="button"
                className="calc__option"
                aria-pressed={workType === w}
                onClick={() => setWorkType(w)}
              >
                <span className="calc__option-label">{WORK_LABELS[w]}</span>
                <span className="calc__option-hint">{WORK_HINTS[w]}</span>
              </button>
            ))}
          </div>
        </fieldset>

        {/* Шаг 3. Тип помещения */}
        <fieldset className="calc__step">
          <legend className="calc__legend">
            <b>03</b> Тип помещения
          </legend>
          <div className="calc__options">
            {ROOM_SCOPES.map((s) => (
              <button
                key={s.value}
                type="button"
                className="calc__option"
                aria-pressed={scope === s.value}
                onClick={() => setScope(s.value)}
              >
                <span className="calc__option-label">{s.label}</span>
                <span className="calc__option-hint">{s.hint}</span>
              </button>
            ))}
          </div>
        </fieldset>

        {/* Шаг 4. Площадь */}
        <div className="calc__step">
          <p className="calc__legend">
            <b>04</b> Площадь объекта
          </p>
          <div className="calc__area">
            <div className="calc__area-field">
              <label htmlFor="calc-area">Площадь, м²</label>
              <div
                className="calc__area-input"
                data-invalid={!areaValid ? "true" : undefined}
              >
                <input
                  id="calc-area"
                  name="area"
                  type="number"
                  inputMode="decimal"
                  min={AREA_MIN}
                  max={AREA_MAX}
                  step={1}
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  aria-invalid={!areaValid}
                  aria-describedby={!areaValid ? "calc-area-err" : undefined}
                />
                <span>м²</span>
              </div>
            </div>
          </div>
          <input
            className="calc__range"
            type="range"
            min={AREA_MIN}
            max={AREA_MAX}
            step={1}
            value={areaValid ? parsedArea : AREA_MIN}
            onChange={(e) => setArea(e.target.value)}
            aria-label="Площадь объекта, ползунок"
          />
          {!areaValid ? (
            <p className="calc__error" id="calc-area-err">
              Укажите площадь числом от {AREA_MIN} до {AREA_MAX} м².
            </p>
          ) : null}
        </div>

        {/* Шаг 5. Доп. работы */}
        <fieldset className="calc__step">
          <legend className="calc__legend">
            <b>05</b> Дополнительные работы
          </legend>
          <div className="calc__checks">
            {ADDONS.map((a) => {
              const checked = addons.includes(a.key);
              return (
                <label
                  key={a.key}
                  className="calc__check"
                  data-checked={checked ? "true" : "false"}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAddon(a.key)}
                  />
                  <span>
                    {a.label}
                    <br />
                    <span className="muted t-micro">
                      {a.hint}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      {/* ---------------- Правая колонка: результат ---------------- */}
      <aside className="calc__result" aria-live="polite">
        <p className="calc__result-label">Предварительный диапазон</p>
        <p className="calc__total">{totalLabel}</p>

        <dl className="calc__rows">
          <div className="calc__row">
            <dt>Объект</dt>
            <dd>{objectLabel}</dd>
          </div>
          <div className="calc__row">
            <dt>Ремонт</dt>
            <dd>{WORK_LABELS[workType]}</dd>
          </div>
          <div className="calc__row">
            <dt>Помещение</dt>
            <dd>{scopeLabel}</dd>
          </div>
          <div className="calc__row">
            <dt>Площадь</dt>
            <dd>{areaValid ? `${parsedArea} м²` : "—"}</dd>
          </div>
          <div className="calc__row">
            <dt>Ставка</dt>
            <dd>{result ? `${formatMoney(result.ratePerM2)} / м²` : "—"}</dd>
          </div>
          {result ? (
            <>
              <div className="calc__row">
                <dt>Работы</dt>
                <dd>
                  {formatMoney(result.baseMin)} — {formatMoney(result.baseMax)}
                </dd>
              </div>
              {addons.length > 0 ? (
                <div className="calc__row">
                  <dt>Доп. работы (+{result.addonSharePct}%)</dt>
                  <dd>
                    {formatMoney(result.addonMin)} —{" "}
                    {formatMoney(result.addonMax)}
                  </dd>
                </div>
              ) : null}
            </>
          ) : null}
        </dl>

        {ratesMissing ? (
          <p className="calc__warning">
            Ставки калькулятора не настроены в админке. Показан расчёт по
            базовым значениям — точную стоимость подтвердит замер.
          </p>
        ) : null}

        <p className="calc__note">
          Диапазон — ориентир по площади и виду работ. Точная стоимость
          считается по смете после замера: там учтены состояние объекта,
          материалы и объём скрытых работ.
        </p>

        <a className="btn btn--light btn--wide" href="#quote">
          Получить точный расчёт
        </a>
      </aside>
    </div>
  );
}
