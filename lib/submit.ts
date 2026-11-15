/**
 * Отправка заявки со статического сайта.
 *
 * Своего сервера у лендинга нет, поэтому режимы такие:
 * 1) настроен `formConfig.telegram.proxyUrl` — заявка уходит на ваш прокси
 *    (Cloudflare Worker), он пересылает её в Telegram. Токен бота спрятан;
 * 2) заполнены `telegram.botToken` + `telegram.chatId` — браузер отправляет
 *    сообщение напрямую в Bot API (запрос непрозрачный, токен виден в коде);
 * 3) настроен `web3forms` — заявка уходит письмом на почту;
 * 4) ничего не настроено — форма показывает готовое сообщение и кнопку
 *    «Отправить в WhatsApp». Ничего не теряется и не притворяется отправленным.
 */
import { formConfig, settings } from "@/content/site";

export type LeadPayload = {
  name: string;
  phone: string;
  email: string;
  message: string;
  source: string;
  page: string;
};

export type SubmitResult =
  | { ok: true; mode: "sent" }
  | { ok: true; mode: "manual"; whatsapp: string; text: string }
  | { ok: false; error: string };

export function buildLeadText(payload: LeadPayload): string {
  const lines = [
    `Заявка с сайта ${settings.company_name ?? "ЛИНИЯ"}`,
    `Имя: ${payload.name}`,
    `Телефон: ${payload.phone}`,
  ];
  if (payload.email) lines.push(`Почта: ${payload.email}`);
  if (payload.message) lines.push("", payload.message);
  if (payload.page) lines.push("", `Страница: ${payload.page}`);
  return lines.join("\n");
}

/** Номер для WhatsApp: сначала formConfig.whatsapp, иначе — телефон из настроек. */
export function whatsappNumber(): string {
  const source = formConfig.whatsapp || settings.phone || "";
  return source.replace(/\D/g, "");
}

export function whatsappLink(text: string): string {
  const number = whatsappNumber();
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

/** Сообщение в Telegram напрямую из браузера. Ответ у no-cors запроса непрозрачный. */
async function sendDirectToTelegram(text: string): Promise<void> {
  const { botToken, chatId } = formConfig.telegram;
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  await fetch(url, {
    method: "POST",
    mode: "no-cors",
    body: new URLSearchParams({
      chat_id: chatId,
      text,
      disable_web_page_preview: "true",
    }),
  });
}

export async function submitLead(payload: LeadPayload): Promise<SubmitResult> {
  const text = buildLeadText(payload);
  const tg = formConfig.telegram;

  // 1. Прокси: знаем результат, токен не раскрыт.
  if (tg.proxyUrl) {
    try {
      const res = await fetch(tg.proxyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ text, ...payload }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (data && data.ok === false) throw new Error("proxy rejected");
      return { ok: true, mode: "sent" };
    } catch {
      return {
        ok: false,
        error: "Не удалось отправить заявку. Позвоните нам — телефон в шапке сайта.",
      };
    }
  }

  // 2. Прямая отправка в Bot API.
  if (tg.botToken && tg.chatId) {
    try {
      await sendDirectToTelegram(text);
      return { ok: true, mode: "sent" };
    } catch {
      // Сеть/блокировка — не теряем заявку, отдаём готовый WhatsApp.
      return { ok: true, mode: "manual", whatsapp: whatsappLink(text), text };
    }
  }

  // 3. Почта через Web3Forms.
  if (formConfig.web3forms.endpoint) {
    try {
      const res = await fetch(formConfig.web3forms.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...(formConfig.web3forms.accessKey ? { access_key: formConfig.web3forms.accessKey } : {}),
          subject: `Заявка с сайта — ${payload.name}`,
          name: payload.name,
          phone: payload.phone,
          email: payload.email,
          message: payload.message,
          source: payload.source,
          page: payload.page,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return { ok: true, mode: "sent" };
    } catch {
      return {
        ok: false,
        error: "Не удалось отправить заявку. Позвоните нам — телефон в шапке сайта.",
      };
    }
  }

  // 4. Ничего не настроено — WhatsApp.
  return { ok: true, mode: "manual", whatsapp: whatsappLink(text), text };
}
