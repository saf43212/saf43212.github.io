"use client";

/**
 * Форма заявки.
 *
 * Сайт статический: если не настроен внешний endpoint (см. content/site.ts),
 * форма собирает готовый текст и предлагает отправить его в WhatsApp —
 * без сервера и без регистраций.
 *
 * Поля по брифу: имя, телефон, почта (необязательно), город, комментарий,
 * тип ремонта, площадь, предварительный расчёт.
 */
import { useRef, useState } from "react";

import { submitLead } from "@/lib/submit";

type Props = {
  /** Источник заявки для статистики (лендинг, модалка, калькулятор) */
  source: string;
  /** Страница, с которой пришла заявка */
  page?: string;
  /** Предзаполненный тип ремонта */
  defaultWorkType?: string;
  /** Предзаполненная площадь */
  defaultArea?: string;
  /** Компактный режим для модалки */
  compact?: boolean;
  /** Заголовок кнопки */
  submitLabel?: string;
  /** Город по умолчанию */
  defaultCity?: string;
};

type Status = "idle" | "sending" | "sent" | "error";

const WORK_OPTIONS = [
  { value: "", label: "Не выбрано" },
  { value: "cosmetic", label: "Косметический" },
  { value: "capital", label: "Капитальный" },
  { value: "designer", label: "Под ключ" },
];

