import { chromium } from '@playwright/test';
const BASE = process.env.BASE || 'http://127.0.0.1:8123';
const browser = await chromium.launch();
const a = await (await browser.newContext()).newPage();
const b = await (await browser.newContext()).newPage();
const errors = [];
for (const [n, p] of [['A', a], ['B', b]]) {
  p.on('pageerror', (e) => errors.push(n + ' ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error') errors.push(n + ' ' + m.text()); });
}
await a.goto(BASE + '/', { waitUntil: 'load' });
await a.waitForTimeout(400);
await a.fill('#nameInput', 'Wren');
await a.click('#onlineBtn'); await a.waitForTimeout(200); await a.click('#netCreateBtn');
await a.waitForFunction(() => document.querySelector('.room-code')?.textContent?.length === 6, null, { timeout: 10000 });
const code = (await a.textContent('.room-code')).trim();
await b.goto(BASE + '/?room=' + code, { waitUntil: 'load' });
await b.waitForTimeout(500);
await b.fill('#nameInput', 'Marlow');
await b.click('#netJoinBtn');
await a.waitForFunction(() => document.querySelectorAll('.net-line').length === 2, null, { timeout: 15000 });
await a.waitForTimeout(600);
await a.click('#netStartBtn');
await b.waitForFunction(() => !!(NET.session && NET.session.guest), null, { timeout: 15000 });
await b.waitForTimeout(600);

// guest opens the shared wall and pins a note
await b.evaluate(() => { netSendToHost({ t: 'wall' }); openPanel('wallnet'); });
await b.waitForTimeout(700);
const wall = await b.evaluate(() => ({ modal: game.modalType, cards: document.querySelectorAll('#modalBody .note-card').length }));
await b.fill('#netWallText', 'the sea is doing the soft thing again');
await b.click('#netWallForm button[type="submit"]');
await a.waitForTimeout(800);
const hostWall = await a.evaluate(() => loadNotes().slice(-1).map((n) => ({ text: n.text, name: n.name })));
const guestWall = await b.evaluate(() => (NET.wallNotes || []).slice(-1).map((n) => n.text));
console.log('wall', JSON.stringify(hostWall));
if (!hostWall.length || !hostWall[0].text.includes('soft thing')) throw new Error('note did not reach the host wall');

// guest sees the next wave banner
await b.keyboard.press('Escape');
await a.evaluate(() => startWave(2));
await b.waitForTimeout(700);
const banner = await b.evaluate(() => ({ label: ui.waveLabel.textContent, count: ui.waveCount.textContent, shown: ui.waveBanner.className.includes('show') }));

if (!banner.shown || !banner.count.includes('ads')) throw new Error('guest did not see the wave banner');

// spectator chip / relay panel smoke
await a.evaluate(() => openPanel('settings'));
await a.waitForTimeout(400);
const hasTurn = await a.evaluate(() => !!document.getElementById('turnBtn'));
if (hasTurn) await a.click('#turnBtn');
await a.waitForTimeout(300);
const turnModal = await a.evaluate(() => game.modalType);
if (!hasTurn || turnModal !== 'turn') throw new Error('relay settings panel missing');
if (errors.length) throw new Error('console errors: ' + errors.slice(0, 4).join(' | '));
console.log('wall + banner + relay ok');
await browser.close();
