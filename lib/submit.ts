/**
 * Отправка заявки со статического сайта.
 *
 * Своего сервера у лендинга нет, поэтому есть два режима:
 * 1) настроен `formConfig.formEndpoint` (Web3Forms, Formspree и т.п.) —
 *    заявка уходит запросом и приходит на почту;
 * 2) endpoint не настроен — форма собирает текст заявки и предлагает
 *    отправить его в WhatsApp уже заполненным. Ничего не теряется и не
 *    притворяется отправленным.
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

export async function submitLead(payload: LeadPayload): Promise<SubmitResult> {
  const text = buildLeadText(payload);

  if (!formConfig.formEndpoint) {
    return { ok: true, mode: "manual", whatsapp: whatsappLink(text), text };
  }

  try {
    const res = await fetch(formConfig.formEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        ...(formConfig.formAccessKey ? { access_key: formConfig.formAccessKey } : {}),
        subject: `Заявка с сайта — ${payload.name}`,
        name: payload.name,
        phone: payload.phone,
        email: payload.email,
        message: payload.message,
        source: payload.source,
        page: payload.page,
      }),
    });

    if (!res.ok) {
      return {
        ok: false,
        error: "Не удалось отправить заявку. Позвоните нам — телефон в шапке сайта.",
      };
    }
    return { ok: true, mode: "sent" };
  } catch {
    return {
      ok: false,
      error: "Не удалось отправить заявку. Проверьте связь или позвоните — телефон в шапке сайта.",
    };
  }
}
