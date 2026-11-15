"use client";

/**
 * Модальное окно заявки.
 *
 * Открывается любым элементом с data-lead-open (кнопки «Оставить заявку»).
 * Внутри — та же LeadForm, что и в блоке заявки, поэтому валидация и
 * отправка на /api/leads одни и те же.
 *
 * Доступность: role=dialog + aria-modal, фокус уходит в первое поле,
 * Esc закрывает, клик по подложке закрывает, фон не прокручивается.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { LeadForm } from "./LeadForm";

type Props = {
  source: string;
  page?: string;
  defaultCity?: string;
};

export function LeadModal({ source, page = "/", defaultCity }: Props) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => lastFocus.current?.focus(), 0);
  }, []);

  useEffect(() => {
    function onOpen(e: MouseEvent) {
      const trigger = (e.target as HTMLElement | null)?.closest<HTMLElement>(
        "[data-lead-open]"
      );
      if (!trigger) return;
      e.preventDefault();
      lastFocus.current = trigger;
      setOpen(true);
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("click", onOpen);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onOpen);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const el = dialogRef.current?.querySelector<HTMLElement>(
      "input:not([type=hidden]), textarea, select"
    ) ?? dialogRef.current?.querySelector<HTMLElement>("button");
    el?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="lead-modal"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className="lead-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-modal-h"
        ref={dialogRef}
      >
        <button
          className="lead-modal__close"
          type="button"
          onClick={close}
          aria-label="Закрыть"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M3 3l10 10M13 3L3 13"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="lead-modal__head">
          <p className="sec-num">Заявка</p>
          <h2 id="lead-modal-h">Оставить заявку</h2>
          <p className="t-small muted">
            Перезвоним, ответим на вопросы и договоримся о замере.
          </p>
        </div>

        <LeadForm
          source={source}
          page={page}
          submitLabel="Отправить заявку"
          defaultCity={defaultCity}
        />
      </div>
    </div>
  );
}
