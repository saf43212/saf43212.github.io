/**
 * Отправка заявки со статического сайта.
 *
 * Своего сервера у лендинга нет, поэтому заявка уходит одним из способов:
 * 1) на прокси `formConfig.telegram.proxyUrl` (Cloudflare Worker), который
 *    пересылает её в Telegram. Токен бота остаётся в секретах воркера;
 * 2) напрямую в Telegram Bot API, если вписаны `telegram.botToken` и `chatId`;
 * 3) письмом через Web3Forms, если настроен `web3forms`.
 *
 * Если ничего не настроено или канал не ответил, форма честно сообщает об
 * ошибке и предлагает позвонить — заявка не притворяется отправленной.
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

export type SubmitResult = { ok: true; mode: "sent" } | { ok: false; error: string };

export const SUBMIT_ERROR =
  "Не удалось отправить заявку. Позвоните нам — телефон в шапке сайта.";

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

/** Сообщение в Telegram напрямую из браузера. Ответ у no-cors запроса непрозрачный. */
async function sendDirectToTelegram(text: string): Promise<void> {
  const { botToken, chatId } = formConfig.telegram;
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
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

  // 1. Прокси: знаем результат доставки, токен не раскрыт.
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
      return { ok: false, error: SUBMIT_ERROR };
    }
  }

  // 2. Прямая отправка в Bot API.
  if (tg.botToken && tg.chatId) {
    try {
      await sendDirectToTelegram(text);
      return { ok: true, mode: "sent" };
    } catch {
      return { ok: false, error: SUBMIT_ERROR };
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
      return { ok: false, error: SUBMIT_ERROR };
    }
  }

  // 4. Ничего не настроено.
  return { ok: false, error: SUBMIT_ERROR };
}
