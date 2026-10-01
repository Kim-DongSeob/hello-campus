import { readFile, access, stat } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { join } from 'node:path';
const html = await readFile('dist/index.html', 'utf8');
const css = await readFile('dist/styles.css', 'utf8');
const assets = new Set([...html.matchAll(/(?:src|href)="(\/[^"#]+)"/g), ...css.matchAll(/url\(['"]?(\/[^)'" ]+)/g)].map(match => match[1]));
for (const asset of assets) { await access(join('dist', asset)); assert.ok((await stat(join('dist', asset))).size > 0, asset); }
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, new Set(ids).size, 'Unique element IDs');
for (const match of html.matchAll(/(?:href="#|aria-controls=")([^"]+)"/g)) assert.ok(ids.includes(match[1]), `Missing target ${match[1]}`);
console.log(`Verified ${assets.size} local assets, ${ids.length} unique IDs, and all navigation targets.`);
