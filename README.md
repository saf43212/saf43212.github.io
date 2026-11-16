# Лендинг «ЛИНИЯ»

Статический одностраничный сайт ремонтной компании «ЛИНИЯ» (Кисловодск и
Кавказские Минеральные Воды). Собирается в обычные HTML/CSS/JS и хостится на
GitHub Pages: без сервера, базы данных, админки и pm2.

- **Сайт:** https://saf43212.github.io/
- **Репозиторий:** https://github.com/saf43212/saf43212.github.io
- **Свой домен:** `liniakmw.ru` — пока не зарегистрирован (DNS отвечает NXDOMAIN), после регистрации см. раздел 5
- **Стек:** Next.js 15 (App Router) + React 19, статический экспорт (`output: "export"`)
- **Сборка:** `npm run build` → папка `out/` — это и есть готовый сайт
- **Контент:** один файл [`content/site.ts`](content/site.ts)

---

## 1. Локальный запуск

Нужен Node.js 22 или новее.

```bash
npm ci          # один раз
npm run dev     # http://localhost:3000 — разработка с горячей перезагрузкой
```

Проверить именно статическую сборку (так сайт будет выглядеть на хостинге):

```bash
npm run build      # создаёт out/
npm run preview    # http://127.0.0.1:4173 — сервер из папки out/
```

Дополнительно:

```bash
npm run typecheck  # проверка типов
npm run lint       # ESLint
npm test           # тесты калькулятора
```

## 2. Как менять контент

Всё содержимое лежит в [`content/site.ts`](content/site.ts):

| Что | Где в файле |
|---|---|
| Телефон, почта, город, часы работы | `settings` |
| Цены калькулятора, ₽/м² | `settings.calc_cosmetic` / `calc_capital` / `calc_designer` |
| Услуги: название, описание, состав, этапы | `services` |
| Проекты и фотографии | `projects` (первое фото — обложка) |
| Домен сайта | `siteUrl` |
| Куда уходят заявки | `formConfig` |

Фотографии лежат в `public/assets/img/`. Чтобы добавить новую: положите файл
`.webp` в эту папку и укажите путь `/assets/img/имя-файла.webp` в `projects`.

После правок пересоберите сайт — GitHub Actions сделает это сам при push.

## 3. Заявки в Telegram

Форма проверяет поля, собирает текст заявки и отправляет его на прокси —
`formConfig.telegram.proxyUrl`. Это Cloudflare Worker, который пересылает
сообщение в Telegram и возвращает подтверждение доставки. Токен бота лежит в
секретах воркера, в коде сайта его нет. Если Telegram или прокси недоступны,
форма честно показывает ошибку и просит позвонить — заявка не притворяется
отправленной.

Порядок настройки с нуля:

1. В Telegram откройте **@BotFather** → `/newbot` → придумайте имя и адрес
   (например `linia_kislovodsk_bot`). BotFather пришлёт **токен** вида
   `1234567890:AAE...`.
2. Напишите своему новому боту любое сообщение — «привет». Без этого бот не
   имеет права писать вам первым.
3. Узнайте свой `chat_id`:

   ```bash
   npm run telegram:chat -- 1234567890:AAE...
   ```

   Скрипт покажет бота и список чатов; нужное число — `chat_id`.
4. Положите токен и chat_id в секреты воркера `linia-leads`
   (`BOT_TOKEN`, `CHAT_ID`) — в панели Cloudflare или запросом из блока ниже.
5. Проверьте доставку: `npm run telegram:chat -- 1234567890:AAE... --send "Тест"`.
6. Сделайте `git push` — GitHub Actions пересоберёт сайт, и заявки начнут
   приходить в чат с ботом.

Прямая отправка из браузера (`telegram.botToken` + `telegram.chatId`, без
прокси) и почта через `web3forms` остаются как запасные варианты, но токен в
этом случае виден в коде страницы.

> **Про безопасность.** Прокси на Cloudflare Workers уже развёрнут:
> `https://linia-leads.danildanil89741.workers.dev` (адрес прописан в
> `formConfig.telegram.proxyUrl`), секреты `BOT_TOKEN` и `CHAT_ID` заданы —
> в коде сайта токена нет. Заявка уходит на воркер, он пересылает её в Telegram
> и возвращает подтверждение доставки.
>
> Секреты задаются в панели Cloudflare → Workers & Pages → `linia-leads` →
> Settings → Variables, либо через API:
>
> ```bash
> curl -X PUT "https://api.cloudflare.com/client/v4/accounts/<account_id>/workers/scripts/linia-leads/secrets" \
>   -H "Authorization: Bearer <API_TOKEN>" -H "Content-Type: application/json" \
>   -d '{"name":"BOT_TOKEN","text":"1234567890:AAE...","type":"secret_text"}'
> ```
>
> Код воркера (для справки — что именно работает на Cloudflare):

```js
// Cloudflare Worker: POST { text } → сообщение в Telegram
export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(request) });
    if (request.method !== "POST") return Response.json({ ok: false }, { status: 405, headers: cors(request) });
    const { text } = await request.json().catch(() => ({}));
    if (!text) return Response.json({ ok: false }, { status: 400, headers: cors(request) });
    const res = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: env.CHAT_ID, text, disable_web_page_preview: true }),
    });
    return Response.json({ ok: res.ok }, { status: res.ok ? 200 : 502, headers: cors(request) });
  },
};
```

