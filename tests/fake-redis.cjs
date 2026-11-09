'use strict';
/* Local harness: serves the game and runs api/signaling.js against an in-memory
 * Redis imitation. Run with `node tests/fake-redis.cjs`, then open
 * http://127.0.0.1:8123/ . No Upstash account needed for tests. */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const store = new Map();
const now = () => Date.now();
const read = (key) => {
  const rec = store.get(key);
  if (!rec) return null;
  if (rec.exp && rec.exp < now()) { store.delete(key); return null; }
  return rec;
};
function exec(args) {
  const [cmd, ...rest] = args.map(String);
  if (process.env.DEBUG_REDIS) console.log('redis', cmd, rest[0]);
  const c = cmd.toLowerCase();
  if (c === 'get') return read(rest[0]) ? read(rest[0]).value : null;
  if (c === 'set') {
    const [key, value, ...opts] = rest;
    const o = opts.map((x) => x.toUpperCase());
    if (o.includes('NX') && read(key)) return null;
    const ex = o.indexOf('EX');
    store.set(key, { value, exp: ex >= 0 ? now() + Number(opts[ex + 1]) * 1000 : 0 });
    return 'OK';
  }
  if (c === 'del') { let n = 0; for (const k of rest) { if (store.delete(k)) n++; } return n; }
  if (c === 'expire') { const rec = read(rest[0]); if (!rec) return 0; rec.exp = now() + Number(rest[1]) * 1000; return 1; }
  if (c === 'incr') {
    let rec = read(rest[0]);
    if (!rec) { rec = { value: '0', exp: 0 }; store.set(rest[0], rec); }
    rec.value = String(Number(rec.value || 0) + 1);
    return Number(rec.value);
  }
  if (c === 'sadd') {
    let rec = read(rest[0]);
    if (!rec) { rec = { value: '', exp: 0 }; store.set(rest[0], rec); }
    if (!rec.set) rec.set = new Set();
    rec.set.add(String(rest[1]));
    return 1;
  }
  if (c === 'srem') { const rec = read(rest[0]); if (!rec || !rec.set) return 0; rec.set.delete(String(rest[1])); return 1; }
  if (c === 'smembers') { const rec = read(rest[0]); return rec && rec.set ? [...rec.set] : []; }
  if (c === 'mget') return rest.map((k) => (read(k) ? read(k).value : null));
  if (c === 'lpush') { const rec = read(rest[0]) || { value: '', exp: 0 }; if (!rec.list) rec.list = []; rec.list.unshift(rest[1]); store.set(rest[0], rec); if (process.env.DEBUG_REDIS) console.log('  -> list len', rec.list.length); return rec.list.length; }
  if (c === 'lrange') {
    const rec = read(rest[0]); if (process.env.DEBUG_REDIS) console.log('  -> lrange rec', rec ? (rec.list ? rec.list.length : 'no-list') : 'missing'); if (!rec || !rec.list) return [];
    const start = Number(rest[1]); let end = Number(rest[2]);
    if (end < 0) end = rec.list.length + end;
    return rec.list.slice(start, end + 1);
  }
  return null;
}

const redisServer = http.createServer((req, res) => {
  let body = '';
  req.on('data', (d) => { body += d; });
  req.on('end', () => {
    res.setHeader('Content-Type', 'application/json');
    if (req.url === '/pipeline') {
      const cmds = JSON.parse(body || '[]');
      res.end(JSON.stringify(cmds.map((c) => ({ result: exec(c) }))));
      return;
    }
    const parts = new URL(req.url, 'http://x').pathname.split('/').filter(Boolean).map(decodeURIComponent);
    res.end(JSON.stringify({ result: exec(parts) }));
  });
});

const REDIS_PORT = Number(process.env.FAKE_REDIS_PORT || 8199);
const PORT = Number(process.env.PORT || 8123);
process.env.UPSTASH_REDIS_REST_URL = 'http://127.0.0.1:' + REDIS_PORT;
process.env.UPSTASH_REDIS_REST_TOKEN = 'test';
const handler = require(path.join(ROOT, 'api/signaling.js'));

function wrap(res) {
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (obj) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)); };
  return res;
}
const web = http.createServer((req, res) => {
  if (req.url.startsWith('/api/signaling')) {
    let body = '';
    req.on('data', (d) => { body += d; });
    req.on('end', async () => {
      try { req.body = JSON.parse(body || '{}'); } catch (e) { req.body = {}; }
      if (process.env.DEBUG_ACTIONS) console.log('action', req.body.action, req.body.text || '');
      try { await handler(req, wrap(res)); } catch (e) { res.statusCode = 500; res.end('{"ok":false}'); }
    });
    return;
  }
  const file = req.url === '/' || req.url.startsWith('/?') ? '/index.html' : req.url.split('?')[0];
  fs.readFile(path.join(ROOT, file), (err, data) => {
    if (err) { res.statusCode = 404; res.end('not found'); return; }
    res.setHeader('Content-Type', file.endsWith('.html') ? 'text/html' : 'application/octet-stream');
    res.end(data);
  });
});

redisServer.listen(REDIS_PORT, '127.0.0.1', () => web.listen(PORT, '127.0.0.1', () => {
  console.log('test server on http://127.0.0.1:' + PORT + ' (fake redis on ' + REDIS_PORT + ')');
}));
