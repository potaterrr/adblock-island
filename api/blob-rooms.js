'use strict';

/* AdBlock Island — Blob-backed room service.
 *
 * A no-signup fallback for when Upstash Redis is not configured. It trades
 * atomicity for availability: every message is its own Blob (single writer),
 * presence lives in each peer's own file, and the host owns the mute list and
 * the handover backup. Reads are public Blob URLs guarded only by the room
 * code, which is why paths are HMAC'd with a server salt.
 *
 * Same action contract as the Redis implementation in signaling.js.
 */

const crypto = require('crypto');
const { put, list, del } = require('@vercel/blob');

const ROOM_TTL = 7200;
const STALE_MS = 30000;
const MAX_PEERS = 4;
const MAX_SIGNAL = 64 * 1024;
const CHAT_RATE_MS = 1500;
const CHAT_MAX = 140;
const CLASSES = ['blocker', 'checker', 'reader', 'engineer', 'medic', 'hacker', 'streamer', 'archivist', 'moderator'];
const CHAT_BLOCK = ['fuck', 'shit', 'bitch', 'cunt', 'nigger', 'faggot', 'retard', 'asshole'];
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const SALT = process.env.ROOM_PATH_SALT || 'adblock-island-rooms';

const clean = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max);
const cleanClass = (v) => (CLASSES.includes(v) ? v : 'blocker');
const newId = () => crypto.randomBytes(6).toString('hex');
const newToken = () => crypto.randomBytes(16).toString('hex');
const hashCode = (t) => crypto.createHash('sha256').update(String(t)).digest('hex');
const newCode = () => {
  let out = '';
  for (let i = 0; i < 6; i++) out += CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)];
  return out;
};
const pathRoot = (code) => 'rooms/' + crypto.createHmac('sha256', SALT).update(code).digest('hex').slice(0, 32) + '/';
const metaPath = (code) => pathRoot(code) + 'meta.json';
const hostPath = (code) => pathRoot(code) + 'host.json';
const peerPath = (code, id) => pathRoot(code) + 'p/' + id + '.json';
const inboxPrefix = (code, id) => pathRoot(code) + 'in/' + id + '/';
const msgPath = (code, to, id) => inboxPrefix(code, to) + id + '.json';
const mutesPath = (code) => pathRoot(code) + 'mutes.json';
const backupPath = (code) => pathRoot(code) + 'backup.json';

const parse = (raw) => { try { return raw ? JSON.parse(raw) : null; } catch (e) { return null; } };

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

async function putJson(path, value) {
  await put(path, JSON.stringify(value), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
    contentType: 'application/json'
  });
}
async function readPath(path) {
  const found = await list({ prefix: path, limit: 2 });
  const blob = (found.blobs || []).find((b) => b.pathname === path);
  if (!blob) return null;
  const res = await fetch(blob.url, { cache: 'no-store' });
  if (!res.ok) return null;
  return { data: await res.json().catch(() => null), url: blob.url, blob };
}
async function readPrefix(prefix, limit = 100) {
  const found = await list({ prefix, limit });
  return found.blobs || [];
}

function snapshot(code, host, peers) {
  return {
    code,
    host: host ? { id: host.id, name: host.name, cls: host.cls } : null,
    peers: peers.map((p) => ({
      id: p.id, name: p.name, cls: p.cls,
      role: host && p.id === host.id ? 'host' : 'guest',
      mode: p.mode || 'play', muted: false, lastSeen: p.lastSeen
    }))
  };
}

async function readRoom(code) {
  const [hostRec, peerBlobs] = await Promise.all([readPath(hostPath(code)), readPrefix(pathRoot(code) + 'p/')]);
  const now = Date.now();
  const peers = (await Promise.all(peerBlobs.map((b) => readPath(b.pathname))))
    .map((r) => r && r.data)
    .filter((p) => p && p.id && now - (p.lastSeen || 0) < STALE_MS);
  const host = hostRec && hostRec.data ? hostRec.data : null;
  return snapshot(code, host, peers);
}

async function resolve(code, body) {
  const peerId = clean(body.peerId, 24);
  const token = String(body.token || '');
  if (!peerId || !token) return { room: await readRoom(code), peer: null };
  const rec = await readPath(peerPath(code, peerId));
  if (!rec || !rec.data || rec.data.tokenHash !== hashCode(token)) return { room: await readRoom(code), peer: null };
  return { room: await readRoom(code), peer: rec.data };
}

