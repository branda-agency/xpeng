#!/usr/bin/env node
// Dumps BAI's Website_L03_BG.xlsx (2026-09-03) into bai-specsheet.json (sheet 1 "Технически характеристики")
// and bai-options.json (sheet 2 "Опционално оборудване"). The 2026-09-02 file Xpeng_L03_BG.xlsx is kept for history.
// so build.py can read it without an XML parser (Python's expat is broken on this Mac).
// Output: { rows: [{ r, A, B, C, D, E, F }], merges: ["B5:F5", ...], comments: {A68: "..."} }
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import os from 'node:os';

const here = path.dirname(new URL(import.meta.url).pathname);
const xlsx = path.join(here, 'Website_L03_BG.xlsx');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'l03xlsx-'));
execSync(`unzip -o -q "${xlsx}" -d "${tmp}"`);

const dec = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
const ss = [];
for (const m of fs.readFileSync(path.join(tmp, 'xl/sharedStrings.xml'), 'utf8').matchAll(/<si>([\s\S]*?)<\/si>/g)) {
  ss.push(dec([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map(t => t[1]).join('')));
}
function dumpSheet(file) {
const sheet = fs.readFileSync(path.join(tmp, `xl/worksheets/${file}`), 'utf8');
const rows = {};
for (const c of sheet.matchAll(/<c r="([A-Z]+)(\d+)"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
  const [, col, row, attrs, inner = ''] = c;
  const vm = inner.match(/<v>([\s\S]*?)<\/v>/);
  let v = null;
  if (/t="s"/.test(attrs) && vm) v = ss[+vm[1]];
  else if (/t="inlineStr"/.test(attrs)) v = dec([...inner.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map(t => t[1]).join(''));
  else if (vm) v = vm[1];
  if (v === null) continue;
  v = String(v).replace(/\r?\n+/g, ' / ').replace(/\s+/g, ' ').trim();   // in-cell line breaks → ' / '
  if (v === '') continue;
  (rows[row] = rows[row] || { r: +row })[col] = v;
}
const merges = [...sheet.matchAll(/<mergeCell ref="([^"]+)"/g)].map(m => m[1]);
const comments = {};
const cx = path.join(tmp, 'xl/comments1.xml');
if (fs.existsSync(cx)) {
  for (const m of fs.readFileSync(cx, 'utf8').matchAll(/<comment ref="([^"]+)"[\s\S]*?<\/comment>/g)) {
    comments[m[1]] = dec(m[0].replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').replace(/^\s*Admin Admin:\s*/, '').trim();
  }
}
  return { rows: Object.values(rows).sort((a, b) => a.r - b.r), merges, comments };
}
const specs = dumpSheet('sheet1.xml'), options = dumpSheet('sheet2.xml');
fs.writeFileSync(path.join(here, 'bai-specsheet.json'), JSON.stringify({ source: 'Website_L03_BG.xlsx, sheet "Технически характеристики" (BAI, received 2026-09-03)', ...specs }, null, 1));
fs.writeFileSync(path.join(here, 'bai-options.json'), JSON.stringify({ source: 'Website_L03_BG.xlsx, sheet "Опционално оборудване" (BAI, received 2026-09-03)', ...options }, null, 1));
console.log(`specs rows=${specs.rows.length} merges=${specs.merges.length} comments=${Object.keys(specs.comments).length}; options rows=${options.rows.length}`);
