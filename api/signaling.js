'use strict';

/* AdBlock Island — room service (Vercel function).
 *
 * The authoritative room desk for online play. It owns membership, WebRTC
 * signaling, server-side chat filtering, mute enforcement, rate limits,
 * per-peer tokens and the handover backup. Gameplay stays host-simulated and
 * travels over WebRTC; this service is the authority for the room.
 *
 * POST /api/signaling  { action, ...body, token? }
 *   ping                              -> { ok, storage }
 *   create  { name, cls, mode }       -> { ok, code, peerId, token, role, room }
 *   join    { code, name, cls, mode } -> { ok, peerId, token, role, room }
 *   poll    { code, token }           -> { ok, room, messages }
 *   signal  { code, token, to, kind, payload }
 *   leave   { code, token }
 *   promote { code, token }           -> host handover
 *   backup  { code, token, state }    -> host only
 *   takeover{ code, token }           -> { ok, state, room }
 *   chat    { code, token, text }     -> filtered + rate-limited
 *   mute    { code, token, peerId, on } -> host only
 *
 * Env: UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
 *      (or KV_REST_API_URL / KV_REST_API_TOKEN)
 */

const crypto = require('crypto');

const BASE = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '';
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || '';
const MODE = (BASE && TOKEN) ? 'redis' : (BLOB_TOKEN ? 'blob' : 'none');
const ROOM_TTL = 7200;
const STALE_MS = 30000;
const MAX_PEERS = 4;
const MAX_BODY = 320 * 1024;
const MAX_SIGNAL = 64 * 1024;
const CHAT_RATE_SEC = 2;
const CHAT_MAX = 140;
const REQ_PER_SEC = 45;
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CLASSES = ['blocker', 'checker', 'reader', 'engineer', 'medic', 'hacker', 'streamer', 'archivist', 'moderator'];
const CHAT_BLOCK = ['fuck', 'shit', 'bitch', 'cunt', 'nigger', 'faggot', 'retard', 'asshole'];

const configured = () => !!(BASE && TOKEN);

async function redis(...parts) {
  const path = parts.map((p) => encodeURIComponent(String(p))).join('/');
  const res = await fetch(BASE + '/' + path, { headers: { Authorization: 'Bearer ' + TOKEN } });
  const data = await res.json().catch(() => ({}));
  if (data && data.error) throw new Error(data.error);
  return data ? data.result : null;
}

async function pipeline(cmds) {
  const res = await fetch(BASE + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds),
  });
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error('bad pipeline response');
  return data.map((d) => (d && d.error ? null : d.result));
}

const metaKey = (code) => `ai:room:${code}`;
const peersKey = (code) => `ai:room:${code}:peers`;
const peerKey = (code, id) => `ai:room:${code}:p:${id}`;
const inboxKey = (code, id) => `ai:room:${code}:in:${id}`;
const backupKey = (code) => `ai:room:${code}:backup`;
const chatKey = (id) => `ai:chat:${id}`;
const rateKey = (id, sec) => `ai:rl:${id}:${sec}`;

