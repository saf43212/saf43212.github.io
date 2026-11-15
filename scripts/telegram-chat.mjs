#!/usr/bin/env node
/**
 * Помощник для настройки заявок в Telegram.
 *
 *   node scripts/telegram-chat.mjs <токен бота>            — показать бота и найденные чаты
 *   node scripts/telegram-chat.mjs <токен бота> --send "…" — отправить тестовое сообщение
 *
 * Как получить токен: в Telegram найдите @BotFather → /newbot → придумайте имя.
 * Как узнать chat_id: напишите своему боту любое сообщение (например «привет»),
 * затем запустите этот скрипт — он покажет chat.id. Для групп сначала добавьте
 * бота в группу и тоже напишите туда сообщение.
 */

const token = process.argv[2] || process.env.TELEGRAM_BOT_TOKEN || "";
const sendIndex = process.argv.indexOf("--send");
const sendText = sendIndex !== -1 ? process.argv[sendIndex + 1] : "";

if (!token) {
  console.error("Укажите токен бота: node scripts/telegram-chat.mjs 123456:AA...");
  process.exit(1);
}

const api = (method) => `https://api.telegram.org/bot${token}/${method}`;

async function call(method, params) {
  const res = await fetch(api(method), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params ?? {}),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data || data.ok === false) {
    throw new Error(`${method}: ${data?.description || `HTTP ${res.status}`}`);
  }
  return data.result;
}

try {
  const me = await call("getMe");
  console.log(`Бот: @${me.username} (${me.first_name}), id ${me.id}`);

  if (sendText) {
    const updates = await call("getUpdates", { limit: 100 });
    const chatId = lastChatId(updates);
    if (!chatId) {
      console.error("Не нашёл ни одного чата. Напишите боту сообщение и повторите.");
      process.exit(1);
    }
    await call("sendMessage", {
      chat_id: chatId,
      text: sendText,
      disable_web_page_preview: true,
    });
    console.log(`Тестовое сообщение отправлено в чат ${chatId}.`);
    process.exit(0);
  }

  const updates = await call("getUpdates", { limit: 100 });
  const chats = collectChats(updates);
  if (chats.length === 0) {
    console.log("Чатов пока нет. Напишите боту сообщение (или добавьте его в группу) и запустите снова.");
    process.exit(0);
  }

  console.log("\nНайденные чаты — впишите id в content/site.ts → formConfig.telegram.chatId:");
  for (const chat of chats) {
    const title = chat.title || [chat.first_name, chat.last_name].filter(Boolean).join(" ") || chat.username || "—";
    console.log(`  ${String(chat.id).padEnd(16)} ${chat.type.padEnd(8)} ${title}`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

function collectChats(updates) {
  const map = new Map();
  for (const update of updates || []) {
    const chat =
      update.message?.chat ||
      update.edited_message?.chat ||
      update.channel_post?.chat ||
      update.my_chat_member?.chat ||
      null;
    if (chat) map.set(chat.id, chat);
  }
  return [...map.values()];
}

function lastChatId(updates) {
  const chats = collectChats(updates);
  return chats.length ? chats[chats.length - 1].id : null;
}