export function LeadForm({
  source,
  page = "/",
  defaultWorkType = "",
  defaultArea = "",
  compact = false,
  submitLabel = "Отправить заявку",
  defaultCity = "Кисловодск",
}: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorText, setErrorText] = useState("");
  const [manual, setManual] = useState<{ whatsapp: string; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending" || status === "sent") return;

    const form = e.currentTarget;
    const data = new FormData(form);

    // honeypot: скрытое поле, боты его заполняют
    if (String(data.get("company") ?? "") !== "") return;

    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const city = String(data.get("city") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    const workType = String(data.get("workType") ?? "").trim();
    const area = String(data.get("area") ?? "").trim();

    const nextErrors: Record<string, string> = {};
    if (name.length < 2) nextErrors.name = "Напишите имя — как к вам обращаться.";
    if (phone.replace(/\D/g, "").length < 10)
      nextErrors.phone = "Напишите телефон, например +7 928 000-00-00.";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      nextErrors.email = "Проверьте адрес — нужен вид imya@pochta.ru.";

    setErrors(nextErrors);
    const firstBad = Object.keys(nextErrors)[0];
    if (firstBad) {
      form.querySelector<HTMLElement>(`[name="${firstBad}"]`)?.focus();
      return;
    }

    setStatus("sending");
    setErrorText("");

    // Дополнительные поля добавляем в текст заявки — так они не потеряются.
    const extra: string[] = [];
    if (city) extra.push(`Город: ${city}`);
    if (workType) {
      const label = WORK_OPTIONS.find((w) => w.value === workType)?.label;
      if (label) extra.push(`Тип ремонта: ${label}`);
    }
    if (area) extra.push(`Площадь: ${area} м²`);

    const fullMessage = [extra.join("\n"), message].filter(Boolean).join("\n\n");

    const result = await submitLead({
      name,
      phone,
      email,
      message: fullMessage,
      source,
      page,
    });

    if (!result.ok) {
      setErrorText(result.error);
      setStatus("error");
      return;
    }

    if (result.mode === "manual") {
      setManual({ whatsapp: result.whatsapp, text: result.text });
    }

    setStatus("sent");
    form.reset();
  }

  if (status === "sent" && manual) {
    return (
      <div className="form" role="status" aria-live="polite">
        <div className="form__full" style={{ display: "grid", gap: "1rem" }}>
          <p className="t-lead" style={{ margin: 0 }}>
            Заявка готова — остался один шаг.
          </p>
          <p className="t-small muted" style={{ margin: 0 }}>
            Нажмите кнопку: откроется WhatsApp с уже заполненным сообщением.
            Отправьте его — и мы перезвоним в течение рабочего дня.
          </p>
          <div className="btn-row">
            <a
              className="btn btn--primary"
              href={manual.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              Отправить в WhatsApp
            </a>
            <button
              className="btn btn--ghost"
              type="button"
              onClick={() => {
                setManual(null);
                setStatus("idle");
              }}
            >
              Изменить данные
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === "sent") {
    return (
      <div className="form" role="status" aria-live="polite">
        <div className="form__full" style={{ display: "grid", gap: "1rem" }}>
          <p className="t-lead" style={{ margin: 0 }}>
            Заявка отправлена. Перезвоним в течение рабочего дня, обычно быстрее.
          </p>
          <p className="t-small muted" style={{ margin: 0 }}>
            Если удобнее, позвоните сами — телефон в шапке сайта.
          </p>
          <button
            className="btn btn--ghost"
            type="button"
            onClick={() => setStatus("idle")}
          >
            Отправить ещё одну заявку
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="form" ref={formRef} onSubmit={onSubmit} noValidate>
      {/* honeypot */}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="f-company">Компания</label>
        <input id="f-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="field">
        <label htmlFor="f-name">Имя</label>
        <input
          id="f-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          aria-invalid={errors.name ? "true" : undefined}
          aria-describedby={errors.name ? "f-name-err" : undefined}
        />
        {errors.name ? (
          <p className="field__error" id="f-name-err">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="f-phone">Телефон</label>
        <input
          id="f-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          required
          placeholder="+7 928 000-00-00"
          aria-invalid={errors.phone ? "true" : undefined}
          aria-describedby={errors.phone ? "f-phone-err" : undefined}
        />
        {errors.phone ? (
          <p className="field__error" id="f-phone-err">
            {errors.phone}
          </p>
        ) : null}
      </div>

      {!compact ? (
        <>
          <div className="field">
            <label htmlFor="f-email">
              Почта <span>— необязательно</span>
            </label>
            <input
              id="f-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              aria-invalid={errors.email ? "true" : undefined}
              aria-describedby={errors.email ? "f-email-err" : undefined}
            />
            {errors.email ? (
              <p className="field__error" id="f-email-err">
                {errors.email}
              </p>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="f-city">Город</label>
            <input
              id="f-city"
              name="city"
              type="text"
              autoComplete="address-level2"
              defaultValue={defaultCity}
            />
          </div>
        </>
      ) : null}

      <div className="field">
        <label htmlFor="f-work">Тип ремонта</label>
        <select id="f-work" name="workType" defaultValue={defaultWorkType}>
          {WORK_OPTIONS.map((w) => (
            <option key={w.value} value={w.value}>
              {w.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="f-area">Площадь, м²</label>
        <input
          id="f-area"
          name="area"
          type="number"
          inputMode="numeric"
          min={1}
          max={5000}
          step={1}
          defaultValue={defaultArea}
          placeholder="54"
        />
      </div>

      <div className="field form__full">
        <label htmlFor="f-message">
          Комментарий <span>— необязательно</span>
        </label>
        <textarea
          id="f-message"
          name="message"
          rows={3}
          placeholder="Например: капитальный ремонт двухкомнатной квартиры, 54 м², дом 1979 года"
        />
      </div>

      <div className="form__full">
        <button
          className="btn btn--primary btn--lg btn--wide"
          type="submit"
          disabled={status === "sending"}
        >
          {status === "sending" ? "Отправляем…" : submitLabel}
        </button>
      </div>

      <p
        className="form__status form__full"
        role="status"
        aria-live="polite"
        data-state={status === "error" ? "error" : undefined}
      >
        {status === "error" ? errorText : ""}
      </p>

      <p className="form__legal form__full">
        Нажимая кнопку, вы соглашаетесь с{" "}
        <a href="/privacy">политикой конфиденциальности</a>. Данные нужны только
        для ответа по заявке.
      </p>
    </form>
  );
}