const clean = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max);
const cleanClass = (v) => (CLASSES.includes(v) ? v : 'blocker');
const newId = () => crypto.randomBytes(5).toString('hex');
const newToken = () => crypto.randomBytes(16).toString('hex');
const newCode = () => {
  let out = '';
  for (let i = 0; i < 6; i++) out += CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)];
  return out;
};
const parse = (raw) => {
  try { return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
};

function filterChat(text) {
  let t = clean(text, CHAT_MAX).replace(/\s+/g, ' ').trim();
  t = t.replace(/https?:\/\/\S+|www\.\S+/gi, '[link]');
  let hit = false;
  for (const w of CHAT_BLOCK) {
    const re = new RegExp(w, 'gi');
    if (re.test(t)) { hit = true; t = t.replace(re, '…'); }
  }
  return { text: t, hit };
}

async function readRoom(code) {
  const [metaRaw, ids] = await pipeline([
    ['get', metaKey(code)],
    ['smembers', peersKey(code)],
  ]);
  const meta = parse(metaRaw);
  if (!meta) return null;
  const list = Array.isArray(ids) ? ids : [];
  let peers = [];
  if (list.length) {
    const raws = await pipeline([['mget', ...list.map((id) => peerKey(code, id))]]);
    const rows = Array.isArray(raws[0]) ? raws[0] : [];
    peers = rows.map(parse).filter(Boolean);
    const now = Date.now();
    const dead = peers.filter((p) => !p.lastSeen || now - p.lastSeen > STALE_MS);
    if (dead.length) {
      const cmds = [];
      for (const p of dead) {
        cmds.push(['srem', peersKey(code), p.id]);
        cmds.push(['del', peerKey(code, p.id)]);
        cmds.push(['del', inboxKey(code, p.id)]);
      }
      await pipeline(cmds);
      const deadIds = new Set(dead.map((p) => p.id));
      peers = peers.filter((p) => !deadIds.has(p.id));
    }
  }
  return {
    code,
    host: meta.host,
    createdAt: meta.createdAt,
    peers: peers.map((p) => ({
      id: p.id, name: p.name, cls: p.cls,
      role: p.id === (meta.host && meta.host.id) ? 'host' : 'guest',
      mode: p.mode || 'play', muted: !!p.muted, lastSeen: p.lastSeen
    }))
  };
}

async function resolvePeer(code, tokenValue) {
  if (!code || !tokenValue) return null;
  const room = await readRoom(code);
  if (!room) return { room: null, peer: null };
  const ids = room.peers.map((p) => p.id);
  if (!ids.length) return { room, peer: null };
  const raws = await pipeline([['mget', ...ids.map((id) => peerKey(code, id))]]);
  const rows = Array.isArray(raws[0]) ? raws[0] : [];
  const peer = rows.map(parse).filter(Boolean).find((p) => p.token === tokenValue);
  return { room, peer };
}

async function tooFast(peerId) {
  const sec = Math.floor(Date.now() / 1000);
  const key = rateKey(peerId, sec);
  const [, n] = await pipeline([['incr', key], ['expire', key, 2]]);
  return Number(n) > REQ_PER_SEC;
}

async function fanout(code, ids, message) {
  const cmds = [];
  for (const id of ids) {
    cmds.push(['lpush', inboxKey(code, id), JSON.stringify(message)]);
    cmds.push(['expire', inboxKey(code, id), ROOM_TTL]);
  }
  if (cmds.length) await pipeline(cmds);
}
async function system(code, text) {
  const ids = (await redis('smembers', peersKey(code))) || [];
  await fanout(code, Array.isArray(ids) ? ids : [], { id: newId(), kind: 'system', text, at: Date.now() });
}

async function create(body) {
  const name = clean(body.name, 16) || 'a neighbour';
  const cls = cleanClass(body.cls);
  const mode = body.mode === 'watch' ? 'watch' : 'play';
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = newCode();
    const peerId = newId();
    const token = newToken();
    const meta = JSON.stringify({ code, host: { id: peerId, name, cls }, createdAt: Date.now() });
    const set = await redis('set', metaKey(code), meta, 'EX', ROOM_TTL, 'NX');
    if (set !== 'OK') continue;
    const peer = JSON.stringify({ id: peerId, name, cls, role: 'host', mode, token, muted: false, lastSeen: Date.now() });
    await pipeline([
      ['sadd', peersKey(code), peerId],
      ['set', peerKey(code, peerId), peer, 'EX', ROOM_TTL],
      ['expire', peersKey(code), ROOM_TTL],
    ]);
    return { ok: true, code, peerId, token, role: 'host', room: await readRoom(code) };
  }
  return { ok: false, status: 503, error: 'Could not open a room. Try once more.' };
}

