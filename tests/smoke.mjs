import { chromium } from '@playwright/test';

const BASE = process.env.BASE || 'http://127.0.0.1:8123';
const errors = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
const apiCalls = [];
page.on('request', (r) => { if (r.url().includes('/api/')) apiCalls.push(r.url()); });

await page.goto(BASE + '/', { waitUntil: 'load' });
await page.waitForTimeout(700);
const boot = await page.evaluate(() => ({
  version: eval('typeof VERSION !== "undefined" ? VERSION : null'),
  online: document.getElementById('onlineBtn')?.innerText,
  sameStyle: document.getElementById('onlineBtn')?.className === document.getElementById('startBtn')?.className,
  halloween: document.body.classList.contains('halloween'),
  pills: document.querySelectorAll('.mania-pill,.halloween-pill').length,
}));
if (!boot.version) throw new Error('no game version');
if (!boot.online || !boot.sameStyle) throw new Error('online button missing or styled differently');
if (boot.halloween || boot.pills) throw new Error('retired mode UI is still visible');

await page.click('#startBtn');
await page.waitForTimeout(1800);
const state = await page.evaluate(() => ({ state: game.state, wave: game.wave, ads: monsters.length }));
if (state.state !== 'playing') throw new Error('solo game did not start');
if (apiCalls.length) throw new Error('offline build made API calls: ' + apiCalls.join(', '));
if (errors.length) throw new Error('console errors: ' + errors.slice(0, 3).join(' | '));

console.log('smoke ok', JSON.stringify({ boot, state }));
await browser.close();
