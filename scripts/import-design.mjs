#!/usr/bin/env node
/**
 * Импорт рендеров дизайн-проекта: PNG → WebP двух размеров + манифест.
 *
 *   node scripts/import-design.mjs "C:\путь\к\папке с PNG" [--title "Название"]
 *
 * Что делает:
 *  - группирует файлы по префиксу имени (LR_, Bathroom_, B_ и т.д.);
 *  - режет каждое изображение в 1600px по ширине (originals) и 640px (превью);
 *  - пишет public/assets/design/<группа>/<nn>.webp и <nn>-640.webp;
 *  - пересобирает content/design.ts с манифестом.
 *
 * Требует sharp: npm i -D sharp
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const source = process.argv[2];
if (!source) {
  console.error('Укажите папку с PNG: node scripts/import-design.mjs "C:\\...\\фото новые"');
  process.exit(1);
}

const GROUPS = [
  { prefix: "LR", slug: "gostinaya", title: "Гостиная", note: "Общая зона: диван, ТВ-стена, свет." },
  { prefix: "Bedroom", slug: "spalnya", title: "Спальня", note: "Спальня с гардеробной зоной." },
  { prefix: "Kidroom", slug: "detskaya", title: "Детская", note: "Детская комната: рабочее место, хранение." },
  { prefix: "Bathroom", slug: "vannaya", title: "Ванная комната", note: "Плитка, сантехника, подсветка." },
  { prefix: "Shower", slug: "dushevaya", title: "Душевая", note: "Душевая зона со стеклянной перегородкой." },
  { prefix: "H", slug: "holl", title: "Холл", note: "Прихожая и коридор." },
  { prefix: "B+G", slug: "b-g", title: "Проект B+G", note: "Серия рендеров B+G." },
  { prefix: "B-G", slug: "b-g-2", title: "Проект B-G", note: "Серия рендеров B-G." },
  { prefix: "S-G2", slug: "s-g2", title: "Проект S-G2", note: "Серия рендеров S-G2." },
  { prefix: "BR", slug: "br", title: "Проект BR", note: "Серия рендеров BR." },
  { prefix: "MB", slug: "mb", title: "Проект MB", note: "Серия рендеров MB." },
  { prefix: "B", slug: "b", title: "Проект B", note: "Серия рендеров B." },
  { prefix: "S", slug: "s", title: "Проект S", note: "Серия рендеров S." },
];

const OUT = path.join(process.cwd(), "public", "assets", "design");
const MANIFEST = path.join(process.cwd(), "content", "design.ts");

const files = fs
  .readdirSync(source)
  .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
  .sort((a, b) => a.localeCompare(b, "en"));

function groupOf(file) {
  const name = file.replace(/\s*\(\d+\)/, "");
  const prefix = GROUPS.filter((g) => name.startsWith(g.prefix + "_"))
    .sort((a, b) => b.prefix.length - a.prefix.length)[0];
  return prefix ?? null;
}

const buckets = new Map(GROUPS.map((g) => [g.slug, { ...g, items: [] }]));
let skipped = 0;

for (const file of files) {
  const group = groupOf(file);
  if (!group) {
    skipped += 1;
    console.warn("пропуск (неизвестный префикс):", file);
    continue;
  }

  const dir = path.join(OUT, group.slug);
  fs.mkdirSync(dir, { recursive: true });
  const bucket = buckets.get(group.slug);
  const index = String(bucket.items.length + 1).padStart(2, "0");
  const src = path.join(source, file);
  const image = sharp(src, { failOn: "none" }).rotate();
  const meta = await image.metadata();
  const bigWidth = Math.min(1600, meta.width || 1600);
  const smallWidth = Math.min(640, meta.width || 640);

  await image.clone().resize({ width: bigWidth, withoutEnlargement: true }).webp({ quality: 80, effort: 5 }).toFile(path.join(dir, `${index}.webp`));
  await image.clone().resize({ width: smallWidth, withoutEnlargement: true }).webp({ quality: 72, effort: 5 }).toFile(path.join(dir, `${index}-640.webp`));

  bucket.items.push({
    src: `/assets/design/${group.slug}/${index}.webp`,
    thumb: `/assets/design/${group.slug}/${index}-640.webp`,
    width: bigWidth,
    height: Math.round((bigWidth * (meta.height || 1)) / (meta.width || 1)),
    alt: `${group.title}, вид ${Number(index)} — дизайн-проект «ЛИНИЯ»`,
  });
  process.stdout.write(`\r${bucket.items.length + skipped}/${files.length} ${file}          `);
}

const groups = GROUPS.map((g) => buckets.get(g.slug)).filter((g) => g.items.length > 0);
const total = groups.reduce((sum, g) => sum + g.items.length, 0);

const body = groups
  .map(
    (g) => `  {
    slug: ${JSON.stringify(g.slug)},
    title: ${JSON.stringify(g.title)},
    note: ${JSON.stringify(g.note)},
    items: [
${g.items
  .map(
    (item) =>
      `      { src: ${JSON.stringify(item.src)}, thumb: ${JSON.stringify(item.thumb)}, width: ${item.width}, height: ${item.height}, alt: ${JSON.stringify(item.alt)} },`,
  )
  .join("\n")}
    ],
  },`,
  )
  .join("\n");

fs.writeFileSync(
  MANIFEST,
  `// Сгенерировано scripts/import-design.mjs — не править вручную.
export type DesignItem = { src: string; thumb: string; width: number; height: number; alt: string };
export type DesignGroup = { slug: string; title: string; note: string; items: DesignItem[] };

export const designGroups: DesignGroup[] = [
${body}
];

export const designTotal = ${total};
`,
  "utf8",
);

console.log(`\nГотово: ${total} рендеров в ${groups.length} группах, пропущено ${skipped}.`);