async function system(code, text) {
  const room = await readRoom(code);
  const ids = room.peers.map((p) => p.id);
  const msg = { id: newId(), kind: 'system', text, at: Date.now() };
  await Promise.all(ids.map((id) => putJson(msgPath(code, id, msg.id), msg)));
}

async function create(body) {
  const name = clean(body.name, 16) || 'a neighbour';
  const cls = cleanClass(body.cls);
  const mode = body.mode === 'watch' ? 'watch' : 'play';
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = newCode();
    if (await readPath(metaPath(code))) continue;
    const peerId = newId();
    const token = newToken();
    const now = Date.now();
    await putJson(metaPath(code), { code, createdAt: now });
    await putJson(hostPath(code), { id: peerId, name, cls });
    await putJson(peerPath(code, peerId), { id: peerId, name, cls, mode, tokenHash: hashCode(token), lastSeen: now, lastChat: 0 });
    return { ok: true, code, peerId, token, role: 'host', room: await readRoom(code) };
  }
  return { ok: false, status: 503, error: 'Could not open a room. Try once more.' };
}

async function join(body) {
  const code = clean(body.code, 6).toUpperCase();
  if (!/^[A-Z2-9]{6}$/.test(code)) return { ok: false, status: 400, error: 'A room code is six letters and numbers.' };
  if (!(await readPath(metaPath(code)))) return { ok: false, status: 404, error: 'No room with that code. It may have closed.' };
  const room = await readRoom(code);
  if (room.peers.length >= MAX_PEERS) return { ok: false, status: 409, error: 'That room is full (four heroes).' };
  const name = clean(body.name, 16) || 'a neighbour';
  const cls = cleanClass(body.cls);
  const mode = body.mode === 'watch' ? 'watch' : 'play';
  const peerId = newId();
  const token = newToken();
  await putJson(peerPath(code, peerId), { id: peerId, name, cls, mode, tokenHash: hashCode(token), lastSeen: Date.now(), lastChat: 0 });
  await system(code, name + ' joined the room.');
  return { ok: true, peerId, token, role: 'guest', room: await readRoom(code) };
}

async function poll(body) {
  const code = clean(body.code, 6).toUpperCase();
  const { room, peer } = await resolve(code, body);
  if (!room) return { ok: false, status: 404, error: 'The room closed.' };
  if (!peer) return { ok: false, status: 410, error: 'You left the room.' };
  const prefix = inboxPrefix(code, peer.id);
  const blobs = await readPrefix(prefix, 50);
  const messages = [];
  const urls = [];
  for (const b of blobs) {
    const res = await fetch(b.url, { cache: 'no-store' });
    if (!res.ok) continue;
    const msg = await res.json().catch(() => null);
    if (msg && msg.id) messages.push(msg);
    urls.push(b.url);
  }
  if (urls.length) { try { await del(urls); } catch (e) {} }
  peer.lastSeen = Date.now();
  await putJson(peerPath(code, peer.id), peer);
  const fresh = await readRoom(code);
  return { ok: true, room: fresh, messages, waited: false };
}

async function signal(body) {
  const code = clean(body.code, 6).toUpperCase();
  const { room, peer } = await resolve(code, body);
  if (!room) return { ok: false, status: 404, error: 'The room closed.' };
  if (!peer) return { ok: false, status: 410, error: 'You left the room.' };
  const to = clean(body.to, 24);
  const kind = clean(body.kind, 12);
  if (!room.peers.some((p) => p.id === to) || !['offer', 'answer', 'ice'].includes(kind)) {
    return { ok: false, status: 400, error: 'Bad signal.' };
  }
  if (JSON.stringify(body.payload || null).length > MAX_SIGNAL) return { ok: false, status: 413, error: 'Signal too large.' };
  const msg = { id: newId(), from: peer.id, kind, payload: body.payload || null, at: Date.now() };
  await putJson(msgPath(code, to, msg.id), msg);
  return { ok: true };
}

async function leave(body) {
  const code = clean(body.code, 6).toUpperCase();
  const { peer } = await resolve(code, body);
  if (!peer) return { ok: true };
  try { const rec = await readPath(peerPath(code, peer.id)); if (rec) await del([rec.url]); } catch (e) {}
  await system(code, peer.name + ' left the room.');
  return { ok: true };
}