> **Обязательно замените заглушки перед запуском:** в `content/site.ts` сейчас
> стоят `phone: "+7 928 000-00-00"` и `form_email: "hello@linia.example"`.
> Телефон подставляется в шапку, подвал, блок контактов и в ссылку «Позвонить»,
> поэтому показывать несуществующий номер нельзя.

**Почта (Web3Forms)** — дополнительный канал, 250 заявок в месяц бесплатно:
получите access key на [web3forms.com](https://web3forms.com) и впишите его в
`formConfig.web3forms`.

## 4. Публикация на GitHub Pages

Уже сделано: репозиторий `saf43212/saf43212.github.io` создан, код запушен,
Pages переключён на GitHub Actions, сайт опубликован по адресу
**https://saf43212.github.io/**.

### Почему репозиторий называется `<логин>.github.io`

Сайт использует абсолютные пути (`/_next/`, `/assets/`), поэтому он должен
лежать в корне домена. Репозиторий с именем `<логин>.github.io` — это
«пользовательский сайт» GitHub Pages: он публикуется в корень
`https://<логин>.github.io/`, и всё работает без дополнительных настроек.

Если положить тот же проект в обычный репозиторий, адрес будет
`https://<логин>.github.io/<репозиторий>/`, и стили с картинками отвалятся:
браузер запросит их с корня домена. Тогда нужно либо переименовать репозиторий
в `<логин>.github.io`, либо задать `basePath: "/<репозиторий>"` в
`next.config.ts` (но с собственным доменом этот `basePath` придётся убрать).

### Как публикуется

Push в ветку `main` запускает `.github/workflows/pages.yml`: `npm ci`,
`npm run build`, публикация папки `out/`. Статус — вкладка **Actions**
репозитория. Pages включён с источником **GitHub Actions**; ветку вручную
выбирать не нужно.

> Не выбирайте **Deploy from a branch → main / (root)**: в корне лежат исходники
> (README, `package.json`), а не собранный сайт — GitHub покажет README вместо
> лендинга. Именно так и получилось в первый раз.

### Вариант без сборки (если не хотите Actions)

Можно загрузить в репозиторий уже собранный сайт: выполните `npm run build` и
скопируйте **содержимое** `out/` в корень репозитория (включая `.nojekyll`).
Затем **Settings → Pages → Source: Deploy from a branch → main / (root)**.
Минус: после каждой правки контента нужно пересобирать и заново загружать файлы.

## 5. Домен и HTTPS

Сейчас сайт живёт на техническом адресе **https://saf43212.github.io/**
(HTTPS уже включён GitHub). Домен `liniakmw.ru` на момент переноса **не
зарегистрирован**: DNS отвечает NXDOMAIN, поэтому привязать его нельзя.
Порядок действий, когда домен будет куплен:

1. Зарегистрировать `liniakmw.ru` у любого регистратора.
2. Прописать DNS-записи из таблицы ниже (в панели регистратора).
3. В репозитории: **Settings → Pages → Custom domain** → `liniakmw.ru` → Save.
4. Поменять `siteUrl` в `content/site.ts` на `https://liniakmw.ru` и запушить —
   пересборка сама положит файл `CNAME` в `out/`.
5. Когда DNS обновится, включить **Enforce HTTPS** (сертификат Let's Encrypt
   GitHub выпускает сам и бесплатно).

### DNS

В панели регистратора домена:

| Тип | Имя | Значение |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `saf43212.github.io.` |

Старые A-записи на IP сервера удалите. Обновление DNS занимает от нескольких
минут до пары часов.

Файл `CNAME` создаётся автоматически при сборке из `siteUrl` в
`content/site.ts`, вручную его добавлять не нужно. Для технического адреса
`*.github.io` `CNAME` намеренно не создаётся — иначе GitHub переключил бы сайт
на домен, к которому ещё не направлен DNS.

## 6. Структура проекта

```
app/                 страницы: главная, /privacy, 404, sitemap, robots
components/site/     шапка, подвал, форма, калькулятор, портфолио, модалка
content/site.ts      весь контент сайта
lib/                 калькулятор, отправка заявки, склонения, доступ к контенту
public/assets/img/   фотографии
public/share.jpg     превью для соцсетей (Open Graph)
scripts/             постобработка сборки и локальный просмотр
.github/workflows/   автодеплой на GitHub Pages
```

## 7. Что изменилось по сравнению с серверной версией

Серверная версия с SQLite, админкой `/admin` и API удалена. Убраны: база
данных, вход администратора, загрузка файлов, Telegram-уведомления. Правки
контента теперь делаются в `content/site.ts` и публикуются через git — это
проще и не требует обслуживания сервера.

Проверено: сборка (`npm run build`), типы (`tsc --noEmit`), тесты калькулятора,
десктоп и мобильная вёрстка, форма заявки, 404-страница, sitemap и robots.
