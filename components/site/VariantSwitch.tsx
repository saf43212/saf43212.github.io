"use client";

/**
 * Переключатель вариантов дизайна — ТОЛЬКО ветка design/variants.
 *
 * Пишет на <html> три атрибута, от которых зависят правила
 * в app/variants.css:
 *   data-theme  material | mineral  — палитра
 *   data-motion line | none         — motion-слой «одна линия»
 *   data-grade  warm | none         — грейд фотографий
 *
 * Выбор запоминается в localStorage, чтобы после перезагрузки
 * оставаться на том же варианте. При публикации удаляется вместе
 * с variants.css — на боевом сайте переключателя быть не должно.
 */
import { useEffect, useState } from "react";

type Theme = "material" | "mineral";
type Motion = "line" | "none";
type Grade = "warm" | "none";

const STORE_KEY = "linia-variant";

type VariantState = { theme: Theme; motion: Motion; grade: Grade };

const DEFAULT_STATE: VariantState = {
  theme: "material",
  motion: "line",
  grade: "warm",
};

function apply(next: VariantState) {
  const root = document.documentElement;
  root.dataset.theme = next.theme;
  root.dataset.motion = next.motion;
  root.dataset.grade = next.grade;
}

export function VariantSwitch() {
  const [state, setState] = useState<VariantState>(DEFAULT_STATE);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    let stored: Partial<VariantState> = {};
    try {
      stored = JSON.parse(localStorage.getItem(STORE_KEY) ?? "{}");
    } catch {
      stored = {};
    }
    const next: VariantState = {
      theme: stored.theme === "mineral" ? "mineral" : DEFAULT_STATE.theme,
      motion: stored.motion === "none" ? "none" : DEFAULT_STATE.motion,
      grade: stored.grade === "none" ? "none" : DEFAULT_STATE.grade,
    };
    setState(next);
    apply(next);
    try {
      setOpen(localStorage.getItem(`${STORE_KEY}-open`) !== "0");
    } catch {
      /* приватный режим */
    }
  }, []);

  const update = (patch: Partial<VariantState>) => {
    const next = { ...state, ...patch };
    setState(next);
    apply(next);
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
    } catch {
      /* приватный режим — просто не запоминаем */
    }
  };

  const toggleOpen = (value: boolean) => {
    setOpen(value);
    try {
      localStorage.setItem(`${STORE_KEY}-open`, value ? "1" : "0");
    } catch {
      /* приватный режим */
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        className="variant-switch__open"
        onClick={() => toggleOpen(true)}
      >
        Варианты
      </button>
    );
  }

  return (
    <aside className="variant-switch" aria-label="Переключатель вариантов дизайна">
      <div className="variant-switch__head">
        <span>Варианты · локально</span>
        <button
          type="button"
          className="variant-switch__hide"
          onClick={() => toggleOpen(false)}
        >
          скрыть
        </button>
      </div>

      <div className="variant-switch__group">
        <span className="variant-switch__label">Палитра</span>
        <div className="variant-switch__row">
          <button
            type="button"
            className="variant-switch__btn"
            aria-pressed={state.theme === "material"}
            onClick={() => update({ theme: "material" })}
          >
            A · Материал
          </button>
          <button
            type="button"
            className="variant-switch__btn"
            aria-pressed={state.theme === "mineral"}
            onClick={() => update({ theme: "mineral" })}
          >
            B · Минерал
          </button>
        </div>
      </div>

      <div className="variant-switch__group">
        <span className="variant-switch__label">Фотографии</span>
        <div className="variant-switch__row">
          <button
            type="button"
            className="variant-switch__btn"
            aria-pressed={state.grade === "warm"}
            onClick={() => update({ grade: "warm" })}
          >
            C · тёплый грейд
          </button>
          <button
            type="button"
            className="variant-switch__btn"
            aria-pressed={state.grade === "none"}
            onClick={() => update({ grade: "none" })}
          >
            без грейда
          </button>
        </div>
      </div>

      <div className="variant-switch__group">
        <span className="variant-switch__label">Движение</span>
        <div className="variant-switch__row">
          <button
            type="button"
            className="variant-switch__btn"
            aria-pressed={state.motion === "line"}
            onClick={() => update({ motion: "line" })}
          >
            «одна линия»
          </button>
          <button
            type="button"
            className="variant-switch__btn"
            aria-pressed={state.motion === "none"}
            onClick={() => update({ motion: "none" })}
          >
            без движения
          </button>
        </div>
      </div>
    </aside>
  );
}