async function promote(body) {
  const code = clean(body.code, 6).toUpperCase();
  const { room, peer } = await resolve(code, body);
  if (!room) return { ok: false, status: 404, error: 'The room closed.' };
  if (!peer) return { ok: false, status: 410, error: 'Not in this room.' };
  await putJson(hostPath(code), { id: peer.id, name: peer.name, cls: peer.cls });
  await system(code, peer.name + ' is the host now.');
  return { ok: true, room: await readRoom(code) };
}

async function backup(body) {
  const code = clean(body.code, 6).toUpperCase();
  const { room, peer } = await resolve(code, body);
  if (!room) return { ok: false, status: 404, error: 'The room closed.' };
  if (!peer) return { ok: false, status: 410, error: 'Not in this room.' };
  if (!room.host || room.host.id !== peer.id) return { ok: false, status: 403, error: 'Only the host backs up the island.' };
  const state = typeof body.state === 'string' ? body.state : JSON.stringify(body.state || {});
  if (state.length > 300000) return { ok: false, status: 413, error: 'State too large.' };
  await putJson(backupPath(code), { state, at: Date.now() });
  return { ok: true };
}

async function takeover(body) {
  const code = clean(body.code, 6).toUpperCase();
  const { room, peer } = await resolve(code, body);
  if (!room) return { ok: false, status: 404, error: 'The room closed.' };
  if (!peer) return { ok: false, status: 410, error: 'Not in this room.' };
  const rec = await readPath(backupPath(code));
  if (!rec || !rec.data || !rec.data.state) return { ok: false, status: 404, error: 'No island state to take over.' };
  await putJson(hostPath(code), { id: peer.id, name: peer.name, cls: peer.cls });
  try { await del([rec.url]); } catch (e) {}
  await system(code, peer.name + ' took the island over.');
  return { ok: true, state: rec.data.state, room: await readRoom(code) };
}

async function chat(body) {
  const code = clean(body.code, 6).toUpperCase();
  const { room, peer } = await resolve(code, body);
  if (!room) return { ok: false, status: 404, error: 'The room closed.' };
  if (!peer) return { ok: false, status: 410, error: 'Not in this room.' };
  const mutes = await readPath(mutesPath(code));
  if (mutes && mutes.data && mutes.data[peer.id]) return { ok: false, status: 403, error: 'The host muted your chat.' };
  if (Date.now() - (peer.lastChat || 0) < CHAT_RATE_MS) return { ok: false, status: 429, error: 'One line every 1.5 seconds.' };
  const f = filterChat(body.text);
  if (!f.text) return { ok: false, status: 400, error: 'Nothing to say.' };
  peer.lastChat = Date.now();
  await putJson(peerPath(code, peer.id), peer);
  const msg = { id: newId(), kind: 'chat', from: peer.id, name: peer.name, mode: peer.mode || 'play', text: f.text, filtered: f.hit, at: Date.now() };
  await Promise.all(room.peers.map((p) => putJson(msgPath(code, p.id, msg.id), msg)));
  return { ok: true, sent: f.text };
}

async function mute(body) {
  const code = clean(body.code, 6).toUpperCase();
  const { room, peer } = await resolve(code, body);
  if (!room) return { ok: false, status: 404, error: 'The room closed.' };
  if (!peer) return { ok: false, status: 410, error: 'Not in this room.' };
  if (!room.host || room.host.id !== peer.id) return { ok: false, status: 403, error: 'Only the host can mute.' };
  const targetId = clean(body.peerId, 24);
  if (targetId === peer.id) return { ok: false, status: 400, error: 'No such hero.' };
  const mutesRec = await readPath(mutesPath(code));
  const mutes = (mutesRec && mutesRec.data) || {};
  if (body.on) mutes[targetId] = true; else delete mutes[targetId];
  await putJson(mutesPath(code), mutes);
  return { ok: true, room: await readRoom(code) };
}

const HANDLERS = { create, join, poll, signal, leave, promote, backup, takeover, chat, mute };

async function handle(action, body) {
  const handler = HANDLERS[action];
  if (!handler) return { ok: false, status: 400, error: 'Unknown action.' };
  return handler(body);
}

module.exports = { handle };