async function join(body) {
  const code = clean(body.code, 6).toUpperCase();
  if (!/^[A-Z2-9]{6}$/.test(code)) return { ok: false, status: 400, error: 'A room code is six letters and numbers.' };
  const room = await readRoom(code);
  if (!room) return { ok: false, status: 404, error: 'No room with that code. It may have closed.' };
  if (room.peers.length >= MAX_PEERS) return { ok: false, status: 409, error: 'That room is full (four heroes).' };
  const name = clean(body.name, 16) || 'a neighbour';
  const cls = cleanClass(body.cls);
  const mode = body.mode === 'watch' ? 'watch' : 'play';
  const peerId = newId();
  const token = newToken();
  const peer = JSON.stringify({ id: peerId, name, cls, role: 'guest', mode, token, muted: false, lastSeen: Date.now() });
  await pipeline([
    ['sadd', peersKey(code), peerId],
    ['set', peerKey(code, peerId), peer, 'EX', ROOM_TTL],
    ['expire', peersKey(code), ROOM_TTL],
  ]);
  await system(code, name + ' joined the room.');
  return { ok: true, peerId, token, role: 'guest', room: await readRoom(code) };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function poll(body) {
  const code = clean(body.code, 6).toUpperCase();
  const { room, peer } = await resolvePeer(code, body.token);
  if (!room) return { ok: false, status: 404, error: 'The room closed.' };
  if (!peer) return { ok: false, status: 410, error: 'You left the room.' };
  if (await tooFast(peer.id)) return { ok: false, status: 429, error: 'Slow down a little.' };
  const wait = Math.min(8000, Math.max(0, Number(body.wait) || 0));
  const started = Date.now();
  let msgs = [];
  // long-poll: hold the request open and check the inbox, so chat feels
  // immediate without polling every second from every client
  if (wait > 0) {
    while (Date.now() - started < wait) {
      const [box] = await pipeline([['lrange', inboxKey(code, peer.id), 0, -1]]);
      if (Array.isArray(box) && box.length) { msgs = box; break; }
      await sleep(Math.min(900, Math.max(120, wait - (Date.now() - started))));
    }
    if (!msgs.length) {
      const [box] = await pipeline([['lrange', inboxKey(code, peer.id), 0, -1]]);
      msgs = Array.isArray(box) ? box : [];
    }
  } else {
    const [box] = await pipeline([['lrange', inboxKey(code, peer.id), 0, -1]]);
    msgs = Array.isArray(box) ? box : [];
  }
  const now = Date.now();
  const ids = room.peers.map((p) => p.id);
  if (!ids.includes(peer.id)) return { ok: false, status: 410, error: 'You left the room.' };
  const updated = JSON.stringify(Object.assign({}, peer, { lastSeen: now }));
  await pipeline([['set', peerKey(code, peer.id), updated, 'EX', ROOM_TTL]]);
  if (msgs.length) await redis('del', inboxKey(code, peer.id));
  await pipeline([['expire', metaKey(code), ROOM_TTL], ['expire', peersKey(code), ROOM_TTL]]);
  const messages = msgs.map(parse).filter(Boolean);
  return { ok: true, room: await readRoom(code), messages, waited: wait > 0, elapsed: Date.now() - started };
}

async function signal(body) {
  const code = clean(body.code, 6).toUpperCase();
  const { room, peer } = await resolvePeer(code, body.token);
  if (!room) return { ok: false, status: 404, error: 'The room closed.' };
  if (!peer) return { ok: false, status: 410, error: 'You left the room.' };
  if (await tooFast(peer.id)) return { ok: false, status: 429, error: 'Slow down a little.' };
  const to = clean(body.to, 24);
  const kind = clean(body.kind, 12);
  if (!room.peers.some((p) => p.id === to) || !['offer', 'answer', 'ice'].includes(kind)) {
    return { ok: false, status: 400, error: 'Bad signal.' };
  }
  const payload = JSON.stringify(body.payload || null);
  if (payload.length > MAX_SIGNAL) return { ok: false, status: 413, error: 'Signal too large.' };
  await fanout(code, [to], { id: newId(), from: peer.id, kind, payload: body.payload || null, at: Date.now() });
  return { ok: true };
}

async function leave(body) {
  const code = clean(body.code, 6).toUpperCase();
  const { room, peer } = await resolvePeer(code, body.token);
  if (!room || !peer) return { ok: true };
  await pipeline([
    ['srem', peersKey(code), peer.id],
    ['del', peerKey(code, peer.id)],
    ['del', inboxKey(code, peer.id)],
  ]);
  await system(code, peer.name + ' left the room.');
  return { ok: true };
}

async function promote(body) {
  const code = clean(body.code, 6).toUpperCase();
  const { room, peer } = await resolvePeer(code, body.token);
  if (!room) return { ok: false, status: 404, error: 'The room closed.' };
  if (!peer) return { ok: false, status: 410, error: 'Not in this room.' };
  const meta = parse(await redis('get', metaKey(code)));
  if (!meta) return { ok: false, status: 404, error: 'The room closed.' };
  meta.host = { id: peer.id, name: peer.name, cls: peer.cls };
  await redis('set', metaKey(code), JSON.stringify(meta), 'EX', ROOM_TTL);
  await system(code, peer.name + ' is the host now.');
  return { ok: true, room: await readRoom(code) };
}

async function backup(body) {
  const code = clean(body.code, 6).toUpperCase();
  const { room, peer } = await resolvePeer(code, body.token);
  if (!room) return { ok: false, status: 404, error: 'The room closed.' };
  if (!peer) return { ok: false, status: 410, error: 'Not in this room.' };
  if (!room.host || room.host.id !== peer.id) return { ok: false, status: 403, error: 'Only the host backs up the island.' };
  const state = typeof body.state === 'string' ? body.state : JSON.stringify(body.state || {});
  if (state.length > MAX_BODY) return { ok: false, status: 413, error: 'State too large.' };
  await redis('set', backupKey(code), state, 'EX', 120);
  return { ok: true };
}

async function takeover(body) {
  const code = clean(body.code, 6).toUpperCase();
  const { room, peer } = await resolvePeer(code, body.token);
  if (!room) return { ok: false, status: 404, error: 'The room closed.' };
  if (!peer) return { ok: false, status: 410, error: 'Not in this room.' };
  const state = await redis('get', backupKey(code));
  if (!state) return { ok: false, status: 404, error: 'No island state to take over.' };
  const meta = parse(await redis('get', metaKey(code)));
  if (!meta) return { ok: false, status: 404, error: 'The room closed.' };
  meta.host = { id: peer.id, name: peer.name, cls: peer.cls };
  await pipeline([
    ['set', metaKey(code), JSON.stringify(meta), 'EX', ROOM_TTL],
    ['del', backupKey(code)],
  ]);
  await system(code, peer.name + ' took the island over.');
  return { ok: true, state, room: await readRoom(code) };
}

async function chat(body) {
  const code = clean(body.code, 6).toUpperCase();
  const { room, peer } = await resolvePeer(code, body.token);
  if (!room) return { ok: false, status: 404, error: 'The room closed.' };
  if (!peer) return { ok: false, status: 410, error: 'Not in this room.' };
  if (peer.muted) return { ok: false, status: 403, error: 'The host muted your chat.' };
  if (await tooFast(peer.id)) return { ok: false, status: 429, error: 'Slow down a little.' };
  const slot = await redis('set', chatKey(peer.id), '1', 'EX', CHAT_RATE_SEC, 'NX');
  if (slot !== 'OK') return { ok: false, status: 429, error: 'One line every ' + CHAT_RATE_SEC + ' seconds.' };
  const f = filterChat(body.text);
  if (!f.text) return { ok: false, status: 400, error: 'Nothing to say.' };
  const msg = { id: newId(), kind: 'chat', from: peer.id, name: peer.name, mode: peer.mode || 'play', text: f.text, filtered: f.hit, at: Date.now() };
  await fanout(code, room.peers.map((p) => p.id), msg);
  return { ok: true, sent: f.text };
}

async function mute(body) {
  const code = clean(body.code, 6).toUpperCase();
  const { room, peer } = await resolvePeer(code, body.token);
  if (!room) return { ok: false, status: 404, error: 'The room closed.' };
  if (!peer) return { ok: false, status: 410, error: 'Not in this room.' };
  if (!room.host || room.host.id !== peer.id) return { ok: false, status: 403, error: 'Only the host can mute.' };
  const targetId = clean(body.peerId, 24);
  if (targetId === peer.id) return { ok: false, status: 400, error: 'No such hero.' };
  const target = parse(await redis('get', peerKey(code, targetId)));
  if (!target) return { ok: false, status: 400, error: 'No such hero.' };
  target.muted = !!body.on;
  await redis('set', peerKey(code, targetId), JSON.stringify(target), 'EX', ROOM_TTL);
  return { ok: true, room: await readRoom(code) };
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return parse(req.body) || {};
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
    if (chunks.reduce((n, c) => n + c.length, 0) > MAX_BODY) throw new Error('too large');
  }
  return parse(Buffer.concat(chunks).toString('utf8')) || {};
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'POST only.' }); return; }
  let body = {};
  try { body = await readBody(req); } catch (e) { res.status(400).json({ ok: false, error: 'Bad request body.' }); return; }
  const action = clean(body.action, 12);
  if (action === 'ping') {
    res.status(200).json({
      ok: true,
      storage: MODE !== 'none',
      service: 'room-desk',
      mode: MODE,
      env: { url: !!BASE, token: !!TOKEN, blob: !!BLOB_TOKEN }
    });
    return;
  }
  if (MODE === 'none') {
    res.status(503).json({ ok: false, storage: false, error: 'Room codes are not switched on yet. In Vercel open Storage → Create → Upstash Redis or Blob, connect it to this project, and press try again. No redeploy is needed.' });
    return;
  }
  if (MODE === 'blob') {
    try {
      const out = await require('./blob-rooms').handle(action, body);
      const status = out && out.status ? out.status : out && out.ok === false ? 400 : 200;
      res.status(status).json(out);
    } catch (e) {
      if (process.env.DEBUG_ACTIONS) console.error('blob room error:', e && (e.stack || e.message || e));
      res.status(500).json({ ok: false, error: 'The room desk hit a snag. Try again in a moment.' });
    }
    return;
  }
  const handlers = { create, join, poll, signal, leave, promote, backup, takeover, chat, mute };
  const handler = handlers[action];
  if (!handler) { res.status(400).json({ ok: false, error: 'Unknown action.' }); return; }
  try {
    const out = await handler(body);
    const status = out && out.status ? out.status : out && out.ok === false ? 400 : 200;
    res.status(status).json(out);
  } catch (e) {
    if (process.env.DEBUG_ACTIONS) console.error('room desk error:', e && (e.stack || e.message || e));
    res.status(500).json({ ok: false, error: 'The room desk hit a snag. Try again in a moment.' });
  }
};
