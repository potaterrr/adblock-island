import { chromium } from '@playwright/test';

const BASE = process.env.BASE || 'http://127.0.0.1:8123';
const browser = await chromium.launch();
const errors = [];
const a = await (await browser.newContext()).newPage();
const b = await (await browser.newContext()).newPage();
for (const [n, p] of [['A', a], ['B', b]]) {
  p.on('pageerror', (e) => errors.push(n + ': ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error') errors.push(n + ': ' + m.text()); });
}

await a.goto(BASE + '/', { waitUntil: 'load' });
await a.waitForTimeout(500);
await a.fill('#nameInput', 'Wren');
await a.click('#onlineBtn');
await a.waitForTimeout(250);
await a.click('#netCreateBtn');
await a.waitForFunction(() => document.querySelector('.room-code')?.textContent?.length === 6, null, { timeout: 10000 });
const code = (await a.textContent('.room-code')).trim();

await b.goto(BASE + '/?room=' + code, { waitUntil: 'load' });
await b.waitForTimeout(600);
await b.fill('#nameInput', 'Marlow');
await b.click('#netJoinBtn');
await a.waitForFunction(() => document.querySelectorAll('.net-line').length === 2, null, { timeout: 15000 });
await a.waitForTimeout(700);
await a.click('#netStartBtn');
await b.waitForFunction(() => !!(NET.session && NET.session.guest), null, { timeout: 15000 });
await b.waitForTimeout(700);

const host = await a.evaluate(() => ({ heroes: bots.filter((x) => x.net).length, wave: game.wave }));
const guest = await b.evaluate(() => ({ state: game.state, wave: game.wave, monsters: monsters.length, hp: Math.round(player.hp) }));
if (host.heroes !== 1) throw new Error('host did not spawn one online hero');
if (guest.state !== 'playing' || guest.monsters < 1) throw new Error('guest did not receive the island');

const x0 = await a.evaluate(() => Math.round(bots.find((x) => x.net).x));
await b.keyboard.down('d');
await b.waitForTimeout(800);
await b.keyboard.up('d');
await b.waitForTimeout(600);
const x1 = await a.evaluate(() => Math.round(bots.find((x) => x.net).x));
if (x1 <= x0) throw new Error('guest movement did not reach the host');

// server-moderated chat: blocked word + link
await b.keyboard.press('c');
await b.waitForTimeout(250);
await b.fill('#netChatInput', 'hi shit https://example.com');
await b.click('#netChatSend');
await a.waitForFunction(() => [...ui.chatLog.children].some((x) => x.textContent.includes('Marlow:')), null, { timeout: 8000 });
const lines = await a.evaluate(() => [...ui.chatLog.children].map((x) => x.textContent).filter((t) => t.includes('Marlow')));
const said = lines.find((t) => t.includes('hi'));
if (!said || /shit|https/.test(said) || !/…/.test(said) || !/\[link\]/.test(said)) throw new Error('chat was not filtered server-side: ' + JSON.stringify(lines));

if (errors.length) throw new Error('console errors: ' + errors.slice(0, 3).join(' | '));
console.log('co-op ok', JSON.stringify({ code, host, guest, moved: [x0, x1], said }));
await browser.close();
