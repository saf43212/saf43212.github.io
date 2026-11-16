/**
 * Постобработка статической сборки.
 *
 * GitHub Pages по умолчанию прогоняет файлы через Jekyll, который игнорирует
 * папки, начинающиеся с подчёркивания (`_next`). Пустой `.nojekyll` это
 * выключает. Если в `content/site.ts` указан свой домен, рядом кладём
 * `CNAME` — GitHub Pages привязывает его автоматически. Для технического
 * адреса `*.github.io` CNAME не нужен: он переключил бы сайт на домен,
 * к которому ещё не направлен DNS.
 */
import fs from "node:fs";
import path from "node:path";
import { lookup } from "node:dns/promises";

const out = path.resolve("out");
if (!fs.existsSync(out)) {
  console.error("нет папки out — сначала должна пройти сборка next build");
  process.exit(1);
}

fs.writeFileSync(path.join(out, ".nojekyll"), "");

const source = fs.readFileSync(path.resolve("content/site.ts"), "utf8");
const match = source.match(/export const siteUrl = "([^"]+)"/);
const url = match?.[1] ?? "";
let host = "";
try {
  host = new URL(url).host;
} catch {
  host = "";
}

const isTechnicalHost = host === "" || host === "linia.example" || host.endsWith(".github.io");
const cname = path.join(out, "CNAME");

if (isTechnicalHost) {
  // Устаревший CNAME от прошлой сборки со своим доменом тоже убираем: иначе
  // GitHub Pages привяжется к домену, который больше не является боевым.
  if (fs.existsSync(cname)) fs.rmSync(cname);
  console.log(`CNAME не создан: технический адрес ${host || "(пусто)"}`);
} else {
  // CNAME включается только когда домен уже резолвится. Если DNS ещё не
  // направлен на GitHub Pages, файл CNAME переключил бы сайт на мёртвый
  // домен и уронил бы и технический адрес *.github.io.
  let resolvable = false;
  try {
    const found = await lookup(host);
    resolvable = Boolean(found?.address);
  } catch {
    resolvable = false;
  }

  if (resolvable) {
    fs.writeFileSync(cname, `${host}\n`);
    console.log(`CNAME: ${host}`);
  } else {
    if (fs.existsSync(cname)) fs.rmSync(cname);
    console.warn(
      `CNAME не создан: ${host} не резолвится. Направьте DNS (A 185.199.108.153/.109.154/.110.155/.111.156 или CNAME на saf43212.github.io) и пересоберите сайт.`
    );
  }
}

console.log(`.nojekyll: да`);
console.log(`готово: ${out}`);
