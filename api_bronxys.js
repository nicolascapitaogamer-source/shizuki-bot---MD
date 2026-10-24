// ═══════════════════════════════════════════════════════════
//              API BRONXYS - ARQUIVO RESERVADO
// ═══════════════════════════════════════════════════════════
// Todas as chamadas da API Bronxys ficam aqui.
// O index.js só importa as funções e usa.
//
// API: https://api.bronxyshost.com.br/api-bronxys/
// Chave: lida do config.json (campo apiKey)
// ═══════════════════════════════════════════════════════════

import fs from 'fs';

const API_BASE = 'https://api.bronxyshost.com.br/api-bronxys';

// ─── Lê a chave do config.json ───
function getApiKey() {
  try {
    const cfg = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
    return cfg.apiKey || cfg.akinatorToken || '';
  } catch (e) {
    return '';
  }
}

// ─── Play (áudio) ───
async function playAudio(nome) {
  const key = getApiKey();
  if (!key) return { erro: 'sem_token' };
  try {
    const url = `${API_BASE}/play?nome_url=${encodeURIComponent(nome)}&apikey=${key}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(120000) });
    if (!r.ok) return { erro: 'api_off', status: r.status };
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 1000) return { erro: 'api_off' };
    return { ok: true, buffer: buf };
  } catch (e) {
    return { erro: 'api_off', msg: e.message };
  }
}

// ─── Pesquisa YouTube ───
async function pesquisarYtb(nome) {
  const key = getApiKey();
  if (!key) return { erro: 'sem_token' };
  try {
    const url = `${API_BASE}/pesquisa_ytb?nome=${encodeURIComponent(nome)}&apikey=${key}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!r.ok) return { erro: 'api_off', status: r.status };
    const json = await r.json();
    return { ok: true, data: json };
  } catch (e) {
    return { erro: 'api_off', msg: e.message };
  }
}

// ─── Play Vídeo ───
async function playVideo(nome) {
  const key = getApiKey();
  if (!key) return { erro: 'sem_token' };
  try {
    const url = `${API_BASE}/play_video?nome_url=${encodeURIComponent(nome)}&apikey=${key}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(120000) });
    if (!r.ok) return { erro: 'api_off', status: r.status };
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 1000) return { erro: 'api_off' };
    return { ok: true, buffer: buf };
  } catch (e) {
    return { erro: 'api_off', msg: e.message };
  }
}

// ─── TikTok ───
async function tiktokVideo(link) {
  const key = getApiKey();
  if (!key) return { erro: 'sem_token' };
  try {
    const url = `${API_BASE}/tiktok?url=${encodeURIComponent(link)}&apikey=${key}`;
    return { ok: true, url };
  } catch (e) {
    return { erro: 'api_off', msg: e.message };
  }
}

// ─── Akinator ───
async function akinatorStart() {
  const key = getApiKey();
  if (!key) return { erro: 'sem_token' };
  try {
    const url = `${API_BASE}/akinator?action=start&apikey=${key}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!r.ok) return { erro: 'api_off', status: r.status };
    const json = await r.json();
    return { ok: true, data: json };
  } catch (e) {
    return { erro: 'api_off', msg: e.message };
  }
}

async function akinatorAnswer(session, answer) {
  const key = getApiKey();
  if (!key) return { erro: 'sem_token' };
  try {
    const url = `${API_BASE}/akinator?action=answer&session=${session}&answer=${answer}&apikey=${key}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!r.ok) return { erro: 'api_off', status: r.status };
    const json = await r.json();
    return { ok: true, data: json };
  } catch (e) {
    return { erro: 'api_off', msg: e.message };
  }
}

// ─── Genérico ───
async function chamar(endpoint, params = {}) {
  const key = getApiKey();
  if (!key) return { erro: 'sem_token' };
  try {
    const query = new URLSearchParams({ ...params, apikey: key }).toString();
    const url = `${API_BASE}/${endpoint}?${query}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(60000) });
    if (!r.ok) return { erro: 'api_off', status: r.status };
    const contentType = r.headers.get('content-type') || '';
    if (contentType.includes('json')) {
      return { ok: true, data: await r.json() };
    } else {
      return { ok: true, buffer: Buffer.from(await r.arrayBuffer()) };
    }
  } catch (e) {
    return { erro: 'api_off', msg: e.message };
  }
}

// ═══ ES MODULE EXPORT ═══
const apiBronxys = {
  getApiKey,
  playAudio,
  playVideo,
  pesquisarYtb,
  tiktokVideo,
  akinatorStart,
  akinatorAnswer,
  chamar
};

export default apiBronxys;
