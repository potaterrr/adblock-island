'use strict';

/* AdBlock Island — Phase 1 room signaling.
 *
 * One tiny serverless endpoint that lets two to four browsers find each other
 * over a short room code. It stores only room metadata and the WebRTC SDP/ICE
 * handshake in Upstash Redis (REST). No accounts, no gameplay state, no chat.
 *
 * POST /api/signaling  { action, ...body }
 *   ping    {}                          -> { ok, storage }
 *   create  { name, cls }               -> { ok, code, peerId, role, room }
 *   join    { code, name, cls }         -> { ok, peerId, role, room }
 *   poll    { code, peerId }            -> { ok, room, messages }
 *   signal  { code, from, to, kind, payload }
 *   leave   { code, peerId }
 *
 * Env: UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
 *      (or the KV_REST_API_* names some Marketplace installs inject).
 */

const BASE = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '';
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';
const ROOM_TTL = 7200;
const STALE_MS = 30000;
const MAX_PEERS = 4;
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CLASSES = ['blocker', 'checker', 'reader', 'engineer', 'medic', 'hacker', 'streamer', 'archivist', 'moderator'];

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

const clean = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max);
const cleanClass = (v) => (CLASSES.includes(v) ? v : 'blocker');
const newId = () => Math.random().toString(36).slice(2, 12);
const newCode = () => {
  let out = '';
  for (let i = 0; i < 6; i++) out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  return out;
};
const parse = (raw) => {
  try { return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
};

async function readRoom(code) {
  const [metaRaw, ids] = await pipeline([
    ['get', metaKey(code)],
    ['smembers', peersKey(code)],
  ]);
  const meta = parse(metaRaw);
  if (!meta) return null;
  const ids2 = Array.isArray(ids) ? ids : [];
  let peers = [];
  if (ids2.length) {
    const raws = await pipeline([['mget', ...ids2.map((id) => peerKey(code, id))]]);
    const list = Array.isArray(raws[0]) ? raws[0] : [];
    peers = list.map(parse).filter(Boolean);
    // drop peers that stopped polling (closed tab, lost network)
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
    peers: peers.map((p) => ({ id: p.id, name: p.name, cls: p.cls, role: p.role, lastSeen: p.lastSeen })),
  };
}

async function touchRoom(code) {
  await pipeline([
    ['expire', metaKey(code), ROOM_TTL],
    ['expire', peersKey(code), ROOM_TTL],
  ]);
}

async function create(body) {
  const name = clean(body.name, 16) || 'a neighbour';
  const cls = cleanClass(body.cls);
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = newCode();
    const peerId = newId();
    const meta = JSON.stringify({ code, host: { id: peerId, name, cls }, createdAt: Date.now() });
    const set = await redis('set', metaKey(code), meta, 'EX', ROOM_TTL, 'NX');
    if (set !== 'OK') continue;
    const peer = JSON.stringify({ id: peerId, name, cls, role: 'host', lastSeen: Date.now() });
    await pipeline([
      ['sadd', peersKey(code), peerId],
      ['set', peerKey(code, peerId), peer, 'EX', ROOM_TTL],
      ['expire', peersKey(code), ROOM_TTL],
    ]);
    return { ok: true, code, peerId, role: 'host', room: await readRoom(code) };
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
  const peerId = newId();
  const peer = JSON.stringify({ id: peerId, name, cls, role: 'guest', lastSeen: Date.now() });
  await pipeline([
    ['sadd', peersKey(code), peerId],
    ['set', peerKey(code, peerId), peer, 'EX', ROOM_TTL],
    ['expire', peersKey(code), ROOM_TTL],
  ]);
  return { ok: true, peerId, role: 'guest', room: await readRoom(code) };
}

async function poll(body) {
  const code = clean(body.code, 6).toUpperCase();
  const peerId = clean(body.peerId, 24);
  if (!code || !peerId) return { ok: false, status: 400, error: 'Missing room.' };
  const room = await readRoom(code);
  if (!room) return { ok: false, status: 404, error: 'The room closed.' };
  if (!room.peers.some((p) => p.id === peerId)) return { ok: false, status: 410, error: 'You left the room.' };
  const now = Date.now();
  const peer = room.peers.find((p) => p.id === peerId);
  const [, msgs] = await pipeline([
    ['set', peerKey(code, peerId), JSON.stringify({ ...peer, lastSeen: now }), 'EX', ROOM_TTL],
    ['lrange', inboxKey(code, peerId), 0, -1],
  ]);
  if (Array.isArray(msgs) && msgs.length) await redis('del', inboxKey(code, peerId));
  await touchRoom(code);
  const messages = (Array.isArray(msgs) ? msgs : []).map(parse).filter(Boolean);
  return { ok: true, room, messages };
}

async function signal(body) {
  const code = clean(body.code, 6).toUpperCase();
  const from = clean(body.from, 24);
  const to = clean(body.to, 24);
  const kind = clean(body.kind, 12);
  if (!code || !from || !to || !['offer', 'answer', 'ice'].includes(kind)) {
    return { ok: false, status: 400, error: 'Bad signal.' };
  }
  const meta = parse(await redis('get', metaKey(code)));
  if (!meta) return { ok: false, status: 404, error: 'The room closed.' };
  const message = JSON.stringify({ id: newId(), from, kind, payload: body.payload, at: Date.now() });
  await pipeline([
    ['lpush', inboxKey(code, to), message],
    ['expire', inboxKey(code, to), ROOM_TTL],
  ]);
  return { ok: true };
}

async function leave(body) {
  const code = clean(body.code, 6).toUpperCase();
  const peerId = clean(body.peerId, 24);
  if (!code || !peerId) return { ok: false, status: 400, error: 'Missing room.' };
  await pipeline([
    ['srem', peersKey(code), peerId],
    ['del', peerKey(code, peerId)],
    ['del', inboxKey(code, peerId)],
  ]);
  return { ok: true };
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return parse(req.body) || {};
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
    if (chunks.reduce((n, c) => n + c.length, 0) > 64 * 1024) throw new Error('too large');
  }
  return parse(Buffer.concat(chunks).toString('utf8')) || {};
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'POST only.' });
    return;
  }
  let body = {};
  try { body = await readBody(req); } catch (e) {
    res.status(400).json({ ok: false, error: 'Bad request body.' });
    return;
  }
  const action = clean(body.action, 12);
  if (action === 'ping') {
    res.status(200).json({ ok: true, storage: configured() });
    return;
  }
  if (!configured()) {
    res.status(503).json({
      ok: false,
      error: 'Room codes are not switched on yet. Add the free Upstash Redis store in the Vercel project, then try again.',
      storage: false,
    });
    return;
  }
  const handlers = { create, join, poll, signal, leave };
  const handler = handlers[action];
  if (!handler) {
    res.status(400).json({ ok: false, error: 'Unknown action.' });
    return;
  }
  try {
    const out = await handler(body);
    const status = out && out.status ? out.status : out && out.ok === false ? 400 : 200;
    res.status(status).json(out);
  } catch (e) {
    res.status(500).json({ ok: false, error: 'The signaling desk hit a snag. Try again in a moment.' });
  }
};
