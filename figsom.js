import WebpMux from 'node-webpmux';
import { marca, exifDe } from './marca.js';
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { spawn } from 'child_process';
import * as B from '@whiskeysockets/baileys';
const BB = { ...(B.default || {}), ...B };
const { downloadContentFromMessage, proto, prepareWAMessageMedia } = BB;
const MAX_SEG = 60;
const CHAVE = Symbol.for('shizuki.audioSticker.encoder');

function desem(m) {
  if (!m) return {};
  return m.ephemeralMessage?.message || m.viewOnceMessage?.message || m.viewOnceMessageV2?.message || m;
}
async function baixar(conteudo, tipo) {
  const stream = await downloadContentFromMessage(conteudo, tipo);
  const partes = [];
  for await (const c of stream) partes.push(c);
  return Buffer.concat(partes);
}
function ffmpeg(args) {
  return new Promise((ok, no) => {
    const p = spawn('nice', ['-n', '10', 'ffmpeg', ...args]);
    let err = '';
    p.stderr.on('data', d => { err += d; if (err.length > 4000) err = err.slice(-2000); });
    const t = setTimeout(() => { p.kill('SIGKILL'); no(new Error('ffmpeg demorou demais')); }, 90000);
    p.on('error', e => { clearTimeout(t); no(e); });
    p.on('close', c => { clearTimeout(t); c === 0 ? ok() : no(new Error('ffmpeg falhou: ' + err.trim().split('\n').slice(-2).join(' | '))); });
  });
}
function patchProto() {
  const Msg = proto?.Message;
  if (!Msg || typeof Msg.encode !== 'function' || typeof Msg.FutureProofMessage?.encode !== 'function' || typeof Msg.StickerMessage?.encode !== 'function' || typeof Msg.AudioMessage?.encode !== 'function') {
    throw new Error('a versão da Baileys não possui os tipos necessários.');
  }
  if (Msg[CHAVE]) return;
  const tipos = [
    [Msg, 'audioStickerMessage', 1074, Msg.FutureProofMessage],
    [Msg.StickerMessage, 'audioMessage', 210, Msg.AudioMessage]
  ];
  for (const [tipo, campo, tag, schema] of tipos) {
    const orig = tipo.encode;
    tipo.encode = function (m, w) {
      const r = orig.call(this, m, w);
      if (m[campo]) return schema.encode(m[campo], r.uint32(tag).fork()).ldelim();
      return r;
    };
  }
  Object.defineProperty(Msg, CHAVE, { value: true });
}
function basePPM() {
  const T = 512;
  const head = Buffer.from('P6\n' + T + ' ' + T + '\n255\n');
  const px = Buffer.alloc(T * T * 3);
  let i = 0;
  for (let y = 0; y < T; y++) {
    const t = 1 - y / (T - 1);
    const g = Math.round(20 + 40 * t), b = Math.round(60 + 140 * t);
    for (let x = 0; x < T; x++) { px[i++] = 0; px[i++] = g; px[i++] = b; }
  }
  return Buffer.concat([head, px]);
}
async function webpEstatico(dir) {
  fs.writeFileSync(dir + '/base.ppm', basePPM());
  await ffmpeg(['-y', '-i', dir + '/base.ppm', '-vf', 'format=rgba', '-c:v', 'libwebp', '-q:v', '60', '-frames:v', '1', '-an', dir + '/fig.webp']);
  return fs.readFileSync(dir + '/fig.webp');
}
async function webpAnimado(dir) {
  const vf = 'fps=10,scale=512:512:force_original_aspect_ratio=increase,crop=512:512,format=rgba';
  for (const q of [40, 25, 15]) {
    await ffmpeg(['-y', '-i', dir + '/v.mp4', '-t', '10', '-vf', vf, '-vcodec', 'libwebp', '-lossless', '0', '-q:v', String(q), '-loop', '0', '-an', dir + '/fig.webp']);
    if (fs.statSync(dir + '/fig.webp').size <= 900 * 1024) break;
  }
  return fs.readFileSync(dir + '/fig.webp');
}
async function enviarFig(sock, from, webp, audioMsg, animada) {
  patchProto();
  const midia = await prepareWAMessageMedia({ sticker: webp }, { upload: sock.waUploadToServer });
  if (!midia?.stickerMessage) throw new Error('não consegui preparar a figurinha.');
  midia.stickerMessage.width = 512;
  midia.stickerMessage.height = 512;
  midia.stickerMessage.isAnimated = !!animada;
  midia.stickerMessage.audioMessage = audioMsg;
  await sock.relayMessage(from, { proto: midia, audioStickerMessage: { message: midia }, messageContextInfo: { messageSecret: crypto.randomBytes(32) } }, {});
}
const LIM_VID = 10;
const LIM_MB = 15;
const AJUDA = '🎬 *FIGURINHA COM SOM*\n\n▸ Responda a um *vídeo* com o comando\n▸ Ou responda a um *áudio de voz*\n\n📏 *Limites*\n• Vídeo: até *' + LIM_VID + 's*\n• Áudio: até *' + MAX_SEG + 's*\n• Tamanho: até *' + LIM_MB + ' MB*';
function aviso(titulo, atual, limite) {
  return '⚠️ *' + titulo + '*\n\n📤 Seu arquivo: *' + atual + '*\n📏 Limite: *' + limite + '*\n\n💡 Corte o arquivo e tente de novo.';
}
function sonda(f) {
  return new Promise((ok) => {
    const p = spawn('ffprobe', ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=codec_name,sample_rate,channels,duration', '-of', 'csv=p=0', f]);
    let o = '';
    p.stdout.on('data', d => { o += d; });
    p.on('error', () => ok('?'));
    p.on('close', () => ok(o.trim() || 'SEM AUDIO'));
  });
}
export async function executar({ sock, from, msg }) {
  const m = desem(msg.message);
  const ctx = (m.extendedTextMessage || m.videoMessage || m.imageMessage || {}).contextInfo;
  const citada = desem(ctx?.quotedMessage);
  const audioCit = citada.audioMessage;
  const videoCit = citada.videoMessage || m.videoMessage;
  const dizer = (t) => sock.sendMessage(from, { text: t }, { quoted: msg });
  if (!audioCit && !videoCit) return dizer(AJUDA);
  if (audioCit && (audioCit.seconds || 0) > MAX_SEG) {
    return dizer(aviso('Áudio muito longo!', (audioCit.seconds || 0) + 's', MAX_SEG + 's'));
  }
  if (!audioCit && videoCit) {
    const dur = Number(videoCit.seconds || 0);
    const mb = Number(String(videoCit.fileLength || 0)) / 1048576;
    if (dur > LIM_VID) return dizer(aviso('Vídeo muito longo!', dur + 's', LIM_VID + 's'));
    if (mb > LIM_MB) return dizer(aviso('Vídeo muito pesado!', mb.toFixed(1) + ' MB', LIM_MB + ' MB'));
  }
  await dizer('⏳ *Criando sua figurinha com som...*\n📏 Limite: ' + LIM_VID + 's de vídeo');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'figsom-'));
  let webp = null, audioMsg = null, animada = false, audioJaEnviado = false;
  try {
    if (audioCit) {
      webp = await webpEstatico(dir);
      audioMsg = audioCit;
    } else {
      fs.writeFileSync(dir + '/v.mp4', await baixar(videoCit, 'video'));
      webp = await webpAnimado(dir);
      animada = true;
      await ffmpeg(['-y', '-i', dir + '/v.mp4', '-t', '10', '-map', '0:a:0', '-vn', '-map_metadata', '-1', '-af', 'aresample=48000:async=1,apad=whole_dur=1', '-c:a', 'libopus', '-b:a', '32k', '-application', 'voip', '-ar', '48000', '-ac', '1', dir + '/a.ogg']);
      console.log('[figsom] audio origem:', await sonda(dir + '/v.mp4'));
      const own = String(sock.user.id).split(':')[0].split('@')[0] + '@s.whatsapp.net';
const enviado = await prepareWAMessageMedia({ audio: fs.readFileSync(dir + '/a.ogg'), mimetype: 'audio/ogg; codecs=opus', ptt: true }, { upload: sock.waUploadToServer });
      audioJaEnviado = true;
      audioMsg = enviado?.audioMessage;
      if (!audioMsg) throw new Error('sem audioMessage no envio');
      console.log('[figsom] audio enviado:', audioMsg.mimetype, audioMsg.seconds, audioMsg.fileLength, audioMsg.ptt);
    }
    try {
      const __m = await marca(sock, msg, from);
      const __im = new WebpMux.Image();
      await __im.load(webp);
      __im.exif = exifDe(__m.pack, __m.author);
      webp = await __im.save(null);
    } catch (eM) { console.log('[figsom] marca falhou:', eM.message); }
    await enviarFig(sock, from, webp, audioMsg, animada);
  } catch (e) {
    console.error('[figsom] erro:', e);
    try {
      if (webp) await sock.sendMessage(from, { sticker: webp }, { quoted: msg });
      if (audioCit && !audioJaEnviado) {
        const a = await baixar(audioCit, 'audio');
        await sock.sendMessage(from, { audio: a, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: msg });
      }
    } catch (e2) {}
    await dizer('❌ *Não consegui criar a figurinha com som.*\n\n🔧 ' + (e?.message || e));
  } finally {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
  }
}
