import { chromium } from '@playwright/test';

const BASE = process.env.BASE || 'http://127.0.0.1:8123';
const browser = await chromium.launch();
const errors = [];
const pages = [];
for (const n of ['A', 'B', 'C']) {
  const p = await (await browser.newContext()).newPage();
  p.on('pageerror', (e) => errors.push(n + ': ' + e.message));
  pages.push(p);
}
const [a, b, c] = pages;

await a.goto(BASE + '/', { waitUntil: 'load' });
await a.waitForTimeout(400);
await a.fill('#nameInput', 'Wren');
await a.click('#onlineBtn');
await a.waitForTimeout(200);
await a.click('#netCreateBtn');
await a.waitForFunction(() => document.querySelector('.room-code')?.textContent?.length === 6, null, { timeout: 10000 });
const code = (await a.textContent('.room-code')).trim();

await b.goto(BASE + '/?room=' + code, { waitUntil: 'load' });
await b.waitForTimeout(500);
await b.fill('#nameInput', 'Marlow');
await b.click('#netJoinBtn');
await a.waitForFunction(() => document.querySelectorAll('.net-line').length === 2, null, { timeout: 15000 });

await c.goto(BASE + '/?room=' + code, { waitUntil: 'load' });
await c.waitForTimeout(500);
await c.fill('#nameInput', 'Sage');
await c.click('#netJoinBtn');
await a.waitForFunction(() => document.querySelectorAll('.net-line').length === 3, null, { timeout: 15000 });
await a.waitForTimeout(700);
await a.click('#netStartBtn');
await b.waitForFunction(() => !!(NET.session && NET.session.guest), null, { timeout: 15000 });
await c.waitForFunction(() => !!(NET.session && NET.session.guest), null, { timeout: 15000 });
await a.waitForTimeout(700);

const oldHost = await a.evaluate(() => NET.peerId);
await a.evaluate(() => netLeave());
await b.waitForTimeout(6500);
const newHost = await b.evaluate(() => ({ host: !!(NET.session && NET.session.host), wave: game.wave, monsters: monsters.length, heroes: 1 + bots.length }));
if (!newHost.host) throw new Error('successor did not become host');
if (newHost.monsters < 1) throw new Error('successor did not adopt the island');

await c.waitForTimeout(5000);
const stayed = await c.evaluate(() => ({ guest: !!(NET.session && NET.session.guest), hostId: NET.room && NET.room.host && NET.room.host.id, monsters: monsters.length }));
if (!stayed.guest) throw new Error('third guest dropped during handover');
if (!stayed.hostId || stayed.hostId === oldHost) throw new Error('room host id was not promoted');
if (stayed.monsters < 1) throw new Error('third guest lost the island');

if (errors.length) throw new Error('console errors: ' + errors.slice(0, 4).join(' | '));
console.log('handover ok', JSON.stringify({ oldHost, newHost, stayed }));
await browser.close();
