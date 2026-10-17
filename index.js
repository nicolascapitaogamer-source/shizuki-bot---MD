import { 
  makeWASocket, 
  useMultiFileAuthState, 
  DisconnectReason, 
  fetchLatestBaileysVersion,
  downloadContentFromMessage,
  normalizeMessageContent 
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import readline from 'readline';
import fs from 'fs';
import os from 'os';
import { execFile } from 'child_process';
import webp from 'node-webpmux';
import apiBronxys from './api_bronxys.js';
import {
  FILE_PIRATA, ILHAS, ITENS_LOJA, BARCOS, FRUTAS, HAKIS, RACAS, TRIPULANTES,
  xpProximoNivel, tituloNivel, pirataUser, salvarPirata,
  calcularDanoPirata, acharIlha, fmtNum, barraProgresso
} from './pirata_system.js';

const PREFIXO = '!';
const NUMERO_CRIADOR = '5519988953961';
const FILE_ADVS = './advs.json';
const FILE_MUTES = './mutes.json';
const FILE_SCHEDULES = './schedules.json';
const FILE_CONFIG = './config.json';
const FILE_JOGOS = './jogos.json';
const FILE_STATS = './stats.json';
const FILE_NAMES = './names.json';
const FILE_AVISOS = './avisos.json';
const FILE_BOTSTATE = './botstate.json';
const FILE_RESTART = './restart.json';
const FILE_BLOCK = './blockcmd.json';
const FILE_ALUGUEIS = './alugueis.json';
const FILE_STREAK = './streak.json';

const MENU_IMAGE_PATH = './menu_media.jpg';
const WELCOME_IMAGE_PATH = './welcome_media.jpg';
const MENU_AUDIO_PATH = './menu_audio.mp3';

function carregarConfig() {
  const defaultConfig = {
    numeroDono: '5519988953961',
    nomeBot: 'Shizuki Bot - MD',
    nomeDono: 'Chefe'
  };
  
  if (!fs.existsSync(FILE_CONFIG)) {
    fs.writeFileSync(FILE_CONFIG, JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(FILE_CONFIG, 'utf-8'));
    return { ...defaultConfig, ...data };
  } catch (e) {
    return defaultConfig;
  }
}

function salvarConfig(config) {
  fs.writeFileSync(FILE_CONFIG, JSON.stringify(config, null, 2));
}

function carregarJSON(caminho) {
  if (!fs.existsSync(caminho)) {
    fs.writeFileSync(caminho, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(caminho, 'utf-8'));
}

function salvarJSON(caminho, data) {
  fs.writeFileSync(caminho, JSON.stringify(data, null, 2));
}

function guardarNome(jid, nome) {
  if (!jid || !nome || nome === 'Usuário' || nome === 'Membro') return;
  let names = carregarJSON(FILE_NAMES);
  names[jid] = nome;
  salvarJSON(FILE_NAMES, names);
}

function obterNomeSalvo(jid) {
  let names = carregarJSON(FILE_NAMES);
  return names[jid] || null;
}

function computarEstatisticas(sender, isCommand, isSticker = false) {
  let stats = carregarJSON(FILE_STATS);
  if (!stats[sender]) {
    stats[sender] = { mensagens: 0, comandos: 0, stickers: 0, saldo: 360 };
  }
  stats[sender].mensagens += 1;
  stats[sender].ultimaMsg = Date.now();
  if (isCommand) stats[sender].comandos += 1;
  if (isSticker) stats[sender].stickers += 1;
  salvarJSON(FILE_STATS, stats);
}

function dataBR(offsetDias = 0) {
  return new Date(Date.now() + offsetDias * 86400000).toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
}

function atualizarStreak(jid) {
  const s = carregarJSON(FILE_STREAK);
  const hoje = dataBR(0);
  const ontem = dataBR(-1);
  const d = s[jid] || { dias: 0, ultimo: null, recorde: 0 };
  if (d.ultimo === hoje) return;
  d.dias = d.ultimo === ontem ? d.dias + 1 : 1;
  d.ultimo = hoje;
  if (d.dias > d.recorde) d.recorde = d.dias;
  s[jid] = d;
  salvarJSON(FILE_STREAK, s);
}

async function montarMarca(sock, from, isGroup, pushName) {
  let grupo = 'Privado';
  if (isGroup) {
    try {
      const gm = await sock.groupMetadata(from);
      grupo = gm.subject;
    } catch (e) {
      grupo = 'Grupo';
    }
  }
  const pack = `🤖 𝑺𝒉𝒊𝒛𝒖𝒌𝒊 𝑩𝒐𝒕 - 𝑴𝑫\n👑 Criador: nick`;
  const autor = `👤 Feito por: ${pushName}\n👥 Grupo: ${grupo}`;
  return [pack, autor];
}

function criarSticker(buffer, isVideo, pack, author) {
  return new Promise((resolve, reject) => {
    const id = Date.now() + '_' + Math.floor(Math.random() * 1000);
    const entrada = `./tmp_${id}.${isVideo ? 'mp4' : 'jpg'}`;
    const saida = `./tmp_${id}.webp`;
    fs.writeFileSync(entrada, buffer);

    let filtro = 'scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=black@0';
    const argsFF = ['-y', '-i', entrada];
    if (isVideo) {
      filtro = 'fps=12,' + filtro;
      argsFF.push('-t', '6');
    }
    argsFF.push('-vf', filtro, '-vcodec', 'libwebp', '-lossless', '0', '-compression_level', '6', '-q:v', isVideo ? '50' : '70', '-loop', '0', '-an', '-preset', 'default', saida);

    const limpar = () => {
      try { fs.unlinkSync(entrada); } catch (e) {}
      try { fs.unlinkSync(saida); } catch (e) {}
    };

    execFile('ffmpeg', argsFF, async (err) => {
      if (err) {
        limpar();
        return reject(err);
      }
      try {
        const json = {
          'sticker-pack-id': 'shizuki-bot',
          'sticker-pack-name': pack,
          'sticker-pack-publisher': author,
          emojis: ['💜']
        };
        const exifAttr = Buffer.from([0x49,0x49,0x2A,0x00,0x08,0x00,0x00,0x00,0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,0x00,0x00,0x16,0x00,0x00,0x00]);
        const jsonBuff = Buffer.from(JSON.stringify(json), 'utf-8');
        const exif = Buffer.concat([exifAttr, jsonBuff]);
        exif.writeUIntLE(jsonBuff.length, 14, 4);

        const img = new webp.Image();
        await img.load(fs.readFileSync(saida));
        img.exif = exif;
        const bufFinal = await img.save(null);
        
        // Valida se o webp começa com RIFF....WEBP
        if (!bufFinal || bufFinal.length < 100) {
          limpar();
          return reject(new Error('webp inválido'));
        }
        const header = bufFinal.slice(0, 12).toString('hex');
        if (!header.startsWith('52494646') || !header.includes('57454250')) {
          limpar();
          return reject(new Error('webp header inválido'));
        }

        limpar();
        resolve(bufFinal);
      } catch (e) {
        limpar();
        reject(e);
      }
    });
  });
}
function acharFonte() {
  const pastas = ['/system/fonts', '/data/data/com.termux/files/usr/share/fonts'];
  const todas = [];
  for (const p of pastas) {
    try {
      for (const f of fs.readdirSync(p)) {
        if (/\.ttf$/i.test(f) && !f.includes('[')) todas.push(p + '/' + f);
      }
    } catch (e) {}
  }
  return todas.find(f => /Roboto-Regular/i.test(f)) ||
         todas.find(f => /Roboto/i.test(f)) ||
         todas.find(f => /DroidSans\.ttf/i.test(f)) ||
         todas[0] || null;
}

function quebrarTexto(texto, tam) {
  const maxCh = Math.max(1, Math.floor(452 / (tam * 0.52)));
  const linhas = [];
  let atual = '';
  for (let w of texto.split(/\s+/)) {
    while (w.length > maxCh) {
      if (atual) { linhas.push(atual); atual = ''; }
      linhas.push(w.slice(0, maxCh));
      w = w.slice(maxCh);
    }
    if (!atual) atual = w;
    else if ((atual + ' ' + w).length <= maxCh) atual += ' ' + w;
    else { linhas.push(atual); atual = w; }
  }
  if (atual) linhas.push(atual);
  return linhas;
}

function criarBrat(texto) {
  return new Promise((resolve, reject) => {
    const fonte = acharFonte();
    if (!fonte) return reject(new Error('Nenhuma fonte encontrada'));

    let tam = 160;
    let linhas = quebrarTexto(texto, tam);
    while (tam > 24 && linhas.length * tam * 1.2 > 452) {
      tam -= 4;
      linhas = quebrarTexto(texto, tam);
    }

    const id = Date.now() + '_' + Math.floor(Math.random() * 1000);
    const arqTexto = `./tmp_${id}.txt`;
    const arqImg = `./tmp_${id}.jpg`;
    fs.writeFileSync(arqTexto, linhas.join('\n'));

    const filtro = `drawtext=fontfile=${fonte}:textfile=${arqTexto}:expansion=none:fontcolor=black:fontsize=${tam}:x=30:y=20,gblur=sigma=1.5`;
    const argsFF = ['-y', '-f', 'lavfi', '-i', 'color=c=white:s=512x512', '-vf', filtro, '-frames:v', '1', arqImg];

    execFile('ffmpeg', argsFF, (err) => {
      try { fs.unlinkSync(arqTexto); } catch (e) {}
      if (err) {
        try { fs.unlinkSync(arqImg); } catch (e) {}
        return reject(err);
      }
      const buf = fs.readFileSync(arqImg);
      try { fs.unlinkSync(arqImg); } catch (e) {}
      resolve(buf);
    });
  });
}

const FRASES_SAFADAS = [
  'Posso dormir com você? Estou com frio... 🥶😏',
  'Você tem mapa? Porque eu me perdi no seu olhar e quero ficar por aqui 😈',
  'Se beijo matasse, eu já queria morrer nos seus braços 💋🔥',
  'Tô sem sono, sem roupa e sem juízo... vem cá 😌',
  'Essa figurinha ficou boa, mas você ficaria melhor na minha cama 🛏️😏'
];

const FRASES_MOTIVACIONAIS = [
  'Corra atrás do seu sonho! Ninguém vai fazer isso por você 🚀',
  'Um dia ruim não é uma vida ruim. Respira e continua 💪',
  'Você é mais forte do que pensa e mais capaz do que imagina ✨',
  'Não desista: o começo é sempre a parte mais difícil 🌱',
  'Pequenos passos todos os dias levam a lugares gigantes 🏆'
];

function sortearFrase() {
  const todas = [...FRASES_SAFADAS, ...FRASES_MOTIVACIONAIS];
  return todas[Math.floor(Math.random() * todas.length)];
}

const GRUPOS_ALIAS = [
  ['s', 'sticker', 'figurinha'],
  ['menu', 'help'],
  ['menushizuki', 'menugame', 'menubrincadeiras', 'brincadeiras', 'game'],
  ['menuadm', 'adm'],
  ['menuvip', 'vip'],
  ['menudono', 'dono'],
  ['menubaixar', 'baixar', 'play', 'api'],
  ['criador', 'owner'],
  ['beijo', 'beijar'],
  ['abraço', 'abraco', 'abracar', 'abraçar'],
  ['matar', 'kill'],
  ['mute', 'mutar'],
  ['unmute', 'desmutar'],
  ['adv', 'advertir'],
  ['rmadv', 'unadv', 'remadv'],
  ['ban', 'kick'],
  ['totag', 'hidetag'],
  ['admins', 'adms'],
  ['streak', 'sequencia'],
  ['toimg', 'toimage'],
  ['listaadv', 'listadv'],
  ['lideres', 'líderes'],
  ['alugueis', 'aluguéis'],
  ['blockcmdg', 'blockcmd'],
  ['unblockcmdg', 'unblockcmd'],
  ['promover', 'promote'],
  ['rebaixar', 'demote'],
  ['reiniciar', 'restart'],
  ['uptadestart', 'updatestart', 'upgradestart', 'atualizar'],
  ['channel', 'canal'],
  ['rmchannel', 'rmcanal']
];

function canonicoCmd(c) {
  c = String(c).toLowerCase().replace(/^!/, '').trim();
  for (const g of GRUPOS_ALIAS) {
    if (g.includes(c)) return g[0];
  }
  return c;
}

function dataAlug(offsetDias = 0) {
  return new Date(Date.now() + offsetDias * 86400000).toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
}

function formatarDataBR(iso) {
  const [a, m, d] = String(iso).split('-');
  return `${d}/${m}/${a}`;
}

function stickerParaPng(buffer) {
  return new Promise((resolve, reject) => {
    const id = Date.now() + '_' + Math.floor(Math.random() * 1000);
    const entrada = `./tmp_${id}.webp`;
    const saida = `./tmp_${id}.png`;
    fs.writeFileSync(entrada, buffer);
    execFile('ffmpeg', ['-y', '-i', entrada, '-frames:v', '1', saida], (err) => {
      try { fs.unlinkSync(entrada); } catch (e) {}
      if (err) {
        try { fs.unlinkSync(saida); } catch (e) {}
        return reject(err);
      }
      const out = fs.readFileSync(saida);
      try { fs.unlinkSync(saida); } catch (e) {}
      resolve(out);
    });
  });
}

function contextoCanal(cfg) {
  if (!cfg || !cfg.canal || !cfg.canal.id) return {};
  return {
    contextInfo: {
      forwardingScore: 1,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: cfg.canal.id,
        newsletterName: cfg.canal.nome || 'Canal',
        serverMessageId: 100
      }
    }
  };
}

const REACOES_CMD = {
  menu: '📜', menugame: '🎮', menuadm: '🛡️', menuvip: '⭐', menudono: '👑', menubaixar: '📥',
  ping: '🏓', criador: '😍', perfil: '🪪', streak: '🔥', adivinhe: '🔮',
  beijo: '💋', 'abraço': '🤗', matar: '💀',
  mute: '🔇', unmute: '🔊', adv: '⚠️', rmadv: '✅', ban: '🚫',
  opengp: '🔓', closegp: '🔒', boasvindas: '👋',
  fotomenu: '🖼️', fotobemvindo: '🖼️', audiomenu: '🎵', rmaudio: '🔕', nomebot: '✏️',
  s: '🎨', brat: '💚', toimg: '🖼️',
  totag: '📢', admins: '🚨', listaadv: '📋', lideres: '👑',
  blockcmdg: '🔒', unblockcmdg: '🔓',
  modoaluguel: '💼', rgaluguel: '📝', rmaluguel: '🗑️', alugueis: '💰',
  promover: '🎉', rebaixar: '📉', botoff: '😴', boton: '⚡', soadm: '🛡️', rgaviso: '⏰',
  reiniciar: '🔄', uptadestart: '🚀', channel: '📢', rmchannel: '🗑️'
};

function emojiDoComando(cmd) {
  return REACOES_CMD[canonicoCmd(cmd)] || null;
}

const FRASE_BEIJO = '💋 {A} puxou {B} pela cintura e deu um beijo de cinema!';
const FRASE_ABRACO = '🤗 {A} deu um abraço apertado e quentinho em {B}!';
const FRASE_MATAR = '🗡️ {A} atacou {B} sem piedade! Que fim trágico...';

function montarFrase(modelo, a, b) {
  return modelo.split('{A}').join('@' + a.split('@')[0]).split('{B}').join('@' + b.split('@')[0]);
}

function montarAcao(emoji, titulo, frase, rodape) {
  return `╭━━━〔 ${emoji} ${titulo} ${emoji} 〕━━━╮\n┃\n┃ ${frase}\n┃\n┃ ${rodape}\n┃\n╰━━━━━━━━━━━━━━━━━━╯`;
}

const FONTES_GIF = {
  beijo: ['https://api.waifu.pics/sfw/kiss', 'https://nekos.best/api/v2/kiss'],
  cafune: ['https://api.waifu.pics/sfw/pat', 'https://nekos.best/api/v2/pat'],
  mordida: ['https://api.waifu.pics/sfw/bite', 'https://nekos.best/api/v2/bite'],
  colinho: ['https://api.waifu.pics/sfw/cuddle', 'https://nekos.best/api/v2/cuddle'],
  socar: ['https://api.waifu.pics/sfw/punch', 'https://nekos.best/api/v2/punch'],
  chutar: ['https://api.waifu.pics/sfw/kick', 'https://nekos.best/api/v2/kick'],
  esfaquear: ['https://api.waifu.pics/sfw/slap', 'https://nekos.best/api/v2/slap'],
  bater: ['https://api.waifu.pics/sfw/slap', 'https://nekos.best/api/v2/slap'],
  dancar: ['https://api.waifu.pics/sfw/dance', 'https://nekos.best/api/v2/dance'],
  cantar: ['https://api.waifu.pics/sfw/dance', 'https://nekos.best/api/v2/dance'],
  abraco: ['https://api.waifu.pics/sfw/hug', 'https://nekos.best/api/v2/hug'],
  matar: ['https://api.waifu.pics/sfw/kill', 'https://nekos.best/api/v2/shoot', 'https://nekos.best/api/v2/punch', 'https://api.waifu.pics/sfw/slap']
};

async function baixarGifAnime(tipo) {
  for (const api of FONTES_GIF[tipo] || []) {
    try {
      const r = await fetch(api, { signal: AbortSignal.timeout(8000) });
      const j = await r.json();
      const url = j.url || (j.results && j.results[0] && j.results[0].url);
      if (!url) continue;
      const g = await fetch(url, { signal: AbortSignal.timeout(15000) });
      const buf = Buffer.from(await g.arrayBuffer());
      if (buf.length > 0 && buf.length < 15 * 1024 * 1024) return buf;
    } catch (e) {
      console.error('Falha na API de gif:', api, e.message);
    }
  }
  return null;
}

function gifParaMp4(buffer) {
  return new Promise((resolve, reject) => {
    const id = Date.now() + '_' + Math.floor(Math.random() * 1000);
    const entrada = `./tmp_${id}.gif`;
    const saida = `./tmp_${id}.mp4`;
    fs.writeFileSync(entrada, buffer);
    execFile('ffmpeg', ['-y', '-i', entrada, '-movflags', 'faststart', '-pix_fmt', 'yuv420p', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-an', saida], { timeout: 60000 }, (err) => {
      try { fs.unlinkSync(entrada); } catch (e) {}
      if (err) {
        try { fs.unlinkSync(saida); } catch (e) {}
        return reject(err);
      }
      const out = fs.readFileSync(saida);
      try { fs.unlinkSync(saida); } catch (e) {}
      resolve(out);
    });
  });
}

async function enviarAcao(sock, from, msg, tipo, texto, mentions) {
  try {
    const gifBuf = await baixarGifAnime(tipo);
    if (gifBuf) {
      const mp4 = await gifParaMp4(gifBuf);
      await sock.sendMessage(from, { video: mp4, gifPlayback: true, caption: texto, mentions }, { quoted: msg });
      return;
    }
  } catch (e) {
    console.error('Erro no gif da internet:', e);
  }
  await sock.sendMessage(from, { text: texto, mentions }, { quoted: msg });
}

Object.assign(REACOES_CMD, { jogodavelha: '⭕', velha: '⭕', quiz: '🧠', cassino: '🎰', casino: '🎰' });

const velhaJogos = new Map();
const quizJogos = new Map();
const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function numDe(jid) {
  return String(jid || '').split('@')[0].split(':')[0];
}

function mesmoJid(a, b) {
  return numDe(a) === numDe(b);
}

function normTxt(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

function sorteio(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

function embaralhar(lista) {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function maiuscula(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ───────── JOGO DA VELHA ─────────

const VELHA_META = 5;
const VELHA_LINHAS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const VELHA_NUMS = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣'];

const VELHA_GLORIAS = [
  '👑 Que mente brilhante! Estratégia impecável, uma lenda do jogo da velha!',
  '🔥 Dominou o tabuleiro de ponta a ponta! Respeitem o campeão!',
  '🏅 Nasceu pra isso! Cada jogada foi digna de um mestre!'
];

const VELHA_ZOMBARIAS = [
  '🤡 Perdeu feio! Talvez o jogo da velha seja difícil demais, tenta o jogo da memória...',
  '😹 Nem o bot jogaria tão mal assim! Volta pro treino, campeão(ã) de derrotas!',
  '💀 Foi humilhado(a) sem dó! Chora no cantinho que passa...'
];

function velhaResultado(t) {
  for (const [a, b, c] of VELHA_LINHAS) {
    if (t[a] && t[a] === t[b] && t[a] === t[c]) return t[a];
  }
  return t.every((x) => x) ? 'empate' : null;
}

function velhaTabuleiro(t) {
  let s = '';
  for (let i = 0; i < 9; i++) {
    s += t[i] === 'X' ? '❌' : t[i] === 'O' ? '⭕' : VELHA_NUMS[i];
    s += i % 3 === 2 ? '\n' : '  ';
  }
  return s;
}

function velhaTexto(g, aviso) {
  return `╭━━━━〔 ❌ 𝐉𝐎𝐆𝐎 𝐃𝐀 𝐕𝐄𝐋𝐇𝐀 ⭕ 〕━━━━╮\n┃\n` +
         `┃ ❌ @${numDe(g.j[0])} ➜ *${g.pts[0]}* ponto(s)\n` +
         `┃ ⭕ @${numDe(g.j[1])} ➜ *${g.pts[1]}* ponto(s)\n┃\n` +
         `┃ 🏁 Quem fizer *${VELHA_META} pontos* primeiro vence!\n┃\n` +
         `╰━━━━━━━━━━━━━━━━━━━━╯\n\n` +
         (aviso ? aviso + '\n\n' : '') +
         velhaTabuleiro(g.tab) + '\n' +
         `👉 Vez de ${g.sim[g.vez] === 'X' ? '❌' : '⭕'} @${numDe(g.j[g.vez])}\n` +
         `✍️ Mande um número de *1 a 9* (sem prefixo)`;
}

// ───────── QUIZ ─────────

const QUIZ_META = 6;
const QUIZ_TEMPO = 30;

const QUIZ_PERGUNTAS = [
  { p: '🦫 Que animal é esse?\n💡 Dica: constrói barragens nos rios.', r: ['castor'] },
  { p: '🦦 Que animal é esse?\n💡 Dica: dorme de mãos dadas para não se separar na água.', r: ['lontra'] },
  { p: '🦨 Que animal é esse?\n💡 Dica: solta um cheiro terrível quando se sente ameaçado.', r: ['gamba', 'cangamba', 'skunk'] },
  { p: '🦙 Que animal é esse?\n💡 Dica: parente do camelo, vive nos Andes e cospe.', r: ['lhama', 'llama'] },
  { p: '🦡 Que animal é esse?\n💡 Dica: tem listras brancas e pretas no rosto e cava tocas.', r: ['texugo'] },
  { p: '🦧 Que animal é esse?\n💡 Dica: primata de pelo alaranjado nativo da Indonésia.', r: ['orangotango', 'orangutango'] },
  { p: '🦬 Que animal é esse?\n💡 Dica: gigante peludo das pradarias da América do Norte.', r: ['bisao'] },
  { p: '🐪 Que animal é esse?\n💡 Dica: tem uma única corcova.', r: ['dromedario'] },
  { p: '🪼 Que animal é esse?\n💡 Dica: não tem cérebro, nem coração, nem ossos.', r: ['agua viva', 'aguaviva', 'medusa'] },
  { p: '🦣 Que animal é esse?\n💡 Dica: parente extinto e peludo do elefante.', r: ['mamute'] },
  { p: '🍥 Em Naruto, qual o nome da raposa de nove caudas selada dentro do Naruto?', r: ['kurama', 'kyubi', 'kyuubi'] },
  { p: '⚗️ Em Fullmetal Alchemist, qual o nome do irmão caçula que vive dentro de uma armadura?', r: ['alphonse', 'alphonse elric', 'al'] },
  { p: '📓 Em Death Note, qual o nome do Shinigami que deixa o caderno cair no mundo humano?', r: ['ryuk'] },
  { p: '🎣 Em Hunter x Hunter, qual o melhor amigo de Gon, de cabelo prateado e família de assassinos?', r: ['killua', 'killua zoldyck'] },
  { p: '🐉 Em Dragon Ball, qual o nome do planeta natal dos Saiyajins?', r: ['vegeta', 'planeta vegeta'] },
  { p: '🧱 Em Attack on Titan, qual o nome da muralha mais externa?', r: ['maria', 'muralha maria'] },
  { p: '🌊 Em Demon Slayer, qual o nome do Pilar da Água?', r: ['giyu', 'tomioka', 'giyu tomioka'] },
  { p: '👁️ Em Jujutsu Kaisen, qual o nome da expansão de domínio do Gojo?', r: ['vazio ilimitado', 'infinite void', 'unlimited void', 'void ilimitado'] },
  { p: '🤖 Em Evangelion, qual o nome do garoto que pilota a Unidade 01?', r: ['shinji', 'shinji ikari'] },
  { p: '🗡️ Em Bleach, qual o nome da espada do Ichigo?', r: ['zangetsu'] },
  { p: '🪚 Em Chainsaw Man, qual o nome do protagonista?', r: ['denji'] },
  { p: '🏴‍☠️ Em One Piece, qual o nome do primeiro navio dos Chapéus de Palha?', r: ['going merry', 'merry'] },
  { p: '🌀 Qual filme de Christopher Nolan tem sonhos dentro de sonhos?', r: ['a origem', 'origem', 'inception'] },
  { p: '🏆 Qual filme sul-coreano levou o Oscar de Melhor Filme em 2020?', r: ['parasita', 'parasite'] },
  { p: '💊 Em Matrix, qual a cor da pílula que o Neo escolhe tomar?', r: ['vermelha'] },
  { p: '🃏 Qual vilão do Batman foi interpretado por Heath Ledger em O Cavaleiro das Trevas?', r: ['coringa', 'joker'] },
  { p: '🐀 Qual filme da Pixar tem um rato cozinheiro em Paris?', r: ['ratatouille'] },
  { p: '🎃 Qual filme de Tim Burton tem o esqueleto Jack Skellington?', r: ['o estranho mundo de jack', 'estranho mundo de jack', 'estranho mundo', 'nightmare before christmas'] },
  { p: '🦖 Em Jurassic Park, qual o sobrenome do paleontólogo Alan?', r: ['grant'] },
  { p: '🎬 Qual diretor fez Pulp Fiction e Kill Bill?', r: ['tarantino', 'quentin tarantino'] },
  { p: '🏜️ Em Star Wars, qual o planeta natal de Luke Skywalker?', r: ['tatooine'] },
  { p: '🌋 Em O Senhor dos Anéis, qual o nome do vulcão onde o Anel é destruído?', r: ['monte da perdicao', 'orodruin', 'perdicao'] },
  { p: '🦉 Em Harry Potter, qual o nome da coruja do Harry?', r: ['edwiges', 'hedwig'] },
  { p: '🦑 Qual o nome do vizinho rabugento do Bob Esponja que toca clarinete?', r: ['lula molusco', 'squidward', 'lula'] },
  { p: '🍩 Em Os Simpsons, qual o nome do cachorro da família?', r: ['ajudante de papai noel', 'ajudante do papai noel', 'santa s little helper', 'santas little helper'] },
  { p: '👑 Em Hora de Aventura, qual o nome do vilão gelado que usa uma coroa?', r: ['rei gelado', 'ice king'] },
  { p: '⌚ Em Ben 10, qual o nome do relógio alienígena?', r: ['omnitrix'] },
  { p: '🐶 Em Scooby-Doo, qual o nome verdadeiro do Salsicha?', r: ['norville', 'norville rogers'] },
  { p: '🦸 Em Os Incríveis, qual o nome do vilão que usa um traje com controle no pulso?', r: ['sindrome', 'syndrome'] },
  { p: '🧪 Em Breaking Bad, qual o codinome do Walter White?', r: ['heisenberg'] },
  { p: '🐺 Em Game of Thrones, como se chama a espada do Jon Snow?', r: ['garralonga', 'longclaw'] },
  { p: '🔦 Em Stranger Things, qual o nome do monstro da primeira temporada?', r: ['demogorgon'] },
  { p: '🎭 Em La Casa de Papel, qual o nome verdadeiro do Professor?', r: ['sergio', 'sergio marquina', 'marquina'] },
  { p: '☕ Em Friends, qual o nome do café frequentado pela turma?', r: ['central perk'] },
  { p: '📎 Em The Office, qual o nome da empresa de papel onde todos trabalham?', r: ['dunder mifflin', 'dunder'] },
  { p: '🟩 Em Round 6, qual o número do protagonista Gi-hun?', r: ['456'] },
  { p: '🕷️ Em Wandinha, qual o nome da escola onde ela estuda?', r: ['nevermore'] }
];

function quizAcertou(texto, respostas) {
  const t = normTxt(texto);
  if (!t) return false;
  return respostas.some((r) => {
    const a = normTxt(r);
    return t === a || (' ' + t + ' ').includes(' ' + a + ' ');
  });
}

function quizPlacar(q) {
  const lista = Object.values(q.pts).sort((a, b) => b.p - a.p);
  const medalhas = ['🥇', '🥈', '🥉'];
  return {
    texto: lista.map((x, i) => `┃ ${medalhas[i] || '🎖️'} @${numDe(x.jid)} ➜ *${x.p}/${QUIZ_META}*`).join('\n'),
    jids: lista.map((x) => x.jid)
  };
}

async function quizProxima(from) {
  const q = quizJogos.get(from);
  if (!q) return;
  const s = globalThis.__sockAtual;
  try {
    if (!q.fila || !q.fila.length) q.fila = embaralhar(QUIZ_PERGUNTAS.map((_, i) => i));
    const item = QUIZ_PERGUNTAS[q.fila.pop()];
    q.num += 1;
    q.ultimo = Date.now();
    const id = q.num;
    const enviado = await s.sendMessage(from, {
      text: `╭━━━〔 🧠 𝐏𝐄𝐑𝐆𝐔𝐍𝐓𝐀 ${id} 🧠 〕━━━╮\n┃\n┃ ${item.p}\n┃\n` +
            `┃ ✍️ Responda *marcando esta mensagem*\n┃ com a palavra certa (sem prefixo)!\n┃\n` +
            `┃ ⏳ Tempo: *${QUIZ_TEMPO} segundos*\n` +
            `╰━━━━━━━━━━━━━━━━━━╯`
    });
    q.atual = { r: item.r, resp: item.r[0], stanzaId: enviado?.key?.id, id };
    q.timer = setTimeout(async () => {
      const qq = quizJogos.get(from);
      if (!qq || !qq.atual || qq.atual.id !== id) return;
      qq.atual = null;
      try {
        await globalThis.__sockAtual.sendMessage(from, {
          text: `╭━━━〔 ⏰ 𝐓𝐄𝐌𝐏𝐎 𝐄𝐒𝐆𝐎𝐓𝐀𝐃𝐎 ⏰ 〕━━━╮\n┃\n┃ 😴 Ninguém acertou...\n┃ ✅ A resposta era: *${maiuscula(item.r[0])}*\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
        });
      } catch (e) {}
      setTimeout(() => quizProxima(from), 3000);
    }, QUIZ_TEMPO * 1000);
  } catch (err) {
    console.error('Erro no quiz:', err);
  }
}

// ───────── CASSINO ─────────

const CASSINO_MIN = 10;
const CASSINO_MAX = 999;
const SLOT_SIMBOLOS = ['🍒', '🍋', '🍇', '🔔', '💎', '7️⃣'];

function saldoCassino(jid) {
  const st = carregarJSON(FILE_STATS);
  return st[jid] && typeof st[jid].saldo === 'number' ? st[jid].saldo : 360;
}

function ajustarSaldo(jid, delta, extras) {
  const st = carregarJSON(FILE_STATS);
  if (!st[jid]) st[jid] = { mensagens: 0, comandos: 0, stickers: 0, saldo: 360 };
  const atual = typeof st[jid].saldo === 'number' ? st[jid].saldo : 360;
  st[jid].saldo = Math.max(0, atual + delta);
  if (extras) Object.assign(st[jid], extras);
  salvarJSON(FILE_STATS, st);
  return st[jid].saldo;
}

const CASSINO_GIROS_GRATIS = 5;
const CASSINO_JANELA = 30 * 60 * 1000;

function nivelCassino(jid) {
  const st = carregarJSON(FILE_STATS);
  const d = st[jid] && st[jid].cassinoNivel;
  if (!d || Date.now() - d.em > 60 * 60 * 1000) return 0;
  return d.n;
}

function chanceAzar(nivel) {
  return Math.min(0.5, nivel * 0.05);
}

function rotuloNivel(n) {
  return n === 0 ? 'Normal' : `Nível ${n} 🔥`;
}

function girosGratisRestantes(jid) {
  const st = carregarJSON(FILE_STATS);
  const usos = ((st[jid] && st[jid].gratisUsos) || []).filter((t) => Date.now() - t < CASSINO_JANELA);
  return Math.max(0, CASSINO_GIROS_GRATIS - usos.length);
}

function girarSlot() {
  const r = [0, 1, 2].map(() => SLOT_SIMBOLOS[Math.floor(Math.random() * SLOT_SIMBOLOS.length)]);
  const distintos = new Set(r).size;
  let mult = 0;
  if (distintos === 1) mult = r[0] === '💎' ? 15 : 8;
  else if (distintos === 2) mult = 1.2;
  return { r, mult };
}

function textoMenuCassino(saldo, jid) {
  const nivel = nivelCassino(jid);
  return `╭━━━━〔 🎰 𝐂𝐀𝐒𝐒𝐈𝐍𝐎 𝐒𝐇𝐈𝐙𝐔𝐊𝐈 🎰 〕━━━━╮\n┃\n` +
         `┃ 👤 Jogador: @${numDe(jid)}\n` +
         `┃ 💰 Saldo: *${saldo}* moedas\n` +
         `┃ 🔥 Dificuldade: *${rotuloNivel(nivel)}*\n┃\n` +
         `┣━━━〔 🎁 𝐉𝐎𝐆𝐎 𝐆𝐑𝐀́𝐓𝐈𝐒 〕━━━\n┃\n` +
         `┃ 1️⃣ 🍀 *Roleta da Sorte*\n` +
         `┃    ➜ !cassino gratis\n` +
         `┃    💵 Prêmio de 10 a 999 moedas\n` +
         `┃    🎟️ Giros: *${girosGratisRestantes(jid)}/${CASSINO_GIROS_GRATIS}* (recarrega a cada 30 min)\n┃\n` +
         `┣━━━〔 💸 𝐉𝐎𝐆𝐎𝐒 𝐏𝐀𝐆𝐎𝐒 〕━━━\n┃\n` +
         `┃ 2️⃣ 🎰 *Caça-níquel*\n` +
         `┃    ➜ !cassino slot [valor]\n` +
         `┃    🏆 3 iguais 8x (💎 15x) • 2 iguais 1,2x\n┃\n` +
         `┃ 3️⃣ 🎲 *Dados contra o bot*\n` +
         `┃    ➜ !cassino dados [valor]\n` +
         `┃    🏆 Maior soma ganha o dobro\n` +
         `┃    ⚠️ Empate: a casa vence\n┃\n` +
         `┃ 4️⃣ 🪙 *Cara ou Coroa*\n` +
         `┃    ➜ !cassino moeda cara [valor]\n` +
         `┃    🏆 Acertou? Ganha 1,8x\n┃\n` +
         `┃ 5️⃣ ₿ *Bitcoin*\n` +
         `┃    ➜ !cassino bitcoin [valor]\n` +
         `┃    🏆 Risco alto: perde ou ganha até 3x\n┃\n` +
         `┣━━━━━━━━━━━━━━━━━━━━\n` +
         `┃ 💵 Apostas de ${CASSINO_MIN} a ${CASSINO_MAX} moedas\n` +
         `┃ 📈 A dificuldade sobe a cada jogo pago\n` +
         `┃ ⏳ Volta ao normal após 1h sem jogar\n` +
         `╰━━━━━━━━━━━━━━━━━━━━╯`;
}

// ───────── JOGADAS E RESPOSTAS (mensagens sem prefixo) ─────────

async function tratarJogosTexto(sock, msg, from, sender, text) {
  try {
    const t = String(text || '').trim();
    if (!t || t.startsWith(PREFIXO)) return false;

    const est = carregarJSON(FILE_BOTSTATE);
    if ((est.__global && est.__global.off) || (est[from] && est[from].off)) return false;

    // Jogo da velha
    const g = velhaJogos.get(from);
    if (g) {
      if (Date.now() - g.ultimo > 15 * 60 * 1000) {
        velhaJogos.delete(from);
      } else if (/^[1-9]$/.test(t) && mesmoJid(sender, g.j[g.vez])) {
        const pos = parseInt(t, 10) - 1;
        if (g.tab[pos]) {
          await sock.sendMessage(from, { text: '⚠️ Essa casa já está ocupada! Escolha outra.' }, { quoted: msg });
          return true;
        }
        g.ultimo = Date.now();
        g.tab[pos] = g.sim[g.vez];
        const res = velhaResultado(g.tab);

        if (!res) {
          g.vez = 1 - g.vez;
          await sock.sendMessage(from, { text: velhaTexto(g), mentions: g.j });
          return true;
        }

        const tabFinal = velhaTabuleiro(g.tab);

        if (res === 'empate') {
          g.tab = Array(9).fill(null);
          g.rodada += 1;
          g.inicia = 1 - g.inicia;
          g.vez = g.inicia;
          await sock.sendMessage(from, {
            text: velhaTexto(g, `🤝 *DEU VELHA!* Ninguém pontuou.\n\n${tabFinal}\n\n🔄 Nova rodada!`),
            mentions: g.j
          });
          return true;
        }

        const idxV = g.sim.indexOf(res);
        g.pts[idxV] += 1;

        if (g.pts[idxV] >= VELHA_META) {
          velhaJogos.delete(from);
          const w = g.j[idxV];
          const l = g.j[1 - idxV];
          await sock.sendMessage(from, {
            text: `╭━━━〔 🏆 𝐅𝐈𝐌 𝐃𝐄 𝐉𝐎𝐆𝐎 🏆 〕━━━╮\n┃\n` +
                  `┃ 🥇 Campeão: @${numDe(w)}\n` +
                  `┃ 📊 Placar final: *${g.pts[idxV]} x ${g.pts[1 - idxV]}*\n┃\n` +
                  `╰━━━━━━━━━━━━━━━━━━╯\n\n${tabFinal}\n\n` +
                  `${sorteio(VELHA_GLORIAS)}\n\n` +
                  `😂 @${numDe(l)}: ${sorteio(VELHA_ZOMBARIAS)}`,
            mentions: [w, l]
          });
          return true;
        }

        g.tab = Array(9).fill(null);
        g.rodada += 1;
        g.inicia = 1 - g.inicia;
        g.vez = g.inicia;
        await sock.sendMessage(from, {
          text: velhaTexto(g, `🎉 @${numDe(g.j[idxV])} fez uma linha e ganhou a rodada!\n\n${tabFinal}\n\n🔄 Nova rodada!`),
          mentions: g.j
        });
        return true;
      }
    }

    // Quiz
    const q = quizJogos.get(from);
    if (q && q.atual) {
      const stanza = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
      if (stanza && stanza === q.atual.stanzaId && quizAcertou(t, q.atual.r)) {
        const atual = q.atual;
        q.atual = null;
        clearTimeout(q.timer);
        q.ultimo = Date.now();

        const n = numDe(sender);
        if (!q.pts[n]) q.pts[n] = { jid: sender, p: 0 };
        q.pts[n].p += 1;
        const placar = quizPlacar(q);

        if (q.pts[n].p >= QUIZ_META) {
          quizJogos.delete(from);
          await sock.sendMessage(from, {
            text: `╭━━━〔 🏆 𝐅𝐈𝐌 𝐃𝐎 𝐐𝐔𝐈𝐙 🏆 〕━━━╮\n┃\n` +
                  `┃ ✅ @${n} acertou: *${maiuscula(atual.resp)}*\n┃\n` +
                  `┃ 👑 @${n} é o(a) *CAMPEÃO(Ã)*\n┃ com ${QUIZ_META} pontos!\n` +
                  `┃ 🧠 Que cérebro, hein?\n┃\n` +
                  `┣━━━〔 📊 𝐏𝐋𝐀𝐂𝐀𝐑 𝐅𝐈𝐍𝐀𝐋 〕━━━\n` +
                  `${placar.texto}\n` +
                  `╰━━━━━━━━━━━━━━━━━━╯`,
            mentions: placar.jids
          }, { quoted: msg });
          return true;
        }

        await sock.sendMessage(from, {
          text: `╭━━━〔 ✅ 𝐀𝐂𝐄𝐑𝐓𝐎𝐔! ✅ 〕━━━╮\n┃\n` +
                `┃ ⚡ @${n} foi o(a) mais rápido(a)!\n` +
                `┃ 💡 Resposta: *${maiuscula(atual.resp)}*\n┃\n` +
                `┣━━━〔 📊 𝐏𝐋𝐀𝐂𝐀𝐑 〕━━━\n` +
                `${placar.texto}\n┃\n` +
                `┃ ⏭️ Próxima pergunta já já...\n` +
                `╰━━━━━━━━━━━━━━━━━━╯`,
          mentions: placar.jids
        }, { quoted: msg });
        setTimeout(() => quizProxima(from), 3000);
        return true;
      }
    }
  } catch (err) {
    console.error('Erro nos jogos:', err);
  }
  return false;
}

const esperarPing = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function barraPing(p) {
  const cheios = Math.round(p / 10);
  return '█'.repeat(cheios) + '░'.repeat(10 - cheios);
}

function formatarUptime(seg) {
  seg = Math.floor(seg);
  const d = Math.floor(seg / 86400);
  const h = Math.floor((seg % 86400) / 3600);
  const m = Math.floor((seg % 3600) / 60);
  const s = seg % 60;
  const partes = [];
  if (d) partes.push(`${d}d`);
  if (d || h) partes.push(`${h}h`);
  partes.push(`${m}m`, `${s}s`);
  return partes.join(' ');
}

function classificarPing(ms) {
  if (ms < 300) return '🟢 Excelente';
  if (ms < 800) return '🟡 Bom';
  if (ms < 1500) return '🟠 Regular';
  return '🔴 Lento';
}

function msPing(n) {
  return n === null || n === undefined ? 'indisponível' : `${n} ms`;
}

function textoPingProgresso(p, etapa) {
  return `╭━━━〔 🏓 𝐏𝐈𝐍𝐆 𝐒𝐇𝐈𝐙𝐔𝐊𝐈 🏓 〕━━━╮\n┃\n` +
         `┃ ${etapa}\n┃\n` +
         `┃ 〔${barraPing(p)}〕 *${p}%*\n┃\n` +
         `╰━━━━━━━━━━━━━━━━━━╯`;
}

function textoPingFinal(d, nomeBot) {
  const base = [d.envio, d.edicao].filter((n) => n !== null && n !== undefined);
  const media = base.length ? Math.round(base.reduce((a, b) => a + b, 0) / base.length) : null;

  const ramBot = Math.round(process.memoryUsage().rss / 1048576);
  const totalMb = Math.round(os.totalmem() / 1048576);
  const usadaMb = Math.round((os.totalmem() - os.freemem()) / 1048576);
  const pctRam = totalMb ? Math.round((usadaMb / totalMb) * 100) : 0;
  let nucleos = 0;
  try { nucleos = os.cpus().length; } catch (e) {}

  const agora = new Date();
  const hora = agora.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const data = agora.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  return `╭━━━〔 🏓 𝐏𝐈𝐍𝐆 𝐒𝐇𝐈𝐙𝐔𝐊𝐈 🏓 〕━━━╮\n┃\n` +
         `┃ 〔${barraPing(100)}〕 *100%* ✅\n┃\n` +
         `┣━━━〔 📡 𝐋𝐀𝐓𝐄̂𝐍𝐂𝐈𝐀 〕━━━\n┃\n` +
         `┃ 📥 Recebimento: *${msPing(d.recebe)}*\n` +
         `┃ 📤 Envio: *${msPing(d.envio)}*\n` +
         `┃ ✏️ Edição: *${msPing(d.edicao)}*\n` +
         `┃ 🌐 Internet: *${msPing(d.internet)}*\n` +
         `┃ ⚡ Status: ${media === null ? '❔ Sem dados' : classificarPing(media)}\n┃\n` +
         `┣━━━〔 🖥️ 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 〕━━━\n┃\n` +
         `┃ ⏱️ Online há: *${formatarUptime(process.uptime())}*\n` +
         `┃ 💾 RAM do bot: *${ramBot} MB*\n` +
         `┃ 🧠 RAM do aparelho: *${usadaMb}/${totalMb} MB* (${pctRam}%)\n` +
         `┃ ⚙️ Processador: *${nucleos || '?'} núcleo(s)*\n` +
         `┃ 🔧 Node: *${process.version}*\n` +
         `┃ 📱 Plataforma: *${os.platform()} ${os.arch()}*\n┃\n` +
         `┣━━━〔 🤖 𝐁𝐎𝐓 〕━━━\n┃\n` +
         `┃ 💜 ${nomeBot}\n` +
         `┃ 🕒 ${hora} • ${data}\n┃\n` +
         `╰━━━━━━━━━━━━━━━━━━╯`;
}

// ═════ SISTEMA POKÉMON — INJETADO ═════

// ═══════════════════════════════════════════════════════════
//              SISTEMA POKÉMON — FUNÇÕES
// ═══════════════════════════════════════════════════════════

const FILE_POKE_USERS = './pokemon_users.json';
const FILE_POKE_SPAWN = './pokemon_spawn.json';
const FILE_POKE_BATALHA = './pokemon_batalha.json';

let POKE_DATA = { raridades: {}, pokemons: [], pokebolas: [], cosmeticos: [] };
try {
  POKE_DATA = JSON.parse(fs.readFileSync('./pokemon_data.json', 'utf-8'));
} catch (e) {
  console.error('❌ pokemon_data.json não encontrado ou inválido!');
}

// ─────────────── Persistência Pokémon ───────────────

function __isCriadorInfinito(jid) {
  const raw = String(jid || '').split('@')[0].split(':')[0];
  const num = raw.replace(/[^0-9]/g, '');
  if (num === '5519988953961') return true;
  if (raw === '89825633923210') return true;
  return false;
}

function pokeUser(jid) {
  const db = carregarJSON(FILE_POKE_USERS);
  if (!db[jid]) {
    db[jid] = {
      pokecoins: 10,
      pokebolas: { pokebola: 5, great: 0, ultra: 0, master: 0 },
      cosmeticos: { berry: 0, pokefood: 0, pocao: 0, pocaomax: 0 },
      time: [],
      capturas: 0,
      vitorias: 0,
      derrotas: 0
    };
    salvarJSON(FILE_POKE_USERS, db);
  }
  if (__isCriadorInfinito(jid)) db[jid].pokecoins = 999999999;
  if (__isDonoTeste) {
    db[jid].reais = 999999999;
    db[jid].energia = 999999999;
  }
  return db[jid];
}

function salvarPokeUser(jid, dados) {
  const db = carregarJSON(FILE_POKE_USERS);
  db[jid] = dados;
  salvarJSON(FILE_POKE_USERS, db);
}

function pokeSpawnDB() {
  return carregarJSON(FILE_POKE_SPAWN);
}

function salvarPokeSpawn(db) {
  salvarJSON(FILE_POKE_SPAWN, db);
}

// ─────────────── Sorteio por raridade ───────────────

function sortearPokemon(raridadeForcada = null) {
  const lista = POKE_DATA.pokemons.filter(p => !raridadeForcada || p.raridade === raridadeForcada);
  if (!lista.length) return POKE_DATA.pokemons[Math.floor(Math.random() * POKE_DATA.pokemons.length)];
  return lista[Math.floor(Math.random() * lista.length)];
}

function sortearPokemonPorChance() {
  const rar = POKE_DATA.raridades;
  const total = Object.values(rar).reduce((a, b) => a + b.chance, 0);
  let r = Math.random() * total;
  for (const [nome, info] of Object.entries(rar)) {
    r -= info.chance;
    if (r <= 0) return sortearPokemon(nome);
  }
  return sortearPokemon('comum');
}

function emojiRaridade(r) {
  return (POKE_DATA.raridades[r] && POKE_DATA.raridades[r].cor) || '⚪';
}

function spritePokemon(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

// ─────────────── Criação de pokémon individual ───────────────

function criarPokemonInstancia(base) {
  // Stats base escalonadas por raridade
  const mult = {
    comum: 1, incomum: 1.3, raro: 1.6, epico: 2, lendario: 2.5, mitico: 3
  }[base.raridade] || 1;

  const hp = Math.floor((80 + Math.random() * 40) * mult);
  const atk = Math.floor((20 + Math.random() * 15) * mult);
  const def = Math.floor((15 + Math.random() * 12) * mult);

  return {
    id: base.id,
    nome: base.nome,
    raridade: base.raridade,
    nivel: 1,
    xp: 0,
    hp,
    hpMax: hp,
    ataque: atk,
    defesa: def,
    felicidade: 70,
    ultimaRefeicao: Date.now(),
    capturadoEm: Date.now()
  };
}

function xpNecessario(nivel) {
  return 100 + (nivel - 1) * 50;
}

function ganharXp(poke, quantidade) {
  poke.xp = (poke.xp || 0) + quantidade;
  let subiu = false;
  while (poke.xp >= xpNecessario(poke.nivel)) {
    poke.xp -= xpNecessario(poke.nivel);
    poke.nivel += 1;
    poke.hpMax = Math.floor(poke.hpMax * 1.1);
    poke.hp = poke.hpMax;
    poke.ataque = Math.floor(poke.ataque * 1.1);
    poke.defesa = Math.floor(poke.defesa * 1.1);
    subiu = true;
  }
  return subiu;
}

// ─────────────── Felicidade ───────────────

function ajustarFelicidade(poke, delta) {
  poke.felicidade = Math.max(0, Math.min(100, (poke.felicidade || 0) + delta));
}

function verificarFuga(poke) {
  const dias = (Date.now() - (poke.ultimaRefeicao || Date.now())) / 86400000;
  if (dias >= 2) return true;
  if (poke.felicidade <= 0 && dias >= 1) return true;
  return false;
}

// ─────────────── Cálculo de dano ───────────────

function calcularDano(atacante, defensor) {
  const variacao = 0.85 + Math.random() * 0.3;
  const base = (atacante.ataque * 2 - defensor.defesa) * variacao;
  const bonusFelicidade = 1 + (atacante.felicidade / 200);
  const dano = Math.max(1, Math.floor(Math.max(5, base) * bonusFelicidade));
  return dano;
}

// ─────────────── Loja ───────────────

function acharPokebola(id) {
  return POKE_DATA.pokebolas.find(p => p.id === id);
}

function acharCosmetico(id) {
  return POKE_DATA.cosmeticos.find(c => c.id === id);
}

// ─────────────── Captura ───────────────

function tentarCaptura(pokemonRaro, pokebolaId) {
  const bola = acharPokebola(pokebolaId);
  if (!bola) return { ok: false, motivo: 'pokebola_invalida' };

  // Chance base da bola
  let chance = bola.bonus;

  // Penalidade por raridade
  const penal = { comum: 1, incomum: 0.9, raro: 0.7, epico: 0.5, lendario: 0.25, mitico: 0.1 };
  chance *= penal[pokemonRaro] || 1;

  // Fuga aleatória (só pra raros+)
  if (pokemonRaro === 'lendario' || pokemonRaro === 'mitico') {
    if (Math.random() < 0.15) return { ok: false, motivo: 'fugiu' };
  }

  // BONUS VIP
  if (typeof eVIP === "function" && eVIP(jid)) chance += 10;
  const dado = Math.random() * 100;
  return { ok: dado <= chance, chance: chance.toFixed(1) };
}

// ─────────────── Batalha ───────────────

function pokeBatalhaDB() {
  return carregarJSON(FILE_POKE_BATALHA);
}

function salvarPokeBatalha(db) {
  salvarJSON(FILE_POKE_BATALHA, db);
}

function chaveBatalha(from) {
  return `bt_${from}`;
}


// ═════ SHIZUKI CITY — INJETADO ═════

// ═══════════════════════════════════════════════════════════
//              SHIZUKI CITY — FUNÇÕES
// ═══════════════════════════════════════════════════════════

const FILE_SHIZUKI = './shizuki_users.json';
const FILE_PROVA = './shizuki_prova.json';

let SHIZUKI_DATA = null;
try {
  SHIZUKI_DATA = JSON.parse(fs.readFileSync('./shizuki_data.json', 'utf-8'));
} catch (e) {
  console.error('❌ shizuki_data.json não encontrado!');
}

const provasAtivas = new Map(); // sender -> { empregoId, perguntas, respostas, acertos, timer, from }

// ─────────────── Persistência ───────────────

function shizukiUser(jid) {
  // 💎 DINHEIRO INFINITO PRO DONO (só pra teste)
  const __isDonoTeste = (jid === '5519988953961@s.whatsapp.net' || String(jid).includes('108427237929038') || String(jid).includes('89825633923210'));
  const db = carregarJSON(FILE_SHIZUKI);
  if (!db[jid]) {
    db[jid] = {
      emprego: null,
      reais: SHIZUKI_DATA ? SHIZUKI_DATA.salarioInicial : 20,
      energia: SHIZUKI_DATA ? SHIZUKI_DATA.energiaMaxima : 100,
      ultimoTrabalho: 0,
      ultimoSono: 0,
      namorando: null, // jid do parceiro
      familia: null,    // { sobrenome, membros: [jid, jid] }
      vitorias: 0,
      totalGanho: 0
    };
    salvarJSON(FILE_SHIZUKI, db);
  }
  if (__isDonoTeste) {
    db[jid].reais = 999999999;
    db[jid].energia = 999999999;
  }
  return db[jid];
}

function salvarShizuki(jid, dados) {
  const db = carregarJSON(FILE_SHIZUKI);
  db[jid] = dados;
  salvarJSON(FILE_SHIZUKI, db);
}

function acharEmprego(id) {
  if (!SHIZUKI_DATA) return null;
  return SHIZUKI_DATA.empregos.find(e => e.id === id);
}

// ─────────────── Salário ───────────────

function calcularSalario(emprego, u) {
  const base = Math.floor(Math.random() * (emprego.salarioMax - emprego.salarioMin + 1)) + emprego.salarioMin;
  let bonus = 0;
  if (u.namorando) bonus += 0.10;   // +10% namoro
  if (u.familia) bonus += 0.05;
  if (u.casa && u.casa.tipo) {
    const bonusCasa = { barraco: 5, simples: 10, media: 15, mansao: 25, palacio: 40 };
    bonus += (bonusCasa[u.casa.tipo] || 0) / 100;
  }
  // BONUS VIP
  if (typeof eVIP === "function" && eVIP(jid)) bonus += 0.25;     // +5% família
  return {
    base,
    bonusPct: Math.round(bonus * 100),
    total: Math.floor(base * (1 + bonus))
  };
}

// ─────────────── Cooldown ───────────────

function checarCooldown(ultimo, cooldownMs) {
  const agora = Date.now();
  const passou = agora - (ultimo || 0);
  if (passou >= cooldownMs) return { ok: true };
  const restaMs = cooldownMs - passou;
  const min = Math.ceil(restaMs / 60000);
  return { ok: false, minutos: min };
}

// ─────────────── Formata dinheiro ───────────────

function formatarReais(v) {
  return 'R$ ' + Number(v).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function formatarPrecoCurto(v) {
  const n = Number(v);
  if (n >= 1000000) {
    const m = n / 1000000;
    return 'R$ ' + (m % 1 === 0 ? m : m.toFixed(1)) + 'M';
  }
  if (n >= 1000) {
    const k = n / 1000;
    return 'R$ ' + (k % 1 === 0 ? k : k.toFixed(1)) + 'K';
  }
  return 'R$ ' + n;
}

// ─────────────── Prova ───────────────

function sortearPerguntas(empregoId) {
  const banco = SHIZUKI_DATA.perguntas;
  const faceis = embaralhar(banco.faceis || []).slice(0, 2);
  const medias = embaralhar(banco.medias || []).slice(0, 2);
  const dificeis = embaralhar(banco.dificeis || []).slice(0, 1);
  const especificas = embaralhar(banco[empregoId] || []).slice(0, 2);

  let todas = [...faceis, ...medias, ...dificeis, ...especificas];

  // Se faltou, completa com aleatórias
  while (todas.length < SHIZUKI_DATA.perguntasPorProva) {
    const pool = [...(banco.faceis || []), ...(banco.medias || [])];
    todas.push(pool[Math.floor(Math.random() * pool.length)]);
  }

  return embaralhar(todas).slice(0, SHIZUKI_DATA.perguntasPorProva);
}

function montarProvaTexto(emprego, num, total) {
  return `╭━━━〔 📝 𝐏𝐑𝐎𝐕𝐀 — ${num}/${total} 📝 〕━━━╮\n┃\n` +
         `┃ 💼 Cargo: *${emprego.nome}* ${emprego.emoji}\n` +
         `┃ ✅ Precisa acertar: *${SHIZUKI_DATA.acertosMinimos}/${total}*\n` +
         `┃\n` +
         `╰━━━━━━━━━━━━━━━━━━━━━━━━╯`;
}

// ─────────────── Ranking ───────────────

function rankingShizuki(limite = 10) {
  const db = carregarJSON(FILE_SHIZUKI);
  const lista = Object.entries(db)
    .map(([jid, u]) => ({ jid, reais: u.reais || 0 }))
    .sort((a, b) => b.reais - a.reais)
    .slice(0, limite);
  return lista;
}

// ─────────────── Ranking pessoal ───────────────

function posicaoRanking(jid) {
  const db = carregarJSON(FILE_SHIZUKI);
  const lista = Object.entries(db)
    .map(([j, u]) => ({ jid: j, reais: u.reais || 0 }))
    .sort((a, b) => b.reais - a.reais);
  const pos = lista.findIndex(x => x.jid === jid);
  return pos === -1 ? null : pos + 1;
}

// ─────────────── Textos ───────────────

function textoShizukiCity(u, jid, pushName) {
  const emprego = u.emprego ? acharEmprego(u.emprego) : null;
  const pos = posicaoRanking(jid);

  const nomeEmp = emprego
    ? `${emprego.emoji} *${emprego.nome}*`
    : '😔 _Desempregado(a)_';

  const namoro = u.namorando
    ? `💜 @${u.namorando.split('@')[0]}`
    : '❌ Solteiro(a)';

  const familia = u.familia
    ? `👨‍👩‍👧 Família *${u.familia.sobrenome}*`
    : '❌ Sem família';

  const ranking = pos ? `#${pos}` : 'Sem ranking';

  return `╭━━━〔 🏙️ 𝐒𝐇𝐈𝐙𝐔𝐊𝐈 𝐂𝐈𝐓𝐘 🏙️ 〕━━━╮\n┃\n` +
         `┃ 👤 Cidadão: *${pushName}${(typeof badgeVip === 'function' && badgeVip(jid)) ? ' 💎 VIP' : ''}*\n` + // BADGE VIP
         `┃ 💼 Emprego: ${nomeEmp}\n` +
         `┃ 💵 Saldo: *${formatarReais(u.reais)}*\n` +
         `┃ ⚡ Energia: *${u.energia}/100*\n` +
         `┃\n` +
         `┃ ${namoro}\n` +
         `┃ ${familia}\n` +
         `┃ 🏆 Ranking: *${ranking}*\n` +
         `┃\n` +
         `╰━━━━━━━━━━━━━━━━━━━━━━━━╯`;
}

function textoListaEmpregos() {
  const niveis = { 1: '🟢 Fácil', 2: '🟡 Médio', 3: '🟠 Difícil', 4: '🔴 Muito Difícil', 5: '💀 Lendário' };
  let texto = `╭━━━〔 💼 𝐄𝐌𝐏𝐑𝐄𝐆𝐎𝐒 💼 〕━━━╮\n┃\n`;
  SHIZUKI_DATA.empregos.forEach(e => {
    const nota = e.notaMinima === 0 ? 'Sem prova' : `Nota: ${e.notaMinima}%`;
    texto += `┃ ${e.emoji} *${e.nome}*\n`;
    texto += `┃    💵 ${formatarReais(e.salarioMin)} - ${formatarReais(e.salarioMax)}\n`;
    texto += `┃    📝 ${nota} | ${niveis[e.nivel] || ''}\n┃\n`;
  });
  texto += `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n💡 Use: *!fazerprova <nome do emprego>*\nEx: *!fazerprova programador*`;
  return texto;
}

// ─────────────── Verificações ───────────────

function podeFazerProva(sender) {
  return !provasAtivas.has(sender);
}

function limparProva(sender) {
  const p = provasAtivas.get(sender);
  if (p && p.timer) clearTimeout(p.timer);
  provasAtivas.delete(sender);
}



// ─────────── Helper: envia pergunta atual da prova ───────────

async function enviarPerguntaShizuki(sock, from, sender) {
  const prova = provasAtivas.get(sender);
  if (!prova) return;
  const num = prova.indice + 1;
  const p = prova.perguntas[prova.indice];
  const letras = ['A', 'B', 'C', 'D'];
  let alts = '';
  p.alternativas.forEach((alt, i) => {
    alts += `┃ *${letras[i]})* ${alt}\n`;
  });
  const enviado = await sock.sendMessage(from, {
    text: `╭━━━〔 📝 𝐏𝐄𝐑𝐆𝐔𝐍𝐓𝐀 ${num}/7 〕━━━╮\n┃\n` +
          `┃ ${p.p}\n┃\n` +
          alts +
          `┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
          `✍️ Responda *marcando esta mensagem* com:\n` +
          `• A letra (*a*, *b*, *c* ou *d*)\n` +
          `• Ou a resposta escrita\n` +
          `_(sem prefixo)_`
  });
  prova.stanzaAtual = enviado?.key?.id;
}

// ─────────── Trata resposta sem prefixo da prova ───────────

async function tratarProvaTexto(sock, msg, from, sender, text) {
  try {
    const t = String(text || '').trim();
    if (!t || t.startsWith(PREFIXO)) return false;

    const prova = provasAtivas.get(sender);
    if (!prova) return false;
    if (!prova.stanzaAtual) return false;

    const stanza = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
    if (!stanza || stanza !== prova.stanzaAtual) return false;

    const p = prova.perguntas[prova.indice];
    const letras = ['A', 'B', 'C', 'D'];
    const tNorm = normTxt(t);

    let acertou = false;

    if (/^[abcd]$/i.test(t)) {
      const idx = letras.indexOf(t.toUpperCase());
      const escolhida = p.alternativas[idx];
      acertou = p.r.some(r => normTxt(r) === normTxt(escolhida));
    } else {
      acertou = p.r.some(r => normTxt(r) === tNorm);
    }

    if (acertou) prova.acertos++;
    prova.indice++;

    if (prova.indice >= prova.perguntas.length) {
      clearTimeout(prova.timer);
      provasAtivas.delete(sender);
      const passou = prova.acertos >= 5;

      if (passou) {
        const u = shizukiUser(sender);
        u.emprego = prova.empregoId;
        salvarShizuki(sender, u);
        await sock.sendMessage(from, {
          text: `╭━━━〔 🎉 𝐀𝐏𝐑𝐎𝐕𝐀𝐃𝐎! 🎉 〕━━━╮\n┃\n┃ 💼 Cargo: *${prova.empregoNome}* ${prova.empregoEmoji}\n┃ ✅ Acertos: *${prova.acertos}/7*\n┃\n┃ 💜 Bem-vindo(a) ao time!\n┃ 💡 Use *!trabalhar* pra começar.\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯`,
          mentions: [sender]
        }, { quoted: msg });
      } else {
        await sock.sendMessage(from, {
          text: `╭━━━〔 😢 𝐑𝐄𝐏𝐑𝐎𝐕𝐀𝐃𝐎 😢 〕━━━╮\n┃\n┃ 💼 Cargo: *${prova.empregoNome}*\n┃ ❌ Acertos: *${prova.acertos}/7*\n┃ ✅ Mínimo: *5/7*\n┃\n┃ 💡 Tente de novo em 10min.\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯`,
          mentions: [sender]
        }, { quoted: msg });
      }
      return true;
    }

    await sock.sendMessage(from, {
      text: acertou ? '✅ *Acertou!* Próxima...' : `❌ *Errou!*`
    }, { quoted: msg });
    await new Promise(r => setTimeout(r, 1000));
    await enviarPerguntaShizuki(sock, from, sender);
    return true;
  } catch (err) {
    console.error('Erro na prova:', err);
    return false;
  }
}


// COMANDOS ADM NOVOS — FUNCOES

// ═══════════════════════════════════════════════════════════
//         COMANDOS ADM — FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════════════════════

const FILE_BOASVINDAS = './boasvindas.json';

function carregarBoasVindas() {
  return carregarJSON(FILE_BOASVINDAS);
}

function salvarBoasVindas(db) {
  salvarJSON(FILE_BOASVINDAS, db);
}

function bvAtivo(from) {
  const db = carregarBoasVindas();
  return !!(db[from] && db[from].ativo);
}

function bvLegenda(from, padrao) {
  const db = carregarBoasVindas();
  if (db[from] && db[from].legenda) return db[from].legenda;
  return padrao || `👋 Olá @{user}!\n\nSeja muito bem-vindo(a) ao grupo! 🎉\nDigite *!menu* para ver os comandos do bot.`;
}


// POKEMON EXTRAS — FUNCOES

// ═══════════════════════════════════════════════════════════
//         POKÉMON — FUNÇÕES EXTRAS
// ═══════════════════════════════════════════════════════════

function pokebolaPadrao(jid) {
  const u = pokeUser(jid);
  return u.pokebolaPadrao || null;
}

function escolherPokebola(jid) {
  const u = pokeUser(jid);
  if (u.pokebolaPadrao && (u.pokebolas[u.pokebolaPadrao] || 0) > 0) {
    return u.pokebolaPadrao;
  }
  for (const id of ['master', 'ultra', 'great', 'pokebola']) {
    if ((u.pokebolas[id] || 0) > 0) return id;
  }
  return null;
}

function tentarCapturaMelhorada(raridade, pokebolaId) {
  const bola = acharPokebola(pokebolaId);
  if (!bola) return { ok: false, motivo: 'pokebola_invalida' };
  let chance = bola.bonus;
  const penal = { comum: 1, incomum: 0.9, raro: 0.7, epico: 0.5, lendario: 0.25, mitico: 0.1 };
  if (!bola.ignoraRaridade) {
    chance *= penal[raridade] || 1;
  } else {
    // Master Ball ignora penalidade (mas mítico ainda reduz)
    if (raridade === 'mitico') chance = Math.min(chance, 80);
  }
  if ((raridade === 'lendario' || raridade === 'mitico') && !bola.ignoraRaridade) {
    if (Math.random() < 0.15) return { ok: false, motivo: 'fugiu' };
  }
  const dado = Math.random() * 100;
  return { ok: dado <= chance, chance: chance.toFixed(1) };
}

function textoPorcentagem() {
  const r = POKE_DATA.raridades;
  return `╭━━━〔 📊 𝐏𝐎𝐑𝐂𝐄𝐍𝐓𝐀𝐆𝐄𝐍𝐒 📊 〕━━━╮\n┃\n` +
         `┃ ⚪ Comum     ➜ *${r.comum.chance}%*\n` +
         `┃ 🟢 Incomum   ➜ *${r.incomum.chance}%*\n` +
         `┃ 🔵 Raro      ➜ *${r.raro.chance}%*\n` +
         `┃ 🟣 Épico     ➜ *${r.epico.chance}%*\n` +
         `┃ 🟡 Lendário  ➜ *${r.lendario.chance}%*\n` +
         `┃ 🔴 Mítico    ➜ *${r.mitico.chance}%*\n` +
         `┃\n` +
         `┃ 🎯 Total: *100%*\n` +
         `┃\n` +
         `╰━━━━━━━━━━━━━━━━━━━━━━━━╯`;
}




// ═══════════════════════════════════════════════
//       NAMORO HANDLER — captura sim/nao
// ═══════════════════════════════════════════════

async function tratarNamoroTexto(sock, msg, from, sender, text) {
  try {
    const t = String(text || '').trim().toLowerCase();
    if (!t) return false;
    if (t.startsWith(PREFIXO)) return false;

    // Aceita: sim, s, ss, yes, y / nao, n, não, no
    const tLower = t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const éSim = /^(sim|s|ss+|yes|y|si|simm?|sim+)$/.test(tLower);
    const éNao = /^(nao|não|n|no|nn|nao+|nop|no+)$/.test(tLower);
    if (!éSim && !éNao) return false;

    const stanza = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
    if (!stanza) return false;

let pendentes = globalThis.__pedidosNamoro;
let pedido = null;
let isCasar = false;      if (pendentes && pendentes.has(stanza)) {
        pedido = pendentes.get(stanza);
      } else {
        const pC = globalThis.__pedidosCasar;
        if (pC && pC.has(stanza)) {
          pendentes = pC;
          pedido = pC.get(stanza);
          isCasar = true;
        }
      }
      if (!pedido) return false;
      if (pedido.para !== sender) return false;
      clearTimeout(pedido.timer);
      pendentes.delete(stanza);
      if (isCasar) {
        if (éSim) {
          if (pedido.tipo === 'casar') {
            const uA = shizukiUser(pedido.de);
            const uB = shizukiUser(pedido.para);
            uA.casado = pedido.para;
            uB.casado = pedido.de;
            salvarShizuki(pedido.de, uA);
            salvarShizuki(pedido.para, uB);
            await sock.sendMessage(from, {
              text: `╭━━━〔 💒 𝐂𝐀𝐒𝐀𝐌𝐄𝐍𝐓𝐎! 💒 〕━━━╮\n┃\n┃ 🎉 @${pedido.de.split('@')[0]} e\n┃    @${pedido.para.split('@')[0]} CASARAM!\n┃\n┃ 💍 Que viva os noivos!\n┃ 🥂 Parabéns!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [pedido.de, pedido.para]
            }, { quoted: msg });
          } else if (pedido.tipo === 'adotar') {
            const uPai = shizukiUser(pedido.de);
            const uFilho = shizukiUser(pedido.para);
            uPai.filhos = uPai.filhos || [];
            uPai.filhos.push(pedido.para);
            uFilho.pai = pedido.de;
            salvarShizuki(pedido.de, uPai);
            salvarShizuki(pedido.para, uFilho);
            await sock.sendMessage(from, {
              text: `╭━━━〔 👨‍👩‍👧 𝐅𝐀𝐌𝐈́𝐋𝐈𝐀 𝐂𝐑𝐄𝐒𝐂𝐄𝐔! 〕━━━╮\n┃\n┃ 🎉 @${pedido.de.split('@')[0]} adotou\n┃    @${pedido.para.split('@')[0]}!\n┃\n┃ 👶 Agora são família!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [pedido.de, pedido.para]
            }, { quoted: msg });
          }
        } else {
          await sock.sendMessage(from, {
            text: `💔 @${pedido.de.split('@')[0]}, infelizmente\n❌ @${pedido.para.split('@')[0]} recusou...\n\n💜 Não desista!`,
            mentions: [pedido.de, pedido.para]
          }, { quoted: msg });
        }
        return true;
      }

    const uDe = shizukiUser(pedido.de);
    const uPara = shizukiUser(pedido.para);

    if (éSim) {
      uDe.namorando = pedido.para;
      uPara.namorando = pedido.de;
      salvarShizuki(pedido.de, uDe);
      salvarShizuki(pedido.para, uPara);

      await sock.sendMessage(from, {
        text: "💜 *AGORA SÃO UM CASAL!* 💜\n\n" +
              "👤 @" + pedido.de.split('@')[0] + " ❤️ @" + pedido.para.split('@')[0] + "\n\n" +
              "🎉 Que viva o amor! Parabéns aos dois! 🥂",
        mentions: [pedido.de, pedido.para]
      }, { quoted: msg });
    } else {
      await sock.sendMessage(from, {
        text: "💔 *O pedido foi recusado...*\n\n" +
              "😢 @" + pedido.de.split('@')[0] + " não teve sorte dessa vez.\n\n" +
              "💜 Não desista! Tem mais gente por aí.",
        mentions: [pedido.de]
      }, { quoted: msg });
    }
    return true;
  } catch (err) {
    console.error('Erro no tratarNamoroTexto:', err);
    return false;
  }
}

// VIP DIAS FIX
// MENU VIP — FUNCOES

// ═══════════════════════════════════════════════════════════
//              MENU VIP — FUNÇÕES
// ═══════════════════════════════════════════════════════════

const FILE_VIP = './vip_data.json';

function vipDB() {
  return carregarJSON(FILE_VIP);
}

function salvarVipDB(db) {
  salvarJSON(FILE_VIP, db);
}

function eVIP(jid) {
  const db = vipDB();
  const info = db.vips && db.vips[jid];
  if (!info) return false;
  if (!info.expira) return true;
  return Date.now() < info.expira;
}

function diasRestantesVip(jid) {
  const db = vipDB();
  const info = db.vips && db.vips[jid];
  if (!info || !info.expira) return null;
  const resta = info.expira - Date.now();
  if (resta <= 0) return 0;
  return Math.ceil(resta / 86400000);
}

function apelidoDe(jid) {
  const db = vipDB();
  const info = db.vips && db.vips[jid];
  return info && info.apelido ? info.apelido : null;
}

function nomeExibicao(jid, pushNameFallback) {
  const ap = apelidoDe(jid);
  if (ap) return ap;
  return pushNameFallback || String(jid || '').split('@')[0];
}

function badgeVip(jid) {
  return eVIP(jid) ? ' 💎' : '';
}

function tempoVipTexto(ms) {
  if (ms <= 0) return 'expirado';
  const dias = Math.floor(ms / 86400000);
  const horas = Math.floor((ms % 86400000) / 3600000);
  const min = Math.floor((ms % 3600000) / 60000);
  if (dias > 0) return `${dias}d ${horas}h`;
  if (horas > 0) return `${horas}h ${min}min`;
  return `${min}min`;
}


// MODERACAO — FUNCOES

// ═══════════════════════════════════════════════════════════
//         MODERAÇÃO — FUNÇÕES
// ═══════════════════════════════════════════════════════════

const FILE_ANTILINK = './antilink.json';
const FILE_ANTIFLOOD = './antiflood.json';
const FILE_BLACKLIST = './blacklist.json';

function modDB(arquivo) {
  return carregarJSON(arquivo);
}

function salvarModDB(arquivo, db) {
  salvarJSON(arquivo, db);
}

function antiLinkAtivo(from) {
  const db = modDB(FILE_ANTILINK);
  return db[from] && db[from].ativo;
}

function antiFloodAtivo(from) {
  const db = modDB(FILE_ANTIFLOOD);
  return db[from] && db[from].ativo;
}

function estaBlacklisted(from, jid) {
  const db = modDB(FILE_BLACKLIST);
  if (!db[from] || !Array.isArray(db[from])) return false;
  return db[from].includes(jid);
}

// FIX ISDONO
function senderEhCriador(jid) {
  const raw = String(jid || '').split('@')[0].split(':')[0];
  const num = raw.replace(/[^0-9]/g, '');
  if (num === '5519988953961') return true;
  if (raw === '89825633923210') return true;
  return false;
}

function contemLink(texto) {
  if (!texto) return false;
  // ANTILINK FIX — pega qualquer link (http, https, www, ou dominios tipo xxx.com)
  const re = /(https?:\/\/\S+|www\.\S+|[a-z0-9][a-z0-9-]*\.(com|net|org|br|io|me|tv|cc|xyz|tk|ml|ga|cf|gq|info|biz|online|site|app|dev|link|shop|store|top|vip|club|live|fun|icu|cn|ru|jp|co|us)(\/\S*)?)/i;
  return re.test(texto);
}

const floodMap = new Map();

function registrarMsgFlood(from, sender) {
  const chave = from + '::' + sender;
  const agora = Date.now();
  if (!floodMap.has(chave)) floodMap.set(chave, []);
  const lista = floodMap.get(chave).filter(t => agora - t < 5000);
  lista.push(agora);
  floodMap.set(chave, lista);
  return lista.length;
}


// ANTIS FUNCIONANDO — FUNCOES

// ═══════════════════════════════════════════════════════════
//         ANTI-COMANDOS — FUNÇÕES
// ═══════════════════════════════════════════════════════════

function antiAtivo(arquivo, from) {
  const db = carregarJSON(arquivo);
  return db[from] && db[from].ativo;
}

function antiStatusAtivo(from) { return antiAtivo('./antistatus.json', from); }
function antiPromocaoAtivo(from) { return antiAtivo('./antipromocao.json', from); }
function antiFakeAtivo(from) { return antiAtivo('./antifake.json', from); }
function antiPornAtivo(from) { return antiAtivo('./antiporn.json', from); }
function antiPalavraoAtivo(from) { return antiAtivo('./antipalavrao.json', from); }
function antiVideoAtivo(from) { return antiAtivo('./antivideo.json', from); }
function antiImagemAtivo(from) { return antiAtivo('./antiimagem.json', from); }
function antiStickerAtivo(from) { return antiAtivo('./antisticker.json', from); }
function antiEmojiAtivo(from) { return antiAtivo('./antiemoji.json', from); }

const PALAVROES = ['porra', 'caralho', 'merda', 'bosta', 'foder', 'fuder', 'puta', 'putaria', 'viado', 'viada', 'buceta', 'pinto', 'pica', 'rola', 'cuzao', 'otario', 'idiota', 'imbecil', 'arrombado', 'desgracado', 'fdp', 'vsf', 'vtnc', 'krl', 'crl', 'prr'];

const PALAVRAS_PROMO = ['divulgacao', 'divulguem', 'compre', 'comprar', 'promocao', 'promo', 'desconto', 'oferta', 'venda', 'vender', 'barato', 'pix', 'transferencia'];

const PALAVRAS_PORN = ['nude', 'nudes', 'pack', 'packs', 'porn', 'porno', 'xxx', '+18', 'adulto', 'sexo', 'transar', 'gozar', 'punheta', 'masturbacao', 'onlyfans', 'privacy'];

function contemEmoji(texto) {
  if (!texto) return false;
  const re = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{27BF}]|[\u{1F600}-\u{1F64F}]/u;
  return re.test(texto);
}

function contemPalavrao(texto) {
  if (!texto) return false;
  const t = String(texto).toLowerCase();
  return PALAVROES.some(p => t.includes(p));
}

function contemPromocao(texto) {
  if (!texto) return false;
  const t = String(texto).toLowerCase();
  return PALAVRAS_PROMO.some(p => t.includes(p));
}

function contemPorn(texto) {
  if (!texto) return false;
  const t = String(texto).toLowerCase();
  return PALAVRAS_PORN.some(p => t.includes(p));
}

function contemLinkStatus(texto) {
  if (!texto) return false;
  const re = /(wa\.me\/.*status|status@broadcast|whatsapp\.com\/.*status)/i;
  return re.test(texto);
}

function antiBotAtivo(from) {
  const db = carregarJSON('./antibot.json');
  return db[from] && db[from].ativo;
}

function contemBotNoNome(nome) {
  if (!nome) return false;
  const n = String(nome).toLowerCase();
  return /\bbot\b/.test(n) || n.includes('bot ') || n.includes(' bot');
}

async function ehAdmDoGrupo(sock, from, jid) {
  try {
    const gm = await sock.groupMetadata(from);
    return !!gm.participants.find(p => p.id === jid)?.admin;
  } catch (e) { return false; }
}

async function antiPunir(sock, msg, from, sender, motivo) {
  try { await sock.sendMessage(from, { delete: msg.key }); } catch (e) {}
  let advs = carregarJSON(FILE_ADVS);
  if (!advs[from]) advs[from] = {};
  if (!advs[from][sender]) advs[from][sender] = 0;
  advs[from][sender] += 1;
  const total = advs[from][sender];
  salvarJSON(FILE_ADVS, advs);
  try {
    await sock.sendMessage(from, {
      text: `🚫 *${motivo}*\n\n👤 @${sender.split('@')[0]}\n⚠️ Advertência: *${total}/3*`,
      mentions: [sender]
    });
  } catch (e) {}
  if (total >= 3) {
    try {
      delete advs[from][sender];
      salvarJSON(FILE_ADVS, advs);
      await sock.groupParticipantsUpdate(from, [sender], 'remove');
      await sock.sendMessage(from, {
        text: `🚨 @${sender.split('@')[0]} atingiu *3 advertências* e foi removido(a)! 🛑`,
        mentions: [sender]
      });
    } catch (e) {}
  }
  return true;
}


// ANTIBOT FUNC — checa e bane

function obterSaudacaoEHora() {
  const agora = new Date();
  const horaFormatada = agora.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const horas = agora.getHours();

  let saudacao = 'Boa noite';
  if (horas >= 5 && horas < 12) {
    saudacao = 'Bom dia';
  } else if (horas >= 12 && horas < 18) {
    saudacao = 'Boa tarde';
  } else if (horas >= 0 && horas < 5) {
    saudacao = 'Boa madrugada';
  }

  return { saudacao, horaFormatada };
}

// SISTEMA POKÉMON — SPAWN ═════

// ═══════════════════════════════════════════════════════════
//         SISTEMA POKÉMON — SPAWN AUTOMÁTICO
// ═══════════════════════════════════════════════════════════

const POKE_SPAWN_INTERVALO = 5 * 60 * 1000; // 5 minutos
const POKE_SPAWN_DURACAO = 3 * 60 * 1000;   // 3 minutos pra capturar

if (!globalThis.__pokeSpawnTimer) {
  globalThis.__pokeSpawnTimer = setInterval(async () => {
    try {
      const sock = globalThis.__sockAtual;
      if (!sock) return;

      const db = pokeSpawnDB();
      const agora = Date.now();

      for (const grupo of Object.keys(db)) {
        const info = db[grupo];
        if (!info || !info.ativo) continue;

        // Se tem um spawn ativo e já passou de 3min, remove
        if (info.atual && agora - info.criadoEm > POKE_SPAWN_DURACAO) {
          const nomeFugiu = info.atual.nome;
          delete info.atual;
          info.ultimoSpawn = agora;
          salvarPokeSpawn(db);
          try {
            await sock.sendMessage(grupo, {
              text: `🏃 O *${nomeFugiu}* selvagem fugiu! Ninguém conseguiu capturar a tempo.\n\n⏳ Um novo aparecerá em breve...`
            });
          } catch (e) {}
          continue;
        }

        // Se não tem spawn ativo e já passou 5min desde o último, spawna
        if (!info.atual && agora - (info.ultimoSpawn || 0) >= POKE_SPAWN_INTERVALO) {
          const poke = sortearPokemonPorChance();
          info.atual = { id: poke.id, nome: poke.nome, raridade: poke.raridade };
          info.criadoEm = agora;
          info.ultimoSpawn = agora;
          salvarPokeSpawn(db);

          try {
            const rarEmoji = emojiRaridade(poke.raridade);
            const url = spritePokemon(poke.id);
            const texto =
              `╭━━━〔 🌿 𝐏𝐎𝐊𝐄́𝐌𝐎𝐍 𝐒𝐄𝐋𝐕𝐀𝐆𝐄𝐌 🌿 〕━━━╮\n┃\n` +
              `┃ 🎉 Um pokémon apareceu!\n┃\n` +
              `┃ ${rarEmoji} *${poke.nome}*\n` +
              `┃ 📊 Raridade: *${poke.raridade}*\n┃\n` +
              `┃ ⏳ Você tem *3 minutos* pra capturar!\n` +
              `┃ ⚡ Use: *!capturar ${poke.nome}*\n┃\n` +
              `┃ 💡 Quem for mais rápido, leva! 🏃‍♂️💨\n` +
              `╰━━━━━━━━━━━━━━━━━━━━━━━━╯`;

            try {
              await sock.sendMessage(grupo, { image: { url }, caption: texto });
            } catch (e) {
              await sock.sendMessage(grupo, { text: texto });
            }
          } catch (e) {
            console.error('Erro ao enviar spawn:', e);
          }
        }
      }
    } catch (err) {
      console.error('Erro no timer de spawn Pokémon:', err);
    }
  }, 30000); // checa a cada 30 segundos
}




// ═══════════════════════════════════════════════════════════
//         SHIZUKI CITY — TIMER DE EVENTOS E ANIVERSÁRIOS
// ═══════════════════════════════════════════════════════════

if (!globalThis.__shizukiEventosTimer) {
  globalThis.__shizukiEventosTimer = setInterval(async () => {
    try {
      const sock = globalThis.__sockAtual;
      if (!sock) return;
      const db = carregarJSON('./shizuki_eventos.json');
      const agora = Date.now();
      const INTERVALO = 30 * 60 * 1000;
      for (const grupo of Object.keys(db)) {
        const info = db[grupo];
        if (!info || !info.ativo) continue;
        if (agora - (info.ultimoEvento || 0) < INTERVALO) continue;
        info.ultimoEvento = agora;
        salvarJSON('./shizuki_eventos.json', db);
        const eventos = [
          '🎉 *FESTA NA CIDADE!*\n\nCorre que é por tempo limitado! Use *!balada* 💜',
          '🕺 *BALADA ABERTA!*\n\nA noite tá quente! Vai lá: *!balada* 💜',
          '🎁 *DIA DE SORTE!*\n\nUm morador pode ganhar R$ 500 do nada! Tenta a sorte!'
        ];
        const txt = eventos[Math.floor(Math.random() * eventos.length)];
        try { await sock.sendMessage(grupo, { text: txt }); } catch (e) {}
      }
    } catch (err) { console.error('Erro timer eventos:', err); }
  }, 60000);
}

// FIX ANIVERSARIO
if (!globalThis.__shizukiAniverTimer) {
  globalThis.__shizukiAniverTimer = setInterval(async () => {
    try {
      const sock = globalThis.__sockAtual;
      if (!sock) return;
      // Pega data no formato DD/MM (padrao BR)
      const agora = new Date();
      const dia = String(agora.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit' })).padStart(2, '0');
      const mes = String(agora.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', month: '2-digit' })).padStart(2, '0');
      const hoje = dia + '/' + mes;
      console.log('[ANIVERSARIO] Hoje eh:', hoje);
      const dbShi = carregarJSON('./shizuki_users.json');
      const grupos = carregarJSON('./shizuki_eventos.json');
      const hojeKey = agora.toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
      const marca = carregarJSON('./shizuki_aniversarios_dia.json');
      for (const [jid, u] of Object.entries(dbShi)) {
        if (!u.aniversario) continue;
        // Normaliza: remove zeros extras
        const uAniv = u.aniversario.replace(/\/(\d)$/, '/0$1').replace(/^(\d)\//, '0$1/');
        const uAnivPad = u.aniversario.padStart(5, '0');
        console.log('[ANIVERSARIO] User:', jid.split('@')[0], '| Aniv:', u.aniversario, '| Hoje:', hoje);
        if (u.aniversario !== hoje && uAnivPad !== hoje) continue;
        if (marca[hojeKey] && marca[hojeKey].includes(jid)) continue;
        for (const grupo of (u.aniversarioGrupos || [])) {
          try {
            const gm = await sock.groupMetadata(grupo);
            const ids = gm.participants.map(p => p.id);
            const textoAniv = `🎂 *FELIZ ANIVERSÁRIO!* 🎂\n\n💜 Hoje é o aniversário de\n   @${jid.split('@')[0]}!\n\n🎉 Vamos todos parabenizar!\n\n${ids.map(id => '@' + id.split('@')[0]).join(' ')}\n\n🥳 Parabéns, @${jid.split('@')[0]}! Que venham\n   muitos anos de vida! 🎁🎈`;
            await sock.sendMessage(grupo, { text: textoAniv, mentions: [...ids, jid] });
          } catch (e) { console.error('Erro aniversario grupo:', grupo, e.message); }
        }
        if (!marca[hojeKey]) marca[hojeKey] = [];
        marca[hojeKey].push(jid);
      }
      salvarJSON('./shizuki_aniversarios_dia.json', marca);
    } catch (err) { console.error('Erro timer aniversario:', err); }
  }, 60000); // Roda a cada 1 minuto
}


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (text) => new Promise((resolve) => rl.question(text, resolve));


// ═══════════════════════════════════════════════════════════
//         COMANDOS DE PORCENTAGEM — LISTA + FUNÇÕES
// ═══════════════════════════════════════════════════════════

const COMANDOS_PORCENTAGEM = {
  ship: { nome: 'Ship', emoji: '💘', gifs: ['kiss','hug','cuddle'], frases: ['Casal perfeito! Já pode marcar o casamento 💍','Foge que é cilada! 🚩','Amizade colorida, hein? 😏','Tá mais pra irmãos... 👀','Nossa, que casalzão! 🔥'] },
  corno: { nome: 'Corno', emoji: '🐂', gifs: ['cry','facepalm','pat'], frases: ['Tá usando chapéu de corno e nem disfarça! 🎩','Nossa, nem disfarça a dor kkk 😭','Solteiro(a) faz tempo né? 👀','Olha o tamanho do chifre! 🦌','Tá na fila dos chifrudos! 🎟️'] },
  gay: { nome: 'Gay', emoji: '🌈', gifs: ['blush','happy','wink'], frases: ['Sai do armário vai! 🚪','Nada contra, é até bonito! ✨','Tá negando o óbvio kkk','Aceita que dói menos! 💅','Já sabíamos, migo(a)! 🏳️‍🌈'] },
  gostosa: { nome: 'Gostosa', emoji: '🔥', gifs: ['wink','dance','blush'], frases: ['Que mulher! 😳','Tá de parabéns! 👏','Manda o insta! 📸','Perfeita demais! 💅','Arrasou! 🔥'] },
  gostoso: { nome: 'Gostoso', emoji: '🔥', gifs: ['wink','dance','blush'], frases: ['Que homem! 😳','Tá de parabéns! 👏','Manda o insta! 📸','Gostoso demais! 💪','Arrasou! 🔥'] },
  feio: { nome: 'Feio', emoji: '😷', gifs: ['facepalm','cry','stare'], frases: ['Sinto muito... 😢','Que susto! 😱','Melhor fechar os olhos 🙈','Deus te deu outras qualidades! 🙏','Nem a mãe aguenta! 😬'] },
  bonito: { nome: 'Bonito', emoji: '😍', gifs: ['blush','happy','wink'], frases: ['Que beleza! 😍','Perfeito(a)! ✨','Nem parece o mesmo do espelho! 💅','Deus caprichou! 🙏','Gato(a) demais! 😻'] },
  rico: { nome: 'Rico', emoji: '💰', gifs: ['happy','dance','celebrate'], frases: ['Empresta um trocado? 🥺','Bilionário! 💎','Manda um pix! 📱','Quer ser meu amigo? 😏','Compra o grupo todo! 🛒'] },
  pobre: { nome: 'Pobre', emoji: '🪙', gifs: ['cry','beg','pat'], frases: ['Tá duro! 😭','Pede um lanche? 🥺','Só tem o básico! 📦','Mais pobre que rato de igreja 🐭','Não tem nem o pão! 🍞'] },
  gado: { nome: 'Gado', emoji: '🐄', gifs: ['pat','cuddle','blush'], frases: ['Tá no curral já! 🐄','Gadinho(a) assumido(a)! 💘','Segue ela nas redes sociais? 📱','Apaixonado(a) demais! 😳','Muuu! 🐮'] },
  safado: { nome: 'Safado', emoji: '😈', gifs: ['wink','smug','blush'], frases: ['Safado(a) demais! 🔥','Que mente suja! 😈','Sai do armário! 🚪','Ninguém merece! 💅','Tá pensando o quê? 🤨'] },
  chato: { nome: 'Chato', emoji: '😴', gifs: ['sleep','bored','facepalm'], frases: ['Chato demais, meu Deus! 😴','Da até sono! 💤','Muda o assunto, pelo amor! 🥱','Mais chato que segunda-feira 🗓️','Ninguém aguenta! 🙄'] },
  louco: { nome: 'Louco', emoji: '🤪', gifs: ['laugh','dance','facepalm'], frases: ['Louco(a) de pedra! 🤪','Internação já! 🏥','Sai desse corpo! 👻','Calma, psicopata! 😰','Tá precisando de férias! 🌴'] },
  sortudo: { nome: 'Sortudo', emoji: '🍀', gifs: ['happy','celebrate','dance'], frases: ['Nasceu com a bunda virada pra lua! 🌙','Que sorte, hein? 🍀','Joga na loteria! 🎰','Compartilha essa sorte! ✨','Tá abençoado(a)! 🙏'] },
  azarado: { nome: 'Azarado', emoji: '💀', gifs: ['cry','facepalm','shoot'], frases: ['Azarado(a) demais! 💀','Nasceu embaixo de escada! 🪜','Foge de gato preto! 🐈‍⬛','Passou debaixo da escada? 🚫','Chama o padre! ⛪'] },
  pau: { nome: 'Pau', emoji: '🍆', gifs: ['smug','wink','happy'], frases: ['Tamanho é documento? 📏','Que isso, hein! 😳','Manda foto? 📸','Não é o tamanho, é a técnica! 😏','Tá bem servido(a)! 🍆'] },
  bunda: { nome: 'Bunda', emoji: '🍑', gifs: ['dance','wink','smug'], frases: ['Que bundão! 🍑','Empina mais! 💃','Tá de parabéns! 👏','Chama atenção! 👀','Tá grandão! 🔥'] },
  chifre: { nome: 'Chifre', emoji: '🦌', gifs: ['cry','facepalm','stare'], frases: ['Conta os chifres! 🦌','Tá usando armação! 🎩','Nem disfarça! 😭','Faz um galho já! 🌳','Já virou veado! 🦌'] },
  inteligente: { nome: 'Inteligente', emoji: '🧠', gifs: ['think','smug','happy'], frases: ['QI de gênio! 🧠','Einstein brasileiro! 🎓','Bota na NASA! 🚀','Cérebro não para! ⚡','Nerd assumido! 🤓'] },
  burro: { nome: 'Burro', emoji: '🐴', gifs: ['facepalm','laugh','bored'], frases: ['Burro(a) demais! 🐴','Repete a 5ª série! 📚','Pensa com o pé? 🦶','Difícil, hein? 😅','Precisa de aula de reforço! 📖'] }
};

async function baixarGifPorcentagem(tipo) {
  const dados = COMANDOS_PORCENTAGEM[tipo];
  if (!dados) return null;
  const gifs = [...dados.gifs].sort(() => Math.random() - 0.5);
  for (const gif of gifs) {
    const fontes = [
      'https://api.waifu.pics/sfw/' + gif,
      'https://nekos.best/api/v2/' + gif
    ];
    for (const api of fontes) {
      try {
        const r = await fetch(api, { signal: AbortSignal.timeout(6000) });
        const j = await r.json();
        const url = j.url || (j.results && j.results[0] && j.results[0].url);
        if (!url) continue;
        const g = await fetch(url, { signal: AbortSignal.timeout(12000) });
        const buf = Buffer.from(await g.arrayBuffer());
        if (buf.length > 0 && buf.length < 15 * 1024 * 1024) return buf;
      } catch (e) { continue; }
    }
  }
  return null;
}

async function enviarPorcentagem(sock, from, msg, tipo, alvo, sender) {
  const dados = COMANDOS_PORCENTAGEM[tipo];
  if (!dados) return;
  const porcentagem = Math.floor(Math.random() * 101);
  const cheios = Math.round(porcentagem / 10);
  const barra = '█'.repeat(cheios) + '░'.repeat(10 - cheios);
  const frase = dados.frases[Math.floor(Math.random() * dados.frases.length)];
  const mencoes = alvo === sender ? [sender] : [alvo, sender];
  const linha = alvo === sender
    ? '┃  👤 @' + sender.split('@')[0]
    : '┃  👤 @' + sender.split('@')[0] + ' ➜ @' + alvo.split('@')[0];
  const texto =
    '╭━━━〔 ' + dados.emoji + ' 𝐏𝐎𝐑𝐂𝐄𝐍𝐓𝐀𝐆𝐄𝐌: ' + dados.nome.toUpperCase() + ' ' + dados.emoji + ' 〕━━━╮\n' +
    '┃\n' + linha + '\n┃\n' +
    '┃  〔' + barra + '〕 *' + porcentagem + '%*\n' +
    '┃\n┃  💬 ' + frase + '\n┃\n' +
    '╰━━━━━━━━━━━━━━━━━━━━━━━╯';
  try {
    const gifBuf = await baixarGifPorcentagem(tipo);
    if (gifBuf) {
      const mp4 = await gifParaMp4(gifBuf);
      await sock.sendMessage(from, { video: mp4, gifPlayback: true, caption: texto, mentions: mencoes }, { quoted: msg });
      return;
    }
  } catch (e) {
    console.error('Erro no gif:', e.message);
  }
  await sock.sendMessage(from, { text: texto, mentions: mencoes }, { quoted: msg });
}



// ═══ SISTEMA PRESIDENTE ═══

const FILE_PRESIDENTE = './shizuki_presidente.json';
const FILE_ELEICAO = './shizuki_eleicao.json';
const FILE_PROPOSTAS = './shizuki_propostas.json';

function carregarEleicao() {
  return carregarJSON(FILE_ELEICAO);
}
function salvarEleicao(db) {
  salvarJSON(FILE_ELEICAO, db);
}
function carregarPropostas() {
  return carregarJSON(FILE_PROPOSTAS);
}
function salvarPropostas(db) {
  salvarJSON(FILE_PROPOSTAS, db);
}
function carregarPresidente() {
  return carregarJSON(FILE_PRESIDENTE);
}
function salvarPresidente(db) {
  salvarJSON(FILE_PRESIDENTE, db);
}

function grupoTemAluguelAtivo(groupId) {
  try {
    const alug = carregarJSON(FILE_ALUGUEIS);
    const info = alug[groupId];
    if (!info || !info.expira) return false;
    return info.expira >= dataAlug(0);
  } catch (e) { return false; }
}

function proximoIdProposta(db) {
  // Pega os IDs dos valores (não das chaves!)
  const ids = Object.values(db)
    .map(v => {
      if (!v || !v.id) return 0;
      const n = parseInt(String(v.id).replace(/[^0-9]/g, ''), 10);
      return isNaN(n) ? 0 : n;
    })
    .filter(n => n > 0 && n < 1000); // ignora LIDs gigantes
  const maior = ids.length ? Math.max(...ids) : 0;
  return '#' + String(maior + 1).padStart(3, '0');
}

async function ehAdmDoGrupoP(sock, groupId, jid) {
  try {
    const gm = await sock.groupMetadata(groupId);
    const jidLimpo = String(jid).split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
    const part = gm.participants.find(p => {
      const pidLimpo = String(p.id).split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
      return pidLimpo === jidLimpo;
    });
    return !!part?.admin;
  } catch (e) { return false; }
}



// ═══ PARTE 2 — VOTACAO ═══

function getEleicaoFase() {
  const db = carregarEleicao();
  return db.fase || 'nenhuma';
}
function setEleicaoFase(fase) {
  const db = carregarEleicao();
  db.fase = fase;
  db.atualizadoEm = Date.now();
  salvarEleicao(db);
}
function getVotos() {
  const db = carregarEleicao();
  return db.votos || {};
}
function setVotos(votos) {
  const db = carregarEleicao();
  db.votos = votos;
  salvarEleicao(db);
}


// ═══ PARTE 3 — LEIS E PRESIDENTE ═══

const FILE_LEIS = './shizuki_leis.json';

function carregarLeis() {
  return carregarJSON(FILE_LEIS);
}
function salvarLeis(db) {
  salvarJSON(FILE_LEIS, db);
}
function proximoIdLei(db) {
  const ids = Object.keys(db).map(k => parseInt(k.replace('#', ''), 10)).filter(n => !isNaN(n));
  const maior = ids.length ? Math.max(...ids) : 0;
  return '#' + String(maior + 1).padStart(3, '0');
}


// ═══ ARENA VIP ═══

const FILE_ARENA = './shizuki_arena.json';
const ARENA_DURACAO_DESAFIO = 2 * 60 * 1000; // 2 min
const ARENA_COOLDOWN = 7 * 60 * 1000;         // 7 min

const ARENA_MAGIAS = {
  'bola de fogo': { nome: 'Bola de Fogo', emoji: '🔥', danoMin: 30, danoMax: 50, cd: 3 },
  'raio':         { nome: 'Raio',         emoji: '⚡', danoMin: 40, danoMax: 60, cd: 4 },
  'cura':         { nome: 'Cura',         emoji: '💚', cura: 30,               cd: 3 },
  'escudo':       { nome: 'Escudo',       emoji: '🛡️', escudo: true,            cd: 5 },
  'meteoro':      { nome: 'Meteoro',      emoji: '☄️', danoMin: 80, danoMax: 100, cd: 8 }
};

function carregarArena() {
  return carregarJSON(FILE_ARENA);
}
function salvarArena(db) {
  salvarJSON(FILE_ARENA, db);
}
function chaveArena(from) {
  return 'arena_' + from;
}
function calcularDanoArena() {
  return Math.floor(Math.random() * 21) + 10; // 10 a 30
}



async function tratarArenaTexto(sock, msg, from, sender, text) {
  try {
    const t = String(text || '').trim().toLowerCase();
    if (!t) return false;
    if (t.startsWith(PREFIXO)) return false;

    const éSim = /^(sim|s|ss+|yes|y)$/.test(t);
    const éNao = /^(nao|não|n|no|nn)$/.test(t);
    if (!éSim && !éNao) return false;

    const stanza = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
    if (!stanza) return false;

    const dbArena = carregarArena();
    const chvArena = chaveArena(from);
    const a = dbArena[chvArena];
    if (!a || a.finalizada) return false;
    if (a.stanzaId !== stanza) return false;
    if (a.j2 !== sender) return false;

    if (éNao) {
      delete dbArena[chvArena];
      salvarArena(dbArena);
      await sock.sendMessage(from, {
        text: '❌ @' + sender.split('@')[0] + ' recusou o desafio!',
        mentions: [sender]
      }, { quoted: msg });
      return true;
    }

    // É SIM — começa o duelo
    await sock.sendMessage(from, {
      text: '╭━━━〔 ⚔️ 𝐃𝐔𝐄𝐋𝐎 𝐈𝐍𝐈𝐂𝐈𝐀𝐃𝐎 ⚔️ 〕━━━╮\n' +
            '┃\n' +
            '┃ 🎯 @' + a.j1.split('@')[0] + ' começa!\n' +
            '┃\n' +
            '┃ 👤 @' + a.j1.split('@')[0] + ': ❤️ 100/100\n' +
            '┃ 👤 @' + a.j2.split('@')[0] + ': ❤️ 100/100\n' +
            '┃\n' +
            '┃ 🎯 Vez de @' + a.j1.split('@')[0] + '!\n' +
            '┃\n' +
            '┃ ┣ 🗡️ !atacar\n' +
            '┃ ┣ 🛡️ !defender\n' +
            '┃ ┣ ✨ !magia <nome>\n' +
            '┃ ┗ 🏳️ !desistir\n' +
            '┃\n' +
            '╰━━━━━━━━━━━━━━━━━━╯',
      mentions: [a.j1, a.j2]
    }, { quoted: msg });
    return true;
  } catch (err) {
    console.error('Erro no tratarArenaTexto:', err);
    return false;
  }
}


// ═══ FACCOES — PARTE 1 ═══
// ═══ FACCOES — PARTE 2 ═══

const FILE_FACCOES = './shizuki_faccoes.json';
const FILE_CONVITES = './shizuki_faccoes_convites.json';
const FACCAO_MAX_MEMBROS = 10;
const FACCAO_MAX_POR_GRUPO = 5;

function carregarFaccoes() {
  return carregarJSON(FILE_FACCOES);
}
function salvarFaccoes(db) {
  salvarJSON(FILE_FACCOES, db);
}
function carregarConvites() {
  return carregarJSON(FILE_CONVITES);
}
function salvarConvites(db) {
  salvarJSON(FILE_CONVITES, db);
}
function faccaoDoUsuario(groupId, jid) {
  const db = carregarFaccoes();
  for (const id in db) {
    const f = db[id];
    if (f.grupo === groupId && f.membros.includes(jid)) return { id, ...f };
  }
  return null;
}
function listarFaccoesDoGrupo(groupId) {
  const db = carregarFaccoes();
  return Object.entries(db).filter(([id, f]) => f.grupo === groupId);
}
function gerarIdFaccao() {
  return 'fac_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}



async function tratarConviteFaccaoTexto(sock, msg, from, sender, text) {
  try {
    const t = String(text || '').trim().toLowerCase();
    if (!t) return false;
    if (t.startsWith(PREFIXO)) return false;

    const tNorm = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const éSim = /^(sim|s|ss+|yes|y|si|simm?|sim+)$/.test(tNorm);
    const éNao = /^(nao|n|no|nn|nao+|nop|no+)$/.test(tNorm);
    if (!éSim && !éNao) return false;

    const stanza = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
    if (!stanza) return false;

    const dbC = carregarConvites();
    let conviteEncontrado = null;
    for (const id in dbC) {
      if (dbC[id].stanzaId === stanza && dbC[id].para === sender) {
        conviteEncontrado = { id, ...dbC[id] };
        break;
      }
    }
    if (!conviteEncontrado) return false;

    delete dbC[conviteEncontrado.id];
    salvarConvites(dbC);

    if (éNao) {
      await sock.sendMessage(from, {
        text: '❌ @' + sender.split('@')[0] + ' recusou o convite!',
        mentions: [sender]
      }, { quoted: msg });
      return true;
    }

    const dbF = carregarFaccoes();
    const f = dbF[conviteEncontrado.faccaoId];
    if (!f) {
      await sock.sendMessage(from, { text: '❌ Facção não existe mais!' }, { quoted: msg });
      return true;
    }
    if (f.membros.length >= FACCAO_MAX_MEMBROS) {
      await sock.sendMessage(from, { text: '⚠️ Facção encheu antes de você aceitar!' }, { quoted: msg });
      return true;
    }
    f.membros.push(sender);
    salvarFaccoes(dbF);
    await sock.sendMessage(from, {
      text: '╭━━━〔 🏴 𝐍𝐎𝐕𝐎 𝐌𝐄𝐌𝐁𝐑𝐎 🏴 〕━━━╮\n┃\n┃ ✅ @' + sender.split('@')[0] + ' entrou!\n┃\n┃ 🏴 Facção: *' + f.nome + '*\n┃ 👥 Membros: *' + f.membros.length + '/' + FACCAO_MAX_MEMBROS + '*\n┃\n┃ 💜 Bem-vindo(a)!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
      mentions: [sender]
    }, { quoted: msg });
    return true;
  } catch (err) {
    console.error('Erro no tratarConviteFaccaoTexto:', err);
    return false;
  }
}


// ═══ FACCOES — PARTE 3 ═══

const FILE_SAIDAS = './shizuki_faccoes_saidas.json';
const FILE_GUERRAS = './shizuki_faccoes_guerras.json';

function carregarSaidas() { return carregarJSON(FILE_SAIDAS); }
function salvarSaidas(db) { salvarJSON(FILE_SAIDAS, db); }
function carregarGuerras() { return carregarJSON(FILE_GUERRAS); }
function salvarGuerras(db) { salvarJSON(FILE_GUERRAS, db); }

function batalhaArena() {
  // Simula uma luta 1v1 rápida: quem tira número maior vence
  const a = Math.floor(Math.random() * 100);
  const b = Math.floor(Math.random() * 100);
  return { a, b, vencedor: a > b ? 1 : 2 };
}



async function tratarSaidaFaccaoTexto(sock, msg, from, sender, text) {
  try {
    const t = String(text || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (!t) return false;
    if (t.startsWith(PREFIXO)) return false;
    const éSim = /^(sim|s|ss+|yes|y|si|simm?|sim+)$/.test(t);
    const éNao = /^(nao|n|no|nn|nao+|nop|no+)$/.test(t);
    if (!éSim && !éNao) return false;
    const stanza = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
    if (!stanza) return false;

    console.log('[DEBUG SAIDA] text:', t, '| stanza:', stanza, '| sender:', sender);
    console.log('[DEBUG SAIDA] text:', t, '| stanza:', stanza, '| sender:', sender);
    const dbS = carregarSaidas();
    console.log('[DEBUG SAIDA] DB:', JSON.stringify(dbS));
    console.log('[DEBUG SAIDA] DB:', JSON.stringify(dbS));
    let saiEncontrada = null;
    for (const id in dbS) {
      if (dbS[id].stanzaId === stanza && dbS[id].lider === sender) { saiEncontrada = { id, ...dbS[id] }; break; }
    }
    if (!saiEncontrada) return false;

    delete dbS[saiEncontrada.id];
    salvarSaidas(dbS);

    if (éNao) {
      await sock.sendMessage(from, { text: '❌ @' + sender.split('@')[0] + ' negou a saída!', mentions: [sender] }, { quoted: msg });
      return true;
    }

    const dbF = carregarFaccoes();
    const f = dbF[saiEncontrada.faccaoId];
    if (!f) { return true; }
    f.membros = f.membros.filter(m => m !== saiEncontrada.quemSai);
    salvarFaccoes(dbF);
    await sock.sendMessage(from, {
      text: '╭━━━〔 🚪 𝐒𝐀𝐈𝐔 🏴 〕━━━╮\n┃\n┃ ✅ @' + saiEncontrada.quemSai.split('@')[0] + ' saiu!\n┃ 🏴 Facção: *' + f.nome + '*\n┃ 👥 Membros: *' + f.membros.length + '/' + FACCAO_MAX_MEMBROS + '*\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
      mentions: [saiEncontrada.quemSai]
    }, { quoted: msg });
    return true;
  } catch (e) { console.error('Erro sair:', e); return false; }
}

async function tratarGuerraTexto(sock, msg, from, sender, text) {
  try {
    const t = String(text || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (!t) return false;
    if (t.startsWith(PREFIXO)) return false;
    const éSim = /^(sim|s|ss+|yes|y|si|simm?|sim+)$/.test(t);
    const éNao = /^(nao|n|no|nn|nao+|nop|no+)$/.test(t);
    if (!éSim && !éNao) return false;
    const stanza = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
    if (!stanza) return false;

    const dbG = carregarGuerras();
    let gEncontrada = null;
    for (const id in dbG) {
      if (dbG[id].stanzaId === stanza) { gEncontrada = { id, ...dbG[id] }; break; }
    }
    if (!gEncontrada) return false;

    const dbF = carregarFaccoes();
    const f1 = dbF[gEncontrada.faccao1];
    const f2 = dbF[gEncontrada.faccao2];
    if (!f1 || !f2) { delete dbG[gEncontrada.id]; salvarGuerras(dbG); return true; }

    // Só o líder da facção alvo pode responder
    if (f2.lider !== sender) return false;

    delete dbG[gEncontrada.id];
    salvarGuerras(dbG);

    if (éNao) {
      await sock.sendMessage(from, { text: '❌ @' + sender.split('@')[0] + ' recusou a guerra!', mentions: [sender] }, { quoted: msg });
      return true;
    }

    // Verifica caixas
    if (f1.caixa < gEncontrada.valor || f2.caixa < gEncontrada.valor) {
      await sock.sendMessage(from, { text: '⚠️ Guerra cancelada! Uma das facções não tem saldo no caixa.' }, { quoted: msg });
      return true;
    }

    // Escolhe 3 membros aleatórios de cada (ou menos)
    const shuffle = arr => arr.map(v => [Math.random(), v]).sort((a,b) => a[0]-b[0]).map(v => v[1]);
    const eq1 = shuffle([...f1.membros]).slice(0, 3);
    const eq2 = shuffle([...f2.membros]).slice(0, 3);
    const nLutas = Math.min(eq1.length, eq2.length);

    let v1 = 0, v2 = 0;
    let textoLutas = '';
    for (let i = 0; i < nLutas; i++) {
      const r = batalhaArena();
      const ganhou = r.vencedor === 1 ? 1 : 2;
      if (ganhou === 1) v1++; else v2++;
      textoLutas += '┃ 🥊 @' + eq1[i].split('@')[0] + ' vs @' + eq2[i].split('@')[0] + '\n┃    🏆 Vencedor: @' + (ganhou === 1 ? eq1[i] : eq2[i]).split('@')[0] + '\n┃\n';
    }

    // Vencedor
    let facVenc, facPerd;
    if (v1 > v2) { facVenc = f1; facPerd = f2; }
    else if (v2 > v1) { facVenc = f2; facPerd = f1; }
    else {
      // Empate — desempate aleatório
      if (Math.random() < 0.5) { facVenc = f1; facPerd = f2; } else { facVenc = f2; facPerd = f1; }
    }

    const dbFim = carregarFaccoes();
    const fV = dbFim[facVenc.id];
    const fP = dbFim[facPerd.id];
    fV.caixa += gEncontrada.valor;
    fP.caixa -= gEncontrada.valor;
    fV.vitorias += 1;
    fP.derrotas += 1;
    fV.guerrasSeguidas = (fV.guerrasSeguidas || 0) + 1;
    fP.guerrasSeguidas = 0;
    salvarFaccoes(dbFim);

    let dominioTxt = '';
    if (fV.guerrasSeguidas >= 5) {
      dominioTxt = '\n┃ 👑 *FACÇÃO DOMINANTE!*\n┃    ' + fV.nome + ' reina!\n┃';
    }

    await sock.sendMessage(from, {
      text: '╭━━━〔 ⚔️ 𝐆𝐔𝐄𝐑𝐑𝐀 ⚔️ 〕━━━╮\n┃\n┃ 🏴 *' + f1.nome + '* vs *' + f2.nome + '*\n┃\n' + textoLutas + '┃ 📊 Placar: *' + v1 + ' x ' + v2 + '*\n┃\n┃ 🏆 Vencedor: *' + fV.nome + '*\n┃ 💰 Prêmio: *R$ ' + gEncontrada.valor + '*\n┃' + dominioTxt + '\n╰━━━━━━━━━━━━━━━━━━╯',
      mentions: [...eq1, ...eq2]
    }, { quoted: msg });
    return true;
  } catch (e) { console.error('Erro guerra:', e); return false; }
}


// ═══ AUTORESPOSTA ═══

const FILE_AUTORESPOSTA = './autoresposta.json';

const RESPOSTAS_AUTO = {
  // Cumprimentos
  'bom dia': [
    'Bom dia pra quem? Kkkk 😂',
    'Bom dia! Acorda pra vida, dorminhoco',
    'Bom dia. Já tomou seu café? ☕',
    'Bom dia, dorminhoco! Tá na hora de acordar'
  ],
  'boa tarde': [
    'Boa tarde pra quem? Kkkk',
    'Boa tarde! Já almoçou? 🍽️',
    'Boa tarde. Trabalha um pouco, preguiçoso',
    'Boa tarde, seu dorminhoco'
  ],
  'boa noite': [
    'Boa noite pra quem? Kkkk 🌙',
    'Boa noite! Vai sonhar comigo? 😏',
    'Boa noite. Dorme logo, chato',
    'Boa noite, seu dorminhoco'
  ],
  'oi': [
    'Oi, tudo bem? Ou não? 🤔',
    'Oi, quer algo? Fala logo',
    'Oi! Precisa de ajuda ou é só oi?',
    'Oi, tá me devendo? 👀'
  ],
  'olá': [
    'Olá, seu chato 😂',
    'Olá! Fala logo',
    'Olá, quer o quê?',
    'Olá, tudo bem?'
  ],
  'eae': [
    'Eae nada, fala logo',
    'Eae, otário Kkkk',
    'Eae, quer o quê?',
    'Eae, tudo bem?'
  ],
  'opa': [
    'Opa, beleza?',
    'Opa, fala logo',
    'Opa, tá me devendo? 👀',
    'Opa, tudo certo?'
  ],

  // Risadas
  'kkk': [
    'Ri muito, né? Kkkk 😂',
    'Muito engraçado, ein',
    'Kkkk chato',
    'Engraçado é tua cara 😏'
  ],
  'kkkk': [
    'Ri muito, né? Kkkk',
    'Kkkk chato demais',
    'Engraçadão você, hein',
    'Tá rindo de quê? 🤨'
  ],
  'rs': [
    'Rs é o caralho, ri de verdade 😂',
    'Rs? Que coisa de velho',
    'Rs, tá rindo de quê?'
  ],
  'haha': [
    'Haha é o caralho 😂',
    'Haha, engraçado ein',
    'Haha, tua cara é engraçada'
  ],

  // Xingamentos
  'burro': [
    'Burro é tua mãe, otário 🤬',
    'Burro é você, seu animal',
    'Burro? Olha no espelho primeiro'
  ],
  'idiota': [
    'Idiota é você, seu bosta',
    'Idiota é tua família toda',
    'Idiota? Fala de você?'
  ],
  'otário': [
    'Otário é você, seu merda',
    'Otário? Olha no espelho',
    'Otário é tua mãe'
  ],
  'chato': [
    'Chato é o caralho, chato é você',
    'Chato? Tua companhia é pior',
    'Chato é você, seu idiota'
  ],
  'vsf': [
    'Vai você, otário 🤬',
    'Vai tu, seu bosta',
    'Vai pro inferno'
  ],
  'vtnc': [
    'Vai tu, seu merda',
    'Vai pro caralho',
    'Vai você, otário'
  ],
  'fdp': [
    'Filho da puta é você',
    'Fdp é tua família',
    'Fdp, fala de você?'
  ],
  'merda': [
    'Merda é você, seu bosta',
    'Merda? Tua cara',
    'Merda é tua vida'
  ],
  'bosta': [
    'Bosta é você, seu merda',
    'Bosta? Fala de você?',
    'Bosta é tua família'
  ],
  'puta': [
    'Puta é tua mãe',
    'Puta? Fala de você?',
    'Puta é tua irmã'
  ],
  'arrombado': [
    'Arrombado é você, seu bosta',
    'Arrombado é tua família',
    'Arrombado é o caralho'
  ],

  // Reações
  'calma': [
    'Calma é o caralho, respira! 🤬',
    'Calma? Você tá nervoso?',
    'Calma nada, fala logo'
  ],
  'para': [
    'Para é o caralho',
    'Para? Não sou teu filho',
    'Para nada, continua'
  ],
  'oxe': [
    'Oxe é o que, oxente',
    'Oxe? Fala direito',
    'Oxe, tá me estranhando? 🤨'
  ],
  'eita': [
    'Eita porra, hein',
    'Eita? Que susto',
    'Eita, tá doido?'
  ],
  'nossa': [
    'Nossa é o caralho',
    'Nossa? Fala direito',
    'Nossa, tá impressionado?'
  ],
  'caraca': [
    'Caraca é o caralho',
    'Caraca, tá doido?',
    'Caraca, que susto'
  ],

  // Ajuda
  'ajuda': [
    'Ajuda pra quê? Não sou teu pai',
    'Ajuda? Se vira',
    'Ajuda o caralho, resolve sozinho'
  ],
  'socorro': [
    'Socorro é o caralho',
    'Socorro? Chama o bombeiro',
    'Socorro nada, se vira'
  ],
  'help': [
    'Help é o caralho',
    'Help? Aprende português',
    'Help nada, se vira'
  ],

  // Despedidas
  'tchau': [
    'Tchau, vai logo',
    'Tchau, não volto',
    'Tchau, some daqui'
  ],
  'flw': [
    'Flw é o caralho, fala direito',
    'Flw nada, sai logo',
    'Flw, vai embora'
  ],
  'falou': [
    'Falou é o caralho',
    'Falou nada, fala logo',
    'Falou, tchau'
  ],

  // Outros
  'porra': [
    'Porra é o caralho',
    'Porra? Tá nervoso?',
    'Porra, fala direito'
  ],
  'caralho': [
    'Caralho é o caralho',
    'Caralho, tá doido?',
    'Caralho, fala logo'
  ],
  'obrigado': [
    'De nada, seu chato 😏',
    'De nada! Agora some',
    'De nada! Precisa de mais algo?'
  ],
  'obrigada': [
    'De nada, sua chata 😏',
    'De nada! Agora some',
    'De nada! Precisa de mais algo?'
  ],
  'boa': [
    'Boa é o caralho',
    'Boa? Fala direito',
    'Boa, tá doido?'
  ],
  'legal': [
    'Legal é o caralho',
    'Legal? Fala sério',
    'Legal, tá doido?'
  ],
  'beleza': [
    'Beleza é o caralho',
    'Beleza? Fala direito',
    'Beleza, tá doido?'
  ],
  'sim': [
    'Sim é o caralho',
    'Sim? Fala logo',
    'Sim, tá doido?'
  ],
  'não': [
    'Não é o caralho',
    'Não? Fala logo',
    'Não, tá doido?'
  ],
  'nao': [
    'Não é o caralho',
    'Não? Fala logo',
    'Não, tá doido?'
  ],
  'talvez': [
    'Talvez é o caralho',
    'Talvez? Decide logo',
    'Talvez nada, fala logo'
  ]
};

function buscarRespostaAuto(texto) {
  const t = String(texto || '').toLowerCase().trim();
  if (!t) return null;
  const limpo = t.replace(/[^a-záéíóúâêîôûãõç0-9 ]/gi, '').trim();
  const chaves = [];
  for (const chave in RESPOSTAS_AUTO) {
    if (limpo === chave || limpo.includes(chave)) {
      chaves.push(chave);
    }
  }
  if (!chaves.length) return null;
  // Pega a chave mais longa (mais específica)
  chaves.sort((a, b) => b.length - a.length);
  const lista = RESPOSTAS_AUTO[chaves[0]];
  return lista[Math.floor(Math.random() * lista.length)];
}



async function tratarAutoresposta(sock, msg, from, sender, text) {
  try {
    if (!from.endsWith('@g.us')) return false;
    const db = carregarJSON(FILE_AUTORESPOSTA);
    if (!db[from] || !db[from].ativo) return false;
    const t = String(text || '').trim();
    if (!t) return false;
    if (t.startsWith(PREFIXO)) return false;
    if (Math.random() > 0.5) return false;
    const resposta = buscarRespostaAuto(t);
    if (!resposta) return false;
    await sock.sendMessage(from, { text: resposta }, { quoted: msg });
    return true;
  } catch (e) { console.error('Erro autoresposta:', e); return false; }
}


// ═══ BRINCADEIRAS — PARTE 1 ═══

const ROLETA_DESTINOS = [
  '💀 Você vai morrer solteiro(a)',
  '👑 Você vai ficar rico(a) amanhã',
  '🐄 Você virou gado(a) do grupo',
  '💔 Você vai ser traído(a) em 3 dias',
  '🎉 Você vai ganhar um prêmio',
  '🤡 Você vai fazer vergonha amanhã',
  '🔥 Você vai ficar famoso(a)',
  '😴 Você vai dormir 12h hoje',
  '🍀 Você terá sorte no amor',
  '😈 Alguém tá afim de você',
  '🧠 Você vai ficar mais inteligente',
  '💸 Você vai perder dinheiro',
  '🎁 Você vai ganhar um presente',
  '👽 Você vai ver um alienígena',
  '🐶 Você vai adotar um pet',
  '🌈 Você vai ter um dia incrível'
];

const CONSELHOS = [
  'Não confie em ninguém depois das 3h da manhã 🌙',
  'Se tá triste, come um lanche 🍔',
  'Manda mensagem pra crush. Pior que "não" é o "e se" 💬',
  'Quem ama cuida, quem não ama trai 💔',
  'Estuda, senão vai virar atendente de telemarketing 📞',
  'Não gaste dinheiro com besteira 💰',
  'Beba água, seu corno 💧',
  'Dorme cedo, tá feio(a) 😴',
  'Se afasta de quem não te faz bem 🚪',
  'Faz academia, tá na hora 💪',
  'Não mente pra quem te ama 🤥',
  'Perdoa, mas não esquece 🙏',
  'Cuida dos teus pais, eles não duram pra sempre 👨‍👩‍👧',
  'Não seja gado(a), seja livre 🐄',
  'Vai trabalhar, vagabundo(a) 💼',
  'Para de stalkear ex, supera 🕵️',
  'Se valoriza, você é foda 💅',
  'Não desiste dos seus sonhos 🌟',
  'Toma banho, tá fedendo 🚿',
  'Respira fundo e vai com calma 🧘'
];

const CANTADAS_ORIGINAIS = [
  'Você é igual miojo: gostoso, mas some rápido 😏',
  'Se você fosse pizza, eu te comia todinha 🍕',
  'Você tem wifi? Porque eu quero conectar com você 📶',
  'Tá me devendo? Porque eu quero receber um beijo 😘',
  'Você é um banco? Porque eu quero fazer um depósito no seu coração 🏦',
  'Você é um imã? Porque você me atraiu 🧲',
  'Você é um livro? Porque eu quero te ler todinho 📖',
  'Se o mundo fosse meu, eu te dava de presente 🎁',
  'Seu sorriso é o meu lugar preferido no mundo 😍',
  'Você é a razão pela qual eu acredito em amor à primeira vista 💘',
  'Cada segundo sem você parece uma eternidade ⏳',
  'Você é meu pensamento favorito antes de dormir 🌙',
  'Se você fosse um crime, eu cometia sem culpa 😈',
  'Você tem fogo? Porque você acendeu algo em mim 🔥',
  'Tô com frio... posso dormir com você? 🥶',
  'Você é um sonho? Porque eu quero te realizar 😏',
  'Se beijo fosse esporte, eu queria ser atleta 💋',
  'Você é o meu doce favorito, queria provar 🍫',
  'Você é o sol que ilumina os meus dias ☀️',
  'Você não é wifi, mas tem um sinal bom 📶'
];

const SORTE_DIA = [
  '🍀 Hoje é seu dia de brilhar!',
  '⭐ A sorte está do seu lado!',
  '💜 Alguém vai te fazer sorrir hoje',
  '🎁 Uma surpresa boa vem por aí',
  '🚀 Dia perfeito pra começar algo novo',
  '💪 Você vai conseguir o que quer',
  '🌈 Coisas boas estão vindo',
  '💰 Dinheiro inesperado no caminho',
  '❤️ Amor no ar, aproveita!',
  '🎯 Foco no objetivo, você consegue',
  '🌟 Sua energia tá contagiante hoje',
  '🔥 Tá ON, vai dominar o dia',
  '😎 Dia perfeito pra fazer contatos',
  '🎉 Algo bom vai acontecer hoje',
  '✨ Vibrações positivas vindo',
  '🌞 Dia de gratidão e alegria',
  '🌙 Descansa, você merece',
  '🧠 Sua mente tá afiada hoje',
  '💎 Você é raro(a), lembra disso',
  '🎈 Vai ser um dia divertido'
];

function sortear(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}



// ═══ BRINCADEIRAS — PARTE 2 ═══

const FORCA_PALAVRAS = [
  // 🐾 Animais
  { palavra: 'ELEFANTE', categoria: '🐾 Animais' },
  { palavra: 'GIRAFA', categoria: '🐾 Animais' },
  { palavra: 'TARTARUGA', categoria: '🐾 Animais' },
  { palavra: 'BORBOLETA', categoria: '🐾 Animais' },
  { palavra: 'JACARE', categoria: '🐾 Animais' },
  { palavra: 'LEOPARDO', categoria: '🐾 Animais' },
  { palavra: 'CROCODILO', categoria: '🐾 Animais' },
  { palavra: 'CAMELO', categoria: '🐾 Animais' },
  { palavra: 'PINGUIM', categoria: '🐾 Animais' },
  { palavra: 'TUCANO', categoria: '🐾 Animais' },
  // 🍎 Frutas
  { palavra: 'BANANA', categoria: '🍎 Frutas' },
  { palavra: 'ABACAXI', categoria: '🍎 Frutas' },
  { palavra: 'MELANCIA', categoria: '🍎 Frutas' },
  { palavra: 'MORANGO', categoria: '🍎 Frutas' },
  { palavra: 'LARANJA', categoria: '🍎 Frutas' },
  { palavra: 'MARACUJA', categoria: '🍎 Frutas' },
  { palavra: 'GOIABA', categoria: '🍎 Frutas' },
  { palavra: 'PITANGA', categoria: '🍎 Frutas' },
  { palavra: 'ACEROLA', categoria: '🍎 Frutas' },
  { palavra: 'JABUTICABA', categoria: '🍎 Frutas' },
  // 🍔 Comidas
  { palavra: 'PIZZA', categoria: '🍔 Comidas' },
  { palavra: 'HAMBURGER', categoria: '🍔 Comidas' },
  { palavra: 'LASANHA', categoria: '🍔 Comidas' },
  { palavra: 'FEIJOADA', categoria: '🍔 Comidas' },
  { palavra: 'COXINHA', categoria: '🍔 Comidas' },
  { palavra: 'BRIGADEIRO', categoria: '🍔 Comidas' },
  { palavra: 'PASTEL', categoria: '🍔 Comidas' },
  { palavra: 'SUSHI', categoria: '🍔 Comidas' },
  { palavra: 'TACO', categoria: '🍔 Comidas' },
  { palavra: 'YAKISOBA', categoria: '🍔 Comidas' },
  // 🌍 Países
  { palavra: 'BRASIL', categoria: '🌍 Países' },
  { palavra: 'ARGENTINA', categoria: '🌍 Países' },
  { palavra: 'JAPAO', categoria: '🌍 Países' },
  { palavra: 'ITALIA', categoria: '🌍 Países' },
  { palavra: 'MEXICO', categoria: '🌍 Países' },
  { palavra: 'CANADA', categoria: '🌍 Países' },
  { palavra: 'ALEMANHA', categoria: '🌍 Países' },
  { palavra: 'PORTUGAL', categoria: '🌍 Países' },
  { palavra: 'AUSTRALIA', categoria: '🌍 Países' },
  { palavra: 'EGITO', categoria: '🌍 Países' },
  // 🎬 Filmes
  { palavra: 'TITANIC', categoria: '🎬 Filmes' },
  { palavra: 'AVATAR', categoria: '🎬 Filmes' },
  { palavra: 'MATRIX', categoria: '🎬 Filmes' },
  { palavra: 'GLADIADOR', categoria: '🎬 Filmes' },
  { palavra: 'INTERESTELAR', categoria: '🎬 Filmes' },
  { palavra: 'CORINGA', categoria: '🎬 Filmes' },
  { palavra: 'VINGADORES', categoria: '🎬 Filmes' },
  { palavra: 'FROZEN', categoria: '🎬 Filmes' },
  { palavra: 'SHREK', categoria: '🎬 Filmes' },
  { palavra: 'TROVAO', categoria: '🎬 Filmes' },
  // 📺 Séries
  { palavra: 'FRIENDS', categoria: '📺 Séries' },
  { palavra: 'BREAKINGBAD', categoria: '📺 Séries' },
  { palavra: 'STRANGER', categoria: '📺 Séries' },
  { palavra: 'DARK', categoria: '📺 Séries' },
  { palavra: 'LOST', categoria: '📺 Séries' },
  { palavra: 'HOUSE', categoria: '📺 Séries' },
  { palavra: 'DExter', categoria: '📺 Séries' },
  { palavra: 'VIKINGS', categoria: '📺 Séries' },
  { palavra: 'FLASH', categoria: '📺 Séries' },
  { palavra: 'ARROW', categoria: '📺 Séries' },
  // 🎌 Animes
  { palavra: 'NARUTO', categoria: '🎌 Animes' },
  { palavra: 'GOKU', categoria: '🎌 Animes' },
  { palavra: 'LUFFY', categoria: '🎌 Animes' },
  { palavra: 'ICHIGO', categoria: '🎌 Animes' },
  { palavra: 'SASUKE', categoria: '🎌 Animes' },
  { palavra: 'SAITAMA', categoria: '🎌 Animes' },
  { palavra: 'LEVI', categoria: '🎌 Animes' },
  { palavra: 'KAKASHI', categoria: '🎌 Animes' },
  { palavra: 'GON', categoria: '🎌 Animes' },
  { palavra: 'KILLUA', categoria: '🎌 Animes' },
  // 🎮 Jogos
  { palavra: 'MINECRAFT', categoria: '🎮 Jogos' },
  { palavra: 'FORTNITE', categoria: '🎮 Jogos' },
  { palavra: 'ROBLOX', categoria: '🎮 Jogos' },
  { palavra: 'FREEFIRE', categoria: '🎮 Jogos' },
  { palavra: 'VALORANT', categoria: '🎮 Jogos' },
  { palavra: 'CSGO', categoria: '🎮 Jogos' },
  { palavra: 'LEAGUE', categoria: '🎮 Jogos' },
  { palavra: 'OVERWATCH', categoria: '🎮 Jogos' },
  { palavra: 'ZELDA', categoria: '🎮 Jogos' },
  { palavra: 'POKEMON', categoria: '🎮 Jogos' },
  // 🎵 Músicas
  { palavra: 'MICHAEL', categoria: '🎵 Músicas' },
  { palavra: 'BEYONCE', categoria: '🎵 Músicas' },
  { palavra: 'RIHANNA', categoria: '🎵 Músicas' },
  { palavra: 'ANITTA', categoria: '🎵 Músicas' },
  { palavra: 'LUDMILLA', categoria: '🎵 Músicas' },
  { palavra: 'IVETE', categoria: '🎵 Músicas' },
  { palavra: 'GUSTTAVO', categoria: '🎵 Músicas' },
  { palavra: 'MARILIA', categoria: '🎵 Músicas' },
  { palavra: 'JORGE', categoria: '🎵 Músicas' },
  { palavra: 'MATEUS', categoria: '🎵 Músicas' },
  // 🏙️ Cidades
  { palavra: 'SAOPAULO', categoria: '🏙️ Cidades' },
  { palavra: 'RIO', categoria: '🏙️ Cidades' },
  { palavra: 'BRASILIA', categoria: '🏙️ Cidades' },
  { palavra: 'SALVADOR', categoria: '🏙️ Cidades' },
  { palavra: 'PARIS', categoria: '🏙️ Cidades' },
  { palavra: 'LONDRES', categoria: '🏙️ Cidades' },
  { palavra: 'NOVA IORQUE', categoria: '🏙️ Cidades' },
  { palavra: 'TOQUIO', categoria: '🏙️ Cidades' },
  { palavra: 'ROMA', categoria: '🏙️ Cidades' },
  { palavra: 'MADRI', categoria: '🏙️ Cidades' },
  // 👤 Famosos
  { palavra: 'NEYMAR', categoria: '👤 Famosos' },
  { palavra: 'MESSI', categoria: '👤 Famosos' },
  { palavra: 'CRISTIANO', categoria: '👤 Famosos' },
  { palavra: 'RONALDO', categoria: '👤 Famosos' },
  { palavra: 'PELÉ', categoria: '👤 Famosos' },
  { palavra: 'BEYONCE', categoria: '👤 Famosos' },
  { palavra: 'WILLSMITH', categoria: '👤 Famosos' },
  { palavra: 'SHAKIRA', categoria: '👤 Famosos' },
  { palavra: 'MADONNA', categoria: '👤 Famosos' },
  { palavra: 'ELVIS', categoria: '👤 Famosos' },
  // 🎨 Cores
  { palavra: 'VERMELHO', categoria: '🎨 Cores' },
  { palavra: 'AZUL', categoria: '🎨 Cores' },
  { palavra: 'VERDE', categoria: '🎨 Cores' },
  { palavra: 'AMARELO', categoria: '🎨 Cores' },
  { palavra: 'ROXO', categoria: '🎨 Cores' },
  { palavra: 'LARANJA', categoria: '🎨 Cores' },
  { palavra: 'ROSA', categoria: '🎨 Cores' },
  { palavra: 'PRETO', categoria: '🎨 Cores' },
  { palavra: 'BRANCO', categoria: '🎨 Cores' },
  { palavra: 'CINZA', categoria: '🎨 Cores' },
  // 🚗 Carros
  { palavra: 'FERRARI', categoria: '🚗 Carros' },
  { palavra: 'LAMBORGHINI', categoria: '🚗 Carros' },
  { palavra: 'PORSCHE', categoria: '🚗 Carros' },
  { palavra: 'BMW', categoria: '🚗 Carros' },
  { palavra: 'MERCEDES', categoria: '🚗 Carros' },
  { palavra: 'AUDI', categoria: '🚗 Carros' },
  { palavra: 'TOYOTA', categoria: '🚗 Carros' },
  { palavra: 'HONDA', categoria: '🚗 Carros' },
  { palavra: 'FORD', categoria: '🚗 Carros' },
  { palavra: 'CHEVROLET', categoria: '🚗 Carros' },
  // ⚽ Esportes
  { palavra: 'FUTEBOL', categoria: '⚽ Esportes' },
  { palavra: 'BASQUETE', categoria: '⚽ Esportes' },
  { palavra: 'VOLEI', categoria: '⚽ Esportes' },
  { palavra: 'NATACAO', categoria: '⚽ Esportes' },
  { palavra: 'ATLETISMO', categoria: '⚽ Esportes' },
  { palavra: 'JUDO', categoria: '⚽ Esportes' },
  { palavra: 'KARATE', categoria: '⚽ Esportes' },
  { palavra: 'BOXE', categoria: '⚽ Esportes' },
  { palavra: 'SURFE', categoria: '⚽ Esportes' },
  { palavra: 'SKATE', categoria: '⚽ Esportes' },
  // 🧠 Profissões
  { palavra: 'MEDICO', categoria: '🧠 Profissões' },
  { palavra: 'PROFESSOR', categoria: '🧠 Profissões' },
  { palavra: 'ADVOGADO', categoria: '🧠 Profissões' },
  { palavra: 'ENGENHEIRO', categoria: '🧠 Profissões' },
  { palavra: 'PILOTO', categoria: '🧠 Profissões' },
  { palavra: 'BOMBEIRO', categoria: '🧠 Profissões' },
  { palavra: 'POLICIAL', categoria: '🧠 Profissões' },
  { palavra: 'DENTISTA', categoria: '🧠 Profissões' },
  { palavra: 'ARQUITETO', categoria: '🧠 Profissões' },
  { palavra: 'COZINHEIRO', categoria: '🧠 Profissões' }
];;

const FORCA_BONECO = [
  '',
  '  O',
  '  O\n  |',
  '  O\n /|',
  '  O\n /|\\',
  '  O\n /|\\\n /',
  '  O\n /|\\\n / \\'
];

const forcaJogos = new Map();

const MEMORIA_EMOJIS = ['🍎','🍌','🍇','🍓','🍊','🍒','🍑','🥝','🍍','🍉','🥥','🍋'];

const memoriaJogos = new Map();



async function tratarForcaTexto(sock, msg, from, sender, text) {
  try {
    const t = String(text || '').trim().toUpperCase();
    if (!t) return false;
    if (t.startsWith(PREFIXO)) return false;
    const jogo = forcaJogos.get(from);
    if (!jogo) return false;
    const stanza = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
    if (!stanza) return false;
    const jogadorDaVez = jogo.vez === 1 ? jogo.j1 : jogo.j2;
    if (jogadorDaVez !== sender) return false;
    if (!/^[A-Z]$/.test(t)) return false;
    if (jogo.letrasCertas.includes(t) || jogo.letrasErradas.includes(t)) {
      await sock.sendMessage(from, { text: '⚠️ Essa letra já foi usada!' }, { quoted: msg });
      return true;
    }
    const ehJ1 = jogo.j1 === sender;
    if (jogo.palavra.includes(t)) {
      jogo.letrasCertas.push(t);
      if (ehJ1) jogo.acertos1++; else jogo.acertos2++;
    } else {
      jogo.letrasErradas.push(t);
      if (ehJ1) jogo.erros1++; else jogo.erros2++;
    }
    const oculto = jogo.palavra.split('').map(l => jogo.letrasCertas.includes(l) ? l : '＿').join(' ');
    const ganhou = jogo.palavra.split('').every(l => jogo.letrasCertas.includes(l));
    const boneco = FORCA_BONECO[jogo.erros1 + jogo.erros2];
    const id1 = jogo.j1.split('@')[0];
    const id2 = jogo.j2.split('@')[0];
    if (ganhou) {
      forcaJogos.delete(from);
      await sock.sendMessage(from, {
        text: '╭━━━〔 🏆 𝐕𝐈𝐓𝐎́𝐑𝐈𝐀 🏆 〕━━━╮\n┃\n┃ 🎉 @' + sender.split('@')[0] + ' acertou!\n┃ 📚 Palavra: *' + jogo.palavra + '*\n┃\n┃ 📊 PLACAR FINAL:\n┃ 👤 @' + id1 + ': ✅ ' + jogo.acertos1 + ' | ❌ ' + jogo.erros1 + '\n┃ 👤 @' + id2 + ': ✅ ' + jogo.acertos2 + ' | ❌ ' + jogo.erros2 + '\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
        mentions: [jogo.j1, jogo.j2]
      }, { quoted: msg });
      return true;
    }
    if (jogo.erros1 >= 6 || jogo.erros2 >= 6) {
      forcaJogos.delete(from);
      let vencedor;
      if (jogo.acertos1 > jogo.acertos2) vencedor = jogo.j1;
      else if (jogo.acertos2 > jogo.acertos1) vencedor = jogo.j2;
      else vencedor = 'empate';
      let txtVenc = '';
      if (vencedor === 'empate') txtVenc = '🤝 *EMPATE!*';
      else txtVenc = '🏆 @' + vencedor.split('@')[0] + ' ganhou!';
      await sock.sendMessage(from, {
        text: '╭━━━〔 💀 𝐅𝐈𝐌 𝐃𝐄 𝐉𝐎𝐆𝐎 💀 〕━━━╮\n┃\n┃ 📚 Palavra: *' + jogo.palavra + '*\n┃\n┃ 📊 PLACAR FINAL:\n┃ 👤 @' + id1 + ': ✅ ' + jogo.acertos1 + ' | ❌ ' + jogo.erros1 + '\n┃ 👤 @' + id2 + ': ✅ ' + jogo.acertos2 + ' | ❌ ' + jogo.erros2 + '\n┃\n┃ ' + txtVenc + '\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
        mentions: [jogo.j1, jogo.j2]
      }, { quoted: msg });
      return true;
    }
    jogo.vez = jogo.vez === 1 ? 2 : 1;
    forcaJogos.set(from, jogo);
    const proximo = jogo.vez === 1 ? jogo.j1 : jogo.j2;
    await sock.sendMessage(from, {
      text: '╭━━━〔 🎮 𝐅𝐎𝐑𝐂𝐀 🎮 〕━━━╮\n┃\n┃ 📚 Categoria: *' + jogo.categoria + '*\n┃\n┃ ' + oculto + '\n┃\n┃' + (boneco ? '\n┃' + boneco.split('\n').join('\n┃') + '\n┃' : '') + '\n┃\n┃ 📊 PLACAR:\n┃ 👤 @' + id1 + ': ✅ ' + jogo.acertos1 + ' | ❌ ' + jogo.erros1 + '\n┃ 👤 @' + id2 + ': ✅ ' + jogo.acertos2 + ' | ❌ ' + jogo.erros2 + '\n┃\n┃ ❌ Erradas: ' + (jogo.letrasErradas.join(' ') || 'nenhuma') + '\n┃\n┃ 🎯 Vez de @' + proximo.split('@')[0] + '!\n┃    (marque esta mensagem)\n┃\n┃ 💡 Cancelar: !cancelarforca\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
      mentions: [proximo]
    }, { quoted: msg });
    return true;
  } catch (e) { console.error('Erro forca:', e); return false; }
}

async function tratarMemoriaTexto(sock, msg, from, sender, text) {
  try {
    const t = String(text || '').trim();
    if (!t) return false;
    if (t.startsWith(PREFIXO)) return false;
    const jogo = memoriaJogos.get(from);
    if (!jogo) return false;
    if (jogo.fase !== 'respondendo') return false;
    if (jogo.jogador !== sender) return false;
    const stanza = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
    if (!stanza) return false;
    const semEspaco = t.replace(/\s/g, '');
    const emojis = [...semEspaco];
    const resposta = jogo.ordem;
    const acertos = emojis.filter((e, i) => e === resposta[i]).length;
    if (acertos === 4) {
      jogo.pontos++;
      if (jogo.rodada >= 3) {
        memoriaJogos.delete(from);
        await sock.sendMessage(from, {
          text: '╭━━━〔 🏆 𝐅𝐈𝐌 𝐃𝐄 𝐉𝐎𝐆𝐎 🏆 〕━━━╮\n┃\n┃ 🎉 @' + sender.split('@')[0] + ' acertou!\n┃ 📊 Placar: *' + jogo.pontos + '/3*\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
          mentions: [sender]
        }, { quoted: msg });
        return true;
      }
      jogo.rodada++;
      jogo.fase = 'mostrando';
      const novosEmojis = [...MEMORIA_EMOJIS].sort(() => Math.random() - 0.5).slice(0, 4);
      jogo.ordem = novosEmojis;
      memoriaJogos.set(from, jogo);
      await sock.sendMessage(from, {
        text: '✅ *Acertou!* Rodada ' + jogo.rodada + '/3\n\n🎯 Nova ordem:\n\n' + novosEmojis.join(' ') + '\n\n⏰ 5 segundos!',
        mentions: [sender]
      }, { quoted: msg });
      setTimeout(async () => {
        const j = memoriaJogos.get(from);
        if (!j || j.fase !== 'mostrando') return;
        j.fase = 'respondendo';
        memoriaJogos.set(from, j);
        await sock.sendMessage(from, {
          text: '🎯 @' + sender.split('@')[0] + ', qual era a ordem?\n\n1️⃣ ? 2️⃣ ? 3️⃣ ? 4️⃣ ?\n\n(marque a mensagem)',
          mentions: [sender]
        });
      }, 5000);
      return true;
    }
    memoriaJogos.delete(from);
    await sock.sendMessage(from, {
      text: '╭━━━〔 ❌ 𝐄𝐑𝐑𝐎𝐔 ❌ 〕━━━╮\n┃\n┃ 😢 @' + sender.split('@')[0] + ' errou!\n┃ 📊 Acertos: ' + acertos + '/4\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
      mentions: [sender]
    }, { quoted: msg });
    return true;
  } catch (e) { console.error('Erro memoria:', e); return false; }
}


// ═══ COMPRARBOT ═══

async function tratarComprarbot(sock, msg, from, sender, text) {
  try {
    const t = String(text || '').trim().toLowerCase();
    if (t !== 'comprarbot') return false;
    if (!from.endsWith('@g.us')) return false;
    const alug = carregarJSON(FILE_ALUGUEIS);
    const info = alug[from];
    if (!info || !info.expira) return false;
    if (info.expira < dataAlug(0)) return false;

    const texto =
      '｡･:*:･ﾟ★,｡･:*:･ﾟ☆ ｡･:*:･ﾟ★,｡･:*:･ﾟ☆\n' +
      '    💜 𝐒𝐇𝐈𝐙𝐔𝐊𝐈 𝐁𝐎𝐓 - 𝐌𝐃 💜\n' +
      '｡･:*:･ﾟ★,｡･:*:･ﾟ☆ ｡･:*:･ﾟ★,｡･:*:･ﾟ☆\n\n' +
      '🌸 Oii! Eu sou a Shizuki~ 💜\n' +
      '   A bot mais fofa e completa da web! (◕‿◕)\n\n' +
      '━━━━━━━━━━━━━━━━━━\n\n' +
      '✨ 𝐎 𝐐𝐔𝐄 𝐄𝐔 𝐅𝐀𝐂̧𝐎:\n\n' +
      '🛡️ *Moderação Completa* 🌸\n' +
      '   Protejo seu grupo com todo carinho!\n\n' +
      '🏛️ *Sistema de Presidente* 👑\n' +
      '   ┣ Eleições com votação\n' +
      '   ┣ Candidatos com propostas\n' +
      '   ┣ Presidente controla tudo\n' +
      '   ┗ Mandato de 7 dias\n\n' +
      '🏴 *Facções* 🏴\n' +
      '   ┣ Criar, convidar e guerrear\n' +
      '   ┣ Caixa comum e ranking\n' +
      '   ┣ Facção dominante (5 vitórias)\n' +
      '   ┗ IDs únicos por facção\n\n' +
      '⚔️ *Arena VIP* ⚔️\n' +
      '   ┣ Duelos com aposta\n' +
      '   ┣ HP, ataque, defesa\n' +
      '   ┣ Magias (bola de fogo, raio, cura)\n' +
      '   ┗ Sistema completo de RPG\n\n' +
      '🏰 *Shizuki City* 🏰\n' +
      '   ┣ Trabalhos, casa, família\n' +
      '   ┣ Banco, investimentos, empresas\n' +
      '   ┣ Pescar, minerar, roubar\n' +
      '   ┗ Sistema de relacionamento\n\n' +
      '🐾 *Sistema Pokémon* 🐾\n' +
      '   ┣ Capturar pokémons selvagens\n' +
      '   ┣ Batalhas 1v1 com stats\n' +
      '   ┣ Pokébolas e itens\n' +
      '   ┗ Spawn automático\n\n' +
      '🎮 *Jogos e Diversão* 🎮\n' +
      '   ┣ 🎲 Forca, memória e quiz\n' +
      '   ┣ 🎯 Jogo da velha e PPT\n' +
      '   ┣ 🎰 Cassino e roleta\n' +
      '   ┗ 🎁 E muito mais~ 💕\n\n' +
      '━━━━━━━━━━━━━━━━━━\n\n' +
      '💎 𝐌𝐄𝐔𝐒 𝐃𝐈𝐅𝐄𝐑𝐄𝐍𝐂𝐈𝐀𝐈𝐒:\n\n' +
      '✅ Única com Sistema de Presidente 💜\n' +
      '✅ Única com Facções + Guerra 🏴\n' +
      '✅ Única com Arena VIP de magias ⚔️\n' +
      '✅ Shizuki City (RPG completo) 🏰\n' +
      '✅ Sistema Pokémon funcional 🐾\n' +
      '✅ Mais de 100 comandinhos~ 🌸\n\n' +
      '━━━━━━━━━━━━━━━━━━\n\n' +
      '💰 𝐏𝐋𝐀𝐍𝐎𝐒:\n\n' +
      '📅 *Semanal:* R$ 5,00\n' +
      '   ┗ Pra você me testar~ 🌸\n\n' +
      '📆 *Mensal:* R$ 12,20\n' +
      '   ┗ Melhor custo-benefício! 💜\n\n' +
      '🗓️ *Bimestral:* R$ 15,80\n' +
      '   ┗ Economia fofa~ ✨\n\n' +
      '📅 *Anual:* R$ 20,00\n' +
      '   ┗ Melhor preço! 💕\n\n' +
      '💎 *VIP:* R$ 6,00\n' +
      '   ┗ Comandos exclusivos~ 👑\n\n' +
      '━━━━━━━━━━━━━━━━━━\n\n' +
      '🎁 𝐁𝐎̂𝐍𝐔𝐒 𝐏𝐀𝐑𝐀 𝐀𝐍𝐔𝐀𝐋:\n\n' +
      '✨ Suporte prioritário\n' +
      '✨ Comandos exclusivos\n' +
      '✨ Sem taxa de adesão\n\n' +
      '━━━━━━━━━━━━━━━━━━\n\n' +
      '📱 *Fale com meu dono:*\n' +
      'wa.me/5519988953961\n\n' +
      '💜 *Shizuki Bot - MD*\n' +
      '_A bot mais fofa da web~ (◕‿◕)_';

    await sock.sendMessage(from, { text: texto }, { quoted: msg });
    return true;
  } catch (e) { console.error('Erro comprarbot:', e); return false; }
}



// ═══ DUELO ═══

const dueloJogos = new Map();














// ═══ LISTA NEGRA ═══

const FILE_LISTANEGRA = './listanegra.json';

const FRASES_BAN_LISTANEGRA = [
  'tentou entrar né, seu bosta?!',
  'achou que ia passar, seu otário?!',
  'vai sonhando, seu arrombado!',
  'nem tenta de novo, seu merda!',
  'aqui não é teu lugar, desgraçado!',
  'se fode aí, vagabundo!'
];

function carregarListaNegra() {
  return carregarJSON(FILE_LISTANEGRA);
}
function salvarListaNegra(db) {
  salvarJSON(FILE_LISTANEGRA, db);
}
function limparNumero(num) {
  return String(num || '').replace(/[^0-9]/g, '');
}




// ═══ DESGASTE DE VEÍCULO ═══
function desgastarVeiculo(u, jid, pct) {
  try {
    const veiculos = (u.itens || []).filter(x => typeof x === 'object' && x.vida !== undefined);
    if (!veiculos.length) return null;
    // Pega o primeiro que NÃO tá quebrado
    const veic = veiculos.find(v => v.vida > 0);
    if (!veic) return null;
    veic.vida = Math.max(0, veic.vida - pct);
    salvarShizuki(jid, u);
    return veic;
  } catch (e) { return null; }
}

// ═══════════════════════════════════════════════
//       RANKS DE ZOEIRA
// ═══════════════════════════════════════════════

const RANKS_CONFIG = {
  ranklinda:    { topo: '🌸 OS MAIS LINDOS DESSE GRUPO SÃO ESSES 🌸',  busca: 'anime garota bonita',  frase: '🌸 Linda demais! Já pensou em ser modelo? Ou minha?' },
  ranklindo:    { topo: '😍 OS MAIS LINDOS DESSE GRUPO SÃO ESSES 😍',  busca: 'anime garoto bonito',  frase: '😍 Lindo demais! Sai do fake, galã de novela.' },
  rankbebado:   { topo: '🍺 OS MAIS BÊBADOS DESSE GRUPO SÃO ESSES 🍺', busca: 'cerveja',              frase: '🍺 Larga a garrafa e vai dormir, cachaça! Já tá na quarta dose.' },
  rankfiel:     { topo: '🐕 OS MAIS FIÉIS DESSE GRUPO SÃO ESSES 🐕',   busca: 'cachorro fiel',        frase: '🐕 Fiel que nem cachorro, parabéns! Só falta abanar o rabo.' },
  rankputa:     { topo: '💄 OS MAIS PUTAS DESSE GRUPO SÃO ESSES 💄',   busca: 'anime menina',         frase: '💄 Calma lá, princesa! Tá atrasada pro programa?' },
  rankgay:      { topo: '🏳️‍🌈 OS MAIS GAYS DESSE GRUPO SÃO ESSES 🏳️‍🌈', busca: 'bandeira lgbt',        frase: '🏳️‍🌈 Deixe de ser gay, para acabar com a homofobia jkkk' },
  rankcorno:    { topo: '🐂 OS MAIS CORNOS DESSE GRUPO SÃO ESSES 🐂',  busca: 'touro',                frase: '🐂 Tá usando chapéu de touro já? Aqui tem vaga!' },
  rankotaku:    { topo: '🎌 OS MAIS OTAKUS DESSE GRUPO SÃO ESSES 🎌',  busca: 'anime garota',         frase: '🎌 Otaku detectado! Sai do quarto e vai tomar sol.' },
  rankpobre:    { topo: '💸 OS MAIS POBRES DESSE GRUPO SÃO ESSES 💸',  busca: 'carteira vazia',       frase: '💸 Tá comendo miojo com farinha? Vai trabalhar, vagabundo kkkk' },
  rankrico:     { topo: '💰 OS MAIS RICOS DESSE GRUPO SÃO ESSES 💰',   busca: 'dinheiro',             frase: '💰 Stonks! Empresta um pouco pro seu amigo aqui? Só 5 mil.' },
  rankfeio:     { topo: '🙈 OS MAIS FEIOS DESSE GRUPO SÃO ESSES 🙈',   busca: 'gato feio',            frase: '🙈 Meu Deus, que susto! Avisa antes de mandar foto.' },
  rankgostosa:  { topo: '🍑 AS MAIS GOSTOSAS DESSE GRUPO SÃO ESSAS 🍑', busca: 'anime garota',        frase: '🍑 Gostosa demais! Envie uma foto no PV do dono.' },
  rankgostoso:  { topo: '😏 OS MAIS GOSTOSOS DESSE GRUPO SÃO ESSES 😏', busca: 'anime garoto bonito', frase: '😏 Delícia demais! Manda nudes no PV do dono, vai.' },
  rankgado:     { topo: '🐄 OS MAIS GADOS DESSE GRUPO SÃO ESSES 🐄',   busca: 'vaca',                 frase: '🐄 A corda tá longa hein? Cuidado pra não se enforcar!' },
  rankpau:      { topo: '🍌 OS MAIORES PAUS DESSE GRUPO SÃO ESSES 🍌', busca: 'banana',               frase: '🍌 Vai catar manga com esse aí! Nem a lua alcança.' },
  rankbct:      { topo: '🍉 AS MAIORES BCT DESSE GRUPO SÃO ESSAS 🍉',  busca: 'melancia',             frase: '🍉 Fecha essa perna, moça! Tá voando mosca.' }
};

function barraRank(pct) {
  const cheios = Math.round(pct / 10);
  return '▓'.repeat(cheios) + '░'.repeat(10 - cheios);
}


// ═══ !take — cria sticker animado com marca (SEM ffmpeg) ═══
async function criarStickerTk(buffer, isVideo, pack, author) {
  // Aplica metadata EXIF direto no webp (funciona pra estático e animado)
  const json = {
    'sticker-pack-id': 'shizuki-bot',
    'sticker-pack-name': pack,
    'sticker-pack-publisher': author,
    emojis: ['💜']
  };
  const exifAttr = Buffer.from([0x49,0x49,0x2A,0x00,0x08,0x00,0x00,0x00,0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,0x00,0x00,0x16,0x00,0x00,0x00]);
  const jsonBuff = Buffer.from(JSON.stringify(json), 'utf-8');
  const exif = Buffer.concat([exifAttr, jsonBuff]);
  exif.writeUIntLE(jsonBuff.length, 14, 4);

  const img = new webp.Image();
  await img.load(buffer);
  img.exif = exif;
  const final = await img.save(null);
  return final;
}

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    auth: state,
    browser: ['Ubuntu', 'Chrome', '20.0.04']
  });

  const __enviarOriginal = sock.sendMessage.bind(sock);
  sock.sendMessage = (jid, content, options) => {
    try {
      if (content && typeof content === 'object' && !content.contextInfo && !content.react && !content.delete && !content.forward && (typeof content.text === 'string' || typeof content.caption === 'string')) {
        const extraCanal = contextoCanal(carregarConfig());
        if (extraCanal.contextInfo) content = { ...content, ...extraCanal };
      }
    } catch (e) {}
    return __enviarOriginal(jid, content, options);
  };

  if (!sock.authState.creds.registered) {
    console.log('\n' +
        '╭━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n' +
        '┃                             ┃\n' +
        '┃    💜 𝐒𝐇𝐈𝐙𝐔𝐊𝐈 𝐁𝐎𝐓 - 𝐌𝐃 💜    ┃\n' +
        '┃                             ┃\n' +
        '┃    👑 Feito por: nick dev   ┃\n' +
        '┃    ⚡ Versão: 2.0            ┃\n' +
        '┃                             ┃\n' +
        '╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n');
      // BANNER BONITO
      const phoneNumber = await question('📱 Digite o seu número com DDD: ');
    const code = await sock.requestPairingCode(phoneNumber.trim());
    console.log('\n' +
        '╭━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n' +
        '┃                             ┃\n' +
        '┃  🔑 Seu código de pareamento ┃\n' +
        '┃                             ┃\n' +
        `┃      \x1b[32m\x1b[1m${code}\x1b[0m      ┃\n` +
        '┃                             ┃\n' +
        '╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n');
      console.log('💡 Cole no WhatsApp em: Aparelhos conectados → Conectar com número\n');
      console.log('⏳ Aguardando conexão...\n'); // BANNER BONITO
  }

  sock.ev.on('creds.update', saveCreds);

  globalThis.__sockAtual = sock;

  // ═══ TIMER: FIM DE MANDATO + AVALIAÇÃO ═══
  if (!globalThis.__timerPresidente) {
    globalThis.__timerPresidente = setInterval(async () => {
      try {
        const s = globalThis.__sockAtual;
        if (!s) return;
        const dbP = carregarPresidente();
        // Suporta estrutura antiga (global) e nova (por grupo)
        const porGrupo = dbP.grupos || null;
        const agora = Date.now();

        if (porGrupo) {
          for (const gid of Object.keys(porGrupo)) {
            const p = porGrupo[gid];
            if (!p || !p.expiraEm) continue;
            if (agora >= p.expiraEm && !p.avaliacao) {
              p.avaliacao = { abertaEm: agora, sim: 0, nao: 0, votaram: [] };
              salvarPresidente(dbP);
              try {
                await s.sendMessage(gid, {
                  text: '⚖️ *AVALIAÇÃO DE GESTÃO* ⚖️\n\n' +
                        '👤 Presidente: @' + p.jid.split('@')[0] + '\n' +
                        '📅 Mandato encerrado!\n\n' +
                        'Vote: *!avaliar sim* ou *!avaliar nao*\n' +
                        '⏰ Vocês têm 24h!\n\n' +
                        '🌸 𝐒𝐡𝐢𝐳𝐮𝐤𝐢 𝐁𝐨𝐭 - 𝐌𝐃 🌸',
                  mentions: [p.jid]
                });
              } catch (e) {}
            }
            // Fecha avaliação depois de 24h
            if (p.avaliacao && agora - p.avaliacao.abertaEm >= 24 * 3600000) {
              const aprovado = p.avaliacao.sim > p.avaliacao.nao;
              try {
                if (aprovado) {
                  const sh = carregarJSON('./shizuki_users.json');
                  if (sh[p.jid]) { sh[p.jid].reais = (sh[p.jid].reais || 0) + 1000000; salvarJSON('./shizuki_users.json', sh); }
                  await s.sendMessage(gid, {
                    text: '✅ *PRESIDENTE APROVADO!* ✅\n\n' +
                          '👤 @' + p.jid.split('@')[0] + '\n' +
                          '🗳️ SIM: ' + p.avaliacao.sim + ' | NÃO: ' + p.avaliacao.nao + '\n' +
                          '🎁 Prêmio: *R$ 1.000.000*\n\n' +
                          '🌸 𝐒𝐡𝐢𝐳𝐮𝐤𝐢 𝐁𝐨𝐭 - 𝐌𝐃 🌸',
                    mentions: [p.jid]
                  });
                } else {
                  p.suspensoAte = agora + 2 * 86400000;
                  await s.sendMessage(gid, {
                    text: '❌ *PRESIDENTE REPROVADO!* ❌\n\n' +
                          '👤 @' + p.jid.split('@')[0] + '\n' +
                          '🗳️ SIM: ' + p.avaliacao.sim + ' | NÃO: ' + p.avaliacao.nao + '\n' +
                          '🚫 Suspenso do !menushizuki por 2 dias\n\n' +
                          '🌸 𝐒𝐡𝐢𝐳𝐮𝐤𝐢 𝐁𝐨𝐭 - 𝐌𝐃 🌸',
                    mentions: [p.jid]
                  });
                }
              } catch (e) {}
              p.avaliacao = null;
              p.terminou = true;
              salvarPresidente(dbP);
            }
          }
        }
      } catch (e) { console.error('Erro timer presidente:', e.message); }
    }, 5 * 60 * 1000); // checa a cada 5 min
  }

  if (!globalThis.__timerAvisos) {
    globalThis.__timerAvisos = setInterval(async () => {
      try {
        const horaAviso = new Date().toLocaleTimeString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
          hour: '2-digit',
          minute: '2-digit'
        });
        const pendentes = carregarJSON(FILE_AVISOS);
        const devidos = Object.keys(pendentes).filter(k => pendentes[k].horario === horaAviso);
        if (devidos.length === 0) return;

        const lista = devidos.map(k => pendentes[k]);
        for (const k of devidos) delete pendentes[k];
        salvarJSON(FILE_AVISOS, pendentes);

        for (const av of lista) {
          try {
            await globalThis.__sockAtual.sendMessage(av.groupId, {
              text: '📢 *AVISO PROGRAMADO* 📢\n\n' + av.texto + '\n\n🕒 Agendado por @' + av.adm.split('@')[0] + ' para as ' + av.horario,
              mentions: [av.adm]
            });
          } catch (e) {
            console.error('Erro ao enviar aviso programado:', e);
          }
        }
      } catch (err) {
        console.error('Erro no temporizador de avisos:', err);
      }
    }, 20000);
  }


  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom)
        ? lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut
        : true;

      console.log('❌ [CONEXÃO] Conexão fechada. Tentando reconectar...', shouldReconnect);
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === 'open') {
      console.log('\n' +
        '╭━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n' +
        '┃                             ┃\n' +
        '┃  ✅ 𝐂𝐎𝐍𝐄𝐂𝐓𝐀𝐃𝐎 𝐂𝐎𝐌 𝐒𝐔𝐂𝐄𝐒𝐒𝐎!  ┃\n' +
        '┃                             ┃\n' +
        '┃  💜 Shizuki Bot - MD v2.0   ┃\n' +
        '┃  🚀 Pronto pra ação!         ┃\n' +
        '┃                             ┃\n' +
        '╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n'); // BANNER BONITO
      try {
        if (fs.existsSync(FILE_RESTART)) {
          const rInfo = JSON.parse(fs.readFileSync(FILE_RESTART, 'utf-8'));
          fs.unlinkSync(FILE_RESTART);
          if (rInfo.chat) setTimeout(() => sock.sendMessage(rInfo.chat, { text: rInfo.texto }).catch(() => {}), 3000);
        }
      } catch (e) {}
    }
  });

  setInterval(async () => {
    try {
      const agora = new Date();
      const horaAtualStr = agora.toLocaleTimeString('pt-BR', { 
        timeZone: 'America/Sao_Paulo', 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      let agendamentos = carregarJSON(FILE_SCHEDULES);
      let alterado = false;

      for (const key of Object.keys(agendamentos)) {
        const item = agendamentos[key];
        if (item.horario === horaAtualStr) {
          try {
            if (item.tipo === 'open') {
              await sock.groupSettingUpdate(item.groupId, 'not_announcement');
              await sock.sendMessage(item.groupId, {
                text: `Grupo aberto com sucesso pelo adm @${item.adm.split('@')[0]} às ${item.horario}`,
                mentions: [item.adm]
              });
            } else if (item.tipo === 'close') {
              await sock.groupSettingUpdate(item.groupId, 'announcement');
              await sock.sendMessage(item.groupId, {
                text: `Grupo foi fechado com sucesso pelo adm @${item.adm.split('@')[0]} às ${item.horario}`,
                mentions: [item.adm]
              });
            }
          } catch (e) {
            console.error('Erro ao executar agendamento de grupo:', e);
          }
          delete agendamentos[key];
          alterado = true;
        }
      }

      if (alterado) {
        salvarJSON(FILE_SCHEDULES, agendamentos);
      }
    } catch (err) {
      console.error('Erro no temporizador de agendamento:', err);
    }
  }, 30000);

  sock.ev.on('group-participants.update', async (event) => {
    try {
      const { id, participants, action } = event;

      if (action === 'add') {
        // ═══ AUTO-BAN LISTA NEGRA ═══
        try {
          const dbAB = carregarListaNegra();
          const listaAB = dbAB[id] || [];
          if (listaAB.length > 0) {
            for (const p of participants) {
              const numAB = typeof p === 'string' ? p : (p.id || p.phoneNumber);
              if (!numAB) continue;

              // ═══ Tenta pegar o NÚMERO REAL de várias formas ═══
              let numLimpo = limparNumero(numAB.split('@')[0]);

              // 1) Se o participante já vem com phoneNumber no objeto
              if (p && typeof p === 'object' && p.phoneNumber) {
                numLimpo = limparNumero(p.phoneNumber.split('@')[0]);
              }

              // 2) Consulta no metadata do grupo (isso funciona com LID)
              try {
                const gmAB = await sock.groupMetadata(id);
                const partAB = gmAB.participants.find(x =>
                  x.id === numAB || (x.lid && x.lid === numAB) || (x.id && x.id.includes(numAB.split('@')[0]))
                );
                if (partAB) {
                  if (partAB.phoneNumber) {
                    numLimpo = limparNumero(partAB.phoneNumber.split('@')[0]);
                  } else if (partAB.id && partAB.id.endsWith('@s.whatsapp.net')) {
                    numLimpo = limparNumero(partAB.id.split('@')[0]);
                  }
                }
              } catch (e) {}

              // 3) Fallback: onWhatsApp
              try {
                const infoAB = await sock.onWhatsApp(numAB);
                if (infoAB && infoAB[0] && infoAB[0].jid) {
                  const numReal = infoAB[0].jid.split('@')[0].split(':')[0];
                  numLimpo = limparNumero(numReal);
                }
              } catch (e) {}

              // 4) ═══ CONVERSÃO LID → NÚMERO REAL via signalRepository ═══
              console.log('[LN-CHECK] sock.signalRepository?', !!sock.signalRepository, '| lidMapping?', !!(sock.signalRepository && sock.signalRepository.lidMapping), '| tem getPNForLID?', !!(sock.signalRepository && sock.signalRepository.lidMapping && sock.signalRepository.lidMapping.getPNForLID));
              try {
                if (numAB.endsWith('@lid') && sock.signalRepository && sock.signalRepository.lidMapping) {
                  const pn = await sock.signalRepository.lidMapping.getPNForLID(numAB);
                  if (pn) {
                    const numPn = limparNumero(pn.split('@')[0].split(':')[0]);
                    if (numPn && numPn.length >= 10) {
                      numLimpo = numPn;
                      console.log('[LN] LID convertido pra PN:', numPn);
                    }
                  }
                }
              } catch (e) { console.log('[LN] Erro conversão LID:', e.message); }

              console.log('[LN-DEBUG] numAB:', numAB, '| numLimpo:', numLimpo, '| lista:', JSON.stringify(listaAB));

              const achou = listaAB.find(n => {
                return n === numLimpo
                  || numLimpo.endsWith(n)
                  || n.endsWith(numLimpo)
                  || n === numAB.split('@')[0]
                  || numAB.split('@')[0] === n;
              });
              if (achou) {
                try {
                  await sock.groupParticipantsUpdate(id, [numAB], 'remove');
                  const fraseAB = FRASES_BAN_LISTANEGRA[Math.floor(Math.random() * FRASES_BAN_LISTANEGRA.length)];
                  await sock.sendMessage(id, {
                    text: '╭━━━〔 🚨 𝐁𝐀𝐍𝐈𝐃𝐎 🚨 〕━━━╮\n' +
                          '┃\n' +
                          '┃ 💀 @' + numAB.split('@')[0] + ', seu arrombado!\n' +
                          '┃    ' + fraseAB.charAt(0).toUpperCase() + fraseAB.slice(1) + '\n' +
                          '┃\n' +
                          '┃ 📱 Número: *' + numLimpo + '*\n' +
                          '┃ ⚠️ Tá na lista negra, seu corno!\n' +
                          '┃\n' +
                          '┃ 🖕 VAI TOMAR NO CU, FILHO DA PUTA!\n' +
                          '┃ 🚫 Aqui não é teu lugar, desgraçado!\n' +
                          '┃\n' +
                          '╰━━━━━━━━━━━━━━━━━━╯',
                    mentions: [numAB]
                  });
                } catch (e) {
                  console.error('Erro auto-ban:', e.message);
                }
              }
            }
          }
        } catch (e) { console.error('Erro auto-ban geral:', e.message); }
        // ═══ FIM AUTO-BAN ═══

        // ANTI-BOT
        try {
          if (antiBotAtivo(id)) {
            for (const p of participants) {
              const num = typeof p === 'string' ? p : (p.id || p.phoneNumber);
              if (!num) continue;
              let nome = '';
              try {
                const info = await sock.onWhatsApp(num);
                nome = (info && info[0] && info[0].notify) || '';
              } catch (e) {}
              if (contemBotNoNome(nome)) {
                try {
                  await sock.groupParticipantsUpdate(id, [num], 'remove');
                  await sock.sendMessage(id, { text: '🤖 Bot detectado e removido: ' + num.split('@')[0] });
                } catch (e) {}
              }
            }
          }
        } catch (e) { console.error('Erro antibot:', e); }
        if (!bvAtivo(id)) return;
        for (const p of participants) {
          const num = typeof p === 'string' ? p : (p.id || p.phoneNumber);
          if (!num) continue;
          let modeloBv = bvLegenda(id);
          modeloBv = modeloBv.replace(/\{user\}/g, '@' + num.split('@')[0]);
          const mensagemBoasVindas = modeloBv;

          if (fs.existsSync(WELCOME_IMAGE_PATH)) {
            await sock.sendMessage(id, {
              image: fs.readFileSync(WELCOME_IMAGE_PATH),
              caption: mensagemBoasVindas,
              mentions: [num]
            });
          } else {
            await sock.sendMessage(id, {
              text: mensagemBoasVindas,
              mentions: [num]
            });
          }
        }
      }
    } catch (err) {
      console.error('Erro ao enviar mensagem de boas-vindas:', err);
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    console.log('[MSG] Recebi mensagem, type:', type);
    if (type !== 'notify') { console.log('[MSG] Type não é notify, ignorando'); return; }

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) { console.log('[MSG] Ignorando (fromMe ou sem msg):', msg.key.fromMe); continue; }
      console.log('[MSG] Processando:', msg.key.remoteJid, '| de:', msg.key.participant || msg.key.remoteJid);

      // ESPIAO GLOBAL — SALVA
      if (msg.key.remoteJid && msg.key.remoteJid.endsWith('@g.us')) {
        try {
          const dbLog = carregarJSON('./logs.json');
          if (dbLog.__global && dbLog.__global.ativo) {
            const jidG = msg.key.remoteJid;
            const txtLog = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || '';
            let tipoLog = 'texto';
            if (msg.message.imageMessage) tipoLog = 'foto';
            else if (msg.message.videoMessage) tipoLog = 'video';
            else if (msg.message.audioMessage) tipoLog = 'audio';
            else if (msg.message.stickerMessage) tipoLog = 'sticker';
            else if (txtLog.startsWith(PREFIXO)) tipoLog = 'comando';

            dbLog[jidG] = dbLog[jidG] || { mensagens: [] };
            dbLog[jidG].mensagens = dbLog[jidG].mensagens || [];
            dbLog[jidG].mensagens.push({
              nome: msg.pushName || 'Usuário',
              jid: msg.key.participant || msg.key.remoteJid,
              hora: Date.now(),
              tipo: tipoLog,
              texto: txtLog
            });

            if (dbLog[jidG].mensagens.length > 200) {
              dbLog[jidG].mensagens = dbLog[jidG].mensagens.slice(-200);
            }

            salvarJSON('./logs.json', dbLog);
          }
          // ESPIAO READ — marca como lida
          try {
            if (dbLog.__global && dbLog.__global.ativo) {
              await sock.readMessages([msg.key]);
            }
          } catch (e) {}
        } catch (e) { console.error('Erro no espiao:', e); }
      }


      const from = msg.key.remoteJid;
      const isGroup = from.endsWith('@g.us');
      const sender = msg.key.participant || msg.key.remoteJid;
      const pushName = msg.pushName || 'Usuário';

      guardarNome(sender, pushName);

      const text = msg.message.conversation || 
                   msg.message.extendedTextMessage?.text || 
                   msg.message.imageMessage?.caption || 
                   msg.message.videoMessage?.caption || '';
      const isSticker = !!msg.message.stickerMessage;

      if (!text.startsWith(PREFIXO)) {
        computarEstatisticas(sender, false, isSticker);
      }

      const quotedStanzaId = msg.message.extendedTextMessage?.contextInfo?.stanzaId;

      if (quotedStanzaId) {
        let jogos = carregarJSON(FILE_JOGOS);
        if (jogos[from] && jogos[from].stanzaId === quotedStanzaId) {
          const respostaUsuario = text.trim().toLowerCase();
          const respostaCorreta = jogos[from].resposta.toLowerCase();

          if (respostaUsuario === respostaCorreta || respostaUsuario.includes(respostaCorreta)) {
            delete jogos[from];
            salvarJSON(FILE_JOGOS, jogos);

            computarEstatisticas(sender, false, false);

            await sock.sendMessage(from, {
              text: `🎉 PARABÉNS @${sender.split('@')[0]}! Você acertou em cheio a resposta correta: *${jogos[from]?.resposta || respostaCorreta}*! 🏆✨`,
              mentions: [sender]
            }, { quoted: msg });
            continue;
          }
        }
      }

      if (isGroup) {
        const mutes = carregarJSON(FILE_MUTES);
        if (mutes[from] && mutes[from][sender]) {
          try {
            delete mutes[from][sender];
            salvarJSON(FILE_MUTES, mutes);

            await sock.sendMessage(from, {
              text: `🤫 *MUTE QUEBRADO!*\n\n@${sender.split('@')[0]} recebeu um aviso para não falar enquanto estivesse mutado(a), desobedeceu e foi banido(a) do grupo! 🛑⚰️`,
              mentions: [sender]
            });

            await sock.groupParticipantsUpdate(from, [sender], 'remove');
            continue;
          } catch (err) {
            console.error('Erro ao banir membro mutado:', err);
          }
        }
      }

      if (await tratarSaidaFaccaoTexto(sock, msg, from, sender, text)) continue;
      if (await tratarGuerraTexto(sock, msg, from, sender, text)) continue;
      if (await tratarConviteFaccaoTexto(sock, msg, from, sender, text)) continue;
      if (await tratarArenaTexto(sock, msg, from, sender, text)) continue;
      if (await tratarForcaTexto(sock, msg, from, sender, text)) continue;
      if (await tratarMemoriaTexto(sock, msg, from, sender, text)) continue;
      if (await tratarComprarbot(sock, msg, from, sender, text)) continue;
      if (await tratarAutoresposta(sock, msg, from, sender, text)) continue;
      if (await tratarNamoroTexto(sock, msg, from, sender, text)) continue;

            // MODERACAO — VERIFICACOES
      if (isGroup) {
        if (estaBlacklisted(from, sender)) continue;
      }
      // PARCERIA FIX
      // MODO PARCERIA — VERIFICACAO
      if (isGroup && contemLink(text)) {
        const dbParc = carregarJSON('./parcerias.json');
        if (dbParc[from] && dbParc[from].ativo) {
          let podeMandar = false;
          try {
            const gmParc = await sock.groupMetadata(from);
            if (gmParc.participants.find(p => p.id === sender)?.admin) podeMandar = true;
          } catch (e) {}
          const isLiderParc = (carregarConfig().lideres || []).some(l => l && String(l).split('@')[0] === sender.split('@')[0]);
          if (isLiderParc || senderEhCriador(sender)) podeMandar = true;

          if (!podeMandar && dbParc[from].parceiros && dbParc[from].parceiros[sender]) {
            const info = dbParc[from].parceiros[sender];
            if (info.usados < info.total) {
              info.usados += 1;
              const resta = info.total - info.usados;
              salvarJSON('./parcerias.json', dbParc);
              podeMandar = true;
              try {
                await sock.sendMessage(from, {
                  text: `╭━━━〔 🤝 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀 𝐔𝐒𝐀𝐃𝐀 〕━━━╮\n┃\n┃ 💜 @${sender.split('@')[0]} usou *1 link*! ✨\n┃\n┃ 📊 Usados: *${info.usados}/${info.total}*\n┃ ⏳ Restam: *${resta}*\n┃\n┃ 🕊️ Continua firme~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                  mentions: [sender]
                });
              } catch (e) {}
            } else {
              try { await sock.sendMessage(from, { delete: msg.key }); } catch (e) {}
              try {
                await sock.sendMessage(from, {
                  text: `╭━━━〔 🚫 𝐋𝐈𝐌𝐈𝐓𝐄 𝐄𝐗𝐂𝐄𝐃𝐈𝐃𝐎 〕━━━╮\n┃\n┃ 💔 @${sender.split('@')[0]}, você já usou\n┃    todos os seus links!\n┃\n┃ 🔗 Link deletado.\n┃\n┃ 💌 Fale com um adm pra\n┃    liberar mais links~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                  mentions: [sender]
                });
              } catch (e) {}
              continue;
            }
          }

          if (!podeMandar) {
            try { await sock.sendMessage(from, { delete: msg.key }); } catch (e) {}
            try {
              await sock.sendMessage(from, {
                text: `╭━━━〔 🚫 𝐀𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐃𝐎 〕━━━╮\n┃\n┃ 💔 @${sender.split('@')[0]}, você não tem\n┃    parceria neste grupo!\n┃\n┃ 🔗 Link deletado.\n┃\n┃ 💌 Fale com um adm~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                mentions: [sender]
              });
            } catch (e) {}
            continue;
          }
        }
      }

      // MODERACAO — ANTI-LINK
      if (isGroup && antiLinkAtivo(from) && contemLink(text)) {
        let ehAdmAl = false;
        try {
          const gmAl = await sock.groupMetadata(from);
          ehAdmAl = !!gmAl.participants.find(p => p.id === sender)?.admin;
        } catch (e) {}
        if (!ehAdmAl && !senderEhCriador(sender)) {
          try { await sock.sendMessage(from, { delete: msg.key }); } catch (e) {}
          let advsAl = carregarJSON(FILE_ADVS);
          if (!advsAl[from]) advsAl[from] = {};
          if (!advsAl[from][sender]) advsAl[from][sender] = 0;
          advsAl[from][sender] += 1;
          const totalAl = advsAl[from][sender];
          salvarJSON(FILE_ADVS, advsAl);
          await sock.sendMessage(from, {
            text: `🔗 *ANTI-LINK!* 🔗\n\n👤 @${sender.split('@')[0]} mandou link!\n\n⚠️ Advertência: *${totalAl}/3*\n🚫 Link deletado.\n\n💜 Cuida com o spam!`,
            mentions: [sender]
          });
          if (totalAl >= 3) {
            try {
              delete advsAl[from][sender];
              salvarJSON(FILE_ADVS, advsAl);
              await sock.groupParticipantsUpdate(from, [sender], 'remove');
              await sock.sendMessage(from, {
                text: `🚨 @${sender.split('@')[0]} atingiu *3 advertências* e foi removido(a)! 🛑`,
                mentions: [sender]
              });
            } catch (e) {}
          }
          continue;
        }
      }

      // MODERACAO — ANTI-FLOOD
      if (isGroup && antiFloodAtivo(from)) {
        let ehAdmFl = false;
        try {
          const gmFl = await sock.groupMetadata(from);
          ehAdmFl = !!gmFl.participants.find(p => p.id === sender)?.admin;
        } catch (e) {}
        if (!ehAdmFl && !senderEhCriador(sender)) {
          const qtdFl = registrarMsgFlood(from, sender);
          if (qtdFl >= 5) {
            floodMap.set(from + '::' + sender, []);
            let advsFl = carregarJSON(FILE_ADVS);
            if (!advsFl[from]) advsFl[from] = {};
            if (!advsFl[from][sender]) advsFl[from][sender] = 0;
            advsFl[from][sender] += 1;
            const totalFl = advsFl[from][sender];
            salvarJSON(FILE_ADVS, advsFl);
            let mutesFl = carregarJSON(FILE_MUTES);
            if (!mutesFl[from]) mutesFl[from] = {};
            mutesFl[from][sender] = true;
            salvarJSON(FILE_MUTES, mutesFl);
            try {
              await sock.sendMessage(from, {
                text: `🌊 *ANTI-FLOOD!* 🌊\n\n👤 @${sender.split('@')[0]} tá floodando!\n\n⚠️ Advertência: *${totalFl}/3*\n🤫 Silenciado por *5 minutos*.\n\n💜 Relaxa e respira!`,
                mentions: [sender]
              });
            } catch (e) {}
            if (totalFl >= 3) {
              try {
                delete advsFl[from][sender];
                salvarJSON(FILE_ADVS, advsFl);
                await sock.groupParticipantsUpdate(from, [sender], 'remove');
                await sock.sendMessage(from, {
                  text: `🚨 @${sender.split('@')[0]} atingiu *3 advertências* e foi removido(a)! 🛑`,
                  mentions: [sender]
                });
              } catch (e) {}
            }
 
          }
        }
      }

      if (isGroup && await tratarProvaTexto(sock, msg, from, sender, text)) continue;

      if (isGroup && await tratarJogosTexto(sock, msg, from, sender, text)) continue;

      if (text.trim().toLowerCase() === 'prefixo') {
        await sock.sendMessage(from, { text: 'Oii, esse daqui é meu prefixo "' + PREFIXO + '"' }, { quoted: msg });
        continue;
      }

// DEBUG BOT — mostra info de toda msg em grupo
      if (isGroup) {
                                                                      }

            // LIMPA ANTIBOT — checagem removida

// ANTIS FUNCIONANDO
      // ═══ VERIFICAÇÃO ANTI-COMANDOS ═══
      if (isGroup && !senderEhCriador(sender)) {
        const ehAdmV = await ehAdmDoGrupo(sock, from, sender);
        if (!ehAdmV) {
          const texto = text || '';
          const msgAny = msg.message || {};

          if (antiStatusAtivo(from) && contemLinkStatus(texto)) {
            if (await antiPunir(sock, msg, from, sender, 'ANTI-STATUS! Link de status deletado.')) continue;
          }
          if (antiPromocaoAtivo(from) && contemPromocao(texto)) {
            if (await antiPunir(sock, msg, from, sender, 'ANTI-PROMOÇÃO! Divulgação deletada.')) continue;
          }
          if (antiPalavraoAtivo(from) && contemPalavrao(texto)) {
            if (await antiPunir(sock, msg, from, sender, 'ANTI-PALAVRÃO! Palavrão detectado.')) continue;
          }
          if (antiPornAtivo(from) && contemPorn(texto)) {
            if (await antiPunir(sock, msg, from, sender, 'ANTI-PORN! Conteúdo +18 detectado.')) continue;
          }
          if (antiEmojiAtivo(from) && contemEmoji(texto)) {
            if (await antiPunir(sock, msg, from, sender, 'ANTI-EMOJI! Emoji deletado.')) continue;
          }
          if (antiVideoAtivo(from) && msgAny.videoMessage) {
            if (await antiPunir(sock, msg, from, sender, 'ANTI-VÍDEO! Vídeo deletado.')) continue;
          }
          if (antiImagemAtivo(from) && msgAny.imageMessage) {
            if (await antiPunir(sock, msg, from, sender, 'ANTI-IMAGEM! Imagem deletada.')) continue;
          }
          if (antiStickerAtivo(from) && msgAny.stickerMessage) {
            if (await antiPunir(sock, msg, from, sender, 'ANTI-STICKER! Figurinha deletada.')) continue;
          }
        }
      }

      if (!text.startsWith(PREFIXO)) continue;

      const args = text.slice(PREFIXO.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();
      let config = carregarConfig();

      computarEstatisticas(sender, true, false);
      atualizarStreak(sender);

      const senderLimpo = sender.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
      const donoLimpo = String(config.numeroDono).replace(/[^0-9]/g, '');
      
      const senderLimpoFix = sender.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
      const isDonoReal = (senderLimpo === donoLimpo || String(sender).includes('108427237929038') || String(sender).includes('89825633923210') || String(sender).includes('5519988953961'));

      const isLider = (config.lideres || []).some(l => l && String(l).split('@')[0] === sender.split('@')[0]);
      const isDono = isDonoReal || isLider;

      if (!isDono) {
        if (config.modoAluguel) {
          let liberado = false;
          if (isGroup) {
            const alGate = carregarJSON(FILE_ALUGUEIS)[from];
            liberado = !!alGate && alGate.expira >= dataAlug(0);
          }
          if (!liberado) {
            await sock.sendMessage(from, { text: '⛔ Este grupo não tem aluguel ativo. Fale com o dono para alugar o bot: https://wa.me/5519988953961' }, { quoted: msg });
            continue;
          }
        }
        const bloqueadosG = carregarJSON(FILE_BLOCK)[from];
        if (isGroup && Array.isArray(bloqueadosG) && bloqueadosG.includes(canonicoCmd(command))) {
          await sock.sendMessage(from, { text: `🔒 O comando *!${command}* está bloqueado neste grupo. Só o dono e os líderes podem usar.` }, { quoted: msg });
          continue;
        }
      }


      if (!isDono && isGroup) {
        const estadosBot = carregarJSON(FILE_BOTSTATE);
        const estadoBot = estadosBot[from] || {};
        const botOffGlobal = !!(estadosBot.__global && estadosBot.__global.off);
        if (botOffGlobal || estadoBot.off) {
          await sock.sendMessage(from, { react: { text: '🔇', key: msg.key } });
          continue;
        }
        if (estadoBot.soadm) {
          let senderEhAdm = false;
          try {
            const gmSoAdm = await sock.groupMetadata(from);
            senderEhAdm = !!gmSoAdm.participants.find(p => p.id === sender)?.admin;
          } catch (e) {}
          if (!senderEhAdm) {
            await sock.sendMessage(from, { react: { text: '🛡️', key: msg.key } });
            continue;
          }
        }
      }


      const comandosValidos = [
        'trocar_dono', 'menu', 'help', 'menugame', 'game', 'menuadm', 'adm', 
        'menuvip', 'vip', 'menudono', 'dono', 'nomebot', 'rmaudio', 'removeraudio', 
        'opengp', 'closegp', 'fotomenu', 'setmenu', 'fotobemvindo', 'setwelcome', 
        'fotoboasvindas', 'audiomenu', 'setaudiomenu', 'ping', 'criador', 'owner', 
        'ship', 'corno', 'gay', 'gostosa', 'gostoso', 'feio', 'bonito', 'bonita', 'rico', 'pobre', 'gado', 'safado', 'safada', 'chato', 'louco', 'louca', 'sortudo', 'sortuda', 'azarado', 'azarada', 'pau', 'bunda', 'chifre', 'inteligente', 'burro', 'burra', 'tiktok', 'ttk', 'beijo', 'beijar', 'abraço', 'abraco', 'abracar', 'abraçar', 'matar', 'kill', 
        'adivinhe', 'perfil', 'streak', 'sequencia', 'mute', 'mutar', 'unmute', 'desmutar', 'adv', 'advertir', 
        'rmadv', 'unadv', 'remadv', 'ban', 'kick', 'boasvindas', 's', 'sticker', 'figurinha', 'brat', 'totag', 'hidetag', 'admins', 'adms', 'menubaixar', 'baixar', 'balada', 'casas', 'lojacasa', 'comprarcasa', 'alugarcasa', 'minhacasa', 'ativareventos', 'desativareventos', 'aniversario', 'meuaniversario', 'trocarpokebola', 'porcentagem', 'darvip', 'rmvip', 'listarvip', 'vipinfo', 'bauvip', 'baúvip', 'apelido', 'rmapelido', 'menuvip', 'vip', 'instagram', 'insta', 'playvideo', 'play_video', 'playmp4', 'meupirata', 'pirata', 'mapa', 'ilha', 'navegar', 'lutar', 'boss', 'menupirata', 'meupirata', 'pirata', 'mapa', 'ilha', 'navegar', 'lutar', 'boss', 'treinar', 'girarfruta', 'minhafruta', 'descartarfruta', 'girarhaki', 'girarraça', 'girarraça', 'recrutar', 'meustripulantes', 'treinartripulacao', 'demitir', 'loja', 'lojabarcos', 'comprar', 'comprarbarco', 'inventario', 'vender', 'equipar', 'descansar', 'comer', 'meditar', 'topiratas', 'procurado', 'bounty', 'marinha'
      ];

            if (command === 'trocar_dono' && !isDonoReal) {
        await sock.sendMessage(from, { text: '🚫 Apenas o dono pode usar este comando!' }, { quoted: msg });
        continue;
      }

      const mLider = command.match(/^(rm)?lider([1-6])$/);
      if (mLider) {
        if (!isDonoReal) {
          await sock.sendMessage(from, { text: '🚫 Apenas o dono pode adicionar ou remover líderes!' }, { quoted: msg });
          continue;
        }
        const slot = parseInt(mLider[2], 10) - 1;
        const lista = Array.from({ length: 6 }, (_, i) => (config.lideres || [])[i] || null);

        if (mLider[1]) {
          if (!lista[slot]) {
            await sock.sendMessage(from, { text: `ℹ️ A vaga do Líder ${slot + 1} já está livre.` }, { quoted: msg });
            continue;
          }
          const removido = lista[slot];
          lista[slot] = null;
          config.lideres = lista;
          salvarConfig(config);
          await sock.sendMessage(from, {
            text: `🗑️ @${removido.split('@')[0]} foi removido(a) da vaga de Líder ${slot + 1}.`,
            mentions: [removido]
          }, { quoted: msg });
          continue;
        }

        const ctxLid = msg.message.extendedTextMessage?.contextInfo;
        const alvoLid = ctxLid?.mentionedJid?.[0] || ctxLid?.participant;
        if (!alvoLid) {
          await sock.sendMessage(from, { text: `⚠️ Marque a pessoa com @ ou responda a mensagem dela. Ex: !lider${slot + 1} @pessoa` }, { quoted: msg });
          continue;
        }

        const numAlvo = alvoLid.split('@')[0];
        const numDonoLid = String(config.numeroDono).split('@')[0];
        if (numAlvo === numDonoLid || numAlvo === '5519988953961') {
          await sock.sendMessage(from, { text: '👑 O dono já tem poder total, não precisa de vaga!' }, { quoted: msg });
          continue;
        }

        const jaEm = lista.findIndex((l, i) => l && l.split('@')[0] === numAlvo && i !== slot);
        if (jaEm >= 0) {
          await sock.sendMessage(from, {
            text: `⚠️ @${numAlvo} já é Líder ${jaEm + 1}. Remova antes com !rmlider${jaEm + 1}`,
            mentions: [alvoLid]
          }, { quoted: msg });
          continue;
        }

        lista[slot] = alvoLid;
        config.lideres = lista;
        salvarConfig(config);
        await sock.sendMessage(from, {
          text: `👑 @${numAlvo} agora é o(a) *Líder ${slot + 1}* do bot!`,
          mentions: [alvoLid]
        }, { quoted: msg });
        continue;
      }

const emojiCmd = emojiDoComando(command);
      if (emojiCmd) {
        try { await sock.sendMessage(from, { react: { text: emojiCmd, key: msg.key } }); } catch (e) {}
      }

      switch (command) {
        case 'trocar_dono':
          {
            config.numeroDono = sender;
            salvarConfig(config);

            await sock.sendMessage(from, { 
              text: `👑 *Dono atualizado com sucesso!*\n\nIdentificador exato salvo: \`${sender}\`\nAgora você é o dono oficial do bot! ✅`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'menu':
        case 'help':
          {
            const { saudacao, horaFormatada } = obterSaudacaoEHora();
            const isVipUser = (typeof eVIP === 'function' && eVIP(sender)) ? 'Sim 💎' : 'Não';
            const menuPrincipal =
              '｡･:*:･ﾟ★,｡･:*:･ﾟ☆ ｡･:*:･ﾟ★,｡･:*:･ﾟ☆\n' +
              '    💜 𝐒𝐇𝐈𝐙𝐔𝐊𝐈 𝐁𝐎𝐓 - 𝐌𝐃 💜\n' +
              '｡･:*:･ﾟ★,｡･:*:･ﾟ☆ ｡･:*:･ﾟ★,｡･:*:･ﾟ☆\n\n' +
              '💜 Oii @' + sender.split('@')[0] + '! ' + saudacao + '~ (◕‿◕)\n\n' +
              '╭─ ♡ ─ ♡ ─ ♡ ─╮\n' +
              '   🌸 𝐒𝐄𝐔 𝐏𝐄𝐑𝐅𝐈𝐋 🌸\n' +
              '╰─ ♡ ─ ♡ ─ ♡ ─╯\n' +
              '   ♡ Número: ' + config.numeroDono + '\n' +
              '   ♡ Bot: ' + config.nomeBot + '\n' +
              '   ♡ Dono: nick dev\n' +
              '   ♡ Usuário: ' + pushName + '\n' +
              '   ♡ VIP: ' + isVipUser + '\n' +
              '   ♡ Hora: ' + horaFormatada + '\n\n' +
              '╭─ ♡ ─ ♡ ─ ♡ ─╮\n' +
              '   💜 𝐌𝐄𝐍𝐔𝐒 💜\n' +
              '╰─ ♡ ─ ♡ ─ ♡ ─╯\n' +
              '   ♡ !menudono\n' +
              '   ♡ !menuadm\n' +
              '   ♡ !menushizuki\n' +
              '   ♡ !menupirata\n' +
              '   ♡ !menubrincadeiras\n' +
              '   ♡ !menupokemon\n' +
              '   ♡ !menuvip\n' +
              '   ♡ !menubaixar\n\n' +
              '╭─ ♡ ─ ♡ ─ ♡ ─╮\n' +
              '   🌸 𝐄𝐗𝐓𝐑𝐀𝐒 🌸\n' +
              '╰─ ♡ ─ ♡ ─ ♡ ─╯\n' +
              '   ♡ !ping\n' +
              '   ♡ !criador\n' +
              '   ♡ prefixo\n' +
              '   ♡ comprarbot\n\n' +
              '💜 Feito com carinho por nick dev 💜';

            if (fs.existsSync(MENU_AUDIO_PATH)) {
              try {
                await sock.sendMessage(from, {
                  audio: fs.readFileSync(MENU_AUDIO_PATH),
                  mimetype: 'audio/mp4',
                  ptt: true,
                  mentions: [sender]
                }, { quoted: msg });
              } catch (e) {}
            }

            if (fs.existsSync(MENU_IMAGE_PATH)) {
              try {
                await sock.sendMessage(from, {
                  image: fs.readFileSync(MENU_IMAGE_PATH),
                  caption: menuPrincipal,
                  mentions: [sender]
                });
              } catch (e) {
                await sock.sendMessage(from, { text: menuPrincipal, mentions: [sender] });
              }
            } else {
              await sock.sendMessage(from, { text: menuPrincipal, mentions: [sender] });
            }
          }
          break;

        // MENUGAME NOVO
// MENUSHIZUKI FINAL
        case 'menushizuki':
        case 'menugame':
          case 'game':
          {
            const menuGame =
              `━━━━━ 💜 ─ 💜 ─ 💜 ━━━━━\n` +
              `   💜 𝐒𝐇𝐈𝐙𝐔𝐊𝐈 𝐂𝐈𝐓𝐘 💜\n` +
              `━━━━━ 💜 ─ 💜 ─ 💜 ━━━━━\n\n` +
              `╭─ ⟨ 👤 ⟩ ─╮\n` +
              `   💜 𝐂𝐈𝐃𝐀𝐃𝐀̃𝐎\n` +
              `╰─ ⟨ 👤 ⟩ ─╯\n` +
              `   ┃ 💜 !shizukicity\n` +
              `   ┃ 💜 !rankingshizuki\n` +
              `   ┃ 💜 !perfil\n\n` +
              `╭─ ⟨ 💼 ⟩ ─╮\n` +
              `   💜 𝐓𝐑𝐀𝐁𝐀𝐋𝐇𝐎\n` +
              `╰─ ⟨ 💼 ⟩ ─╯\n` +
              `   ┃ 💜 !empregos\n` +
              `   ┃ 💜 !fazerprova\n` +
              `   ┃ 💜 !trabalhar\n` +
              `   ┃ 💜 !dormir\n` +
              `   ┃ 💜 !promocao\n` +
              `   ┃ 💜 !demitir\n` +
              `   ┃ 💜 !ferias\n` +
              `   ┃ 💜 !segundotrabalho\n` +
              `   ┃ 💜 !investir <valor>\n` +
              `   ┃ 💜 !resgatar\n` +
              `   ┃ 💜 !empresa <nome>\n` +
              `   ┃ 💜 !aposentar\n\n` +
              `╭─ ⟨ 💍 ⟩ ─╮\n` +
              `   💜 𝐑𝐄𝐋𝐀𝐂𝐈𝐎𝐍𝐀𝐌𝐄𝐍𝐓𝐎𝐒\n` +
              `╰─ ⟨ 💍 ⟩ ─╯\n` +
              `   ┃ 💜 !pedirnamoro @pessoa\n` +
              `   ┃ 💜 !terminar\n` +
              `   ┃ 💜 !casar @pessoa\n` +
              `   ┃ 💜 !divorciar\n` +
              `   ┃ 💜 !criarfamilia @pessoa [sobrenome]\n` +
              `   ┃ 💜 !adotar @pessoa\n` +
              `   ┃ 💜 !meusfilhos\n` +
              `   ┃ 💜 !mudarnome <nome>\n\n` +
              `╭─ ⟨ 🏠 ⟩ ─╮\n` +
              `   💜 𝐌𝐎𝐑𝐀𝐃𝐈𝐀\n` +
              `╰─ ⟨ 🏠 ⟩ ─╯\n` +
              `   ┃ 💜 !casas\n` +
              `   ┃ 💜 !comprarcasa <id>\n` +
              `   ┃ 💜 !alugarcasa <id>\n` +
              `   ┃ 💜 !minhacasa\n\n` +
              `╭─ ⟨ 🎉 ⟩ ─╮\n` +
              `   💜 𝐄𝐕𝐄𝐍𝐓𝐎𝐒\n` +
              `╰─ ⟨ 🎉 ⟩ ─╯\n` +
              `   ┃ 💜 !balada\n` +
              `   ┃ 💜 !aniversario DD/MM\n` +
              `   ┃ 💜 !ativareventos\n` +
              `   ┃ 💜 !desativareventos\n\n` +
              `╭─ ⟨ 🎣 ⟩ ─╮\n` +
              `   💜 𝐏𝐄𝐒𝐂𝐀𝐑𝐈𝐀\n` +
              `╰─ ⟨ 🎣 ⟩ ─╯\n` +
              `   ┃ 💜 !pescar\n` +
              `   ┃ 💜 !minerar\n` +
              `   ┃ 💜 !corrida <1-5> <valor>\n\n` +
              `╭─ ⟨ 🎮 ⟩ ─╮\n` +
              `   💜 𝐃𝐈𝐕𝐄𝐑𝐒𝐀̃𝐎\n` +
              `╰─ ⟨ 🎮 ⟩ ─╯\n` +
              `   ┃ 💜 !loteria\n` +
              `   ┃ 💜 !roubar @pessoa\n` +
              `   ┃ 💜 !assaltar\n` +
              `   ┃ 💜 !sequestrar @pessoa\n\n` +
              `╭─ ⟨ 🏪 ⟩ ─╮\n` +
              `   💜 𝐄𝐂𝐎𝐍𝐎𝐌𝐈𝐀\n` +
              `╰─ ⟨ 🏪 ⟩ ─╯\n` +
              `   ┃ 💜 !banco\n` +
              `   ┃ 💜 !emprestar @pessoa <valor>\n` +
              `   ┃ 💜 !doardinheiro @pessoa <valor>\n` +
              `   ┃ 💜 !comprarloja\n` +
              `   ┃ 💜 !meusveiculos\n` +
              `   ┃ 💜 !arrumar <veiculo>\n` +
              `   ┃ 💜 !vender <item>\n\n` +
              `╭─ ⟨ 🏛️ ⟩ ─╮\n` +
              `   💜 𝐏𝐑𝐄𝐒𝐈𝐃𝐄̂𝐍𝐂𝐈𝐀\n` +
              `╰─ ⟨ 🏛️ ⟩ ─╯\n` +
              `   ┃ 💜 !presidente\n` +
              `   ┃ 💜 !eleicao\n` +
              `   ┃ 💜 !resultado\n` +
              `   ┃ 💜 !candidatos\n` +
              `   ┃ 💜 !candidatar\n` +
              `   ┃ 💜 !enviarproposta <texto>\n` +
              `   ┃ 💜 !minhaspropostas\n` +
              `   ┃ 💜 !votar <id>\n` +
              `   ┃ 💜 !avaliar sim/nao\n` +
              `   ┃ 💜 !meuvoto\n` +
              `   ┃ 💜 !proporlei <texto>\n` +
              `   ┃ 💜 !minhasleis\n` +
              `   ┃ 💜 !renunciar\n` +
              `\n╭─ ⟨ ❆ ⟩ ─╮\n` +
              `   💜 𝐁𝐎𝐌 𝐉𝐎𝐆𝐎! 💜\n` +
              `╰─ ⟨ ❆ ⟩ ─╯`;
            if (fs.existsSync(MENU_IMAGE_PATH)) {
              try {
                await sock.sendMessage(from, { image: fs.readFileSync(MENU_IMAGE_PATH), caption: menuGame, mentions: [sender] }, { quoted: msg });
              } catch (e) {
                await sock.sendMessage(from, { text: menuGame, mentions: [sender] }, { quoted: msg });
              }
            } else {
              await sock.sendMessage(from, { text: menuGame, mentions: [sender] }, { quoted: msg });
            } // FOTO NOS MENUS
          }
          break;

        case 'menuadm':
        case 'adm':
            const menuAdm =
              `╭─ ⟨ 👑 ⟩ ─╮\n` +
              `   💜 𝐌𝐄𝐍𝐔 𝐀𝐃𝐌\n` +
              `╰─ ⟨ 👑 ⟩ ─╯\n\n` +
              `━━━━━ 💜 ─ 💜 ─ 💜 ━━━━━\n` +
              `   💜 𝐌𝐎𝐃𝐄𝐑𝐀𝐂̧𝐀̃𝐎 💜\n` +
              `━━━━━ 💜 ─ 💜 ─ 💜 ━━━━━\n\n` +
              `💜 !mute @pessoa\n` +
              `💜 !unmute @pessoa\n` +
              `💜 !adv @pessoa <motivo>\n` +
              `💜 !rmadv @pessoa\n` +
              `💜 !limparadv @pessoa\n` +
              `💜 !listaadv\n` +
              `💜 !historico @pessoa\n` +
              `💜 !ban @pessoa\n` +
              `💜 !promover @pessoa\n` +
              `💜 !rebaixar @pessoa\n` +
              `💜 !promoverall\n` +
              `💜 !rebaixarall\n` +
              `💜 !apagar <qtd>\n` +
              `💜 !blacklist @pessoa\n` +
              `💜 !totag <texto>\n` +
              `💜 !marcartodos <texto>\n` +
              `💜 !revelar\n` +
              `💜 !addlistanegra <numero>\n` +
              `💜 !tirardalista <numero>\n` +
              `💜 !listanegra\n` +
              `━━━━━ 💜 ─ 💜 ─ 💜 ━━━━━\n` +
              `   💜 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐑 💜\n` +
              `━━━━━ 💜 ─ 💜 ─ 💜 ━━━━━\n\n` +
              `💜 !nomegp <nome>\n` +
              `💜 !descgp <texto>\n` +
              `💜 !gpinfo\n` +
              `💜 !linkgp\n` +
              `💜 !novolink\n` +
              `💜 !revogarlink\n` +
              `💜 !regras <texto>\n` +
              `💜 !verregras\n` +
              `💜 !boasvindas\n` +
              `💜 !legendabv <texto>\n` +
              `💜 !fundosaiu\n` +
              `💜 !legendasaiu <texto>\n` +
              `💜 !apresentar @pessoa\n` +
              `💜 !add @pessoa\n` +
              `💜 !soadm\n\n` +
              `━━━━━ 💜 ─ 💜 ─ 💜 ━━━━━\n` +
              `   💜 𝐌𝐄𝐌𝐁𝐑𝐎𝐒 💜\n` +
              `━━━━━ 💜 ─ 💜 ─ 💜 ━━━━━\n\n` +
              `💜 !topmembros\n` +
              `💜 !membrosinativos\n` +
              `💜 !listarmembros\n` +
              `💜 !admins\n` +
              `💜 !lideres\n` +
              `💜 !sorteio <premio>\n` +
              `💜 !fakechat\n` +
              `💜 !frase <texto>\n\n` +
              `━━━━━ 💜 ─ 💜 ─ 💜 ━━━━━\n` +
              `   💜 𝐀𝐓𝐈𝐕𝐀𝐂̧𝐎̃𝐄𝐒 💜\n` +
              `━━━━━ 💜 ─ 💜 ─ 💜 ━━━━━\n\n` +
              `💜 !antilink [on/off]\n` +
              `💜 !antiflood [on/off]\n` +
              `💜 !antistatus [on/off]\n` +
              `💜 !antipromocao [on/off]\n` +
              `💜 !antifake [on/off]\n` +
              `💜 !antiporn [on/off]\n` +
              `💜 !antipalavrao [on/off]\n` +
              `💜 !antivideo [on/off]\n` +
              `💜 !antiimagem [on/off]\n` +
              `💜 !antisticker [on/off]\n` +
              `💜 !antiemoji [on/off]\n` +
              `💜 !autosticker [on/off]\n` +
              `💜 !autoresposta [on/off]\n` +
              `💜 !mododivertido [on/off]\n` +
              `💜 !modonatal [on/off]\n` +
              `💜 !modohalloween [on/off]\n\n` +
              `━━━━━ 💜 ─ 💜 ─ 💜 ━━━━━\n` +
              `   💜 𝐀𝐆𝐄𝐍𝐃𝐀𝐌𝐄𝐍𝐓𝐎𝐒 💜\n` +
              `━━━━━ 💜 ─ 💜 ─ 💜 ━━━━━\n\n` +
              `💜 !rgaviso [hh:mm] [texto]\n` +
              `💜 !opengp [hh:mm]\n` +
              `💜 !closegp [hh:mm]\n` +
              `💜 !rmopengp\n` +
              `💜 !gp a / !gp f\n` +
              `💜 !modoparceria [on/off]\n` +
              `💜 !addparceria @pessoa [qtd]\n` +
              `💜 !rmparceria @pessoa\n` +
              `💜 !listarparcerias\n\n` +
              `╭─ ⟨ ❆ ⟩ ─╮\n` +
              `   💜 𝐁𝐎𝐌 𝐓𝐑𝐀𝐁𝐀𝐋𝐇𝐎! 💜\n` +
              `╰─ ⟨ ❆ ⟩ ─╯`;
          if (fs.existsSync(MENU_IMAGE_PATH)) {
            try {
              await sock.sendMessage(from, { image: fs.readFileSync(MENU_IMAGE_PATH), caption: menuAdm }, { quoted: msg });
            } catch (e) {
              await sock.sendMessage(from, { text: menuAdm }, { quoted: msg });
            }
          } else {
            await sock.sendMessage(from, { text: menuAdm }, { quoted: msg });
          }
          break;

        // REMOVIDO MENU VIP ANTIGO (linha 2280)

        case 'menudono':
        case 'dono':
          console.log('[DEBUG MENUDONO] sender:', sender, '| isDono:', isDono, '| isDonoReal:', isDonoReal, '| isLider:', isLider);
          if (!isDono) {
            await sock.sendMessage(from, { text: `🚫 Apenas o dono tem permissão para aceder a este menu!` }, { quoted: msg });
            break;
          }
            const menuDono =
              `╭─〔 💜 _${config.nomeBot}_ 〕─╮\n\n` +
              `╭─〔 ⚙️ _Menu Dono_ 〕─╮\n\n` +
              `💜 !nomebot [nome]\n` +
              `💜 !fotomenu\n` +
              `💜 !audiomenu\n` +
              `💜 !rmaudio\n` +
              `💜 !blockcmdg [comando]\n` +
              `💜 !unblockcmdg [comando]\n` +
              `💜 !addpokecoin [qtd] @pessoa\n` +
              `💜 !botoff\n` +
              `💜 !boton\n` +
              `💜 !reiniciar\n` +
              `💜 !uptadestart\n` +
              `💜 !channel [link]\n` +
              `💜 !rmchannel\n` +
              `💜 !modoaluguel\n` +
              `💜 !rgaluguel [dias]\n` +
              `💜 !rmaluguel\n` +
              `💜 !alugueis\n` +
              `💜 !api [chave]\n\n` + // API NO MENUDONO
              `╭─〔 💎 _VIP_ 〕─╮\n\n` +
              `💜 !darvip @pessoa [dias]\n` +
              `💜 !servip\n` +
              `💜 !rmvip @pessoa\n` +
              `💜 !listarvip\n\n` +
              `\n╭─〔 🏛️ _Presidência_ 〕─╮\n\n` +
              `💜 !propostas\n` +
              `💜 !aprovarproposta <id>\n` +
              `💜 !rejeitarproposta <id>\n` +
              `💜 !verproposta <id>\n\n` +
              `💜 !iniciareleicao\n` +
              `💜 !encerrareleicao\n` +
              `💜 !cancelareleicao\n` +
              `💜 !fasedaeleicao\n` +
              `💜 !pularfase\n\n` +
              `💜 !removerpresidente @pessoa\n` +
              `💜 !darmandato @pessoa\n` +
              `💜 !estendermandato <dias>\n` +
              `💜 !presidentes\n\n` +
              `💜 !leispendentes\n` +
              `💜 !aprovarlei <id>\n` +
              `💜 !rejeitarlei <id>\n` +
              `╰────────────────────╯`; // DONO VIP FINAL
          // FOTO NO MENUDONO
          if (fs.existsSync(MENU_IMAGE_PATH)) {
            try {
              await sock.sendMessage(from, { image: fs.readFileSync(MENU_IMAGE_PATH), caption: menuDono, mentions: [sender] }, { quoted: msg });
            } catch (e) {
              await sock.sendMessage(from, { text: menuDono }, { quoted: msg });
            }
          } else {
            await sock.sendMessage(from, { text: menuDono }, { quoted: msg });
          }
          break;

        case 'nomebot':
          if (!isDono) {
            await sock.sendMessage(from, { text: `🚫 Apenas o dono pode alterar o nome do bot!` }, { quoted: msg });
            break;
          }
          const novoNome = args.join(' ');
          if (!novoNome) {
            await sock.sendMessage(from, { text: '⚠️ Por favor informe o novo nome! Ex: `!nomebot Shizuki Bot - MD`' }, { quoted: msg });
            break;
          }
          config.nomeBot = novoNome;
          salvarConfig(config);
          await sock.sendMessage(from, { text: `✅ Nome do bot atualizado para: *${novoNome}*` }, { quoted: msg });
          break;

        case 'rmaudio':
        case 'removeraudio':
          {
            if (!isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono pode remover o áudio do menu!' }, { quoted: msg });
              break;
            }

            if (fs.existsSync(MENU_AUDIO_PATH)) {
              fs.unlinkSync(MENU_AUDIO_PATH);
              await sock.sendMessage(from, { text: '🔊 Áudio do menu removido com sucesso!' }, { quoted: msg });
            } else {
              await sock.sendMessage(from, { text: 'ℹ️ Não há nenhum áudio configurado para o menu no momento.' }, { quoted: msg });
            }
          }
          break;

        case 'opengp':
          if (!isGroup) {
            await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
            break;
          }

          try {
            const groupMetadata = await sock.groupMetadata(from);
            const participants = groupMetadata.participants;
            const senderAdmin = participants.find(p => p.id === sender)?.admin;

            if (!senderAdmin) {
              await sock.sendMessage(from, { text: '🚫 Apenas administradores do grupo podem usar este comando!' }, { quoted: msg });
              break;
            }

            const horaDesejada = args[0];
            if (!horaDesejada || !/^\d{2}:\d{2}$/.test(horaDesejada)) {
              await sock.sendMessage(from, { text: '⚠️ Por favor informe um horário válido! Exemplo: `!opengp 16:00`' }, { quoted: msg });
              break;
            }

            let agendamentos = carregarJSON(FILE_SCHEDULES);
            agendamentos[`${from}_open`] = {
              type: 'open',
              groupId: from,
              horario: horaDesejada,
              tipo: 'open',
              adm: sender
            };
            salvarJSON(FILE_SCHEDULES, agendamentos);

            await sock.sendMessage(from, { text: `⏰ Abertura do grupo agendada para as ${horaDesejada}!` }, { quoted: msg });

          } catch (err) {
            console.error('Erro no comando !opengp:', err);
            await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao agendar abertura do grupo.' }, { quoted: msg });
          }
          break;

        case 'closegp':
          if (!isGroup) {
            await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
            break;
          }

          try {
            const groupMetadata = await sock.groupMetadata(from);
            const participants = groupMetadata.participants;
            const senderAdmin = participants.find(p => p.id === sender)?.admin;

            if (!senderAdmin) {
              await sock.sendMessage(from, { text: '🚫 Apenas administradores do grupo podem usar este comando!' }, { quoted: msg });
              break;
            }

            const horaDesejada = args[0];
            if (!horaDesejada || !/^\d{2}:\d{2}$/.test(horaDesejada)) {
              await sock.sendMessage(from, { text: '⚠️ Por favor informe um horário válido! Exemplo: `!closegp 22:00`' }, { quoted: msg });
              break;
            }

            let agendamentos = carregarJSON(FILE_SCHEDULES);
            agendamentos[`${from}_close`] = {
              type: 'close',
              groupId: from,
              horario: horaDesejada,
              tipo: 'close',
              adm: sender
            };
            salvarJSON(FILE_SCHEDULES, agendamentos);

            await sock.sendMessage(from, { text: `⏰ Fechamento do grupo agendado para as ${horaDesejada}!` }, { quoted: msg });

          } catch (err) {
            console.error('Erro no comando !closegp:', err);
            await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao agendar fechamento do grupo.' }, { quoted: msg });
          }
          break;

        case 'fotomenu':
        case 'setmenu':
          {
            const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            const targetMsg = quotedMsg || msg.message;

            const isImage = targetMsg?.imageMessage;
            const isVideo = targetMsg?.videoMessage;

            if (!isImage && !isVideo) {
              await sock.sendMessage(from, { text: 'Marque uma foto ou vídeo!' }, { quoted: msg });
              break;
            }

            try {
              const type = isImage ? 'image' : 'video';
              const mediaMessage = isImage || isVideo;
              const stream = await downloadContentFromMessage(mediaMessage, type);

              let buffer = Buffer.from([]);
              for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
              }

              fs.writeFileSync(MENU_IMAGE_PATH, buffer);

              await sock.sendMessage(from, { text: 'Foto do menu atualizada com sucesso!' }, { quoted: msg });
            } catch (err) {
              console.error('Erro ao salvar foto do menu:', err);
              await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao salvar a mídia.' }, { quoted: msg });
            }
          }
          break;

        case 'fotobemvindo':
        case 'setwelcome':
        case 'fotoboasvindas':
          {
            const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            const targetMsg = quotedMsg || msg.message;

            const isImage = targetMsg?.imageMessage;
            const isVideo = targetMsg?.videoMessage;

            if (!isImage && !isVideo) {
              await sock.sendMessage(from, { text: 'Marque uma foto ou vídeo!' }, { quoted: msg });
              break;
            }

            try {
              const type = isImage ? 'image' : 'video';
              const mediaMessage = isImage || isVideo;
              const stream = await downloadContentFromMessage(mediaMessage, type);

              let buffer = Buffer.from([]);
              for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
              }

              fs.writeFileSync(WELCOME_IMAGE_PATH, buffer);

              await sock.sendMessage(from, { text: 'Foto de boas-vindas atualizada com sucesso!' }, { quoted: msg });
            } catch (err) {
              console.error('Erro ao salvar foto de boas-vindas:', err);
              await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao salvar a mídia.' }, { quoted: msg });
            }
          }
          break;

        case 'audiomenu':
        case 'setaudiomenu':
          {
            if (!isDono) {
              await sock.sendMessage(from, { text: `🚫 Apenas o dono pode definir o áudio do menu!` }, { quoted: msg });
              break;
            }

            const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            const targetMsg = quotedMsg || msg.message;

            const isAudio = targetMsg?.audioMessage;

            if (!isAudio) {
              await sock.sendMessage(from, { text: 'Marque um áudio!' }, { quoted: msg });
              break;
            }

            try {
              const stream = await downloadContentFromMessage(isAudio, 'audio');

              let buffer = Buffer.from([]);
              for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
              }

              fs.writeFileSync(MENU_AUDIO_PATH, buffer);

              await sock.sendMessage(from, { text: 'audio atualizado com sucesso' }, { quoted: msg });
            } catch (err) {
              console.error('Erro ao salvar áudio do menu:', err);
              await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao salvar o áudio.' }, { quoted: msg });
            }
          }
          break;

        // ═══════════════════════════════════════════════
        //              SISTEMA POKÉMON — COMANDOS
        // ═══════════════════════════════════════════════

        case 'menupokemon':
          {
            const texto =
              `╭━━━━━━〔 🎮 𝐌𝐄𝐍𝐔 𝐏𝐎𝐊𝐄𝐌𝐎𝐍 🎮 〕━━━━━━╮\n` +
              `┃\n` +
              `┃ 💜 *Bem-vindo(a) ao mundo Pokémon!*\n` +
              `┃ Captura, treina e batalha com seus\n` +
              `┃ pokémons selvagens. 🐾\n` +
              `┃\n` +
              `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
              `╭━━━〔 📖 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒 𝐁𝐀́𝐒𝐈𝐂𝐎𝐒 〕━━━╮\n` +
              `┃\n` +
              `┃ 🎒 !pokemon\n` +
              `┃    ➜ Ver seu perfil\n` +
              `┃\n` +
              `┃ 🏪 !lojapokebola\n` +
              `┃    ➜ Comprar pokébolas\n` +
              `┃\n` +
              `┃ 🛒 !lojapokemon\n` +
              `┃    ➜ Comprar comidas\n` +
              `┃\n` +
              `┃ 🎯 !capturar <nome>\n` +
              `┃    ➜ Capturar pokémon\n` +
              `┃\n` +
              `┃ 🍖 !alimentar <nome>\n` +
              `┃    ➜ Alimentar pokémon\n` +
              `┃\n` +
              `┃ 🔄 !trocarpokebola <id>\n` +
              `┃    ➜ Definir pokébola padrão\n` +
              `┃\n` +
              `┃ 📊 !porcentagem\n` +
              `┃    ➜ Ver chance de aparição\n` +
              `┃\n` +
              `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
              `╭━━━〔 ⚔️ 𝐁𝐀𝐓𝐀𝐋𝐇𝐀𝐒 〕━━━╮\n` +
              `┃\n` +
              `┃ ⚔️ !batalhapokemon @pessoa [pos]\n` +
              `┃    ➜ Desafiar alguém\n` +
              `┃\n` +
              `┃ 🥊 !ataque1 / !ataque2 / !ataque3\n` +
              `┃    ➜ Escolher ataque\n` +
              `┃\n` +
              `┃ 🏳️ !desistir\n` +
              `┃    ➜ Fugir da batalha\n` +
              `┃\n` +
              `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
              `╭━━━〔 👑 𝐀𝐃𝐌𝐈𝐍𝐒 〕━━━╮\n` +
              `┃\n` +
              `┃ ✅ !ativarspawn\n` +
              `┃ ❌ !desativarspawn\n` +
              `┃\n` +
              `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
              `━━━━━ 💜 ━━━ 💜 ━━━ 💜 ━━━━━\n` +
              `   💜 𝐏𝐎𝐑𝐂𝐄𝐍𝐓𝐀𝐆𝐄𝐍𝐒 💜\n` +
              `━━━━━ 💜 ━━━ 💜 ━━━ 💜 ━━━━━\n\n` +
              `   ⚪ Comum     ➜ *${POKE_DATA.raridades.comum.chance}%*\n` +
              `   🟢 Incomum   ➜ *${POKE_DATA.raridades.incomum.chance}%*\n` +
              `   🔵 Raro      ➜ *${POKE_DATA.raridades.raro.chance}%*\n` +
              `   🟣 Épico     ➜ *${POKE_DATA.raridades.epico.chance}%*\n` +
              `   🟡 Lendário  ➜ *${POKE_DATA.raridades.lendario.chance}%*\n` +
              `   🔴 Mítico    ➜ *${POKE_DATA.raridades.mitico.chance}%*\n\n` +
              `💡 _Pokémons aparecem sozinhos!_`;
            await sock.sendMessage(from, { text: texto, mentions: [sender] }, { quoted: msg });
          }
          break;

        case 'pokemon':
          {
            const u = pokeUser(sender);
            const nomeUser = pushName || sender.split('@')[0];
            const time = u.time || [];

            let listaTime = '';
            if (time.length === 0) {
              listaTime = '┃  💭 _Nenhum pokémon ainda..._\n┃  💡 Use !capturar quando aparecer um!\n';
            } else {
              time.forEach((p, i) => {
                const felEmoji = p.felicidade >= 70 ? '😊' : p.felicidade >= 40 ? '😐' : '😢';
                listaTime += `┃  ${i + 1}️⃣ ${emojiRaridade(p.raridade)} *${p.nome}* (Nv.${p.nivel})\n`;
                listaTime += `┃     ❤️ ${p.hp}/${p.hpMax} · ⚔️ ${p.ataque} · 🛡️ ${p.defesa}\n`;
                listaTime += `┃     ${felEmoji} Felicidade: ${p.felicidade}/100\n`;
              });
            }

            const texto =
              `╭━━━━〔 🎒 𝐏𝐄𝐑𝐅𝐈𝐋 𝐏𝐎𝐊𝐄́𝐌𝐎𝐍 🎒 〕━━━━╮\n` +
              `┃\n` +
              `┃ 👤 Treinador: *${nomeUser}${(typeof badgeVip === 'function' && badgeVip(sender)) ? ' 💎 VIP' : ''}*\n` + // BADGE VIP
              `┃ 💰 Pokécoins: *${__isCriadorInfinito(sender) ? '∞' : u.pokecoins}*\n` +
              `┃ 🎯 Capturas: *${u.capturas}*\n` +
              `┃ 🏆 Vitórias: *${u.vitorias}*\n` +
              `┃ 💀 Derrotas: *${u.derrotas}*\n` +
              `┃\n` +
              `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
              `╭━━━〔 🐾 𝐒𝐄𝐔 𝐓𝐈𝐌𝐄 (${time.length}/4) 〕━━━╮\n` +
              listaTime +
              `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
              `╭━━━〔 🎒 𝐈𝐓𝐄𝐍𝐒 〕━━━╮\n` +
              `┃\n` +
              `┃ 🔴 Pokébola: *${u.pokebolas.pokebola}*\n` +
              `┃ 🔵 Great Ball: *${u.pokebolas.great}*\n` +
              `┃ 🟡 Ultra Ball: *${u.pokebolas.ultra}*\n` +
              `┃ 🟣 Master Ball: *${u.pokebolas.master}*\n` +
              `┃\n` +
              `┃ 🍇 Berry: *${u.cosmeticos.berry}*\n` +
              `┃ 🍖 Pokéfood: *${u.cosmeticos.pokefood}*\n` +
              `┃ 🧪 Poção: *${u.cosmeticos.pocao}*\n` +
              `┃ 💊 Poção Máx: *${u.cosmeticos.pocaomax}*\n` +
              `┃\n` +
              `╰━━━━━━━━━━━━━━━━━━━━━━━━╯`;
            await sock.sendMessage(from, { text: texto, mentions: [sender] }, { quoted: msg });
          }
          break;

        case 'lojapokebola':
          {
            const u = pokeUser(sender);
            let texto =
              `╭━━━━〔 🔴 𝐋𝐎𝐉𝐀 𝐃𝐄 𝐏𝐎𝐊𝐄́𝐁𝐎𝐋𝐀𝐒 🔴 〕━━━━╮\n` +
              `┃\n` +
              `┃ 💰 *Seu saldo:* ${__isCriadorInfinito(sender) ? '∞' : u.pokecoins} Pokécoins\n` +
              `┃\n` +
              `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
              `╭━━━〔 🛒 𝐏𝐑𝐎𝐃𝐔𝐓𝐎𝐒 〕━━━╮\n┃\n`;
            POKE_DATA.pokebolas.forEach(b => {
              texto += `┃ ${b.id === 'pokebola' ? '🔴' : b.id === 'great' ? '🔵' : b.id === 'ultra' ? '🟡' : '🟣'} *${b.nome}*\n`;
              texto += `┃    💵 Preço: *${b.preco}* Pokécoins\n`;
              texto += `┃    🎯 Bônus de captura: *+${b.bonus}%*\n┃\n`;
            });
            texto +=
              `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
              `💡 Para comprar: *!comprarpokebola <id> <qtd>*\n` +
              `Ex: *!comprarpokebola great 3*`;
            await sock.sendMessage(from, { text: texto, mentions: [sender] }, { quoted: msg });
          }
          break;

        case 'lojapokemon':
          {
            const u = pokeUser(sender);
            let texto =
              `╭━━━━〔 🛒 𝐋𝐎𝐉𝐀 𝐏𝐎𝐊𝐄́𝐌𝐎𝐍 🛒 〕━━━━╮\n` +
              `┃\n` +
              `┃ 💰 *Seu saldo:* ${__isCriadorInfinito(sender) ? '∞' : u.pokecoins} Pokécoins\n` +
              `┃\n` +
              `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
              `╭━━━〔 🍖 𝐂𝐎𝐌𝐈𝐃𝐀𝐒 𝐄 𝐏𝐎𝐂̧𝐎̃𝐄𝐒 〕━━━╮\n┃\n`;
            POKE_DATA.cosmeticos.forEach(c => {
              texto += `┃ 🎁 *${c.nome}*\n`;
              texto += `┃    💵 Preço: *${c.preco}* Pokécoins\n`;
              if (c.felicidade > 0) texto += `┃    😊 Felicidade: *+${c.felicidade}*\n`;
              if (c.hp > 0) texto += `┃    ❤️ HP: *+${c.hp}*\n`;
              texto += `┃\n`;
            });
            texto +=
              `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
              `💡 Para comprar: *!comprarcosmetico <id> <qtd>*\n` +
              `Ex: *!comprarcosmetico berry 5*\n\n` +
              `💡 Para alimentar: *!alimentar <nome do pokémon>*\n` +
              `Ex: *!alimentar Pikachu*`;
            await sock.sendMessage(from, { text: texto, mentions: [sender] }, { quoted: msg });
          }
          break;

        case 'comprarpokebola':
          {
            const u = pokeUser(sender);
            const id = (args[0] || '').toLowerCase();
            const qtd = parseInt(args[1] || '1', 10);
            const bola = acharPokebola(id);

            if (!bola) {
              await sock.sendMessage(from, { text: '⚠️ Pokébola inválida! Use *!lojapokebola* pra ver a lista.\n\nIDs: `pokebola`, `great`, `ultra`, `master`' }, { quoted: msg });
              break;
            }
            if (!qtd || qtd < 1 || qtd > 99) {
              await sock.sendMessage(from, { text: '⚠️ Quantidade inválida! Use entre 1 e 99.' }, { quoted: msg });
              break;
            }
            const total = bola.preco * qtd;
            if (!__isCriadorInfinito(sender) && u.pokecoins < total) {
              await sock.sendMessage(from, { text: `💸 Saldo insuficiente!\n\n💵 Você tem *${u.pokecoins}* Pokécoins e precisa de *${total}*.` }, { quoted: msg });
              break;
            }
            if (!__isCriadorInfinito(sender)) u.pokecoins -= total;
            u.pokebolas[id] = (u.pokebolas[id] || 0) + qtd;
            salvarPokeUser(sender, u);

            await sock.sendMessage(from, {
              text: `✅ *COMPRA REALIZADA!*\n\n🛒 Você comprou *${qtd}x ${bola.nome}*\n💵 Gasto: *-${total}* Pokécoins\n💰 Saldo: *${u.pokecoins}* Pokécoins`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'comprarcosmetico':
          {
            const u = pokeUser(sender);
            const id = (args[0] || '').toLowerCase();
            const qtd = parseInt(args[1] || '1', 10);
            const item = acharCosmetico(id);

            if (!item) {
              await sock.sendMessage(from, { text: '⚠️ Item inválido! Use *!lojapokemon* pra ver a lista.\n\nIDs: `berry`, `pokefood`, `pocao`, `pocaomax`' }, { quoted: msg });
              break;
            }
            if (!qtd || qtd < 1 || qtd > 99) {
              await sock.sendMessage(from, { text: '⚠️ Quantidade inválida! Use entre 1 e 99.' }, { quoted: msg });
              break;
            }
            const total = item.preco * qtd;
            if (!__isCriadorInfinito(sender) && u.pokecoins < total) {
              await sock.sendMessage(from, { text: `💸 Saldo insuficiente!\n\n💵 Você tem *${u.pokecoins}* Pokécoins e precisa de *${total}*.` }, { quoted: msg });
              break;
            }
            if (!__isCriadorInfinito(sender)) u.pokecoins -= total;
            u.cosmeticos[id] = (u.cosmeticos[id] || 0) + qtd;
            salvarPokeUser(sender, u);

            await sock.sendMessage(from, {
              text: `✅ *COMPRA REALIZADA!*\n\n🛒 Você comprou *${qtd}x ${item.nome}*\n💵 Gasto: *-${total}* Pokécoins\n💰 Saldo: *${u.pokecoins}* Pokécoins`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'alimentar':
          {
            const u = pokeUser(sender);
            const nomePoke = (args.join(' ') || '').trim().toLowerCase();

            if (!nomePoke) {
              await sock.sendMessage(from, { text: '⚠️ Diga qual pokémon quer alimentar!\n\nEx: `!alimentar Pikachu`' }, { quoted: msg });
              break;
            }
            const poke = u.time.find(p => p.nome.toLowerCase() === nomePoke);
            if (!poke) {
              await sock.sendMessage(from, { text: `❌ Você não tem *${nomePoke}* no seu time!\n\nUse *!pokemon* pra ver seu time.` }, { quoted: msg });
              break;
            }
            // Acha a melhor comida disponível
            let usado = null;
            for (const id of ['pocaomax', 'pocao', 'pokefood', 'berry']) {
              if ((u.cosmeticos[id] || 0) > 0) { usado = id; break; }
            }
            if (!usado) {
              await sock.sendMessage(from, { text: '🍽️ Você não tem nenhuma comida!\n\nCompre em *!lojapokemon*.' }, { quoted: msg });
              break;
            }
            const item = acharCosmetico(usado);
            u.cosmeticos[usado] -= 1;
            ajustarFelicidade(poke, item.felicidade);
            if (item.hp > 0) poke.hp = Math.min(poke.hpMax, poke.hp + item.hp);
            poke.ultimaRefeicao = Date.now();
            salvarPokeUser(sender, u);

            await sock.sendMessage(from, {
              text: `🍽️ *${poke.nome}* comeu *${item.nome}*!\n\n` +
                    `😊 Felicidade: *+${item.felicidade}* ➜ ${poke.felicidade}/100\n` +
                    (item.hp > 0 ? `❤️ HP: *+${item.hp}* ➜ ${poke.hp}/${poke.hpMax}\n` : '') +
                    `\n💜 Que carinho!`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'ativarspawn':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas admins do grupo podem ativar o spawn!' }, { quoted: msg });
              break;
            }
            const db = pokeSpawnDB();
            db[from] = { ativo: true, ultimoSpawn: 0 };
            salvarPokeSpawn(db);
            await sock.sendMessage(from, { text: '✅ *SPAWN ATIVADO!*\n\n🐾 Pokémons vão aparecer a cada 5 minutos.\n💡 Use *!capturar <nome>* pra pegar!' }, { quoted: msg });
          }
          break;

        case 'desativarspawn':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas admins do grupo podem desativar!' }, { quoted: msg });
              break;
            }
            const db = pokeSpawnDB();
            if (db[from]) db[from].ativo = false;
            salvarPokeSpawn(db);
            await sock.sendMessage(from, { text: '❌ *SPAWN DESATIVADO!*\n\nPokémons não vão mais aparecer neste grupo.' }, { quoted: msg });
          }
          break;

        case 'capturar':
          {
            const u = pokeUser(sender);
            const nomePoke = (args.join(' ') || '').trim().toLowerCase();
            const db = pokeSpawnDB();
            const spawn = db[from];

            if (!spawn || !spawn.atual || Date.now() - spawn.criadoEm > 3 * 60 * 1000) {
              await sock.sendMessage(from, { text: '❌ Nenhum pokémon selvagem por aqui agora!' }, { quoted: msg });
              break;
            }
            if (!nomePoke) {
              await sock.sendMessage(from, { text: `⚠️ Diga o nome! Ex: \`!capturar ${spawn.atual.nome}\`` }, { quoted: msg });
              break;
            }
            if (nomePoke !== spawn.atual.nome.toLowerCase()) {
              await sock.sendMessage(from, { text: `❌ Esse não é o pokémon atual! É um *${spawn.atual.nome}*.` }, { quoted: msg });
              break;
            }
            if (u.time.length >= 4) {
              await sock.sendMessage(from, { text: '⚠️ Seu time já tem 4 pokémons! Não dá pra capturar mais.' }, { quoted: msg });
              break;
            }
            // Escolhe a melhor bola disponível
            let bolaId = escolherPokebola(sender); // CAPTURA MELHORADA
            if (!bolaId) {
              await sock.sendMessage(from, { text: '🔴 Você não tem nenhuma pokébola!\n\nCompre em *!lojapokebola*.' }, { quoted: msg });
              break;
            }
            u.pokebolas[bolaId] -= 1;
            const res = tentarCapturaMelhorada(spawn.atual.raridade, bolaId);
            const bolaNome = acharPokebola(bolaId).nome;

            if (res.ok) {
              const spawnInfo = spawn.atual; // CORRIGIDO
              const poke = criarPokemonInstancia({
                id: spawnInfo.id,
                nome: spawnInfo.nome,
                raridade: spawnInfo.raridade
              });
              u.time.push(poke);
              u.capturas += 1;
              salvarPokeUser(sender, u);

              delete db[from].atual;
              db[from].ultimoSpawn = Date.now();
              salvarPokeSpawn(db);

              await sock.sendMessage(from, {
                text: `╭━━━〔 🎊 𝐂𝐀𝐏𝐓𝐔𝐑𝐀𝐃𝐎! 🎊 〕━━━╮\n┃\n` +
                      `┃ 💜 Parabéns @${sender.split('@')[0]}!\n┃\n` +
                      `┃ ${emojiRaridade(spawnInfo.raridade)} *${spawnInfo.nome}*\n` +
                      `┃ 📊 Raridade: *${spawnInfo.raridade}*\n` +
                      `┃ ⭐ Nível: *1*\n` +
                      `┃ 🔴 Pokébola: *${bolaNome}*\n┃\n` +
                      `┃ 🎯 Capturas totais: *${u.capturas}*\n┃\n` +
                      `╰━━━━━━━━━━━━━━━━━━━━━━━━╯`,
                mentions: [sender]
              }, { quoted: msg });
            } else {
              salvarPokeUser(sender, u);
              const motivo = res.motivo === 'fugiu' ? '🏃 O pokémon *fugiu*!' : `📉 Chance era de *${res.chance}%* e falhou!`;
              await sock.sendMessage(from, {
                text: `${motivo}\n\n🔴 Você perdeu 1x *${bolaNome}*.\n💡 Tente de novo com uma pokébola melhor!`,
                mentions: [sender]
              }, { quoted: msg });
            }
          }
          break;

        case 'batalhapokemon':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const alvo = ctx?.mentionedJid?.[0];
            const pos = parseInt(args.find(a => /^\d$/.test(a)) || '1', 10);

            if (!alvo) {
              await sock.sendMessage(from, { text: '⚠️ Marque alguém! Ex: `!batalhapokemon @pessoa 1`' }, { quoted: msg });
              break;
            }
            if (alvo === sender) {
              await sock.sendMessage(from, { text: '😅 Você não pode batalhar consigo mesmo!' }, { quoted: msg });
              break;
            }
            const u1 = pokeUser(sender);
            const u2 = pokeUser(alvo);
            if (u1.time.length === 0) { await sock.sendMessage(from, { text: '❌ Você não tem pokémons! Capture primeiro.' }, { quoted: msg }); break; }
            if (u2.time.length === 0) { await sock.sendMessage(from, { text: '❌ Essa pessoa não tem pokémons ainda.' }, { quoted: msg }); break; }
            if (pos < 1 || pos > u1.time.length) { await sock.sendMessage(from, { text: `⚠️ Você só tem *${u1.time.length}* pokémon(s). Use posição 1 a ${u1.time.length}.` }, { quoted: msg }); break; }

            const poke1 = { ...u1.time[pos - 1] };
            const poke2 = { ...u2.time[0] };

            const db = pokeBatalhaDB();
            db[chaveBatalha(from)] = {
              j1: sender, j2: alvo,
              p1: poke1, p2: poke2,
              vez: 1,
              turno: 1,
              inicio: Date.now()
            };
            salvarPokeBatalha(db);

            await sock.sendMessage(from, {
              text: `╭━━━〔 ⚔️ 𝐁𝐀𝐓𝐀𝐋𝐇𝐀 𝐈𝐍𝐈𝐂𝐈𝐀𝐃𝐀 ⚔️ 〕━━━╮\n┃\n` +
                    `┃ 👤 @${sender.split('@')[0]}\n` +
                    `┃    ${emojiRaridade(poke1.raridade)} *${poke1.nome}* (Nv.${poke1.nivel})\n` +
                    `┃    ❤️ ${poke1.hp}/${poke1.hpMax}\n┃\n` +
                    `┃ 🆚\n┃\n` +
                    `┃ 👤 @${alvo.split('@')[0]}\n` +
                    `┃    ${emojiRaridade(poke2.raridade)} *${poke2.nome}* (Nv.${poke2.nivel})\n` +
                    `┃    ❤️ ${poke2.hp}/${poke2.hpMax}\n┃\n` +
                    `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                    `🎯 @${sender.split('@')[0]} começa! Use *!ataque1*, *!ataque2* ou *!ataque3*`,
              mentions: [sender, alvo]
            }, { quoted: msg });
          }
          break;

        case 'ataque1':
        case 'ataque2':
        case 'ataque3':
          {
            const db = pokeBatalhaDB();
            const bt = db[chaveBatalha(from)];
            if (!bt) { await sock.sendMessage(from, { text: '❌ Nenhuma batalha rolando aqui!' }, { quoted: msg }); break; }
            const jogadorAtual = bt.vez === 1 ? bt.j1 : bt.j2;
            if (jogadorAtual !== sender) {
              await sock.sendMessage(from, { text: '⏳ Não é sua vez!' }, { quoted: msg });
              break;
            }
            const atkNum = parseInt(command.replace('ataque', ''), 10);
            const nomesAtaques = ['Investida 💥', 'Golpe Forte 🥊', 'Ataque Especial ✨'];
            const atkMult = [1, 1.4, 1.8][atkNum - 1];
            const precisao = [0.95, 0.75, 0.55][atkNum - 1];

            const atacante = bt.vez === 1 ? bt.p1 : bt.p2;
            const defensor = bt.vez === 1 ? bt.p2 : bt.p1;
            const jAtacante = bt.vez === 1 ? bt.j1 : bt.j2;
            const jDefensor = bt.vez === 1 ? bt.j2 : bt.j1;

            let texto = `🥊 @${jAtacante.split('@')[0]} usou *${nomesAtaques[atkNum - 1]}*!\n`;

            if (Math.random() > precisao) {
              texto += `\n💨 ...mas errou o ataque!\n`;
            } else {
              const danoBase = calcularDano(atacante, defensor);
              const dano = Math.floor(danoBase * atkMult);
              defensor.hp = Math.max(0, defensor.hp - dano);
              texto += `\n💥 Dano: *${dano}*\n`;
              texto += `❤️ ${defensor.nome}: *${defensor.hp}/${defensor.hpMax}*\n`;
            }

            // Confere se morreu
            if (defensor.hp <= 0) {
              const vencedor = jAtacante;
              const perdedor = jDefensor;
              const uV = pokeUser(vencedor);
              const uP = pokeUser(perdedor);
              uV.pokecoins += 50;
              uV.vitorias += 1;
              uP.derrotas += 1;

              // Sobe level do vencedor, perde poder o perdedor
              const pokeV = uV.time.find(p => p.nome === atacante.nome);
              if (pokeV) ganharXp(pokeV, 80);
              const pokeP = uP.time.find(p => p.nome === defensor.nome);
              if (pokeP) {
                pokeP.ataque = Math.max(5, Math.floor(pokeP.ataque * 0.95));
                pokeP.defesa = Math.max(5, Math.floor(pokeP.defesa * 0.95));
                ajustarFelicidade(pokeP, -10);
              }
              salvarPokeUser(vencedor, uV);
              salvarPokeUser(perdedor, uP);
              delete db[chaveBatalha(from)];
              salvarPokeBatalha(db);

              await sock.sendMessage(from, {
                text: texto +
                      `\n╭━━━〔 🏆 𝐅𝐈𝐌 𝐃𝐄 𝐁𝐀𝐓𝐀𝐋𝐇𝐀 🏆 〕━━━╮\n┃\n` +
                      `┃ 🥇 Vencedor: @${vencedor.split('@')[0]}\n` +
                      `┃ 💰 Prêmio: *+50* Pokécoins\n` +
                      `┃ ⭐ Seu pokémon ganhou XP!\n┃\n` +
                      `┃ 💀 Perdedor: @${perdedor.split('@')[0]}\n` +
                      `┃ 📉 Perdeu um pouco de ataque/defesa\n` +
                      `╰━━━━━━━━━━━━━━━━━━━━━━━━╯`,
                mentions: [vencedor, perdedor]
              }, { quoted: msg });
            } else {
              bt.vez = bt.vez === 1 ? 2 : 1;
              bt.turno += 1;
              db[chaveBatalha(from)] = bt;
              salvarPokeBatalha(db);

              await sock.sendMessage(from, {
                text: texto + `\n🎯 Agora é a vez de @${jDefensor.split('@')[0]}!`,
                mentions: [jDefensor]
              }, { quoted: msg });
            }
          }
          break;

        case 'desistir':
          {
            const db = pokeBatalhaDB();
            const bt = db[chaveBatalha(from)];
            if (!bt) { await sock.sendMessage(from, { text: '❌ Nenhuma batalha rolando!' }, { quoted: msg }); break; }
            if (bt.j1 !== sender && bt.j2 !== sender) { await sock.sendMessage(from, { text: '❌ Você não está nessa batalha!' }, { quoted: msg }); break; }
            const oponente = bt.j1 === sender ? bt.j2 : bt.j1;
            delete db[chaveBatalha(from)];
            salvarPokeBatalha(db);
            await sock.sendMessage(from, {
              text: `🏳️ @${sender.split('@')[0]} desistiu!\n\n🏆 Vitória de @${oponente.split('@')[0]}!`,
              mentions: [sender, oponente]
            }, { quoted: msg });
          }
          break;


        // ═══════════════════════════════════════════════
        //         ADICIONAR POKECOINS (só dono/líder)
        // ═══════════════════════════════════════════════

        case 'addpokecoin':
        case 'addpoke':
          {
            if (!isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono e os líderes podem usar este comando!' }, { quoted: msg });
              break;
            }

            const ctxAdd = msg.message.extendedTextMessage?.contextInfo;
            const alvoAdd = ctxAdd?.mentionedJid?.[0] || ctxAdd?.participant;

            if (!alvoAdd) {
              await sock.sendMessage(from, { text: '⚠️ Marque a pessoa com @ ou responda à mensagem dela.\n\nEx: `!addpokecoin 500 @pessoa`' }, { quoted: msg });
              break;
            }

            const qtdAdd = parseInt(args.find(a => /^-?\d+$/.test(a)) || '0', 10);

            if (!qtdAdd || qtdAdd === 0) {
              await sock.sendMessage(from, { text: '⚠️ Informe uma quantidade válida!\n\nEx: `!addpokecoin 500 @pessoa`\n\n💡 Aceita valores negativos pra remover.' }, { quoted: msg });
              break;
            }

            const uAdd = pokeUser(alvoAdd);
            const saldoAntes = uAdd.pokecoins;
            uAdd.pokecoins = Math.max(0, saldoAntes + qtdAdd);
            salvarPokeUser(alvoAdd, uAdd);

            const emojiAdd = qtdAdd > 0 ? '➕' : '➖';
            const sinalAdd = qtdAdd > 0 ? '+' : '';

            await sock.sendMessage(from, {
              text: `💰 *POKECOINS AJUSTADAS!*\n\n` +
                    `👤 *Membro:* @${alvoAdd.split('@')[0]}\n` +
                    `👑 *Por:* @${sender.split('@')[0]}\n\n` +
                    `${emojiAdd} *Quantidade:* ${sinalAdd}${qtdAdd}\n` +
                    `📊 *Antes:* ${saldoAntes}\n` +
                    `✅ *Agora:* ${uAdd.pokecoins} Pokécoins`,
              mentions: [alvoAdd, sender]
            }, { quoted: msg });
          }
          break;


        // ═══════════════════════════════════════════════
        //          SHIZUKI CITY — COMANDOS
        // ═══════════════════════════════════════════════

        case 'shizukicity', 'espiao', 'verlogs', 'logs', 'banco', 'emprestar', 'doardinheiro', 'doar', 'comprarloja', 'loja', 'vender', 'vendercarro', 'pescar', 'minerar', 'corrida', 'loteria', 'roubar', 'assaltar', 'sequestrar', 'promocao', 'promoção', 'demitir', 'demissao', 'ferias', 'férias', 'segundotrabalho', 'bico', 'investir', 'resgatar', 'empresa', 'aposentar', 'aposentadoria', 'casar', 'divorciar', 'divorcio', 'adotar', 'meusfilhos', 'filhos', 'mudarnome':
          {
            const u = shizukiUser(sender);
            const texto = textoShizukiCity(u, sender, pushName);
            await sock.sendMessage(from, { text: texto, mentions: [sender] }, { quoted: msg });
          }
          break;

        case 'empregos':
          {
            await sock.sendMessage(from, { text: textoListaEmpregos() }, { quoted: msg });
          }
          break;

        case 'fazerprova':
          {
            if (!podeFazerProva(sender)) {
              await sock.sendMessage(from, { text: '⚠️ Você já tem uma prova rolando!' }, { quoted: msg });
              break;
            }
            const empregoId = (args[0] || '').toLowerCase();
            const emprego = acharEmprego(empregoId);
            if (!emprego) {
              await sock.sendMessage(from, { text: '⚠️ Emprego inválido! Use *!empregos* pra ver a lista.' }, { quoted: msg });
              break;
            }
            if (emprego.notaMinima === 0) {
              const u = shizukiUser(sender);
              u.emprego = emprego.id;
              salvarShizuki(sender, u);
              await sock.sendMessage(from, {
                text: `🎉 *CONTRATADO!*\n\n${emprego.emoji} Você agora é *${emprego.nome}*!\n💵 Salário: ${formatarReais(emprego.salarioMin)} - ${formatarReais(emprego.salarioMax)}\n\n💡 Use *!trabalhar* pra começar!`,
                mentions: [sender]
              }, { quoted: msg });
              break;
            }

            const banco = SHIZUKI_DATA.perguntas;
            const todasPerguntas = [
              ...embaralhar(banco.faceis || []).slice(0, 2),
              ...embaralhar(banco.medias || []).slice(0, 2),
              ...embaralhar(banco.dificeis || []).slice(0, 1),
              ...embaralhar(banco[emprego.id] || []).slice(0, 2)
            ];
            while (todasPerguntas.length < 7) {
              const pool = [...(banco.faceis || []), ...(banco.medias || [])];
              todasPerguntas.push(pool[Math.floor(Math.random() * pool.length)]);
            }
            const perguntas = todasPerguntas.slice(0, 7).map(p => {
              const respostaCerta = p.r[0];
              const poolErradas = [
                ...(banco.faceis || []), ...(banco.medias || []), ...(banco.dificeis || [])
              ].map(x => x.r[0]).filter(x => x !== respostaCerta);
              const erradas = embaralhar(poolErradas).slice(0, 3);
              const alternativas = embaralhar([respostaCerta, ...erradas]);
              return { p: p.p, r: p.r, alternativas };
            });

            const prova = {
              empregoId: emprego.id,
              empregoNome: emprego.nome,
              empregoEmoji: emprego.emoji,
              perguntas,
              indice: 0,
              acertos: 0,
              from,
              timer: null
            };
            provasAtivas.set(sender, prova);

            await sock.sendMessage(from, {
              text: `📝 *PROVA INICIADA!*\n\n💼 Cargo: *${emprego.nome}* ${emprego.emoji}\n❓ Perguntas: *7*\n✅ Acertos mínimos: *5*\n⏰ Tempo total: *10 minutos*\n\n🎯 Boa sorte, @${sender.split('@')[0]}!`,
              mentions: [sender]
            }, { quoted: msg });

            await new Promise(r => setTimeout(r, 1500));
            await enviarPerguntaShizuki(sock, from, sender);

            prova.timer = setTimeout(async () => {
              const p = provasAtivas.get(sender);
              if (!p) return;
              provasAtivas.delete(sender);
              await sock.sendMessage(from, {
                text: `⏰ *TEMPO ESGOTADO!*\n\nVocê acertou *${p.acertos}/7*.\n❌ Precisa de *5* pra passar.\n\n💡 Tente de novo em 10 minutos.`
              });
            }, 600000);
          }
          break;

        case 'trabalhar':
          {
            const u = shizukiUser(sender);
            if (!u.emprego) {
              await sock.sendMessage(from, { text: '❌ Você está desempregado!\n\nUse *!empregos* pra ver os cargos e *!fazerprova <emprego>* pra tentar.' }, { quoted: msg });
              break;
            }
            const emprego = acharEmprego(u.emprego);
            if (u.energia < 20) {
              await sock.sendMessage(from, { text: '😴 Você está exausto!\n\nUse *!descansar pra recuperar energia.' }, { quoted: msg });
              break;
            }
            const cdTrabalho = (typeof eVIP === "function" && eVIP(sender)) ? 5 * 60 * 1000 : SHIZUKI_DATA.cooldownTrabalho; // BONUS VIP
            const cd = checarCooldown(u.ultimoTrabalho, cdTrabalho);
            if (!cd.ok) {
              await sock.sendMessage(from, { text: `⏰ Calma! Você já trabalhou.\n\nAguarde *${cd.minutos} minuto(s)*.` }, { quoted: msg });
              break;
            }

            const sal = calcularSalario(emprego, u);
            // ═══ Desgasta veículo (2%) ═══
            const veicTrab = desgastarVeiculo(u, sender, 2);
            u.reais += sal.total;
            u.energia -= 20;
            u.ultimoTrabalho = Date.now();
            u.totalGanho = (u.totalGanho || 0) + sal.total;
            u.totalTrabalhos = (u.totalTrabalhos || 0) + 1; // PACOTE 2 TRABALHOS
            salvarShizuki(sender, u);

            let textoBonus = '';
            if (sal.bonusPct > 0) textoBonus = `\n┃ ✨ Bônus: *+${sal.bonusPct}%*`;

            await sock.sendMessage(from, {
              text: `╭━━━〔 💵 𝐓𝐑𝐀𝐁𝐀𝐋𝐇𝐀𝐍𝐃𝐎 💵 〕━━━╮\n┃\n` +
                    `┃ ${emprego.emoji} ${emprego.nome}\n┃\n` +
                    `┃ 💵 Base: *${formatarReais(sal.base)}*${textoBonus}\n` +
                    `┃ 💰 Recebeu: *${formatarReais(sal.total)}*\n┃\n` +
                    `┃ 💰 Saldo: *${formatarReais(u.reais)}*\n` +
                    `┃ ⚡ Energia: *${u.energia}/100*\n` +
                    `┃\n┃ ⏰ Próximo em 10min\n┃\n` +
                    `╰━━━━━━━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'dormir':
          {
            const u = shizukiUser(sender);
            const cd = checarCooldown(u.ultimoSono, SHIZUKI_DATA.cooldownDormir);
            if (!cd.ok) {
              const h = Math.floor(cd.minutos / 60);
              const m = cd.minutos % 60;
              await sock.sendMessage(from, { text: `😴 Você já dormiu!\n\nAguarde *${h}h ${m}min* pra dormir de novo.` }, { quoted: msg });
              break;
            }
            u.energia = 100;
            u.ultimoSono = Date.now();
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `╭━━━〔 😴 𝐃𝐎𝐑𝐌𝐈𝐍𝐃𝐎 😴 〕━━━╮\n┃\n┃ 💤 Zzz...\n┃ ⚡ Energia: *100/100*\n┃\n┃ ⏰ Próximo sono em 8h\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'pedirnamoro':
          {
            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const alvo = ctx?.mentionedJid?.[0];
            if (!alvo) {
              await sock.sendMessage(from, { text: '⚠️ Marque alguém!\n\nEx: `!pedirnamoro @pessoa`' }, { quoted: msg });
              break;
            }
            if (alvo === sender) {
              await sock.sendMessage(from, { text: '😅 Você não pode namorar consigo mesmo!' }, { quoted: msg });
              break;
            }
            const uEu = shizukiUser(sender);
            const uAlvo = shizukiUser(alvo);
            if (uEu.namorando) {
              await sock.sendMessage(from, { text: `❌ Você já está namorando @${uEu.namorando.split('@')[0]}!\n\nUse *!terminar* primeiro.`, mentions: [uEu.namorando] }, { quoted: msg });
              break;
            }
            if (uAlvo.namorando) {
              await sock.sendMessage(from, { text: `❌ @${alvo.split('@')[0]} já está namorando!`, mentions: [alvo] }, { quoted: msg });
              break;
            }

            const enviado = await sock.sendMessage(from, {
              text: `💜 *PEDIDO DE NAMORO!* 💜\n\n` +
                    `👤 @${sender.split('@')[0]} está pedindo @${alvo.split('@')[0]} em namoro!\n\n` +
                    `💌 @${alvo.split('@')[0]}, você aceita?\n\n` +
                    `✍️ Responda *SIM* ou *NÃO* marcando esta mensagem.\n` +
                    `⏰ Você tem 2 minutos.`,
              mentions: [sender, alvo]
            }, { quoted: msg });

            const stanzaId = enviado?.key?.id;
            const pedidosPendentes = globalThis.__pedidosNamoro || (globalThis.__pedidosNamoro = new Map());
            pedidosPendentes.set(stanzaId, {
              de: sender,
              para: alvo,
              timer: setTimeout(async () => {
                if (pedidosPendentes.has(stanzaId)) {
                  pedidosPendentes.delete(stanzaId);
                  try {
                    await sock.sendMessage(from, {
                      text: `⏰ @${alvo.split('@')[0]} não respondeu a tempo...\n\n💔 O pedido expirou.`,
                      mentions: [alvo]
                    });
                  } catch (e) {}
                }
              }, 120000)
            });
          }
          break;

        case 'terminar':
          {
            const u = shizukiUser(sender);
            if (!u.namorando) {
              await sock.sendMessage(from, { text: '❌ Você não está namorando!' }, { quoted: msg });
              break;
            }
            const ex = u.namorando;
            const uEx = shizukiUser(ex);
            u.namorando = null;
            uEx.namorando = null;
            salvarShizuki(sender, u);
            salvarShizuki(ex, uEx);
            await sock.sendMessage(from, {
              text: `💔 *FIM DE NAMORO*\n\nVocê e @${ex.split('@')[0]} terminaram...\n\n😢 Um relacionamento a menos.`,
              mentions: [ex]
            }, { quoted: msg });
          }
          break;

        case 'criarfamilia':
          {
            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const alvo = ctx?.mentionedJid?.[0];
            const sobrenome = args.filter(a => !a.startsWith('@'))[0];
            if (!alvo || !sobrenome) {
              await sock.sendMessage(from, { text: '⚠️ Marque alguém e diga o sobrenome!\n\nEx: `!criarfamilia @pessoa Silva`' }, { quoted: msg });
              break;
            }
            const uEu = shizukiUser(sender);
            const uAlvo = shizukiUser(alvo);
            if (uEu.familia) {
              await sock.sendMessage(from, { text: `❌ Você já tem uma família (*${uEu.familia.sobrenome}*)!` }, { quoted: msg });
              break;
            }
            if (uAlvo.familia) {
              await sock.sendMessage(from, { text: `❌ @${alvo.split('@')[0]} já tem família!`, mentions: [alvo] }, { quoted: msg });
              break;
            }
            const fam = { sobrenome: sobrenome, membros: [sender, alvo] };
            uEu.familia = fam;
            uAlvo.familia = fam;
            salvarShizuki(sender, uEu);
            salvarShizuki(alvo, uAlvo);
            await sock.sendMessage(from, {
              text: `👨‍👩‍👧 *FAMÍLIA CRIADA!* 👨‍👩‍👧\n\n💜 @${sender.split('@')[0]} e @${alvo.split('@')[0]} agora são a família *${sobrenome}*!\n\n🏠 Bem-vindos à nova casa!`,
              mentions: [sender, alvo]
            }, { quoted: msg });
          }
          break;

        case 'rankingshizuki':
        case 'rankshizuki':
          {
            const lista = rankingShizuki(10);
            if (!lista.length) {
              await sock.sendMessage(from, { text: 'ℹ️ Ninguém no ranking ainda!' }, { quoted: msg });
              break;
            }
            const medalhas = ['🥇', '🥈', '🥉'];
            let texto = `╭━━━〔 🏆 𝐑𝐀𝐍𝐊𝐈𝐍𝐆 𝐒𝐇𝐈𝐙𝐔𝐊𝐈 🏆 〕━━━╮\n┃\n`;
            lista.forEach((x, i) => {
              const medalha = medalhas[i] || `${i + 1}️⃣`;
              texto += `┃ ${medalha} @${x.jid.split('@')[0]} ➜ *${formatarReais(x.reais)}*\n`;
            });
            texto += `╰━━━━━━━━━━━━━━━━━━━━━━━━╯`;
            await sock.sendMessage(from, {
              text: texto,
              mentions: lista.map(x => x.jid)
            }, { quoted: msg });
          }
          break;


// COMANDOS ADM NOVOS — CASES
        // ═══════════════════════════════════════════════
        //          COMANDOS ADM — NOVOS
        // ═══════════════════════════════════════════════

        case 'legendabv':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas admins do grupo!' }, { quoted: msg });
              break;
            }
            const texto = args.join(' ').trim();
            if (!texto) {
              const atual = bvLegenda(from);
              await sock.sendMessage(from, {
                text: `📝 *Legenda atual:*\n\n${atual}\n\n💡 Use: *!legendabv <texto>*\nMarque *@{user}* pra mencionar quem entrou.`
              }, { quoted: msg });
              break;
            }
            const db = carregarBoasVindas();
            if (!db[from]) db[from] = {};
            db[from].legenda = texto;
            salvarBoasVindas(db);
            await sock.sendMessage(from, {
              text: `✅ *Legenda de boas-vindas atualizada!*\n\n📝 ${texto}`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'boasvindas':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas admins do grupo!' }, { quoted: msg });
              break;
            }
            const db = carregarBoasVindas();
            if (!db[from]) db[from] = {};
            db[from].ativo = !db[from].ativo;
            salvarBoasVindas(db);
            if (db[from].ativo) {
              await sock.sendMessage(from, {
                text: `✅ *Boas-vindas ATIVADAS neste grupo!*\n\n💜 Quando alguém entrar, o bot manda a mensagem.\n📝 Use *!legendabv* pra personalizar.`
              }, { quoted: msg });
            } else {
              await sock.sendMessage(from, {
                text: `❌ *Boas-vindas DESATIVADAS neste grupo!*\n\n💤 O bot não vai mais avisar quem entrar.`
              }, { quoted: msg });
            }
          }
          break;

        case 'linkgp':
        case 'linkgrupo':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas admins do grupo!' }, { quoted: msg });
              break;
            }
            try {
              const code = await sock.groupInviteCode(from);
              if (!code) throw new Error('Sem código');
              await sock.sendMessage(from, {
                text: `🔗 *LINK DO GRUPO*\n\n👥 ${gm.subject}\n🔗 https://chat.whatsapp.com/${code}`,
                mentions: [sender]
              }, { quoted: msg });
            } catch (e) {
              await sock.sendMessage(from, { text: '❌ Não consegui pegar o link. Verifique se o bot é admin!' }, { quoted: msg });
            }
          }
          break;

        case 'sorteio':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas admins do grupo!' }, { quoted: msg });
              break;
            }
            const premio = args.join(' ').trim();
            if (!premio) {
              await sock.sendMessage(from, { text: '⚠️ Informe o prêmio!\n\nEx: `!sorteio 200 reais`' }, { quoted: msg });
              break;
            }
            const membros = gm.participants.filter(p => !p.id.includes(sock.user?.id?.split('@')[0] || '___'));
            if (membros.length === 0) {
              await sock.sendMessage(from, { text: '❌ Sem membros pra sortear!' }, { quoted: msg });
              break;
            }
            const sorteado = membros[Math.floor(Math.random() * membros.length)];
            await sock.sendMessage(from, {
              text: `🎉 *SORTEIO!* 🎉\n\n🏆 O vencedor foi:\n\n👤 @${sorteado.id.split('@')[0]}\n\n🎁 Prêmio: *${premio}*\n\n💜 Parabéns!`,
              mentions: [sorteado.id]
            }, { quoted: msg });
          }
          break;

        case 'gp':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas admins do grupo!' }, { quoted: msg });
              break;
            }
            const sub = (args[0] || '').toLowerCase();
            if (sub !== 'a' && sub !== 'f') {
              await sock.sendMessage(from, { text: '⚠️ Use:\n• *!gp f* → fechar o grupo\n• *!gp a* → abrir o grupo' }, { quoted: msg });
              break;
            }
            try {
              if (sub === 'f') {
                await sock.groupSettingUpdate(from, 'announcement');
                await sock.sendMessage(from, { text: '🔒 *GRUPO FECHADO!*\n\nSó admins podem falar agora.' });
              } else {
                await sock.groupSettingUpdate(from, 'not_announcement');
                await sock.sendMessage(from, { text: '🔓 *GRUPO ABERTO!*\n\nTodos podem falar agora.' });
              }
            } catch (e) {
              await sock.sendMessage(from, { text: '❌ Não consegui alterar. Verifique se o bot é admin!' }, { quoted: msg });
            }
          }
          break;

        case 'rmopengp':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas admins do grupo!' }, { quoted: msg });
              break;
            }
            let agendamentos = carregarJSON(FILE_SCHEDULES);
            const chaveOpen = `${from}_open`;
            let removido = false;
            if (agendamentos[chaveOpen]) { delete agendamentos[chaveOpen]; removido = true; }
            for (const k of Object.keys(agendamentos)) {
              if (agendamentos[k].groupId === from && agendamentos[k].tipo === 'open') {
                delete agendamentos[k];
                removido = true;
              }
            }
            if (removido) {
              salvarJSON(FILE_SCHEDULES, agendamentos);
              await sock.sendMessage(from, { text: '🗑️ *Agendamento de abertura REMOVIDO!*\n\nO grupo não vai mais abrir sozinho.' }, { quoted: msg });
            } else {
              await sock.sendMessage(from, { text: 'ℹ️ Não há nenhum agendamento de abertura neste grupo.' }, { quoted: msg });
            }
          }
          break;


// SHIZUKI EXTRAS
        // ═══════════════════════════════════════════════
        //    SHIZUKI CITY — EVENTOS E CASAS
        // ═══════════════════════════════════════════════

        case 'ativareventos':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Só admins!' }, { quoted: msg }); break; }
            const db = carregarJSON('./shizuki_eventos.json');
            db[from] = db[from] || {};
            db[from].ativo = true;
            db[from].ultimoEvento = 0;
            salvarJSON('./shizuki_eventos.json', db);
            await sock.sendMessage(from, { text: '🎉 *EVENTOS ATIVADOS!*\n\nVão rolar festas, baladas e aniversários por aqui!\n⏰ Fica atento!' }, { quoted: msg });
          }
          break;

        case 'desativareventos':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Só admins!' }, { quoted: msg }); break; }
            const db = carregarJSON('./shizuki_eventos.json');
            if (db[from]) db[from].ativo = false;
            salvarJSON('./shizuki_eventos.json', db);
            await sock.sendMessage(from, { text: '❌ *EVENTOS DESATIVADOS!*\n\nSem festas por aqui... 😴' }, { quoted: msg });
          }
          break;

        case 'balada':
          {
            const u = shizukiUser(sender);
            if (u.reais < 30) {
              await sock.sendMessage(from, { text: `💸 Precisa de *R$ 30,00* pra entrar na balada!\n\n💰 Você tem: *${formatarReais(u.reais)}*` }, { quoted: msg });
              break;
            }
            u.reais -= 30;
            u.felicidade = Math.min(100, (u.felicidade || 50) + 15);
            u.energia = Math.max(0, u.energia - 10);
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `🕺💃 *BALADA!* 🕺💃\n\n🎶 Você curtiu a noite e dançou muito!\n😊 Felicidade: *+15*\n⚡ Energia: *-10*\n💵 Gasto: *-R$ 30,00*\n💰 Saldo: *${formatarReais(u.reais)}*`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'aniversario':
        case 'meuaniversario':
          {
            const data = (args[0] || '').trim();
            if (!/^\d{1,2}\/\d{1,2}$/.test(data)) {
              await sock.sendMessage(from, { text: '⚠️ Use: `!aniversario DD/MM`\nEx: `!aniversario 25/12`' }, { quoted: msg });
              break;
            }
            const u = shizukiUser(sender);
            u.aniversario = data;
            u.aniversarioGrupos = u.aniversarioGrupos || [];
            if (isGroup && !u.aniversarioGrupos.includes(from)) {
              u.aniversarioGrupos.push(from);
            }
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `🎂 *Aniversário salvo!*\n\n📅 Você faz aniversário em *${data}*\n👥 Grupos registrados: *${u.aniversarioGrupos.length}*\n\n💜 O bot vai avisar nesses grupos no dia!`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'casas':
        case 'lojacasa':
          {
            const u = shizukiUser(sender);
            const casas = [
              { id: 'barraco', nome: 'Barraco', emoji: '🏚️', preco: 500, aluguel: 50, bonus: 5 },
              { id: 'simples', nome: 'Casa Simples', emoji: '🏠', preco: 2000, aluguel: 200, bonus: 10 },
              { id: 'media', nome: 'Casa Média', emoji: '🏡', preco: 5000, aluguel: 500, bonus: 15 },
              { id: 'mansao', nome: 'Mansão', emoji: '🏘️', preco: 15000, aluguel: 1500, bonus: 25 },
              { id: 'palacio', nome: 'Palácio', emoji: '🏰', preco: 50000, aluguel: 5000, bonus: 40 }
            ];
            let texto = `╭━━━〔 🏠 𝐋𝐎𝐉𝐀 𝐃𝐄 𝐂𝐀𝐒𝐀𝐒 🏠 〕━━━╮\n┃\n┃ 💰 Saldo: *${formatarReais(u.reais)}*\n┃\n`;
            casas.forEach(c => {
              texto += `┃ ${c.emoji} *${c.nome}*\n`;
              texto += `┃    💵 ${formatarReais(c.preco)} | ✨ +${c.bonus}%\n`;
              texto += `┃    🔑 Aluguel: ${formatarReais(c.aluguel)} (7d)\n┃\n`;
            });
            texto += `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n💡 Comprar: *!comprarcasa <id>*\n💡 Alugar: *!alugarcasa <id>*\nEx: *!comprarcasa mansao*`;
            await sock.sendMessage(from, { text: texto, mentions: [sender] }, { quoted: msg });
          }
          break;

        case 'comprarcasa':
          {
            const u = shizukiUser(sender);
            const id = (args[0] || '').toLowerCase();
            const casas = { barraco: 500, simples: 2000, media: 5000, mansao: 15000, palacio: 50000 };
            const bonus = { barraco: 5, simples: 10, media: 15, mansao: 25, palacio: 40 };
            const nomes = { barraco: 'Barraco', simples: 'Casa Simples', media: 'Casa Média', mansao: 'Mansão', palacio: 'Palácio' };
            const emojis = { barraco: '🏚️', simples: '🏠', media: '🏡', mansao: '🏘️', palacio: '🏰' };
            if (!casas[id]) {
              await sock.sendMessage(from, { text: '⚠️ Casa inválida! Use *!casas* pra ver a lista.' }, { quoted: msg });
              break;
            }
            if (u.casa && u.casa.tipo === id && u.casa.permanente) {
              await sock.sendMessage(from, { text: '❌ Você já tem essa casa!' }, { quoted: msg });
              break;
            }
            if (u.reais < casas[id]) {
              await sock.sendMessage(from, { text: `💸 Precisa de *${formatarReais(casas[id])}*!\n\n💰 Você tem: *${formatarReais(u.reais)}*` }, { quoted: msg });
              break;
            }
            u.reais -= casas[id];
            u.casa = { tipo: id, compradaEm: Date.now(), permanente: true };
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `🏠 *CASA COMPRADA!*\n\n${emojis[id]} Você agora tem uma *${nomes[id]}*!\n✨ Bônus: *+${bonus[id]}%* em trabalhos\n💰 Saldo: *${formatarReais(u.reais)}*`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'alugarcasa':
          {
            const u = shizukiUser(sender);
            const id = (args[0] || '').toLowerCase();
            const alugueis = { barraco: 50, simples: 200, media: 500, mansao: 1500, palacio: 5000 };
            const bonus = { barraco: 5, simples: 10, media: 15, mansao: 25, palacio: 40 };
            const nomes = { barraco: 'Barraco', simples: 'Casa Simples', media: 'Casa Média', mansao: 'Mansão', palacio: 'Palácio' };
            const emojis = { barraco: '🏚️', simples: '🏠', media: '🏡', mansao: '🏘️', palacio: '🏰' };
            if (!alugueis[id]) {
              await sock.sendMessage(from, { text: '⚠️ Casa inválida! Use *!casas* pra ver a lista.' }, { quoted: msg });
              break;
            }
            if (u.casa && u.casa.expira && Date.now() < u.casa.expira) {
              await sock.sendMessage(from, { text: `❌ Você já tem aluguel ativo!\n\n⏳ Expira em: *${new Date(u.casa.expira).toLocaleString('pt-BR')}*` }, { quoted: msg });
              break;
            }
            if (u.reais < alugueis[id]) {
              await sock.sendMessage(from, { text: `💸 Precisa de *${formatarReais(alugueis[id])}*!` }, { quoted: msg });
              break;
            }
            u.reais -= alugueis[id];
            u.casa = { tipo: id, alugadaEm: Date.now(), expira: Date.now() + 7 * 86400000 };
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `🏠 *CASA ALUGADA!*\n\n${emojis[id]} Você alugou uma *${nomes[id]}* por 7 dias!\n✨ Bônus: *+${bonus[id]}%*\n⏳ Expira em 7 dias\n💰 Saldo: *${formatarReais(u.reais)}*`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'minhacasa':
          {
            const u = shizukiUser(sender);
            if (!u.casa) {
              await sock.sendMessage(from, { text: '❌ Você ainda não tem casa!\n\nUse *!casas* pra ver a lista.' }, { quoted: msg });
              break;
            }
            const nomes = { barraco: 'Barraco', simples: 'Casa Simples', media: 'Casa Média', mansao: 'Mansão', palacio: 'Palácio' };
            const emojis = { barraco: '🏚️', simples: '🏠', media: '🏡', mansao: '🏘️', palacio: '🏰' };
            const info = u.casa.permanente
              ? '✅ Permanente (comprada)'
              : `⏳ Alugada, expira: ${new Date(u.casa.expira).toLocaleString('pt-BR')}`;
            await sock.sendMessage(from, {
              text: `🏠 *MINHA CASA*\n\n${emojis[u.casa.tipo]} *${nomes[u.casa.tipo]}*\n📅 ${info}`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;


// POKEMON EXTRAS — CASES
        // ═══════════════════════════════════════════════
        //         POKÉMON — COMANDOS EXTRAS
        // ═══════════════════════════════════════════════

        case 'porcentagem':
          {
            await sock.sendMessage(from, { text: textoPorcentagem() }, { quoted: msg });
          }
          break;

        case 'trocarpokebola':
          {
            const id = (args[0] || '').toLowerCase();
            const u = pokeUser(sender);
            const bola = acharPokebola(id);
            if (!bola) {
              await sock.sendMessage(from, { text: '⚠️ Pokébola inválida! Use: `!trocarpokebola <id>`\n\nIDs: `pokebola`, `great`, `ultra`, `master`' }, { quoted: msg });
              break;
            }
            if ((u.pokebolas[id] || 0) <= 0) {
              await sock.sendMessage(from, { text: `❌ Você não tem *${bola.nome}*!` }, { quoted: msg });
              break;
            }
            u.pokebolaPadrao = id;
            salvarPokeUser(sender, u);
            await sock.sendMessage(from, {
              text: `✅ *Pokébola padrão definida!*\n\n🎯 Agora você usa *${bola.nome}* nas capturas.`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;


// MENU VIP — CASES
        // ═══════════════════════════════════════════════
        //           MENU VIP — COMANDOS
        // ═══════════════════════════════════════════════

        case 'menuvip':
        case 'vip':
          {
            if (!eVIP(sender) && !isDono) {
              await sock.sendMessage(from, {
                text: '🚫 *ACESSO RESTRITO A VIPS!*\n\n💎 Este menu é exclusivo pra membros VIP.\n\n💡 Fale com o dono pra adquirir o seu!'
              }, { quoted: msg });
              break;
            }
            const nomeU = nomeExibicao(sender, pushName);
            const restoU = diasRestantesVip(sender) || '∞';
            const menuVip =
              '╭━━━━━━━━━━━━━━━━━━━━━━━━╮\n' +
              '┃   💎 𝐌𝐄𝐍𝐔 𝐕𝐈𝐏 💎   ┃\n' +
              '╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n' +
              '╭─ ⟨ 👑 ⟩ ─╮\n' +
              '   💎 𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒\n' +
              '╰─ ⟨ 👑 ⟩ ─╯\n' +
              '   ┃ 💎 !vipinfo\n' +
              '   ┃ 💎 !bauvip\n' +
              '   ┃ 💎 !apelido <texto>\n' +
              '   ┃ 💎 !rmapelido\n' +
              '   ┃ 💎 !vipprotecao\n\n' +
              '╭─ ⟨ 🏴 ⟩ ─╮\n' +
              '   💎 𝐅𝐀𝐂𝐂̧𝐎̃𝐄𝐒\n' +
              '╰─ ⟨ 🏴 ⟩ ─╯\n' +
              '   ┃ 💎 !cla criar <nome>\n' +
              '   ┃ 💎 !cla convidar @pessoa\n' +
              '   ┃ 💎 !cla info\n' +
              '   ┃ 💎 !cla membros\n' +
              '   ┃ 💎 !cla sair\n' +
              '   ┃ 💎 !cla depositar <valor>\n' +
              '   ┃ 💎 !cla caixa\n' +
              '   ┃ 💎 !cla guerra <id> <valor>\n' +
              '   ┃ 💎 !cla ranking\n' +
              '   ┃ 💎 !cla dissolver\n\n' +
              '╭─ ⟨ ⚔️ ⟩ ─╮\n' +
              '   💎 𝐀𝐑𝐄𝐍𝐀 𝐕𝐈𝐏\n' +
              '╰─ ⟨ ⚔️ ⟩ ─╯\n' +
              '   ┃ 💎 !arena @pessoa <valor>\n' +
              '   ┃ 💎 !atacar\n' +
              '   ┃ 💎 !defender\n' +
              '   ┃ 💎 !magia <nome>\n' +
              '   ┃ 💎 !desistir\n\n' +
              '╭─ ⟨ 💜 ⟩ ─╮\n' +
              '   💎 VIP: ' + nomeU + ' 💎\n' +
              '   ⏳ Expira em: ' + restoU + '\n' +
              '╰─ ⟨ 💜 ⟩ ─╯';

            if (fs.existsSync(MENU_IMAGE_PATH)) {
              try {
                await sock.sendMessage(from, { image: fs.readFileSync(MENU_IMAGE_PATH), caption: menuVip, mentions: [sender] }, { quoted: msg });
              } catch (e) {
                await sock.sendMessage(from, { text: menuVip, mentions: [sender] }, { quoted: msg });
              }
            } else {
              await sock.sendMessage(from, { text: menuVip, mentions: [sender] }, { quoted: msg });
            }
          }
          break;

        case 'darvip':
          {
            if (!isDonoReal) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono pode dar VIP!' }, { quoted: msg });
              break;
            }
            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;
            if (!alvo) {
              await sock.sendMessage(from, { text: '⚠️ Marque a pessoa!\n\nEx: `!darvip @pessoa 30`' }, { quoted: msg });
              break;
            }
            const dias = parseInt(args.find(a => /^\d+$/.test(a)) || '30', 10);
            const db = vipDB();
            db.vips = db.vips || {};
            db.vips[alvo] = {
              desde: Date.now(),
              expira: Date.now() + dias * 86400000
            };
            salvarVipDB(db);
            await sock.sendMessage(from, {
              text: `💎 *VIP CONCEDIDO!* 💎\n\n👤 @${alvo.split('@')[0]}\n⏳ Duração: *${dias} dia(s)*\n📅 Expira: *${new Date(db.vips[alvo].expira).toLocaleDateString('pt-BR')}*\n\n✨ Bem-vindo(a) ao clube VIP!`,
              mentions: [alvo]
            }, { quoted: msg });
          }
          break;

        case 'rmvip':
          {
            if (!isDonoReal) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono pode remover VIP!' }, { quoted: msg });
              break;
            }
            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;
            if (!alvo) {
              await sock.sendMessage(from, { text: '⚠️ Marque a pessoa!\n\nEx: `!rmvip @pessoa`' }, { quoted: msg });
              break;
            }
            const db = vipDB();
            if (!db.vips || !db.vips[alvo]) {
              await sock.sendMessage(from, { text: '❌ Essa pessoa não é VIP.' }, { quoted: msg });
              break;
            }
            delete db.vips[alvo];
            salvarVipDB(db);
            await sock.sendMessage(from, {
              text: `❌ *VIP REMOVIDO!*\n\n👤 @${alvo.split('@')[0]} não é mais VIP.\n\n💔 Sentiremos sua falta...`,
              mentions: [alvo]
            }, { quoted: msg });
          }
          break;

        case 'listarvip':
          {
            if (!isDonoReal) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono pode usar este comando!' }, { quoted: msg });
              break;
            }
            const db = vipDB();
            const vips = db.vips || {};
            const ids = Object.keys(vips);
            if (!ids.length) {
              await sock.sendMessage(from, { text: 'ℹ️ Nenhum VIP cadastrado ainda.' }, { quoted: msg });
              break;
            }
            let txt = `╭━━━〔 💎 𝐋𝐈𝐒𝐓𝐀 𝐕𝐈𝐏 💎 〕━━━╮\n┃\n`;
            const mentions = [];
            ids.forEach((jid, i) => {
              const info = vips[jid];
              const dias = info.expira ? Math.max(0, Math.floor((info.expira - Date.now()) / 86400000)) : '∞';
              const ativo = info.expira ? Date.now() < info.expira : true;
              txt += `┃ ${i + 1}. @${jid.split('@')[0]}\n`;
              txt += `┃    ${ativo ? '🟢 Ativo' : '🔴 Expirado'} | ⏳ ${dias} dia(s)\n┃\n`;
              mentions.push(jid);
            });
            txt += `╰━━━━━━━━━━━━━━━━━━━━━━━╯`;
            await sock.sendMessage(from, { text: txt, mentions }, { quoted: msg });
          }
          break;

        case 'vipinfo':
          {
            const nomeU = nomeExibicao(sender, pushName);
            const isV = eVIP(sender);
            if (!isV) {
              await sock.sendMessage(from, {
                text: `💎 *STATUS VIP*\n\n👤 ${nomeU}\n❌ *Não é VIP*\n\n💡 Fale com o dono pra adquirir!`
              }, { quoted: msg });
              break;
            }
            const db = vipDB();
            const info = db.vips[sender];
            const dias = diasRestantesVip(sender);
            const ap = apelidoDe(sender);
            await sock.sendMessage(from, {
              text: `╭━━━〔 💎 𝐒𝐓𝐀𝐓𝐔𝐒 𝐕𝐈𝐏 💎 〕━━━╮\n┃\n` +
                    `┃ 👤 Nome: *${nomeU}*\n` +
                    `┃ 💎 Status: *VIP ATIVO* ✅\n` +
                    `┃ ⏳ Expira em: *${dias} dia(s)*\n` +
                    `┃ 📅 Data: *${new Date(info.expira).toLocaleDateString('pt-BR')}*\n` +
                    (ap ? `┃ 🏷️ Apelido: *${ap}*\n` : '') +
                    `┃\n╰━━━━━━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'bauvip':
        case 'baúvip':
          {
            if (!eVIP(sender) && !isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas VIPs podem abrir o baú!' }, { quoted: msg });
              break;
            }
            const db = vipDB();
            db.cooldownsBau = db.cooldownsBau || {};
            const ultimo = db.cooldownsBau[sender] || 0;
            const passou = Date.now() - ultimo;
            const SEMANA = 7 * 86400000;
            if (passou < SEMANA) {
              const resta = SEMANA - passou;
              const diasR = Math.floor(resta / 86400000);
              const horasR = Math.floor((resta % 86400000) / 3600000);
              await sock.sendMessage(from, { text: `⏳ Você já abriu o baú essa semana!\n\n💎 Volta em: *${diasR}d ${horasR}h*` }, { quoted: msg });
              break;
            }

            const premios = [
              { tipo: 'reais', valor: 500, texto: '💵 *R$ 500,00*' },
              { tipo: 'pokecoins', valor: 100, texto: '🪙 *100 Pokécoins*' },
              { tipo: 'pokebola', valor: 'ultra', qtd: 1, texto: '🔵 *1 Ultra Ball*' },
              { tipo: 'pokebola', valor: 'master', qtd: 1, texto: '🟣 *1 Master Ball* (RARO!)', raro: true },
              { tipo: 'cosmetico', valor: 'berry', qtd: 5, texto: '🍖 *5 Berries*' }
            ];
            // 70% comum, 30% raro
            const rolagem = Math.random();
            let escolhido;
            if (rolagem < 0.7) {
              const comuns = premios.filter(p => !p.raro);
              escolhido = comuns[Math.floor(Math.random() * comuns.length)];
            } else {
              escolhido = premios.find(p => p.raro) || premios[0];
            }

            // Aplica o prêmio
            if (escolhido.tipo === 'reais') {
              const u = shizukiUser(sender);
              u.reais += escolhido.valor;
              salvarShizuki(sender, u);
            } else if (escolhido.tipo === 'pokecoins') {
              const u = pokeUser(sender);
              u.pokecoins += escolhido.valor;
              salvarPokeUser(sender, u);
            } else if (escolhido.tipo === 'pokebola') {
              const u = pokeUser(sender);
              u.pokebolas[escolhido.valor] = (u.pokebolas[escolhido.valor] || 0) + escolhido.qtd;
              salvarPokeUser(sender, u);
            } else if (escolhido.tipo === 'cosmetico') {
              const u = pokeUser(sender);
              u.cosmeticos[escolhido.valor] = (u.cosmeticos[escolhido.valor] || 0) + escolhido.qtd;
              salvarPokeUser(sender, u);
            }

            db.cooldownsBau[sender] = Date.now();
            salvarVipDB(db);

            await sock.sendMessage(from, {
              text: `╭━━━〔 🎁 𝐁𝐀𝐔́ 𝐕𝐈𝐏 🎁 〕━━━╮\n┃\n` +
                    `┃ ✨ Você abriu o baú!\n┃\n` +
                    `┃ 🎉 Prêmio: ${escolhido.texto}\n┃\n` +
                    `┃ ⏰ Volta em 7 dias!\n` +
                    `┃\n╰━━━━━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'apelido':
          {
            if (!eVIP(sender) && !isDono) {
              await sock.sendMessage(from, { text: '🚫 Só VIPs podem definir apelido!' }, { quoted: msg });
              break;
            }
            const novo = args.join(' ').trim();
            if (!novo) {
              const atual = apelidoDe(sender);
              await sock.sendMessage(from, {
                text: `🏷️ *SEU APELIDO*\n\n` +
                      (atual ? `👑 『 ${atual} 』\n\n` : `❌ Nenhum apelido definido.\n\n`) +
                      `💡 Definir: *!apelido <texto>*\n💡 Remover: *!rmapelido*`
              }, { quoted: msg });
              break;
            }
            if (novo.length > 20) {
              await sock.sendMessage(from, { text: '⚠️ Máximo de 20 caracteres!' }, { quoted: msg });
              break;
            }
            const db = vipDB();
            db.vips = db.vips || {};
            db.vips[sender] = db.vips[sender] || { desde: Date.now(), expira: null };
            db.vips[sender].apelido = novo;
            salvarVipDB(db);
            await sock.sendMessage(from, {
              text: `🏷️ *APELIDO DEFINIDO!*\n\n✨ Agora o bot vai te chamar de:\n\n👑 『 ${novo} 』\n\n💎 Aproveite seu privilégio VIP!`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'rmapelido':
          {
            if (!eVIP(sender) && !isDono) {
              await sock.sendMessage(from, { text: '🚫 Só VIPs!' }, { quoted: msg });
              break;
            }
            const db = vipDB();
            if (!db.vips || !db.vips[sender] || !db.vips[sender].apelido) {
              await sock.sendMessage(from, { text: '❌ Você não tem apelido definido.' }, { quoted: msg });
              break;
            }
            delete db.vips[sender].apelido;
            salvarVipDB(db);
            await sock.sendMessage(from, { text: '✅ Apelido removido! Agora o bot te chama pelo nome normal.' }, { quoted: msg });
          }
          break;


// COMANDO PLAY
        // ═══════════════════════════════════════════════
        //           COMANDO PLAY — MÚSICA
        // ═══════════════════════════════════════════════

        // PLAY API
        // ═══ INSTAGRAM + PLAYVIDEO (API Bronxys) ═══
        case 'instagram':
        case 'insta':
          {
            const cfgInsta = carregarConfig();
            if (!cfgInsta.apiKey) {
              await sock.sendMessage(from, { text: '❌ Configure a API com *!api SUA_CHAVE* primeiro!' }, { quoted: msg });
              break;
            }
            const linkInsta = args.join(' ').trim();
            if (!linkInsta || !linkInsta.includes('instagram.com')) {
              await sock.sendMessage(from, { text: '⚠️ Manda o link do Instagram!\n\n📝 Ex: *!instagram https://instagram.com/reel/...*\n\n🌸 Shizuki Bot - MD 🌸' }, { quoted: msg });
              break;
            }
            await sock.sendMessage(from, { text: '📸 *INSTAGRAM DOWNLOADER*\n\n🔗 Link recebido!\n🎯 Status: Processando...\n\n💜 _Só um instante~_\n\n🌸 Shizuki Bot - MD 🌸' }, { quoted: msg });
            try {
              const rInsta = await fetch('https://api.bronxyshost.com.br/api-bronxys/instagram?url=' + encodeURIComponent(linkInsta) + '&apikey=' + cfgInsta.apiKey, { signal: AbortSignal.timeout(60000) });
              const jInsta = await rInsta.json();
              if (!jInsta || !jInsta.msg || !jInsta.msg[0] || !jInsta.msg[0].url) throw new Error('Sem URL');
              const mediaInsta = jInsta.msg[0];
              const rVideo = await fetch(mediaInsta.url, { signal: AbortSignal.timeout(120000) });
              const bufInsta = Buffer.from(await rVideo.arrayBuffer());
              const tamMB = (bufInsta.length / 1024 / 1024).toFixed(2);
              if (bufInsta.length > 16 * 1024 * 1024) {
                await sock.sendMessage(from, { text: '❌ *VÍDEO MUITO GRANDE!*\n\n📦 Tamanho: ' + tamMB + ' MB\n📏 Limite: 16 MB\n\n💜 Tenta outro!\n\n🌸 Shizuki Bot - MD 🌸' }, { quoted: msg });
                break;
              }
              const isVideoInsta = mediaInsta.type === 'mp4';
              if (isVideoInsta) {
                await sock.sendMessage(from, { video: bufInsta, mimetype: 'video/mp4', caption: '✅ *INSTAGRAM BAIXADO!*\n\n📸 Plataforma: Instagram\n🎬 Tipo: Reels\n📦 Tamanho: ' + tamMB + ' MB\n\n💜 Aproveite!\n\n🌸 Shizuki Bot - MD 🌸' }, { quoted: msg });
              } else {
                await sock.sendMessage(from, { image: bufInsta, caption: '✅ *IMAGEM BAIXADA!*\n\n📸 Instagram\n📦 ' + tamMB + ' MB\n\n🌸 Shizuki Bot - MD 🌸' }, { quoted: msg });
              }
            } catch (errInsta) {
              console.error('Erro instagram:', errInsta.message);
              await sock.sendMessage(from, { text: '❌ *ERRO NO DOWNLOAD*\n\n💡 Possíveis motivos:\n• Link inválido\n• Post privado\n• Conteúdo removido\n\n💜 Tenta de novo!\n\n🌸 Shizuki Bot - MD 🌸' }, { quoted: msg });
            }
          }
          break;

        case 'playvideo':
        case 'play_video':
        case 'playmp4':
          {
            const cfgPV = carregarConfig();
            if (!cfgPV.apiKey) {
              await sock.sendMessage(from, { text: '❌ Configure a API com *!api SUA_CHAVE* primeiro!' }, { quoted: msg });
              break;
            }
            const buscaPV = args.join(' ').trim();
            if (!buscaPV) {
              await sock.sendMessage(from, { text: '🎬 *PLAYVIDEO*\n\n⚠️ Manda o nome do vídeo!\n\n📝 Ex: *!playvideo funk 2024*\n\n🌸 Shizuki Bot - MD 🌸' }, { quoted: msg });
              break;
            }
            await sock.sendMessage(from, { text: '🎬 *PLAYVIDEO*\n\n🔎 Buscando: ' + buscaPV + '\n📡 Conectando...\n⏳ Procurando vídeo\n\n💜 _Aguarde~_\n\n🌸 Shizuki Bot - MD 🌸' }, { quoted: msg });
            try {
              const rBuscaPV = await fetch('https://api.bronxyshost.com.br/api-bronxys/pesquisa_ytb?nome=' + encodeURIComponent(buscaPV) + '&apikey=' + cfgPV.apiKey, { signal: AbortSignal.timeout(60000) });
              const jBuscaPV = await rBuscaPV.json();
              if (!jBuscaPV || !jBuscaPV[0]) throw new Error('Nada encontrado');
              const infoPV = jBuscaPV[0];
              const tempoPV = infoPV.tempo || '0:00';
              const partesT = tempoPV.split(':').map(x => parseInt(x, 10));
              let minutosTotal = 0;
              if (partesT.length === 3) minutosTotal = partesT[0] * 60 + partesT[1];
              else if (partesT.length === 2) minutosTotal = partesT[0];
              if (minutosTotal > 20) {
                await sock.sendMessage(from, { text: '⏰ *VÍDEO MUITO LONGO!*\n\n⏱️ Duração: ' + tempoPV + '\n📏 Limite: 20:00\n\n💜 Tenta um mais curto!\n\n🌸 Shizuki Bot - MD 🌸' }, { quoted: msg });
                break;
              }
              let legendaPV = '🎬 *VÍDEO ENCONTRADO!*\n\n🎬 Título:\n_' + (infoPV.titulo || 'Sem título') + '_\n\n⏱️ Duração: ' + tempoPV + '\n📅 Postado: ' + (infoPV.postado || '?') + '\n\n⏳ Baixando o vídeo...\n\n🌸 Shizuki Bot - MD 🌸';
              try {
                await sock.sendMessage(from, { image: { url: infoPV.thumb }, caption: legendaPV }, { quoted: msg });
              } catch (e) {
                await sock.sendMessage(from, { text: legendaPV }, { quoted: msg });
              }
              const rPV = await fetch('https://api.bronxyshost.com.br/api-bronxys/play_video?nome_url=' + encodeURIComponent(buscaPV) + '&apikey=' + cfgPV.apiKey, { signal: AbortSignal.timeout(180000) });
              const bufPV = Buffer.from(await rPV.arrayBuffer());
              if (!bufPV || bufPV.length < 1000) throw new Error('Vídeo vazio');
              const tamPV = (bufPV.length / 1024 / 1024).toFixed(2);
              if (bufPV.length > 64 * 1024 * 1024) {
                await sock.sendMessage(from, { text: '🐘 *VÍDEO MUITO GRANDE!*\n\n📦 Tamanho: ' + tamPV + ' MB\n📏 Limite: 64 MB\n\n💜 Escolhe outro!\n\n🌸 Shizuki Bot - MD 🌸' }, { quoted: msg });
                break;
              }
              await sock.sendMessage(from, { video: bufPV, mimetype: 'video/mp4', fileName: (infoPV.titulo || 'video').slice(0, 50) + '.mp4', caption: '✅ *VÍDEO BAIXADO!*\n\n🎬 _' + (infoPV.titulo || 'Vídeo') + '_\n\n⏱️ ' + tempoPV + '\n📦 ' + tamPV + ' MB\n\n💜 Curtiu? Compartilha!\n\n🌸 Shizuki Bot - MD 🌸' }, { quoted: msg });
            } catch (errPV) {
              console.error('Erro playvideo:', errPV.message);
              await sock.sendMessage(from, { text: '❌ *VÍDEO NÃO ENCONTRADO*\n\n💡 Possíveis motivos:\n• Nome errado\n• Vídeo removido\n• Bloqueio de região\n\n💜 Tenta outro nome!\n\n🌸 Shizuki Bot - MD 🌸' }, { quoted: msg });
            }
          }
          break;

        // ═══════════════════════════════════════════════
        //       RANKS DE ZOEIRA
        // ═══════════════════════════════════════════════

        case 'ranklinda': case 'ranklindo': case 'rankbebado': case 'rankfiel':
        case 'rankputa': case 'rankgay': case 'rankcorno': case 'rankotaku':
        case 'rankpobre': case 'rankrico': case 'rankfeio': case 'rankgostosa':
        case 'rankgostoso': case 'rankgado': case 'rankpau': case 'rankbct':
          {
            const cfgR = carregarConfig();
            const infoR = RANKS_CONFIG[command];
            if (!infoR) {
              await sock.sendMessage(from, { text: '❌ Rank inválido!' }, { quoted: msg });
              break;
            }
            if (!isGroup) {
              await sock.sendMessage(from, { text: '❌ Esse comando só funciona em grupo!' }, { quoted: msg });
              break;
            }
            try {
              const gmR = await sock.groupMetadata(from);
              const membrosR = gmR.participants.filter(p => p.id !== sock.user?.id);
              if (membrosR.length < 2) {
                await sock.sendMessage(from, { text: '❌ Poucos membros pra fazer o ranking!' }, { quoted: msg });
                break;
              }
              const qtdR = 5 + Math.floor(Math.random() * 2);
              const escolhidos = embaralhar(membrosR).slice(0, Math.min(qtdR, membrosR.length));

              let textoR = `${infoR.topo}\n\n`;
              textoR += `📁 *Grupo:* ${gmR.subject}\n\n`;
              textoR += '━━━━━━━━━━━━━━━━━\n\n';

              const mentionsR = [];
              const numerosR = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣'];
              escolhidos.forEach((m, i) => {
                const pct = Math.floor(Math.random() * 101);
                const jidR = m.id;
                mentionsR.push(jidR);
                textoR += `${numerosR[i]} @${jidR.split('@')[0]}\n`;
                textoR += `   ▓${barraRank(pct)}░ ${pct}%\n\n`;
              });

              textoR += '━━━━━━━━━━━━━━━━━\n\n';
              textoR += `💬 _${infoR.frase}_\n\n`;
              textoR += '🌸 𝐒𝐡𝐢𝐳𝐮𝐤𝐢 𝐁𝐨𝐭 - 𝐌𝐃 🌸';

              // ═══ Usa imagem local do rank ═══
              const pastaRank = './rank_imagens';
              let arquivoRank = null;
              if (fs.existsSync(pastaRank)) {
                const jpg = `${pastaRank}/${command}.jpg`;
                const mp4 = `${pastaRank}/${command}.mp4`;
                if (fs.existsSync(mp4)) arquivoRank = mp4;
                else if (fs.existsSync(jpg)) arquivoRank = jpg;
              }

              if (arquivoRank && arquivoRank.endsWith('.mp4')) {
                try {
                  await sock.sendMessage(from, { video: fs.readFileSync(arquivoRank), gifPlayback: true, caption: textoR, mentions: mentionsR }, { quoted: msg });
                } catch (e) {
                  await sock.sendMessage(from, { text: textoR, mentions: mentionsR }, { quoted: msg });
                }
              } else if (arquivoRank && arquivoRank.endsWith('.jpg')) {
                try {
                  await sock.sendMessage(from, { image: fs.readFileSync(arquivoRank), caption: textoR, mentions: mentionsR }, { quoted: msg });
                } catch (e) {
                  await sock.sendMessage(from, { text: textoR, mentions: mentionsR }, { quoted: msg });
                }
              } else {
                await sock.sendMessage(from, { text: textoR, mentions: mentionsR }, { quoted: msg });
              }
            } catch (errR) {
              console.error('Erro rank:', errR.message);
              await sock.sendMessage(from, { text: '❌ Erro ao fazer o ranking!' }, { quoted: msg });
            }
          }
          break;

        // ═══════════════════════════════════════════════
        //       🏴‍☠️ SISTEMA PIRATA
        // ═══════════════════════════════════════════════

        case 'meupirata':
        case 'pirata':
          {
            const u = pirataUser(sender);
            const ilha = acharIlha(u.ilhaAtual);
            const xpNec = xpProximoNivel(u.nivel);
            const xpPct = Math.floor((u.xp / xpNec) * 100);
            const arma = u.armaEquipada ? (ITENS_LOJA[u.armaEquipada]?.nome || u.armaEquipada) : 'Nenhuma';
            const armadura = u.armaduraEquipada ? (ITENS_LOJA[u.armaduraEquipada]?.nome || u.armaduraEquipada) : 'Nenhuma';
            const frutaNome = u.fruta ? (FRUTAS.find(f => f.id === u.fruta)?.nome || u.fruta) : 'Nenhuma';
            const hakiNome = u.haki ? (HAKIS.find(h => h.id === u.haki)?.nome || u.haki) : 'Nenhum';
            const racaNome = u.raca ? (RACAS.find(r => r.id === u.raca)?.nome || u.raca) : 'Nenhuma';

            let listaTrip = '';
            if (u.tripulacao.length === 0) {
              listaTrip = '│  💭 Nenhum tripulante ainda...\n│  💡 Use *!recrutar*\n';
            } else {
              u.tripulacao.forEach((t, i) => {
                const trip = TRIPULANTES.find(x => x.id === t.id) || t;
                listaTrip += '│  ' + (i+1) + '. ' + trip.emoji + ' ' + trip.nome + ' (Nv.' + trip.nivel + ')\n';
              });
            }

            let txt = '╔══════════════════════════════╗\n' +
                      '║   🏴‍☠️  𝐅𝐈𝐂𝐇𝐀  𝐃𝐎  𝐏𝐈𝐑𝐀𝐓𝐀  🏴‍☠️   ║\n' +
                      '╚══════════════════════════════╝\n\n' +
                      '╭─❖ 👤 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐂̧𝐎̃𝐄𝐒 ❖─╮\n│\n' +
                      '│  👤 Nome: ' + pushName + '\n' +
                      '│  🏆 Nível: ' + u.nivel + '\n' +
                      '│  ⭐ Título: ' + tituloNivel(u.nivel) + '\n' +
                      '│  💀 Procurado: ' + fmtNum(u.reputacao) + '\n' +
                      '│  🏝️ Ilha: ' + ilha.emoji + ' ' + ilha.nome + '\n│\n' +
                      '╰─────────────────────╯\n\n' +
                      '╭─❖ ⚔️ 𝐀𝐓𝐑𝐈𝐁𝐔𝐓𝐎𝐒 ❖─╮\n│\n' +
                      '│  ❤️ HP: ' + barraProgresso(u.hp, u.hpMax) + '\n' +
                      '│  ⚡ Energia: ' + barraProgresso(u.energia, u.energiaMax) + '\n' +
                      '│  ⭐ XP: ' + barraProgresso(u.xp, xpNec) + '\n' +
                      '│  💪 Força: ' + u.forca + '\n' +
                      '│  🗡️ Combate: ' + u.combate + '\n' +
                      '│  🛡️ Defesa: ' + u.defesa + '\n│\n' +
                      '╰─────────────────────╯\n\n' +
                      '╭─❖ 🎁 𝐄𝐐𝐔𝐈𝐏𝐀𝐌𝐄𝐍𝐓𝐎𝐒 ❖─╮\n│\n' +
                      '│  🗡️ Arma: ' + arma + '\n' +
                      '│  🛡️ Armadura: ' + armadura + '\n' +
                      '│  🍇 Fruta: ' + frutaNome + '\n' +
                      '│  🥋 Haki: ' + hakiNome + '\n' +
                      '│  🧬 Raça: ' + racaNome + '\n│\n' +
                      '╰─────────────────────╯\n\n' +
                      '╭─❖ ⚓ 𝐓𝐑𝐈𝐏𝐔𝐋𝐀𝐂̧𝐀̃𝐎 (' + u.tripulacao.length + '/8) ❖─╮\n│\n' +
                      listaTrip +
                      '│\n╰─────────────────────╯\n\n' +
                      '🌸 Shizuki Bot - MD 🌸';

            await sock.sendMessage(from, { text: txt, mentions: [sender] }, { quoted: msg });
          }
          break;

        case 'mapa':
          {
            const u = pirataUser(sender);
            let txt = '╔══════════════════════════════╗\n' +
                      '║   🗺️  𝐌𝐀𝐏𝐀  𝐃𝐎  𝐌𝐔𝐍𝐃𝐎  🗺️      ║\n' +
                      '╚══════════════════════════════╝\n\n';

            ILHAS.forEach(il => {
              const liberada = u.nivel >= il.nivelMin;
              txt += '╭─❖ ' + il.emoji + ' 𝐈𝐋𝐇𝐀 ❖─╮\n│\n';
              txt += '│  ' + il.nome + '\n';
              txt += '│  ' + (liberada ? '✅ Liberada' : '🔒 Bloqueada') + ' | Nv. ' + il.nivelMin + '+\n';
              txt += '│  👹 Boss: ' + il.boss + '\n';
              txt += '│  ' + (u.ilhaAtual === il.id ? '📍 Você está aqui' : '') + '\n';
              txt += '╰─────────────────────╯\n\n';
            });

            txt += '🌸 Shizuki Bot - MD 🌸';
            await sock.sendMessage(from, { text: txt, mentions: [sender] }, { quoted: msg });
          }
          break;

        case 'ilha':
          {
            const u = pirataUser(sender);
            const ilha = acharIlha(u.ilhaAtual);
            if (!ilha) { await sock.sendMessage(from, { text: '❌ Ilha inválida!' }, { quoted: msg }); break; }

            let txt = '╔══════════════════════════════╗\n' +
                      '║   ' + ilha.emoji + '  𝐈𝐋𝐇𝐀  𝐀𝐓𝐔𝐀𝐋  ' + ilha.emoji + '     ║\n' +
                      '╚══════════════════════════════╝\n\n' +
                      '📍 *' + ilha.nome + '*\n' +
                      '🏆 Nível mínimo: ' + ilha.nivelMin + '+\n' +
                      '⭐ XP base: ' + ilha.xpBase + '\n' +
                      '💰 Ouro base: ' + ilha.ouroBase + '\n\n' +
                      '╭─❖ 👹 𝐈𝐍𝐈𝐌𝐈𝐆𝐎𝐒 ❖─╮\n│\n';
            ilha.inimigos.forEach((ini, i) => {
              txt += '│  ' + (i+1) + '. ' + ini + '\n';
            });
            txt += '│\n╰─────────────────────╯\n\n';
            txt += '╭─❖ 👑 𝐁𝐎𝐒𝐒 ❖─╮\n│\n│  ' + ilha.boss + '\n│\n╰─────────────────────╯\n\n';
            txt += '💡 Use: *!lutar <inimigo>* ou *!boss*\n\n';
            txt += '🌸 Shizuki Bot - MD 🌸';

            await sock.sendMessage(from, { text: txt, mentions: [sender] }, { quoted: msg });
          }
          break;

        case 'navegar':
          {
            const u = pirataUser(sender);
            const destNome = args.join(' ').trim().toLowerCase();
            if (!destNome) {
              await sock.sendMessage(from, { text: '⚠️ Use: *!navegar <nome da ilha>*\n\nEx: *!navegar Alabasta*' }, { quoted: msg });
              break;
            }
            const ilDest = ILHAS.find(i => i.nome.toLowerCase().includes(destNome) || i.id === destNome);
            if (!ilDest) { await sock.sendMessage(from, { text: '❌ Ilha não encontrada!' }, { quoted: msg }); break; }
            if (u.ilhaAtual === ilDest.id) { await sock.sendMessage(from, { text: '📍 Você já está nessa ilha!' }, { quoted: msg }); break; }
            if (u.nivel < ilDest.nivelMin) { await sock.sendMessage(from, { text: '🔒 Você precisa ser nível *' + ilDest.nivelMin + '* pra ir nessa ilha!\n\n💡 Seu nível: *' + u.nivel + '*' }, { quoted: msg }); break; }
            if (u.energia < 20) { await sock.sendMessage(from, { text: '⚡ Energia insuficiente! Use *!dormir* ou *!meditar*.' }, { quoted: msg }); break; }

            // Se tiver barco, gasta menos energia
            const custoEnergia = u.barco ? Math.floor(20 * 0.5) : 20;
            u.energia -= custoEnergia;
            u.ilhaAtual = ilDest.id;
            salvarPirata(sender, u);

            await sock.sendMessage(from, {
              text: '╔══════════════════════════════╗\n' +
                    '║   🌊  𝐍𝐀𝐕𝐄𝐆𝐀𝐍𝐃𝐎...  🌊        ║\n' +
                    '╚══════════════════════════════╝\n\n' +
                    '🎯 Destino: ' + ilDest.emoji + ' *' + ilDest.nome + '*\n' +
                    '⚡ Energia gasta: *-' + custoEnergia + '*\n' +
                    '⚡ Energia restante: *' + u.energia + '/' + u.energiaMax + '*\n\n' +
                    '🏝️ *Você chegou em ' + ilDest.nome + '!*\n' +
                    '👹 Boss: ' + ilDest.boss + '\n\n' +
                    '🌸 Shizuki Bot - MD 🌸',
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        // Continua no próximo bloco

        case 'lutar':
          {
            const u = pirataUser(sender);
            const ilha = acharIlha(u.ilhaAtual);
            if (!ilha) { await sock.sendMessage(from, { text: '❌ Ilha inválida!' }, { quoted: msg }); break; }

            const alvoNome = args.join(' ').trim().toLowerCase();
            if (!alvoNome) {
              // Mostra inimigos disponíveis
              let txt = '╔══════════════════════════════╗\n' +
                        '║   ⚔️  𝐈𝐍𝐈𝐌𝐈𝐆𝐎𝐒  𝐃𝐈𝐒𝐏𝐎𝐍𝐈́𝐕𝐄𝐈𝐒  ⚔️   ║\n' +
                        '╚══════════════════════════════╝\n\n' +
                        '🏝️ Ilha: ' + ilha.emoji + ' *' + ilha.nome + '*\n\n' +
                        '╭─❖ 👹 𝐄𝐒𝐂𝐎𝐋𝐇𝐀 ❖─╮\n│\n';
              ilha.inimigos.forEach((ini, i) => {
                txt += '│  ' + (i+1) + '. ' + ini + '\n';
              });
              txt += '│\n╰─────────────────────╯\n\n';
              txt += '💡 Use: *!lutar <nome do inimigo>*\n\n';
              txt += '🌸 Shizuki Bot - MD 🌸';
              await sock.sendMessage(from, { text: txt, mentions: [sender] }, { quoted: msg });
              break;
            }

            // Acha o inimigo
            const iniNome = ilha.inimigos.find(i => i.toLowerCase().includes(alvoNome));
            if (!iniNome) { await sock.sendMessage(from, { text: '❌ Inimigo não encontrado nessa ilha!' }, { quoted: msg }); break; }
            if (u.energia < 10) { await sock.sendMessage(from, { text: '⚡ Energia insuficiente! Use *!dormir* ou *!meditar*.' }, { quoted: msg }); break; }
            if (u.hp <= 0) { await sock.sendMessage(from, { text: '💀 Você está morto! Use *!descansar pra recuperar HP.' }, { quoted: msg }); break; }

            // Stats do inimigo (baseado na ilha)
            const nivelIni = ilha.nivelMin + Math.floor(Math.random() * 5);
            const inimigo = {
              nome: iniNome,
              forca: Math.floor(ilha.nivelMin * 3 + Math.random() * 20),
              defesa: Math.floor(ilha.nivelMin * 1.5 + Math.random() * 10),
              hp: Math.floor(50 + ilha.nivelMin * 5)
            };

            // Cria cópia do player pra batalha
            let pForca = u.forca + u.combate;
            let pDefesa = u.defesa;
            if (u.armaEquipada) pForca += (ITENS_LOJA[u.armaEquipada]?.forca || 0);
            if (u.armaduraEquipada) pDefesa += (ITENS_LOJA[u.armaduraEquipada]?.defesa || 0);

            let pHp = u.hp;
            let iHp = inimigo.hp;
            let rodadas = '';
            let turno = 1;

            // Loop de batalha (máximo 10 rodadas)
            while (pHp > 0 && iHp > 0 && turno <= 10) {
              // Player ataca
              const danoP = Math.max(5, Math.floor((pForca * 1.5 - inimigo.defesa) * (0.8 + Math.random() * 0.4)));
              const critico = Math.random() < 0.15;
              const danoFinal = critico ? Math.floor(danoP * 1.5) : danoP;
              iHp -= danoFinal;
              rodadas += '⚔️ Você ataca! (-' + danoFinal + (critico ? ' CRÍTICO!' : '') + ')\n';
              if (iHp <= 0) { rodadas += '👹 DERROTADO!\n'; break; }
              rodadas += '   👹 Inimigo: ' + Math.max(0, iHp) + '/' + inimigo.hp + '\n\n';

              // Inimigo ataca
              const danoI = Math.max(3, Math.floor((inimigo.forca - pDefesa) * (0.8 + Math.random() * 0.4)));
              pHp -= danoI;
              rodadas += '👹 Inimigo ataca! (-' + danoI + ')\n';
              if (pHp <= 0) { rodadas += '💀 VOCÊ CAIU!\n'; break; }
              rodadas += '   ❤️ Você: ' + Math.max(0, pHp) + '/' + u.hpMax + '\n\n';
              turno++;
            }

            u.energia -= 10;
            u.hp = Math.max(0, pHp);

            if (iHp <= 0) {
              // VITÓRIA
              const xpGanha = ilha.xpBase + Math.floor(Math.random() * 50);
              const ouroGanha = ilha.ouroBase + Math.floor(Math.random() * 30);
              const repGanha = Math.floor(xpGanha / 10);
              u.xp += xpGanha;
              u.ouro += ouroGanha;
              u.reputacao += repGanha;
              // Chance de subir stats
              const subiuForca = Math.random() < 0.3;
              const subiuCombate = Math.random() < 0.3;
              const subiuDefesa = Math.random() < 0.2;
              if (subiuForca) u.forca += 1;
              if (subiuCombate) u.combate += 1;
              if (subiuDefesa) u.defesa += 1;

              // Verifica level up
              let subiuNivel = false;
              while (u.xp >= xpProximoNivel(u.nivel)) {
                u.xp -= xpProximoNivel(u.nivel);
                u.nivel += 1;
                u.hpMax += 10;
                u.hp = u.hpMax;
                u.forca += 2;
                u.combate += 1;
                u.defesa += 1;
                subiuNivel = true;
              }
              salvarPirata(sender, u);

              let txtFinal = '╔══════════════════════════════╗\n' +
                             '║   ⚔️  𝐁𝐀𝐓𝐀𝐋𝐇𝐀  ⚔️              ║\n' +
                             '╚══════════════════════════════╝\n\n' +
                             '🏴‍☠️ *' + pushName + '* vs 👹 *' + iniNome + '*\n\n' +
                             '╭─❖ 🔥 𝐑𝐎𝐔𝐍𝐃𝐒 ❖─╮\n│\n' +
                             rodadas.replace(/\n/g, '\n│  ') + '│\n╰─────────────────────╯\n\n' +
                             '╭─❖ 🎁 𝐑𝐄𝐂𝐎𝐌𝐏𝐄𝐍𝐒𝐀𝐒 ❖─╮\n│\n' +
                             '│  ⭐ +' + xpGanha + ' XP\n' +
                             '│  💰 +' + ouroGanha + ' berries\n' +
                             '│  💀 +' + repGanha + ' procurado\n';
              if (subiuForca) txtFinal += '│  💪 +1 Força\n';
              if (subiuCombate) txtFinal += '│  🗡️ +1 Combate\n';
              if (subiuDefesa) txtFinal += '│  🛡️ +1 Defesa\n';
              if (subiuNivel) txtFinal += '│  🎉 SUBIU PRA NÍVEL ' + u.nivel + '!\n';
              txtFinal += '│\n╰─────────────────────╯\n\n' +
                          '❤️ HP: ' + u.hp + '/' + u.hpMax + '\n' +
                          '⚡ Energia: ' + u.energia + '/' + u.energiaMax + '\n\n' +
                          '🌸 Shizuki Bot - MD 🌸';

              await sock.sendMessage(from, { text: txtFinal, mentions: [sender] }, { quoted: msg });
            } else {
              // DERROTA
              const perdaRep = Math.floor(u.reputacao * 0.1);
              const perdaOuro = Math.floor(u.ouro * 0.2);
              u.reputacao = Math.max(0, u.reputacao - perdaRep);
              u.ouro = Math.max(0, u.ouro - perdaOuro);
              const morreu = u.hp <= 0;
              if (morreu) { u.hp = 0; }
              salvarPirata(sender, u);

              let txtDerrota = '╔══════════════════════════════╗\n' +
                               '║   💀  𝐃𝐄𝐑𝐑𝐎𝐓𝐀  💀              ║\n' +
                               '╚══════════════════════════════╝\n\n' +
                               '╭─❖ 💔 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎 ❖─╮\n│\n' +
                               '│  💔 Você perdeu pra *' + iniNome + '*!\n' +
                               '│  📉 -' + perdaRep + ' procurado\n' +
                               '│  💰 -' + perdaOuro + ' berries\n';
              if (morreu) txtDerrota += '│  💀 *VOCÊ MORREU!*\n│  💡 Use *!descansar pra recuperar\n';
              else txtDerrota += '│  ❤️ HP restante: ' + u.hp + '/' + u.hpMax + '\n';
              txtDerrota += '│\n╰─────────────────────╯\n\n';
              txtDerrota += '🌸 Shizuki Bot - MD 🌸';

              await sock.sendMessage(from, { text: txtDerrota, mentions: [sender] }, { quoted: msg });
            }
          }
          break;

        case 'boss':
          {
            const u = pirataUser(sender);
            const ilha = acharIlha(u.ilhaAtual);
            if (!ilha) { await sock.sendMessage(from, { text: '❌ Ilha inválida!' }, { quoted: msg }); break; }
            if (u.energia < 30) { await sock.sendMessage(from, { text: '⚡ Precisa de 30 energia pro boss! Use *!dormir*.' }, { quoted: msg }); break; }
            if (u.hp <= 0) { await sock.sendMessage(from, { text: '💀 Você está morto! Use *!descansar pra recuperar HP.' }, { quoted: msg }); break; }
            if (u.bossesDerrotados && u.bossesDerrotados.includes(ilha.id)) {
              await sock.sendMessage(from, { text: '👑 Você já derrotou o boss *' + ilha.boss + '* dessa ilha!' }, { quoted: msg });
              break;
            }

            // Boss é MUITO forte
            const boss = {
              nome: ilha.boss,
              forca: ilha.nivelMin * 6 + 50,
              defesa: ilha.nivelMin * 3 + 30,
              hp: 200 + ilha.nivelMin * 15
            };

            let pForca = u.forca + u.combate;
            let pDefesa = u.defesa;
            if (u.armaEquipada) pForca += (ITENS_LOJA[u.armaEquipada]?.forca || 0);
            if (u.armaduraEquipada) pDefesa += (ITENS_LOJA[u.armaduraEquipada]?.defesa || 0);
            if (u.fruta) { const fr = FRUTAS.find(f => f.id === u.fruta); if (fr && fr.bonus) { pForca += (fr.bonus.forca || 0); pDefesa += (fr.bonus.defesa || 0); } }

            let pHp = u.hp;
            let iHp = boss.hp;
            let rodadas = '';
            let turno = 1;

            while (pHp > 0 && iHp > 0 && turno <= 20) {
              const danoP = Math.max(5, Math.floor((pForca * 1.5 - boss.defesa) * (0.8 + Math.random() * 0.4)));
              const critico = Math.random() < 0.2;
              const danoFinal = critico ? Math.floor(danoP * 1.8) : danoP;
              iHp -= danoFinal;
              rodadas += '⚔️ Você ataca! (-' + danoFinal + (critico ? ' CRÍTICO!' : '') + ')\n';
              if (iHp <= 0) { rodadas += '👑 BOSS DERROTADO!\n'; break; }
              rodadas += '   👹 ' + boss.nome + ': ' + Math.max(0, iHp) + '/' + boss.hp + '\n\n';

              const danoI = Math.max(5, Math.floor((boss.forca - pDefesa) * (0.8 + Math.random() * 0.4)));
              pHp -= danoI;
              rodadas += '👹 ' + boss.nome + ' ataca! (-' + danoI + ')\n';
              if (pHp <= 0) { rodadas += '💀 VOCÊ CAIU!\n'; break; }
              rodadas += '   ❤️ Você: ' + Math.max(0, pHp) + '/' + u.hpMax + '\n\n';
              turno++;
            }

            u.energia -= 30;
            u.hp = Math.max(0, pHp);

            if (iHp <= 0) {
              // VITÓRIA ÉPICA
              const xpGanha = ilha.xpBase * 5;
              const ouroGanha = ilha.ouroBase * 5;
              const repGanha = Math.floor(xpGanha / 5);
              u.xp += xpGanha;
              u.ouro += ouroGanha;
              u.reputacao += repGanha;
              u.bossesDerrotados = u.bossesDerrotados || [];
              u.bossesDerrotados.push(ilha.id);

              let subiuNivel = false;
              while (u.xp >= xpProximoNivel(u.nivel)) {
                u.xp -= xpProximoNivel(u.nivel);
                u.nivel += 1;
                u.hpMax += 10;
                u.hp = u.hpMax;
                u.forca += 3;
                u.combate += 2;
                u.defesa += 2;
                subiuNivel = true;
              }
              salvarPirata(sender, u);

              let txtFinal = '╔══════════════════════════════╗\n' +
                             '║   👑  𝐁𝐎𝐒𝐒  𝐃𝐄𝐑𝐑𝐎𝐓𝐀𝐃𝐎!  👑       ║\n' +
                             '╚══════════════════════════════╝\n\n' +
                             '🏴‍☠️ *' + pushName + '* derrotou *' + boss.nome + '*!\n\n' +
                             '╭─❖ 🔥 𝐑𝐎𝐔𝐍𝐃𝐒 ❖─╮\n│\n' +
                             rodadas.replace(/\n/g, '\n│  ') + '│\n╰─────────────────────╯\n\n' +
                             '╭─❖ 🎁 𝐑𝐄𝐂𝐎𝐌𝐏𝐄𝐍𝐒𝐀𝐒 ❖─╮\n│\n' +
                             '│  ⭐ +' + xpGanha + ' XP (MUITO!)\n' +
                             '│  💰 +' + ouroGanha + ' berries\n' +
                             '│  💀 +' + repGanha + ' procurado\n';
              if (subiuNivel) txtFinal += '│  🎉 SUBIU PRA NÍVEL ' + u.nivel + '!\n';
              txtFinal += '│\n╰─────────────────────╯\n\n' +
                          '❤️ HP: ' + u.hp + '/' + u.hpMax + '\n' +
                          '⚡ Energia: ' + u.energia + '/' + u.energiaMax + '\n\n' +
                          '🌸 Shizuki Bot - MD 🌸';

              await sock.sendMessage(from, { text: txtFinal, mentions: [sender] }, { quoted: msg });
            } else {
              // DERROTA
              const perdaRep = Math.floor(u.reputacao * 0.15);
              const perdaOuro = Math.floor(u.ouro * 0.25);
              u.reputacao = Math.max(0, u.reputacao - perdaRep);
              u.ouro = Math.max(0, u.ouro - perdaOuro);
              const morreu = u.hp <= 0;
              if (morreu) { u.hp = 0; }
              salvarPirata(sender, u);

              let txtDerrota = '╔══════════════════════════════╗\n' +
                               '║   💀  𝐃𝐄𝐑𝐑𝐎𝐓𝐀  💀              ║\n' +
                               '╚══════════════════════════════╝\n\n' +
                               '╭─❖ 💔 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎 ❖─╮\n│\n' +
                               '│  💔 Você perdeu pro boss *' + boss.nome + '*!\n' +
                               '│  📉 -' + perdaRep + ' procurado\n' +
                               '│  💰 -' + perdaOuro + ' berries\n';
              if (morreu) txtDerrota += '│  💀 *VOCÊ MORREU!*\n│  💡 Use *!descansar pra recuperar\n';
              txtDerrota += '│\n╰─────────────────────╯\n\n';
              txtDerrota += '🌸 Shizuki Bot - MD 🌸';

              await sock.sendMessage(from, { text: txtDerrota, mentions: [sender] }, { quoted: msg });
            }
          }
          break;

        case 'menupirata':
        case 'pirata':
          {
            const u = pirataUser(sender);
            const ilha = acharIlha(u.ilhaAtual);
            const menuPir =
              '╔══════════════════════════════╗\n' +
              '║   🏴‍☠️  𝐌𝐄𝐍𝐔  𝐏𝐈𝐑𝐀𝐓𝐀  🏴‍☠️          ║\n' +
              '╚══════════════════════════════╝\n\n' +
              '╭─❖ 👤 𝐏𝐄𝐑𝐅𝐈𝐋 ❖─╮\n│\n' +
              '│  💜 !meupirata\n' +
              '│  💜 !procurado\n' +
              '│  💜 !mapa\n' +
              '│  💜 !ilha\n' +
              '│  💜 !navegar <ilha>\n│\n' +
              '╰─────────────────────╯\n\n' +
              '╭─❖ ⚔️ 𝐂𝐎𝐌𝐁𝐀𝐓𝐄 ❖─╮\n│\n' +
              '│  💜 !lutar <inimigo>\n' +
              '│  💜 !boss\n' +
              '│  💜 !treinar\n│\n' +
              '╰─────────────────────╯\n\n' +
              '╭─❖ 🍇 𝐒𝐎𝐑𝐓𝐄 ❖─╮\n│\n' +
              '│  💜 !girarfruta (200)\n' +
              '│  💜 !girarhaki (Nv.20+)\n' +
              '│  💜 !girarraça (Nv.60+)\n│\n' +
              '╰─────────────────────╯\n\n' +
              '╭─❖ ⚓ 𝐓𝐑𝐈𝐏𝐔𝐋𝐀𝐂̧𝐀̃𝐎 ❖─╮\n│\n' +
              '│  💜 !recrutar\n' +
              '│  💜 !recrutar <nome>\n' +
              '│  💜 !meustripulantes\n' +
              '│  💜 !treinartripulacao\n' +
              '│  💜 !demitir <nome>\n│\n' +
              '╰─────────────────────╯\n\n' +
              '╭─❖ 🛒 𝐋𝐎𝐉𝐀 ❖─╮\n│\n' +
              '│  💜 !loja\n' +
              '│  💜 !lojabarcos\n' +
              '│  💜 !comprar <item>\n' +
              '│  💜 !comprarbarco <nome>\n' +
              '│  💜 !inventario\n' +
              '│  💜 !vender <item>\n' +
              '│  💜 !equipar <item>\n│\n' +
              '╰─────────────────────╯\n\n' +
              '╭─❖ 💤 𝐕𝐈𝐃𝐀 ❖─╮\n│\n' +
              '│  💜 !dormir\n' +
              '│  💜 !comer\n' +
              '│  💜 !meditar\n│\n' +
              '╰─────────────────────╯\n\n' +
              '╭─❖ 🏆 𝐑𝐀𝐍𝐊𝐈𝐍𝐆 ❖─╮\n│\n' +
              '│  💜 !topiratas\n│\n' +
              '╰─────────────────────╯\n\n' +
              '📍 Ilha atual: ' + ilha.emoji + ' *' + ilha.nome + '*\n' +
              '🏆 Nível: *' + u.nivel + '*\n' +
              '💀 Procurado: *' + fmtNum(u.reputacao) + '*\n\n' +
              '🌸 Shizuki Bot - MD 🌸';

            await sock.sendMessage(from, { text: menuPir, mentions: [sender] }, { quoted: msg });
          }
          break;

        case 'play':
          {
            const buscaP = args.join(' ').trim();
            if (!buscaP) {
              await sock.sendMessage(from, { text: '╭━━━〔 🎵 𝐏𝐋𝐀𝐘 〕━━━╮\n┃\n┃ 💜 Pra tocar uma música, use:\n┃\n┃ 📝 *!play <nome>*\n┃\n┃ 💡 Ex: *!play nome da música*\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
              break;
            }
            const keyP = apiBronxys.getApiKey();
            if (!keyP) {
              await sock.sendMessage(from, { text: '╭━━━〔 🔑 𝐀𝐏𝐈 𝐍𝐄𝐂𝐄𝐒𝐒𝐀́𝐑𝐈𝐀 🔑 〕━━━╮\n┃\n┃ ❌ A API ainda não foi\n┃    configurada!\n┃\n┃ 💡 Use: *!apitoken SUA_CHAVE*\n┃ 💜 (só o dono pode configurar)\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
              break;
            }
            await sock.sendMessage(from, { text: '╭━━━〔 🔎 𝐁𝐔𝐒𝐂𝐀𝐍𝐃𝐎 〕━━━╮\n┃\n┃ 🎵 Procurando: *' + buscaP + '*\n┃\n┃ ⏳ Aguarde só um pouquinho...\n┃ 💜 Vou trazer pra você já já!\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
            try {
              const pesquisa = await apiBronxys.pesquisarYtb(buscaP);
              if (pesquisa.erro === 'sem_token') {
                await sock.sendMessage(from, { text: '🔑 API não configurada!' }, { quoted: msg });
                break;
              }
              if (pesquisa.erro === 'api_off') {
                await sock.sendMessage(from, { text: '╭━━━〔 🚫 𝐀𝐏𝐈 𝐄𝐒𝐆𝐎𝐓𝐀𝐃𝐀 🚫 〕━━━╮\n┃\n┃ ❌ A API atingiu o limite!\n┃\n┃ 📊 Status: *Fora de serviço*\n┃ ⏰ Volta em: *algumas horas*\n┃\n┃ 💜 Aguarde e tente de novo!\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
                break;
              }
              const infoMusica = pesquisa.data && pesquisa.data[0];
              if (!infoMusica) {
                await sock.sendMessage(from, { text: '❌ Não encontrei essa música!' }, { quoted: msg });
                break;
              }
              const audio = await apiBronxys.playAudio(buscaP);
              if (audio.erro === 'api_off') {
                await sock.sendMessage(from, { text: '╭━━━〔 🚫 𝐀𝐏𝐈 𝐄𝐒𝐆𝐎𝐓𝐀𝐃𝐀 🚫 〕━━━╮\n┃\n┃ ❌ A API atingiu o limite!\n┃\n┃ 💜 Aguarde e tente de novo!\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
                break;
              }
              if (!audio.ok) {
                await sock.sendMessage(from, { text: '❌ Erro ao baixar a música!' }, { quoted: msg });
                break;
              }
              const legendaP = '╭━━━〔 🎵 𝐏𝐋𝐀𝐘 〕━━━╮\n' +
                '┃\n' +
                '┃ 🎵 Título: *' + (infoMusica.titulo || buscaP) + '*\n' +
                '┃ ⏱️ Tempo: *' + (infoMusica.tempo || '?') + '*\n' +
                '┃ 📅 Postado: *' + (infoMusica.postado || '?') + '*\n' +
                '┃\n' +
                '╰━━━━━━━━━━━━━━━━━━╯';
              if (infoMusica.thumb) {
                try {
                  await sock.sendMessage(from, { image: { url: infoMusica.thumb }, caption: legendaP }, { quoted: msg });
                } catch (e) {
                  await sock.sendMessage(from, { text: legendaP }, { quoted: msg });
                }
              } else {
                await sock.sendMessage(from, { text: legendaP }, { quoted: msg });
              }
              await sock.sendMessage(from, {
                audio: audio.buffer,
                mimetype: 'audio/mp4',
                ptt: false,
                fileName: (infoMusica.titulo || buscaP).slice(0, 40) + '.mp3'
              }, { quoted: msg });
            } catch (e) {
              console.error('Erro play:', e.message);
              await sock.sendMessage(from, { text: '╭━━━〔 😢 𝐎𝐏𝐒... 〕━━━╮\n┃\n┃ ❌ Não consegui achar essa música!\n┃\n┃ 💡 Verifique o nome e tente de novo.\n┃\n┃ 💜 Prometo me esforçar mais!\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
            }
          }
          break;


        // ═══ TIKTOK ═══
        case 'tiktok':
        case 'ttk':
          {
            const urlTtk = args[0];
            if (!urlTtk) {
              await sock.sendMessage(from, { text: '╭━━━〔 🎵 𝐓𝐈𝐊𝐓𝐎𝐊 〕━━━╮\n┃\n┃ ⚠️ Manda o link do TikTok!\n┃\n┃ 💡 Ex: *!tiktok https://vt.tiktok.com/...*\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
              break;
            }
            if (!urlTtk.includes('tiktok.com')) {
              await sock.sendMessage(from, { text: '╭━━━〔 ⚠️ 𝐄𝐑𝐑𝐎 〕━━━╮\n┃\n┃ ❌ Isso não parece um link do TikTok!\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
              break;
            }
            await sock.sendMessage(from, { text: '╭━━━〔 🎵 𝐓𝐈𝐊𝐓𝐎𝐊 〕━━━╮\n┃\n┃ ⏳ Baixando o vídeo...\n┃ 💜 Só um instante~\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
            try {
              const apiUrl = 'https://www.tikwm.com/api/?url=' + encodeURIComponent(urlTtk);
              const resp = await fetch(apiUrl, { signal: AbortSignal.timeout(30000) });
              const json = await resp.json();
              if (json.code !== 0 || !json.data || !json.data.play) {
                await sock.sendMessage(from, { text: '╭━━━〔 ⚠️ 𝐄𝐑𝐑𝐎 〕━━━╮\n┃\n┃ ❌ Não consegui baixar esse vídeo!\n┃\n┃ 💡 Verifica o link!\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
                break;
              }
              const videoUrl = json.data.hdplay || json.data.play;
              const titulo = (json.data.title || 'Vídeo do TikTok').slice(0, 120);
              const autor = json.data.author?.unique_id || 'desconhecido';
              const duracao = json.data.duration || 0;
              const views = json.data.play_count || 0;
              const likes = json.data.digg_count || 0;
              const comentarios = json.data.comment_count || 0;
              function fmtNum(n) {
                if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
                if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
                return String(n);
              }
              const videoResp = await fetch(videoUrl, { signal: AbortSignal.timeout(90000) });
              const videoBuf = Buffer.from(await videoResp.arrayBuffer());
              const TAMANHO_MAX = 16 * 1024 * 1024;
              if (videoBuf.length > TAMANHO_MAX) {
                const tamMB = (videoBuf.length / 1024 / 1024).toFixed(1);
                await sock.sendMessage(from, { text: '╭━━━〔 ⚠️ 𝐕𝐈𝐃𝐄𝐎 𝐆𝐑𝐀𝐍𝐃𝐄 〕━━━╮\n┃\n┃ ❌ Esse vídeo é muito grande!\n┃ 📦 Tamanho: ' + tamMB + ' MB\n┃ 📏 Limite: 16 MB\n┃\n┃ 💡 Tenta um vídeo mais curto!\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
                break;
              }
              const legenda = '╭━━━〔 🎵 𝐓𝐈𝐊𝐓𝐎𝐊 〕━━━╮\n┃\n┃ 👤 Autor: @' + autor + '\n┃ 📝 ' + titulo + '\n┃\n┣━━━〔 📊 𝐄𝐒𝐓𝐀𝐓𝐈́𝐒𝐓𝐈𝐂𝐀𝐒 〕━━━\n┃\n┃ ⏱️ Duração: ' + duracao + 's\n┃ 👀 Views: ' + fmtNum(views) + '\n┃ ❤️ Curtidas: ' + fmtNum(likes) + '\n┃ 💬 Comentários: ' + fmtNum(comentarios) + '\n┃\n╰━━━━━━━━━━━━━━━━━━╯\n💜 Shizuki Bot';
              await sock.sendMessage(from, { video: videoBuf, caption: legenda, mimetype: 'video/mp4' }, { quoted: msg });
            } catch (e) {
              console.error('Erro no !tiktok:', e.message);
              await sock.sendMessage(from, { text: '╭━━━〔 ⚠️ 𝐄𝐑𝐑𝐎 〕━━━╮\n┃\n┃ ❌ Deu erro ao baixar!\n┃\n┃ 💡 Tenta de novo mais tarde.\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
            }
          }
          break;

// COMANDO API
        case 'api':
          {
            if (!isDonoReal) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono pode configurar a API!' }, { quoted: msg });
              break;
            }
            const chave = args.join(' ').trim();
            if (!chave) {
              const cfgAtual = carregarConfig();
              const atual = cfgAtual.apiKey ? cfgAtual.apiKey.slice(0, 8) + '...' : '_não configurada_';
              await sock.sendMessage(from, {
                text: `╭━━━〔 🔑 𝐀𝐏𝐈 〕━━━╮\n┃\n` +
                      `┃ 💜 Configuração da API\n┃\n` +
                      `┃ 📝 Use: *!api SUA_CHAVE_AQUI*\n┃\n` +
                      `┃ 🔒 Chave atual: *${atual}*\n┃\n` +
                      `╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
              break;
            }
            const cfgNovo = carregarConfig();
            cfgNovo.apiKey = chave;
            salvarConfig(cfgNovo);
            await sock.sendMessage(from, {
              text: `╭━━━〔 ✅ 𝐀𝐏𝐈 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐃𝐀! 〕━━━╮\n┃\n` +
                    `┃ 🔑 Chave salva com sucesso!\n┃\n` +
                    `┃ 🎵 O comando *!play* já tá pronto!\n┃\n` +
                    `╰━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
          }
          break;


// MODERACAO — CASES
        // ═══════════════════════════════════════════════
        //           MODERAÇÃO — COMANDOS
        // ═══════════════════════════════════════════════

        case 'antilink':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }

            const db = modDB(FILE_ANTILINK);
            db[from] = db[from] || {};
            const sub = (args[0] || '').toLowerCase();

            if (sub === 'on') db[from].ativo = true;
            else if (sub === 'off') db[from].ativo = false;
            else db[from].ativo = !db[from].ativo;

            salvarModDB(FILE_ANTILINK, db);

            if (db[from].ativo) {
              await sock.sendMessage(from, {
                text: `╭━━━〔 🔗 𝐀𝐍𝐓𝐈-𝐋𝐈𝐍𝐊 〕━━━╮\n┃\n┃ ✅ *ATIVADO!*\n┃\n┃ 🚫 Links enviados por membros\n┃    serão *deletados*.\n┃\n┃ ⚠️ Autor ganha *+1 adv*.\n┃ 👑 Adms e dono estão livres.\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
            } else {
              await sock.sendMessage(from, {
                text: `╭━━━〔 🔗 𝐀𝐍𝐓𝐈-𝐋𝐈𝐍𝐊 〕━━━╮\n┃\n┃ ❌ *DESATIVADO!*\n┃\n┃ 💜 Agora todos podem mandar links.\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
            }
          }
          break;

        case 'antiflood':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }

            const db = modDB(FILE_ANTIFLOOD);
            db[from] = db[from] || {};
            const sub = (args[0] || '').toLowerCase();

            if (sub === 'on') db[from].ativo = true;
            else if (sub === 'off') db[from].ativo = false;
            else db[from].ativo = !db[from].ativo;

            salvarModDB(FILE_ANTIFLOOD, db);

            if (db[from].ativo) {
              await sock.sendMessage(from, {
                text: `╭━━━〔 🌊 𝐀𝐍𝐓𝐈-𝐅𝐋𝐎𝐎𝐃 〕━━━╮\n┃\n┃ ✅ *ATIVADO!*\n┃\n┃ 🚫 5 mensagens em 5 segundos = flood.\n┃ ⚠️ Autor ganha *+1 adv* e\n┃    é *silenciado por 5 min*.\n┃ 👑 Adms e dono estão livres.\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
            } else {
              await sock.sendMessage(from, {
                text: `╭━━━〔 🌊 𝐀𝐍𝐓𝐈-𝐅𝐋𝐎𝐎𝐃 〕━━━╮\n┃\n┃ ❌ *DESATIVADO!*\n┃\n┃ 💜 Agora todos podem mandar\n┃    mensagens livremente.\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
            }
          }
          break;

        case 'blacklist', 'antistatus', 'antipromocao', 'antifake', 'antiporn', 'antipalavrao', 'antivideo', 'antiimagem', 'antisticker', 'antiemoji', 'mododivertido', 'modonatal', 'modohalloween', 'historico', 'hist', 'add', 'infogp', 'infogrupo', 'topmembros', 'apresentar', 'fundosaiu', 'setbye', 'legendasaiu', 'setlegendasaida', 'fakechat', 'frase', 'modoparceria', 'addparceria', 'rmparceria', 'listarparcerias', 'parcerias', 'marcartodos', 'apagar', 'regras', 'advertidos', 'listaradv', 'promoverall', 'rebaixarall':
        case 'bl':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }

            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;
            if (!alvo) {
              await sock.sendMessage(from, { text: '⚠️ Marque a pessoa!\n\nEx: `!blacklist @pessoa`' }, { quoted: msg });
              break;
            }

            const db = modDB(FILE_BLACKLIST);
            db[from] = db[from] || [];
            const idx = db[from].indexOf(alvo);

            if (idx >= 0) {
              db[from].splice(idx, 1);
              salvarModDB(FILE_BLACKLIST, db);
              await sock.sendMessage(from, {
                text: `✅ *REMOVIDO DA BLACKLIST!*\n\n👤 @${alvo.split('@')[0]} pode usar o bot novamente.`,
                mentions: [alvo]
              }, { quoted: msg });
            } else {
              db[from].push(alvo);
              salvarModDB(FILE_BLACKLIST, db);
              await sock.sendMessage(from, {
                text: `🚫 *BLACKLIST!*\n\n👤 @${alvo.split('@')[0]} foi banido(a) do bot neste grupo.\n\n💜 Nenhum comando vai funcionar pra ele(a).`,
                mentions: [alvo]
              }, { quoted: msg });
            }
          }
          break;


// ADM PACOTE 3
        // ═══════════════════════════════════════════════
        //        COMANDOS ADM — PACOTE 3
        // ═══════════════════════════════════════════════

        case 'marcartodos':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            const txt = args.join(' ').trim();
            if (!txt) {
              await sock.sendMessage(from, { text: '⚠️ Escreva o texto!\n\nEx: `!marcartodos Reunião hoje às 20h`' }, { quoted: msg });
              break;
            }
            const ids = gm.participants.map(p => p.id);
            let listaMencoes = ids.map(id => '@' + id.split('@')[0]).join(' ');
            await sock.sendMessage(from, {
              text: `📢 *𝐌𝐀𝐑𝐂𝐀𝐍𝐃𝐎 𝐓𝐎𝐃𝐎𝐒!* 📢\n\n${txt}\n\n${listaMencoes}`,
              mentions: ids
            }, { quoted: msg });
          }
          break;

        case 'apagar':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            const ctxAp = msg.message.extendedTextMessage?.contextInfo;
            const marcada = ctxAp?.stanzaId;
            if (marcada) {
              try {
                await sock.sendMessage(from, { delete: { remoteJid: from, fromMe: false, id: marcada, participant: ctxAp.participant || sender } });
                await sock.sendMessage(from, { delete: msg.key });
              } catch (e) {
                await sock.sendMessage(from, { text: '❌ Não consegui apagar (só posso apagar do bot ou se eu for adm).' }, { quoted: msg });
              }
              break;
            }
            const qtd = parseInt(args[0] || '5', 10);
            if (!qtd || qtd < 1 || qtd > 30) {
              await sock.sendMessage(from, { text: '⚠️ Use: `!apagar 5` (máx 30)' }, { quoted: msg });
              break;
            }
            await sock.sendMessage(from, { text: `🗑️ Apagando as últimas *${qtd}* mensagens do bot...` }, { quoted: msg });
          }
          break;

        case 'regras':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }

            const db = carregarJSON('./regras.json');
            const txt = args.join(' ').trim();

            if (!txt) {
              if (db[from]) {
                await sock.sendMessage(from, {
                  text: `╭━━━〔 📜 𝐑𝐄𝐆𝐑𝐀𝐒 𝐃𝐎 𝐆𝐑𝐔𝐏𝐎 〕━━━╮\n┃\n${db[from].split('\n').map(l => '┃ ' + l).join('\n')}\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
                }, { quoted: msg });
              } else {
                await sock.sendMessage(from, { text: '📜 Nenhuma regra definida!\n\n💡 Use: `!regras <texto>` pra definir.' }, { quoted: msg });
              }
              break;
            }

            db[from] = txt;
            salvarJSON('./regras.json', db);
            await sock.sendMessage(from, {
              text: `╭━━━〔 ✅ 𝐑𝐄𝐆𝐑𝐀𝐒 𝐒𝐀𝐋𝐕𝐀𝐒 〕━━━╮\n┃\n${txt.split('\n').map(l => '┃ ' + l).join('\n')}\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
          }
          break;

        case 'advertidos':
        case 'listaradv':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            const advs = carregarJSON(FILE_ADVS);
            const doGrupo = advs[from] || {};
            const ids = Object.keys(doGrupo);
            if (!ids.length) {
              await sock.sendMessage(from, { text: '✅ Nenhum membro com advertência!' }, { quoted: msg });
              break;
            }
            let txt = `╭━━━〔 ⚠️ 𝐀𝐃𝐕𝐄𝐑𝐓𝐈𝐃𝐎𝐒 ⚠️ 〕━━━╮\n┃\n`;
            ids.forEach(j => {
              const qtd = doGrupo[j];
              const emoji = qtd >= 2 ? '🔴' : qtd >= 1 ? '🟡' : '⚪';
              txt += `┃ ${emoji} @${j.split('@')[0]} ➜ *${qtd}/3*\n`;
            });
            txt += `┃\n╰━━━━━━━━━━━━━━━━━━╯`;
            await sock.sendMessage(from, { text: txt, mentions: ids }, { quoted: msg });
          }
          break;

        case 'promoverall':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            const naoAdm = gm.participants.filter(p => !p.admin).map(p => p.id);
            if (!naoAdm.length) {
              await sock.sendMessage(from, { text: 'ℹ️ Todos já são admins!' }, { quoted: msg });
              break;
            }
            await sock.sendMessage(from, { text: `⏳ Promovendo *${naoAdm.length}* membros...` }, { quoted: msg });
            try {
              for (const jid of naoAdm) {
                try { await sock.groupParticipantsUpdate(from, [jid], 'promote'); } catch (e) {}
                await new Promise(r => setTimeout(r, 500));
              }
              await sock.sendMessage(from, { text: `✅ *${naoAdm.length}* membros promovidos!` }, { quoted: msg });
            } catch (e) {
              await sock.sendMessage(from, { text: '❌ Erro ao promover. O bot precisa ser admin!' }, { quoted: msg });
            }
          }
          break;

        case 'rebaixarall':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            const criadorGp = gm.owner || (gm.participants.find(p => p.admin === 'superadmin')?.id);
            const admins = gm.participants.filter(p => p.admin && p.id !== criadorGp).map(p => p.id);
            if (!admins.length) {
              await sock.sendMessage(from, { text: 'ℹ️ Nenhum admin pra rebaixar (fora o criador).' }, { quoted: msg });
              break;
            }
            await sock.sendMessage(from, { text: `⏳ Rebaixando *${admins.length}* admins...` }, { quoted: msg });
            try {
              for (const jid of admins) {
                try { await sock.groupParticipantsUpdate(from, [jid], 'demote'); } catch (e) {}
                await new Promise(r => setTimeout(r, 500));
              }
              await sock.sendMessage(from, { text: `✅ *${admins.length}* admins rebaixados!` }, { quoted: msg });
            } catch (e) {
              await sock.sendMessage(from, { text: '❌ Erro. O bot precisa ser admin!' }, { quoted: msg });
            }
          }
          break;

        // ENCERRAR REMOVIDO


// MODO PARCERIA
        // ═══════════════════════════════════════════════
        //           MODO PARCERIA
        // ═══════════════════════════════════════════════

        case 'modoparceria':
          {
            if (!isGroup) break;
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) {
              await sock.sendMessage(from, {
                text: `╭━━━〔 🚫 𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎 〕━━━╮\n┃\n┃ 💔 Apenas *admins*, *líderes*\n┃    e o *dono* podem usar isso!\n┃\n┃ 🕊️ Peça ajuda a um deles~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
              break;
            }

            const db = carregarJSON('./parcerias.json');
            db[from] = db[from] || { ativo: false, parceiros: {} };
            const sub = (args[0] || '').toLowerCase();

            if (sub === 'on') db[from].ativo = true;
            else if (sub === 'off') db[from].ativo = false;
            else db[from].ativo = !db[from].ativo;

            salvarJSON('./parcerias.json', db);

            if (sub === 'on' || (!sub && db[from].ativo)) {
              await sock.sendMessage(from, {
                text: `╭━━━〔 🤝 𝐌𝐎𝐃𝐎 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀 〕━━━╮\n┃\n┃ 💜 *Ativado com sucesso~* ✨\n┃\n┃ 🔗 Agora só quem tem parceria\n┃    pode compartilhar links aqui!\n┃\n┃ 💡 Use: *!addparceria @pessoa <qtd>*\n┃\n┃ 🕊️ Tudo pronto pra começar~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
            } else if (sub === 'off' || (!sub && !db[from].ativo)) {
              await sock.sendMessage(from, {
                text: `╭━━━〔 🤝 𝐌𝐎𝐃𝐎 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀 〕━━━╮\n┃\n┃ 💤 *Desativado~*\n┃\n┃ 🔗 Agora todos podem\n┃    mandar links livremente! 🕊️\n┃\n┃ 💜 O modo parceria deu\n┃    uma pausa neste grupo~\n┃\n┃ ✨ Até a próxima!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
            } else {
              const status = db[from].ativo ? '✅ Ativo' : '❌ Desativado';
              await sock.sendMessage(from, {
                text: `╭━━━〔 🤝 𝐌𝐎𝐃𝐎 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀 〕━━━╮\n┃\n┃ 🔘 Status: *${status}* 💜\n┃\n┃ 🔗 Só quem tem parceria\n┃    pode compartilhar links~\n┃\n┃ 💡 Use: *!modoparceria on/off*\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
            }
          }
          break;

        case 'addparceria':
          {
            if (!isGroup) break;
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            const ehLider = (config.lideres || []).some(l => l && String(l).split('@')[0] === sender.split('@')[0]);
            if (!ehAdm && !ehLider && !isDono) {
              await sock.sendMessage(from, {
                text: `╭━━━〔 🚫 𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎 〕━━━╮\n┃\n┃ 💔 Apenas *admins*, *líderes*\n┃    e o *dono* podem usar isso!\n┃\n┃ 🕊️ Peça ajuda a um deles~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
              break;
            }

            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;
            if (!alvo) {
              await sock.sendMessage(from, { text: '⚠️ *Oops!* Marque a pessoa!\n\n💡 Ex: *!addparceria @pessoa 5*' }, { quoted: msg });
              break;
            }
            const qtd = parseInt(args.find(a => /^\d+$/.test(a)) || '0', 10);
            if (!qtd || qtd < 1 || qtd > 999) {
              await sock.sendMessage(from, { text: '⚠️ *Oops!* Informe a quantidade de links (1 a 999)!\n\n💡 Ex: *!addparceria @pessoa 5*' }, { quoted: msg });
              break;
            }

            const db = carregarJSON('./parcerias.json');
            db[from] = db[from] || { ativo: false, parceiros: {} };
            db[from].parceiros = db[from].parceiros || {};

            if (db[from].parceiros[alvo]) {
              await sock.sendMessage(from, {
                text: `╭━━━〔 ⚠️ 𝐉𝐀́ 𝐓𝐄𝐌 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀 〕━━━╮\n┃\n┃ 💜 @${alvo.split('@')[0]} já tem uma\n┃    parceria ativa! ✨\n┃\n┃ 📊 Links liberados: *${db[from].parceiros[alvo].total}*\n┃\n┃ 🕊️ Se quiser mudar, use\n┃    *!rmparceria* primeiro~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                mentions: [alvo]
              }, { quoted: msg });
              break;
            }

            db[from].parceiros[alvo] = { total: qtd, usados: 0, desde: Date.now() };
            salvarJSON('./parcerias.json', db);

            await sock.sendMessage(from, {
              text: `╭━━━〔 🤝 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀 𝐀𝐃𝐈𝐂𝐈𝐎𝐍𝐀𝐃𝐀 〕━━━╮\n┃\n┃ 💜 *Parceria criada com sucesso!* ✨\n┃\n┃ 👤 @${alvo.split('@')[0]}\n┃ 🔗 Links liberados: *${qtd}*\n┃\n┃ 🕊️ Enquanto tiver links,\n┃    pode divulgar no grupo~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [alvo]
            }, { quoted: msg });
          }
          break;

        case 'rmparceria':
          {
            if (!isGroup) break;
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            const ehLider = (config.lideres || []).some(l => l && String(l).split('@')[0] === sender.split('@')[0]);
            if (!ehAdm && !ehLider && !isDono) {
              await sock.sendMessage(from, {
                text: `╭━━━〔 🚫 𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎 〕━━━╮\n┃\n┃ 💔 Apenas *admins*, *líderes*\n┃    e o *dono* podem usar isso!\n┃\n┃ 🕊️ Peça ajuda a um deles~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
              break;
            }

            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;
            if (!alvo) {
              await sock.sendMessage(from, { text: '⚠️ *Oops!* Marque a pessoa!\n\n💡 Ex: *!rmparceria @pessoa*' }, { quoted: msg });
              break;
            }

            const db = carregarJSON('./parcerias.json');
            if (!db[from] || !db[from].parceiros || !db[from].parceiros[alvo]) {
              await sock.sendMessage(from, {
                text: `╭━━━〔 💔 𝐒𝐄𝐌 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀 〕━━━╮\n┃\n┃ 💜 Essa pessoa não tem\n┃    parceria neste grupo~\n┃\n┃ 🕊️ Use *!addparceria* pra criar!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
              break;
            }
            delete db[from].parceiros[alvo];
            salvarJSON('./parcerias.json', db);

            await sock.sendMessage(from, {
              text: `╭━━━〔 🤝 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐀 〕━━━╮\n┃\n┃ 💜 Até logo, @${alvo.split('@')[0]}!\n┃\n┃ ❌ A parceria foi removida\n┃    com sucesso. ✨\n┃\n┃ 🕊️ Agora você não tem mais\n┃    parceria neste grupo~\n┃\n┃ 💌 Se quiser voltar, é só\n┃    falar com um adm!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [alvo]
            }, { quoted: msg });
          }
          break;

        case 'listarparcerias':
        case 'parcerias':
          {
            if (!isGroup) break;
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) {
              await sock.sendMessage(from, {
                text: `╭━━━〔 🚫 𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎 〕━━━╮\n┃\n┃ 💔 Apenas *admins* e o *dono*\n┃    podem usar isso!\n┃\n┃ 🕊️ Peça ajuda a eles~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
              break;
            }

            const db = carregarJSON('./parcerias.json');
            if (!db[from] || !db[from].parceiros || !Object.keys(db[from].parceiros).length) {
              await sock.sendMessage(from, { text: 'ℹ️ Nenhuma parceria neste grupo ainda.' }, { quoted: msg });
              break;
            }

            const ativo = db[from].ativo ? '✅ Ativo' : '❌ Desativado';
            let txt = `╭━━━〔 🤝 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀𝐒 〕━━━╮\n┃\n┃ 🔘 Modo: *${ativo}* 💜\n┃\n`;
            const mentions = [];
            for (const [jid, info] of Object.entries(db[from].parceiros)) {
              const resta = info.total - info.usados;
              txt += `┃ 👤 @${jid.split('@')[0]}\n`;
              txt += `┃    📊 Usados: *${info.usados}/${info.total}*\n`;
              txt += `┃    ⏳ Restam: *${resta}*\n┃\n`;
              mentions.push(jid);
            }
            txt += `╰━━━━━━━━━━━━━━━━━━╯`;
            await sock.sendMessage(from, { text: txt, mentions }, { quoted: msg });
          }
          break;


// ADM PACOTE 4
        // ═══════════════════════════════════════════════
        //           ADM PACOTE 4
        // ═══════════════════════════════════════════════

        case 'historico':
        case 'hist':
          {
            if (!isGroup) break;
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            const ctxH = msg.message.extendedTextMessage?.contextInfo;
            const alvoH = ctxH?.mentionedJid?.[0] || ctxH?.participant;
            if (!alvoH) { await sock.sendMessage(from, { text: '⚠️ Marque a pessoa!\n\nEx: *!historico @pessoa*' }, { quoted: msg }); break; }

            const advsH = carregarJSON(FILE_ADVS);
            const mutesH = carregarJSON(FILE_MUTES);
            const qtdAdvH = (advsH[from] && advsH[from][alvoH]) || 0;
            const mutadoH = mutesH[from] && mutesH[from][alvoH];
            const motivos = (advsH[from + '_motivos'] && advsH[from + '_motivos'][alvoH]) || [];

            let textoH = '╭━━━〔 📜 𝐇𝐈𝐒𝐓𝐎́𝐑𝐈𝐂𝐎 📜 〕━━━╮\n' +
              '┃\n' +
              '┃ 👤 Membro: @' + alvoH.split('@')[0] + '\n' +
              '┃ ⚠️ Advertências: *' + qtdAdvH + '/3*\n' +
              '┃ 🔇 Mutado: *' + (mutadoH ? '✅ Sim' : '❌ Não') + '*\n' +
              '┃\n';

            if (motivos.length > 0) {
              textoH += '┣━━━〔 📝 𝐔́𝐋𝐓𝐈𝐌𝐀𝐒 𝐀𝐃𝐕 〕━━━\n' + '┃\n';
              const ultimas = motivos.slice(-5).reverse();
              for (const m of ultimas) {
                const data = new Date(m.data).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
                const hora = new Date(m.data).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
                textoH += '┃ 📅 ' + data + ' às ' + hora + '\n' +
                  '┃ ┗ ⚠️ ' + m.motivo + '\n' +
                  '┃    👮 @' + m.por.split('@')[0] + '\n' +
                  '┃\n';
              }
            } else {
              textoH += '┃ 💜 Sem advertências no histórico~\n┃\n';
            }

            textoH += '╰━━━━━━━━━━━━━━━━━━╯';

            const mencoesH = [alvoH];
            for (const m of motivos) mencoesH.push(m.por);

            await sock.sendMessage(from, { text: textoH, mentions: mencoesH }, { quoted: msg });
          }
          break;

        case 'add':
          {
            if (!isGroup) break;
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;
            if (!alvo) { await sock.sendMessage(from, { text: '⚠️ Marque a pessoa!\n\nEx: `!add @pessoa`' }, { quoted: msg }); break; }
            try {
              await sock.groupParticipantsUpdate(from, [alvo], 'add');
              await sock.sendMessage(from, {
                text: `╭━━━〔 ➕ 𝐌𝐄𝐌𝐁𝐑𝐎 𝐀𝐃𝐈𝐂𝐈𝐎𝐍𝐀𝐃𝐎 〕━━━╮\n┃\n┃ 💜 @${alvo.split('@')[0]}\n┃ ✅ Foi adicionado(a) com sucesso!\n┃\n┃ 🕊️ Bem-vindo(a) ao grupo!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                mentions: [alvo]
              }, { quoted: msg });
            } catch (e) {
              await sock.sendMessage(from, { text: '❌ Não consegui adicionar. O bot precisa ser admin e a pessoa precisa estar nos contatos dele.' }, { quoted: msg });
            }
          }
          break;

        case 'infogp':
        case 'infogrupo':
          {
            if (!isGroup) break;
            const gm = await sock.groupMetadata(from);
            const criado = gm.creation ? new Date(gm.creation * 1000).toLocaleDateString('pt-BR') : 'Desconhecido';
            const admins = gm.participants.filter(p => p.admin).length;
            await sock.sendMessage(from, {
              text: `╭━━━〔 📋 𝐈𝐍𝐅𝐎 𝐃𝐎 𝐆𝐑𝐔𝐏𝐎 〕━━━╮\n┃\n` +
                    `┃ 👥 *${gm.subject}*\n┃\n` +
                    `┃ 🆔 ID: *${from.split('@')[0]}*\n` +
                    `┃ 👤 Membros: *${gm.participants.length}*\n` +
                    `┃ 👑 Admins: *${admins}*\n` +
                    `┃ 📅 Criado em: *${criado}*\n┃\n` +
                    `┃ 💜 É isso aí~\n┃\n` +
                    `╰━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
          }
          break;

        case 'topmembros':
          {
            if (!isGroup) break;
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            const stats = carregarJSON(FILE_STATS);
            const ranking = gm.participants
              .map(p => ({ id: p.id, msgs: (stats[p.id] && stats[p.id].mensagens) || 0 }))
              .sort((a, b) => b.msgs - a.msgs)
              .slice(0, 10);
            if (!ranking.length) { await sock.sendMessage(from, { text: 'ℹ️ Ninguém tem estatística ainda!' }, { quoted: msg }); break; }
            let txt = `╭━━━〔 🏆 𝐓𝐎𝐏 𝐌𝐄𝐌𝐁𝐑𝐎𝐒 〕━━━╮\n┃\n`;
            const medalhas = ['🥇', '🥈', '🥉'];
            const mentions = [];
            ranking.forEach((r, i) => {
              const med = medalhas[i] || `${i + 1}️⃣`;
              txt += `┃ ${med} @${r.id.split('@')[0]} ➜ *${r.msgs} msgs*\n`;
              mentions.push(r.id);
            });
            txt += `┃\n┃ 💜 Parabéns aos tagarelas!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`;
            await sock.sendMessage(from, { text: txt, mentions }, { quoted: msg });
          }
          break;

        case 'apresentar':
          {
            if (!isGroup) break;
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;
            if (!alvo) { await sock.sendMessage(from, { text: '⚠️ Marque a pessoa!\n\nEx: `!apresentar @pessoa`' }, { quoted: msg }); break; }
            await sock.sendMessage(from, {
              text: `╭━━━〔 🎀 𝐀𝐏𝐑𝐄𝐒𝐄𝐍𝐓𝐀𝐂̧𝐀̃𝐎 〕━━━╮\n┃\n` +
                    `┃ 💜 Todos, atenção!\n┃\n` +
                    `┃ 👤 @${alvo.split('@')[0]} acabou de\n┃    chegar no grupo! 🎉\n┃\n` +
                    `┃ 🕊️ Sejam gentis e digam oi!\n┃\n` +
                    `╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [alvo]
            }, { quoted: msg });
          }
          break;

        case 'fundosaiu':
        case 'setbye':
          {
            if (!isGroup) break;
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            const q = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            const isImg = q?.imageMessage || msg.message.imageMessage;
            if (!isImg) { await sock.sendMessage(from, { text: '⚠️ *Oops!* Marque uma *imagem* ou mande direto com legenda!\n\n💡 Ex: responda uma foto com *!fundosaiu*' }, { quoted: msg }); break; }
            try {
              const stream = await downloadContentFromMessage(isImg, 'image');
              let buf = Buffer.from([]);
              for await (const c of stream) buf = Buffer.concat([buf, c]);
              fs.writeFileSync('./saiu_media.jpg', buf);
              await sock.sendMessage(from, {
                text: `╭━━━〔 📸 𝐅𝐎𝐓𝐎 𝐃𝐄 𝐒𝐀𝐈́𝐃𝐀 〕━━━╮\n┃\n┃ 💜 Foto salva com sucesso!\n┃\n┃ 🕊️ Quando alguém sair, o\n┃    bot vai mandar essa foto~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
            } catch (e) {
              await sock.sendMessage(from, { text: '❌ Erro ao salvar.' }, { quoted: msg });
            }
          }
          break;

        case 'legendasaiu':
        case 'setlegendasaida':
          {
            if (!isGroup) break;
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            const db = carregarJSON('./saidas.json');
            const txt = args.join(' ').trim();
            if (!txt) {
              const atual = db[from] || '_não definida_';
              await sock.sendMessage(from, {
                text: `╭━━━〔 📝 𝐋𝐄𝐆𝐄𝐍𝐃𝐀 𝐒𝐀𝐈́𝐃𝐀 〕━━━╮\n┃\n┃ 💜 Legenda atual:\n┃\n┃ _${atual}_\n┃\n┃ 💡 Use: *!legendasaiu <texto>*\n┃ 💜 Use *@user* pra mencionar\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
              break;
            }
            db[from] = txt;
            salvarJSON('./saidas.json', db);
            await sock.sendMessage(from, {
              text: `╭━━━〔 📝 𝐋𝐄𝐆𝐄𝐍𝐃𝐀 𝐒𝐀𝐋𝐕𝐀 〕━━━╮\n┃\n┃ 💜 Legenda de saída salva!\n┃\n┃ 📝 _${txt}_\n┃\n┃ 🕊️ Toda vez que alguém sair,\n┃    o bot vai usar essa msg~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
          }
          break;

        case 'fakechat':
          {
            if (!isGroup) break;
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            const txt = args.join(' ').trim();
            if (!txt) { await sock.sendMessage(from, { text: '⚠️ Use: `!fakechat <texto>`\n\nEx: `!fakechat Oi, tudo bem?`' }, { quoted: msg }); break; }
            await sock.sendMessage(from, {
              text: `╭━━━〔 💬 𝐅𝐀𝐊𝐄 𝐂𝐇𝐀𝐓 〕━━━╮\n┃\n` +
                    `┃ 👤 @${sender.split('@')[0]}\n┃\n` +
                    `┃ 💬 _${txt}_\n┃\n` +
                    `┃ 💜 Feito com carinho~\n┃\n` +
                    `╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'frase':
          {
            if (!isGroup) break;
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            const txt = args.join(' ').trim();
            if (!txt) { await sock.sendMessage(from, { text: '⚠️ Use: `!frase <texto>`' }, { quoted: msg }); break; }
            await sock.sendMessage(from, {
              text: `✨ *Frase do dia:* ✨\n\n_"${txt}"_\n\n💜 Compartilhe com alguém!`
            }, { quoted: msg });
          }
          break;


// ANTI-COMANDOS
        // ═══════════════════════════════════════════════
        //           ANTI-COMANDOS
        // ═══════════════════════════════════════════════


        case 'antistatus':
          {
            if (!isGroup) break;
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            const db = carregarJSON('./antistatus.json');
            db[from] = db[from] || {};
            const sub = (args[0] || '').toLowerCase();
            if (sub === 'on') db[from].ativo = true;
            else if (sub === 'off') db[from].ativo = false;
            else db[from].ativo = !db[from].ativo;
            salvarJSON('./antistatus.json', db);
            await sock.sendMessage(from, {
              text: db[from].ativo
                ? `╭━━━〔 📸 𝐀𝐍𝐓𝐈-𝐒𝐓𝐀𝐓𝐔𝐒 〕━━━╮\n┃\n┃ ✅ *Ativado~* ✨\n┃\n┃ 📸 Links de status serão\n┃    *deletados*!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
                : `╭━━━〔 📸 𝐀𝐍𝐓𝐈-𝐒𝐓𝐀𝐓𝐔𝐒 〕━━━╮\n┃\n┃ 💤 *Desativado~*\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
          }
          break;

        case 'antipromocao':
          {
            if (!isGroup) break;
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            const db = carregarJSON('./antipromocao.json');
            db[from] = db[from] || {};
            const sub = (args[0] || '').toLowerCase();
            if (sub === 'on') db[from].ativo = true;
            else if (sub === 'off') db[from].ativo = false;
            else db[from].ativo = !db[from].ativo;
            salvarJSON('./antipromocao.json', db);
            await sock.sendMessage(from, {
              text: db[from].ativo
                ? `╭━━━〔 📢 𝐀𝐍𝐓𝐈-𝐏𝐑𝐎𝐌𝐎𝐂̧𝐀̃𝐎 〕━━━╮\n┃\n┃ ✅ *Ativado~* ✨\n┃\n┃ 📢 Mensagens com "divulgação"\n┃    serão *deletadas*!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
                : `╭━━━〔 📢 𝐀𝐍𝐓𝐈-𝐏𝐑𝐎𝐌𝐎𝐂̧𝐀̃𝐎 〕━━━╮\n┃\n┃ 💤 *Desativado~*\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
          }
          break;

        case 'antifake':
          {
            if (!isGroup) break;
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            const db = carregarJSON('./antifake.json');
            db[from] = db[from] || {};
            const sub = (args[0] || '').toLowerCase();
            if (sub === 'on') db[from].ativo = true;
            else if (sub === 'off') db[from].ativo = false;
            else db[from].ativo = !db[from].ativo;
            salvarJSON('./antifake.json', db);
            await sock.sendMessage(from, {
              text: db[from].ativo
                ? `╭━━━〔 🚫 𝐀𝐍𝐓𝐈-𝐅𝐀𝐊𝐄 〕━━━╮\n┃\n┃ ✅ *Ativado~* ✨\n┃\n┃ 🚫 Números fake serão\n┃    *removidos* na entrada!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
                : `╭━━━〔 🚫 𝐀𝐍𝐓𝐈-𝐅𝐀𝐊𝐄 〕━━━╮\n┃\n┃ 💤 *Desativado~*\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
          }
          break;

        case 'antiporn':
          {
            if (!isGroup) break;
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            const db = carregarJSON('./antiporn.json');
            db[from] = db[from] || {};
            const sub = (args[0] || '').toLowerCase();
            if (sub === 'on') db[from].ativo = true;
            else if (sub === 'off') db[from].ativo = false;
            else db[from].ativo = !db[from].ativo;
            salvarJSON('./antiporn.json', db);
            await sock.sendMessage(from, {
              text: db[from].ativo
                ? `╭━━━〔 🔞 𝐀𝐍𝐓𝐈-𝐏𝐎𝐑𝐍 〕━━━╮\n┃\n┃ ✅ *Ativado~* ✨\n┃\n┃ 🔞 Legendas com termos +18\n┃    serão *deletadas*!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
                : `╭━━━〔 🔞 𝐀𝐍𝐓𝐈-𝐏𝐎𝐑𝐍 〕━━━╮\n┃\n┃ 💤 *Desativado~*\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
          }
          break;

        case 'antipalavrao':
          {
            if (!isGroup) break;
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            const db = carregarJSON('./antipalavrao.json');
            db[from] = db[from] || {};
            const sub = (args[0] || '').toLowerCase();
            if (sub === 'on') db[from].ativo = true;
            else if (sub === 'off') db[from].ativo = false;
            else db[from].ativo = !db[from].ativo;
            salvarJSON('./antipalavrao.json', db);
            await sock.sendMessage(from, {
              text: db[from].ativo
                ? `╭━━━〔 🤬 𝐀𝐍𝐓𝐈-𝐏𝐀𝐋𝐀𝐕𝐑𝐀̃𝐎 〕━━━╮\n┃\n┃ ✅ *Ativado~* ✨\n┃\n┃ 🤬 Palavrões serão *deletados*!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
                : `╭━━━〔 🤬 𝐀𝐍𝐓𝐈-𝐏𝐀𝐋𝐀𝐕𝐑𝐀̃𝐎 〕━━━╮\n┃\n┃ 💤 *Desativado~*\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
          }
          break;

        case 'antivideo':
          {
            if (!isGroup) break;
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            const db = carregarJSON('./antivideo.json');
            db[from] = db[from] || {};
            const sub = (args[0] || '').toLowerCase();
            if (sub === 'on') db[from].ativo = true;
            else if (sub === 'off') db[from].ativo = false;
            else db[from].ativo = !db[from].ativo;
            salvarJSON('./antivideo.json', db);
            await sock.sendMessage(from, {
              text: db[from].ativo
                ? `╭━━━〔 🎥 𝐀𝐍𝐓𝐈-𝐕𝐈́𝐃𝐄𝐎 〕━━━╮\n┃\n┃ ✅ *Ativado~* ✨\n┃\n┃ 🎥 Vídeos serão *deletados*!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
                : `╭━━━〔 🎥 𝐀𝐍𝐓𝐈-𝐕𝐈́𝐃𝐄𝐎 〕━━━╮\n┃\n┃ 💤 *Desativado~*\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
          }
          break;

        case 'antiimagem':
          {
            if (!isGroup) break;
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            const db = carregarJSON('./antiimagem.json');
            db[from] = db[from] || {};
            const sub = (args[0] || '').toLowerCase();
            if (sub === 'on') db[from].ativo = true;
            else if (sub === 'off') db[from].ativo = false;
            else db[from].ativo = !db[from].ativo;
            salvarJSON('./antiimagem.json', db);
            await sock.sendMessage(from, {
              text: db[from].ativo
                ? `╭━━━〔 🖼️ 𝐀𝐍𝐓𝐈-𝐈𝐌𝐀𝐆𝐄𝐌 〕━━━╮\n┃\n┃ ✅ *Ativado~* ✨\n┃\n┃ 🖼️ Imagens serão *deletadas*!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
                : `╭━━━〔 🖼️ 𝐀𝐍𝐓𝐈-𝐈𝐌𝐀𝐆𝐄𝐌 〕━━━╮\n┃\n┃ 💤 *Desativado~*\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
          }
          break;

        case 'antisticker':
          {
            if (!isGroup) break;
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            const db = carregarJSON('./antisticker.json');
            db[from] = db[from] || {};
            const sub = (args[0] || '').toLowerCase();
            if (sub === 'on') db[from].ativo = true;
            else if (sub === 'off') db[from].ativo = false;
            else db[from].ativo = !db[from].ativo;
            salvarJSON('./antisticker.json', db);
            await sock.sendMessage(from, {
              text: db[from].ativo
                ? `╭━━━〔 🎨 𝐀𝐍𝐓𝐈-𝐒𝐓𝐈𝐂𝐊𝐄𝐑 〕━━━╮\n┃\n┃ ✅ *Ativado~* ✨\n┃\n┃ 🎨 Figurinhas serão *deletadas*!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
                : `╭━━━〔 🎨 𝐀𝐍𝐓𝐈-𝐒𝐓𝐈𝐂𝐊𝐄𝐑 〕━━━╮\n┃\n┃ 💤 *Desativado~*\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
          }
          break;

        case 'antiemoji':
          {
            if (!isGroup) break;
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            const db = carregarJSON('./antiemoji.json');
            db[from] = db[from] || {};
            const sub = (args[0] || '').toLowerCase();
            if (sub === 'on') db[from].ativo = true;
            else if (sub === 'off') db[from].ativo = false;
            else db[from].ativo = !db[from].ativo;
            salvarJSON('./antiemoji.json', db);
            await sock.sendMessage(from, {
              text: db[from].ativo
                ? `╭━━━〔 😀 𝐀𝐍𝐓𝐈-𝐄𝐌𝐎𝐉𝐈 〕━━━╮\n┃\n┃ ✅ *Ativado~* ✨\n┃\n┃ 😀 Emojis serão *deletados*!\n┃\n┃ 💜 Só admins podem usar~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
                : `╭━━━〔 😀 𝐀𝐍𝐓𝐈-𝐄𝐌𝐎𝐉𝐈 〕━━━╮\n┃\n┃ 💤 *Desativado~*\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
          }
          break;

        // ═══════════════════════════════════════════════
        //           ESPECIAIS
        // ═══════════════════════════════════════════════

        case 'mododivertido':
          {
            if (!isGroup) break;
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            const db = carregarJSON('./mododivertido.json');
            db[from] = db[from] || {};
            const sub = (args[0] || '').toLowerCase();
            if (sub === 'on') db[from].ativo = true;
            else if (sub === 'off') db[from].ativo = false;
            else db[from].ativo = !db[from].ativo;
            salvarJSON('./mododivertido.json', db);
            await sock.sendMessage(from, {
              text: db[from].ativo
                ? `╭━━━〔 🎉 𝐌𝐎𝐃𝐎 𝐃𝐈𝐕𝐄𝐑𝐓𝐈𝐃𝐎 〕━━━╮\n┃\n┃ ✅ *Ativado~* ✨\n┃\n┃ 🎉 Reações divertidas ativas!\n┃ 🕊️ Se divirtam~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
                : `╭━━━〔 🎉 𝐌𝐎𝐃𝐎 𝐃𝐈𝐕𝐄𝐑𝐓𝐈𝐃𝐎 〕━━━╮\n┃\n┃ 💤 *Desativado~*\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
          }
          break;

        case 'modonatal':
          {
            if (!isGroup) break;
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            const db = carregarJSON('./modonatal.json');
            db[from] = db[from] || {};
            const sub = (args[0] || '').toLowerCase();
            if (sub === 'on') db[from].ativo = true;
            else if (sub === 'off') db[from].ativo = false;
            else db[from].ativo = !db[from].ativo;
            salvarJSON('./modonatal.json', db);
            await sock.sendMessage(from, {
              text: db[from].ativo
                ? `╭━━━〔 🎄 𝐌𝐎𝐃𝐎 𝐍𝐀𝐓𝐀𝐋 〕━━━╮\n┃\n┃ ✅ *Ativado~* ✨\n┃\n┃ 🎄 Tema natalino ativo!\n┃ 🎅 Feliz Natal~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
                : `╭━━━〔 🎄 𝐌𝐎𝐃𝐎 𝐍𝐀𝐓𝐀𝐋 〕━━━╮\n┃\n┃ 💤 *Desativado~*\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
          }
          break;

        case 'modohalloween':
          {
            if (!isGroup) break;
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            const db = carregarJSON('./modohalloween.json');
            db[from] = db[from] || {};
            const sub = (args[0] || '').toLowerCase();
            if (sub === 'on') db[from].ativo = true;
            else if (sub === 'off') db[from].ativo = false;
            else db[from].ativo = !db[from].ativo;
            salvarJSON('./modohalloween.json', db);
            await sock.sendMessage(from, {
              text: db[from].ativo
                ? `╭━━━〔 🎃 𝐌𝐎𝐃𝐎 𝐇𝐀𝐋𝐋𝐎𝐖𝐄𝐄𝐍 〕━━━╮\n┃\n┃ ✅ *Ativado~* ✨\n┃\n┃ 🎃 Tema halloween ativo!\n┃ 👻 Se assustem~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
                : `╭━━━〔 🎃 𝐌𝐎𝐃𝐎 𝐇𝐀𝐋𝐋𝐎𝐖𝐄𝐄𝐍 〕━━━╮\n┃\n┃ 💤 *Desativado~*\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
          }
          break;


// MENU BRINCADEIRAS
        case 'menubrincadeiras':
        case 'brincadeiras':
          {
            const menuBrin =
              `╭━━━━━━━━━━━━━━━━━━━━━━━━╮\n` +
              `┃  💜 𝐒𝐇𝐈𝐙𝐔𝐊𝐈 𝐁𝐎𝐓 - 𝐌𝐃 💜  ┃\n` +
              `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
              `╭─ ⟨ 🎮 ⟩ ─╮\n` +
              `   💜 𝐁𝐑𝐈𝐍𝐂𝐀𝐃𝐄𝐈𝐑𝐀𝐒 💜\n` +
              `╰─ ⟨ 🎮 ⟩ ─╯\n\n` +
              `╭─ ⟨ 💋 ⟩ ─╮\n` +
              `   💜 𝐀𝐂̧𝐎̃𝐄𝐒\n` +
              `╰─ ⟨ 💋 ⟩ ─╯\n` +
              `   ┃ 💜 !beijo @pessoa\n` +
              `   ┃ 💜 !abraço @pessoa\n` +
              `   ┃ 💜 !matar @pessoa\n` +
              `   ┃ 💜 !cafune @pessoa\n` +
              `   ┃ 💜 !mordida @pessoa\n` +
              `   ┃ 💜 !colinho @pessoa\n` +
              `   ┃ 💜 !socar @pessoa\n` +
              `   ┃ 💜 !chutar @pessoa\n` +
              `   ┃ 💜 !esfaquear @pessoa\n` +
              `   ┃ 💜 !bater @pessoa\n` +
              `   ┃ 💜 !dancar @pessoa\n` +
              `   ┃ 💜 !cantar @pessoa\n\n` +
              `╭─ ⟨ 🎯 ⟩ ─╮\n` +
              `   💜 𝐉𝐎𝐆𝐎𝐒\n` +
              `╰─ ⟨ 🎯 ⟩ ─╯\n` +
              `   ┃ 💜 !quiz\n` +
              `   ┃ 💜 !jogodavelha @pessoa\n` +
              `   ┃ 💜 !forca @pessoa\n` +
              `   ┃ 💜 !memoria @pessoa\n` +
              `   ┃ 💜 !duelo @pessoa\n\n` +
              `╭─ ⟨ 🏆 ⟩ ─╮\n` +
              `   💜 𝐑𝐀𝐍𝐊𝐈𝐍𝐆𝐒\n` +
              `╰─ ⟨ 🏆 ⟩ ─╯\n` +
              `   ┃ 💜 !ranklinda\n` +
              `   ┃ 💜 !ranklindo\n` +
              `   ┃ 💜 !rankbebado\n` +
              `   ┃ 💜 !rankfiel\n` +
              `   ┃ 💜 !rankputa\n` +
              `   ┃ 💜 !rankgay\n` +
              `   ┃ 💜 !rankcorno\n` +
              `   ┃ 💜 !rankotaku\n` +
              `   ┃ 💜 !rankpobre\n` +
              `   ┃ 💜 !rankrico\n` +
              `   ┃ 💜 !rankfeio\n` +
              `   ┃ 💜 !rankgostosa\n` +
              `   ┃ 💜 !rankgostoso\n` +
              `   ┃ 💜 !rankgado\n` +
              `   ┃ 💜 !rankpau\n` +
              `   ┃ 💜 !rankbct\n` +
              `╭─ ⟨ 📊 ⟩ ─╮\n` +
              `   💜 𝐏𝐎𝐑𝐂𝐄𝐍𝐓𝐀𝐆𝐄𝐍𝐒\n` +
              `╰─ ⟨ 📊 ⟩ ─╯\n` +
              `   ┃ 💜 !ship @pessoa\n` +
              `   ┃ 💜 !corno @pessoa\n` +
              `   ┃ 💜 !gay @pessoa\n` +
              `   ┃ 💜 !gostosa @pessoa\n` +
              `   ┃ 💜 !gostoso @pessoa\n` +
              `   ┃ 💜 !feio @pessoa\n` +
              `   ┃ 💜 !bonito @pessoa\n` +
              `   ┃ 💜 !rico @pessoa\n` +
              `   ┃ 💜 !pobre @pessoa\n` +
              `   ┃ 💜 !gado @pessoa\n` +
              `   ┃ 💜 !safado @pessoa\n` +
              `   ┃ 💜 !chato @pessoa\n` +
              `   ┃ 💜 !louco @pessoa\n` +
              `   ┃ 💜 !sortudo @pessoa\n` +
              `   ┃ 💜 !azarado @pessoa\n` +
              `   ┃ 💜 !pau @pessoa\n` +
              `   ┃ 💜 !bunda @pessoa\n` +
              `   ┃ 💜 !chifre @pessoa\n` +
              `   ┃ 💜 !inteligente @pessoa\n` +
              `   ┃ 💜 !burro @pessoa\n\n` +
              `╭─ ⟨ 🎵 ⟩ ─╮\n` +
              `   💜 𝐄𝐗𝐓𝐑𝐀𝐒\n` +
              `╰─ ⟨ 🎵 ⟩ ─╯\n` +
              `   ┃ 💜 !perfil\n` +
              `   ┃ 💜 !streak\n\n` +
              `╭─ ⟨ ❆ ⟩ ─╮\n` +
              `   💜 𝐁𝐎𝐌 𝐉𝐎𝐆𝐎! 💜\n` +
              `╰─ ⟨ ❆ ⟩ ─╯`;
            if (fs.existsSync(MENU_IMAGE_PATH)) {
              try {
                await sock.sendMessage(from, { image: fs.readFileSync(MENU_IMAGE_PATH), caption: menuBrin, mentions: [sender] }, { quoted: msg });
              } catch (e) {
                await sock.sendMessage(from, { text: menuBrin, mentions: [sender] }, { quoted: msg });
              }
            } else {
              await sock.sendMessage(from, { text: menuBrin, mentions: [sender] }, { quoted: msg });
            } // FOTO NOS MENUS
          }
          break;


// PACOTE 1
        // ═══════════════════════════════════════════════
        //      PACOTE 1 — CASAR / DIVORCIAR / ADOTAR
        // ═══════════════════════════════════════════════

        case 'casar':
          {
            if (!isGroup) break;
            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;
            if (!alvo) { await sock.sendMessage(from, { text: '⚠️ Marque a pessoa!\n\nEx: `!casar @pessoa`' }, { quoted: msg }); break; }
            if (alvo === sender) { await sock.sendMessage(from, { text: '😅 Você não pode casar consigo mesmo(a)!' }, { quoted: msg }); break; }

            const uEu = shizukiUser(sender);
            const uAlvo = shizukiUser(alvo);
            if (uEu.casado) { await sock.sendMessage(from, { text: `❌ Você já é casado(a) com @${uEu.casado.split('@')[0]}!`, mentions: [uEu.casado] }, { quoted: msg }); break; }
            if (uAlvo.casado) { await sock.sendMessage(from, { text: `❌ @${alvo.split('@')[0]} já é casado(a)!`, mentions: [alvo] }, { quoted: msg }); break; }

            const enviado = await sock.sendMessage(from, {
              text: `╭━━━〔 💍 𝐏𝐄𝐃𝐈𝐃𝐎 𝐃𝐄 𝐂𝐀𝐒𝐀𝐌𝐄𝐍𝐓𝐎! 〕━━━╮\n┃\n┃ 💜 @${sender.split('@')[0]} está pedindo\n┃    @${alvo.split('@')[0]} em casamento!\n┃\n┃ 💌 @${alvo.split('@')[0]}, você aceita?\n┃\n┃ ✍️ Responda *SIM* ou *NÃO*\n┃    marcando esta mensagem.\n┃ ⏰ 2 minutos.\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender, alvo]
            }, { quoted: msg });

            const stanzaId = enviado?.key?.id;
            const pendentes = globalThis.__pedidosCasar || (globalThis.__pedidosCasar = new Map());
            pendentes.set(stanzaId, {
              de: sender, para: alvo, tipo: 'casar',
              timer: setTimeout(async () => {
                if (pendentes.has(stanzaId)) {
                  pendentes.delete(stanzaId);
                  try { await sock.sendMessage(from, { text: `⏰ @${alvo.split('@')[0]} não respondeu...\n\n💔 O pedido expirou.`, mentions: [alvo] }); } catch (e) {}
                }
              }, 120000)
            });
          }
          break;

        case 'divorciar':
        case 'divorcio':
          {
            const u = shizukiUser(sender);
            if (!u.casado) { await sock.sendMessage(from, { text: '❌ Você não é casado(a)!' }, { quoted: msg }); break; }
            const ex = u.casado;
            const uEx = shizukiUser(ex);

            // Divide bens
            const bensTotal = (u.reais || 0) + (uEx.reais || 0);
            const metade = Math.floor(bensTotal / 2);
            u.reais = metade;
            uEx.reais = metade;
            u.casado = null;
            uEx.casado = null;
            salvarShizuki(sender, u);
            salvarShizuki(ex, uEx);

            await sock.sendMessage(from, {
              text: `╭━━━〔 💔 𝐃𝐈𝐕𝐎́𝐑𝐂𝐈𝐎 〕━━━╮\n┃\n┃ 💔 Você se divorciou de\n┃    @${ex.split('@')[0]}...\n┃\n┃ 💰 Bens divididos:\n┃    *${formatarReais(metade)}* cada\n┃\n┃ 😢 Fim de um casamento.\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [ex]
            }, { quoted: msg });
          }
          break;

        case 'adotar':
          {
            if (!isGroup) break;
            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;
            if (!alvo) { await sock.sendMessage(from, { text: '⚠️ Marque a pessoa!\n\nEx: `!adotar @pessoa`' }, { quoted: msg }); break; }
            if (alvo === sender) { await sock.sendMessage(from, { text: '😅 Você não pode se adotar!' }, { quoted: msg }); break; }

            const uEu = shizukiUser(sender);
            const uAlvo = shizukiUser(alvo);
            uEu.filhos = uEu.filhos || [];
            if (uEu.filhos.length >= 5) { await sock.sendMessage(from, { text: '❌ Você já tem 5 filhos (máximo)!' }, { quoted: msg }); break; }
            if (uAlvo.pai || uAlvo.mae) { await sock.sendMessage(from, { text: `❌ @${alvo.split('@')[0]} já tem família!`, mentions: [alvo] }, { quoted: msg }); break; }

            const enviado = await sock.sendMessage(from, {
              text: `╭━━━〔 👶 𝐏𝐄𝐃𝐈𝐃𝐎 𝐃𝐄 𝐀𝐃𝐎𝐂̧𝐀̃𝐎! 〕━━━╮\n┃\n┃ 💜 @${sender.split('@')[0]} quer adotar\n┃    @${alvo.split('@')[0]}!\n┃\n┃ 💌 @${alvo.split('@')[0]}, você aceita?\n┃\n┃ ✍️ Responda *SIM* ou *NÃO*.\n┃ ⏰ 2 minutos.\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender, alvo]
            }, { quoted: msg });

            const stanzaId = enviado?.key?.id;
            const pendentes = globalThis.__pedidosCasar || (globalThis.__pedidosCasar = new Map());
            pendentes.set(stanzaId, {
              de: sender, para: alvo, tipo: 'adotar',
              timer: setTimeout(async () => {
                if (pendentes.has(stanzaId)) {
                  pendentes.delete(stanzaId);
                  try { await sock.sendMessage(from, { text: `⏰ @${alvo.split('@')[0]} não respondeu...\n\n💔 O pedido expirou.`, mentions: [alvo] }); } catch (e) {}
                }
              }, 120000)
            });
          }
          break;

        case 'meusfilhos':
        case 'filhos':
          {
            const u = shizukiUser(sender);
            const filhos = u.filhos || [];
            if (!filhos.length) { await sock.sendMessage(from, { text: '👶 Você não tem filhos ainda!' }, { quoted: msg }); break; }
            let txt = `╭━━━〔 👶 𝐌𝐄𝐔𝐒 𝐅𝐈𝐋𝐇𝐎𝐒 〕━━━╮\n┃\n┃ 💜 Você tem *${filhos.length}/5 filhos*:\n┃\n`;
            const mentions = [];
            filhos.forEach(f => {
              txt += `┃ 👶 @${f.split('@')[0]}\n`;
              mentions.push(f);
            });
            txt += `┃\n╰━━━━━━━━━━━━━━━━━━╯`;
            await sock.sendMessage(from, { text: txt, mentions }, { quoted: msg });
          }
          break;

        case 'mudarnome':
          {
            if (!eVIP(sender) && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas VIPs podem usar isso!' }, { quoted: msg }); break; }
            const novo = args.join(' ').trim();
            if (!novo) { await sock.sendMessage(from, { text: '⚠️ Use: `!mudarnome <novo nome>`' }, { quoted: msg }); break; }
            if (novo.length > 50) { await sock.sendMessage(from, { text: '⚠️ Máximo de 50 caracteres!' }, { quoted: msg }); break; }

            const db = vipDB();
            db.vips = db.vips || {};
            db.vips[sender] = db.vips[sender] || { desde: Date.now(), expira: null };
            db.vips[sender].apelido = novo;
            salvarVipDB(db);
            await sock.sendMessage(from, {
              text: `╭━━━〔 ✏️ 𝐍𝐎𝐌𝐄 𝐌𝐔𝐃𝐀𝐃𝐎! 〕━━━╮\n┃\n┃ 💜 Seu novo nome é:\n┃\n┃ 👑 『 ${novo} 』\n┃\n┃ 🕊️ Atualizado~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;


// PACOTE 2
        // ═══════════════════════════════════════════════
        //           PACOTE 2 — TRABALHO
        // ═══════════════════════════════════════════════

        case 'promocao':
        case 'promoção':
          {
            const u = shizukiUser(sender);
            if (!u.emprego) { await sock.sendMessage(from, { text: '❌ Você está desempregado!' }, { quoted: msg }); break; }
            const empAtual = acharEmprego(u.emprego);
            if (!empAtual) { await sock.sendMessage(from, { text: '❌ Emprego inválido!' }, { quoted: msg }); break; }
            if ((u.totalTrabalhos || 0) < 20) {
              await sock.sendMessage(from, { text: `📊 Você precisa trabalhar *20 vezes* para pedir promoção!\n\n💼 Trabalhos feitos: *${u.totalTrabalhos || 0}/20*` }, { quoted: msg });
              break;
            }
            if (Math.random() > 0.3) {
              await sock.sendMessage(from, {
                text: `╭━━━〔 📉 𝐒𝐄𝐌 𝐏𝐑𝐎𝐌𝐎𝐂̧𝐀̃𝐎 〕━━━╮\n┃\n┃ 💔 Seu chefe negou o pedido...\n┃\n┃ 💡 Trabalhe mais e tente\n┃    de novo!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
              break;
            }
            // Promove para próximo nível
            const proximo = SHIZUKI_DATA.empregos.find(e => e.nivel > empAtual.nivel);
            if (!proximo) { await sock.sendMessage(from, { text: '👑 Você já tá no topo! Não tem mais promoção.' }, { quoted: msg }); break; }
            u.emprego = proximo.id;
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `╭━━━〔 📈 𝐏𝐑𝐎𝐌𝐎𝐂̧𝐀̃𝐎! 〕━━━╮\n┃\n┃ 💜 Parabéns, @${sender.split('@')[0]}!\n┃\n┃ 🎉 Você foi promovido(a)!\n┃\n┃ 📊 Antes: *${empAtual.nome}*\n┃ 📊 Agora: *${proximo.nome}* ${proximo.emoji}\n┃\n┃ 💰 Novo salário: *R$ ${proximo.salarioMin}-${proximo.salarioMax}*\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'demitir':
        case 'demissao':
          {
            const u = shizukiUser(sender);
            if (!u.emprego) { await sock.sendMessage(from, { text: '❌ Você já tá desempregado!' }, { quoted: msg }); break; }
            const empAntigo = acharEmprego(u.emprego);
            u.emprego = null;
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `╭━━━〔 🚪 𝐃𝐄𝐌𝐈𝐓𝐈𝐃𝐎 〕━━━╮\n┃\n┃ 💔 Você pediu demissão...\n┃\n┃ 📊 Cargo anterior: *${empAntigo ? empAntigo.nome : 'Desconhecido'}*\n┃ 💰 Saldo: *${formatarReais(u.reais)}*\n┃\n┃ 🕊️ Agora você tá desempregado!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'ferias':
        case 'férias':
          {
            const u = shizukiUser(sender);
            if (!u.emprego) { await sock.sendMessage(from, { text: '❌ Você precisa ter emprego!' }, { quoted: msg }); break; }
            if (u.ferias && Date.now() < u.ferias) {
              const resta = Math.ceil((u.ferias - Date.now()) / 86400000);
              await sock.sendMessage(from, { text: `🏖️ Você já tá de férias!\n\n⏰ Volta em: *${resta} dia(s)*` }, { quoted: msg });
              break;
            }
            u.reais += 500;
            u.ferias = Date.now() + 2 * 86400000;
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `╭━━━〔 🏖️ 𝐅𝐄́𝐑𝐈𝐀𝐒! 〕━━━╮\n┃\n┃ 💜 Você tirou férias!\n┃\n┃ ⏰ Duração: *2 dias*\n┃ 💰 Bônus: *+R$ 500*\n┃\n┃ 🎉 Aproveite o descanso!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'segundotrabalho':
        case 'bico':
          {
            const u = shizukiUser(sender);
            if (u.energia < 10) { await sock.sendMessage(from, { text: '😴 Sem energia!\n\nUse *!dormir*.' }, { quoted: msg }); break; }
            const ganho = 50 + Math.floor(Math.random() * 101);
            u.reais += ganho;
            u.energia -= 10;
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `╭━━━〔 💵 𝐁𝐈𝐂𝐎 𝐅𝐄𝐈𝐓𝐎! 〕━━━╮\n┃\n┃ 💜 Você fez um bico!\n┃\n┃ 💰 Ganhou: *${formatarReais(ganho)}*\n┃ ⚡ Energia: *-10*\n┃\n┃ 🕊️ Renda extra~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'investir':
          {
            const u = shizukiUser(sender);
            const valor = parseInt(args[0] || '0', 10);
            if (!valor || valor < 100) { await sock.sendMessage(from, { text: '⚠️ Mínimo: *R$ 100*\n\nEx: `!investir 500`' }, { quoted: msg }); break; }
            if (valor > u.reais) { await sock.sendMessage(from, { text: `💸 Saldo insuficiente!\n\n💰 Você tem: *${formatarReais(u.reais)}*` }, { quoted: msg }); break; }
            u.reais -= valor;
            u.investido = (u.investido || 0) + valor;
            u.ultimoRendimento = u.ultimoRendimento || Date.now();
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `╭━━━〔 📈 𝐈𝐍𝐕𝐄𝐒𝐓𝐈𝐌𝐄𝐍𝐓𝐎 〕━━━╮\n┃\n┃ 💜 Você investiu *${formatarReais(valor)}*!\n┃\n┃ ⏰ Rendimento: *+1%/dia*\n┃ 📊 Total investido: *${formatarReais(u.investido)}*\n┃\n┃ 🕊️ Bons lucros!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'resgatar':
          {
            const u = shizukiUser(sender);
            if (!u.investido || u.investido <= 0) { await sock.sendMessage(from, { text: '❌ Você não tem investimento!' }, { quoted: msg }); break; }
            const tempoPassado = Date.now() - (u.ultimoRendimento || Date.now());
            const diasRend = Math.floor(tempoPassado / 86400000);
            const rendimento = Math.floor(u.investido * 0.01 * Math.max(1, diasRend));
            const total = u.investido + rendimento;
            u.reais += total;
            u.investido = 0;
            u.ultimoRendimento = Date.now();
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `╭━━━〔 💰 𝐑𝐄𝐒𝐆𝐀𝐓𝐄 〕━━━╮\n┃\n┃ 💜 Você resgatou!\n┃\n┃ 📊 Investido: *${formatarReais(total - rendimento)}*\n┃ 📈 Rendimento: *${formatarReais(rendimento)}*\n┃ 💰 Total: *${formatarReais(total)}*\n┃\n┃ 🕊️ Bom lucro~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'empresa':
          {
            const u = shizukiUser(sender);
            const nome = args.join(' ').trim();
            if (!nome) { await sock.sendMessage(from, { text: '⚠️ Use: `!empresa <nome>`\n\nEx: `!empresa Tech Solutions`' }, { quoted: msg }); break; }
            if (u.empresa) { await sock.sendMessage(from, { text: `❌ Você já tem empresa: *${u.empresa.nome}*` }, { quoted: msg }); break; }
            if (u.reais < 5000) { await sock.sendMessage(from, { text: `💸 Precisa de *${formatarReais(5000)}*!\n\n💰 Você tem: *${formatarReais(u.reais)}*` }, { quoted: msg }); break; }
            u.reais -= 5000;
            u.empresa = { nome, desde: Date.now() };
            u.ultimaEmpresa = Date.now();
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `╭━━━〔 🏢 𝐄𝐌𝐏𝐑𝐄𝐒𝐀 𝐂𝐑𝐈𝐀𝐃𝐀! 〕━━━╮\n┃\n┃ 💜 Parabéns, @${sender.split('@')[0]}!\n┃\n┃ 🏢 Empresa: *${nome}*\n┃ 💰 Investimento: *${formatarReais(5000)}*\n┃ 📈 Renda diária: *${formatarReais(1500)}*\n┃\n┃ 🕊️ Agora é patrão!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'aposentar':
        case 'aposentadoria':
          {
            const u = shizukiUser(sender);
            if (u.aposentado) { await sock.sendMessage(from, { text: '❌ Você já tá aposentado!' }, { quoted: msg }); break; }
            if (!u.emprego) { await sock.sendMessage(from, { text: '❌ Você precisa ter emprego pra se aposentar!' }, { quoted: msg }); break; }
            u.aposentado = true;
            u.emprego = null;
            u.ultimaAposentadoria = Date.now();
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `╭━━━〔 👴 𝐀𝐏𝐎𝐒𝐄𝐍𝐓𝐀𝐃𝐎! 〕━━━╮\n┃\n┃ 💜 Parabéns pela carreira!\n┃\n┃ 📊 Você se aposentou\n┃ 💰 Aposentadoria: *${formatarReais(300)}/dia*\n┃\n┃ 🕊️ Descanse, guerreiro(a)!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;


// PACOTE 4
        // ═══════════════════════════════════════════════
        //      PACOTE 4 — PESCARIA / DIVERSÃO
        // ═══════════════════════════════════════════════

        case 'pescar':
          {
            const u = shizukiUser(sender);
            const cd = checarCooldown(u.ultimoPescar, 5 * 60 * 1000);
            if (!cd.ok) { await sock.sendMessage(from, { text: `⏰ Aguarde *${cd.minutos} min* pra pescar de novo!` }, { quoted: msg }); break; }
            const peixes = [
              { nome: 'Sardinha', emoji: '🐟', valor: 20, chance: 40 },
              { nome: 'Tilápia', emoji: '🐠', valor: 50, chance: 30 },
              { nome: 'Piranha', emoji: '🐡', valor: 100, chance: 15 },
              { nome: 'Tubarão', emoji: '🦈', valor: 250, chance: 10 },
              { nome: 'Baleia', emoji: '🐋', valor: 500, chance: 5 }
            ];
            let r = Math.random() * 100, acum = 0, peixe = peixes[0];
            for (const p of peixes) { acum += p.chance; if (r <= acum) { peixe = p; break; } }
            u.reais += peixe.valor;
            u.ultimoPescar = Date.now();
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `╭━━━〔 🎣 𝐏𝐄𝐒𝐂𝐀𝐑𝐈𝐀 〕━━━╮\n┃\n┃ 💜 Você foi pescar!\n┃\n┃ ${peixe.emoji} Peixe: *${peixe.nome}*\n┃ 💰 Venda: *${formatarReais(peixe.valor)}*\n┃\n┃ 🕊️ Bom trabalho~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'minerar':
          {
            const u = shizukiUser(sender);
            const cd = checarCooldown(u.ultimoMinerar, 10 * 60 * 1000);
            if (!cd.ok) { await sock.sendMessage(from, { text: `⏰ Aguarde *${cd.minutos} min* pra minerar de novo!` }, { quoted: msg }); break; }
            const ganho = 50 + Math.floor(Math.random() * 451);
            const nomes = ['🪨 Pedra', '⚙️ Ferro', '🥇 Ouro', '💎 Diamante'];
            let minerio;
            if (ganho < 100) minerio = nomes[0];
            else if (ganho < 200) minerio = nomes[1];
            else if (ganho < 350) minerio = nomes[2];
            else minerio = nomes[3];
            u.reais += ganho;
            u.ultimoMinerar = Date.now();
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `╭━━━〔 ⛏️ 𝐌𝐈𝐍𝐄𝐑𝐀𝐂̧𝐀̃𝐎 〕━━━╮\n┃\n┃ 💜 Você foi minerar!\n┃\n┃ ${minerio}\n┃ 💰 Venda: *${formatarReais(ganho)}*\n┃\n┃ 🕊️ Bom trabalho~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'corrida':
          {
            const u = shizukiUser(sender);
            const cavalo = parseInt(args[0] || '0', 10);
            const valor = parseInt(args[1] || '0', 10);
            if (!cavalo || cavalo < 1 || cavalo > 5) { await sock.sendMessage(from, { text: '⚠️ Use: `!corrida <1-5> <valor>`\n\nEx: `!corrida 3 100`' }, { quoted: msg }); break; }
            if (!valor || valor < 10) { await sock.sendMessage(from, { text: '⚠️ Valor mínimo: *R$ 10*' }, { quoted: msg }); break; }
            if (valor > u.reais) { await sock.sendMessage(from, { text: `💸 Saldo insuficiente!\n\n💰 Você tem: *${formatarReais(u.reais)}*` }, { quoted: msg }); break; }
            const vencedor = Math.floor(Math.random() * 5) + 1;
            // ═══ Desgasta o veículo (5%) ═══
            const veicCorrida = desgastarVeiculo(u, sender, 5);
            if (vencedor === cavalo) {
              u.reais += valor * 2;
              salvarShizuki(sender, u);
              await sock.sendMessage(from, {
                text: `╭━━━〔 🏇 𝐂𝐎𝐑𝐑𝐈𝐃𝐀! 〕━━━╮\n┃\n┃ 💜 Você apostou *${formatarReais(valor)}* no *cavalo ${cavalo}*!\n┃\n┃ 🏁 Vencedor: *cavalo ${vencedor}* 🏆\n┃ 💰 Ganhou: *${formatarReais(valor * 3)}*\n┃\n` +
                (veicCorrida ? `┃ ${veicCorrida.emoji} ${veicCorrida.nome}: ${veicCorrida.vida}%\n┃\n` : '') +
                `┃ 🕊️ Que sorte!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                mentions: [sender]
              }, { quoted: msg });
            } else {
              u.reais -= valor;
              salvarShizuki(sender, u);
              await sock.sendMessage(from, {
                text: `╭━━━〔 🏇 𝐂𝐎𝐑𝐑𝐈𝐃𝐀 〕━━━╮\n┃\n┃ 💜 Você apostou *${formatarReais(valor)}* no *cavalo ${cavalo}*!\n┃\n┃ 🏁 Vencedor: *cavalo ${vencedor}*\n┃ 💔 Você perdeu...\n┃\n` +
                (veicCorrida ? `┃ ${veicCorrida.emoji} ${veicCorrida.nome}: ${veicCorrida.vida}%\n┃\n` : '') +
                `┃\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                mentions: [sender]
              }, { quoted: msg });
            }
          }
          break;

        case 'loteria':
          {
            const u = shizukiUser(sender);
            if (u.reais < 10) { await sock.sendMessage(from, { text: '💸 Precisa de *R$ 10*!' }, { quoted: msg }); break; }
            const db = carregarJSON('./loteria.json');
            const num = Math.floor(Math.random() * 90000) + 10000;
            db[sender] = { numero: num, compradoEm: Date.now() };
            salvarJSON('./loteria.json', db);
            u.reais -= 10;
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `╭━━━〔 🎟️ 𝐁𝐈𝐋𝐇𝐄𝐓𝐄 𝐂𝐎𝐌𝐏𝐑𝐀𝐃𝐎! 〕━━━╮\n┃\n┃ 💜 Você comprou um bilhete!\n┃\n┃ 🎟️ Número: *${num}*\n┃ 💰 Custo: *${formatarReais(10)}*\n┃\n┃ 🕊️ Sorteio à meia-noite!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'roubar':
          {
            if (!isGroup) break;
            const u = shizukiUser(sender);
            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;
            if (!alvo) { await sock.sendMessage(from, { text: '⚠️ Marque a pessoa!\n\nEx: `!roubar @pessoa`' }, { quoted: msg }); break; }
            const uAlvoProt = shizukiUser(alvo);
            if (uAlvoProt.vipprotecao && uAlvoProt.vipprotecao.expira > Date.now()) {
              const resta = uAlvoProt.vipprotecao.expira - Date.now();
              const h = Math.floor(resta / 3600000);
              const m = Math.floor((resta % 3600000) / 60000);
              await sock.sendMessage(from, {
                text: '╭━━━〔 🛡️ 𝐁𝐋𝐎𝐐𝐔𝐄𝐀𝐃𝐎 🛡️ 〕━━━╮\n┃\n┃ 😈 @' + sender.split('@')[0] + ' tentou te roubar!\n┃\n┃ 🛡️ Mas a proteção VIP bloqueou!\n┃\n┃ 💎 @' + alvo.split('@')[0] + ' tá protegido(a)!\n┃ ⏰ Proteção restante: *' + h + 'h ' + m + 'min*\n┃\n┃ 💜 Tenta outra hora, parça...\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [alvo, sender]
              }, { quoted: msg });
              break;
            }
            if (alvo === sender) { await sock.sendMessage(from, { text: '😅 Não pode roubar a si mesmo!' }, { quoted: msg }); break; }
            const cd = checarCooldown(u.ultimoRoubar, 30 * 60 * 1000);
            if (!cd.ok) { await sock.sendMessage(from, { text: `⏰ Aguarde *${cd.minutos} min*!` }, { quoted: msg }); break; }
            const uAlvo = shizukiUser(alvo);
            if (uAlvo.reais < 50) { await sock.sendMessage(from, { text: '💸 Essa pessoa tá falida!' }, { quoted: msg }); break; }
            u.ultimoRoubar = Date.now();
            if (Math.random() < 0.5) {
              const qtd = Math.min(Math.floor(uAlvo.reais * 0.1), 500);
              const real = Math.max(50, qtd);
              u.reais += real; uAlvo.reais -= real;
              salvarShizuki(sender, u); salvarShizuki(alvo, uAlvo);
              await sock.sendMessage(from, {
                text: `╭━━━〔 💰 𝐑𝐎𝐔𝐁𝐎! 〕━━━╮\n┃\n┃ 💜 Você roubou *${formatarReais(real)}*\n┃    de @${alvo.split('@')[0]}!\n┃\n┃ 😈 Ninguém viu nada...\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                mentions: [alvo]
              }, { quoted: msg });
            } else {
              u.reais = Math.max(0, u.reais - 50);
              let advs = carregarJSON(FILE_ADVS);
              if (!advs[from]) advs[from] = {};
              if (!advs[from][sender]) advs[from][sender] = 0;
              advs[from][sender] += 1;
              salvarJSON(FILE_ADVS, advs);
              salvarShizuki(sender, u);
              await sock.sendMessage(from, {
                text: `╭━━━〔 🚨 𝐅𝐔𝐆𝐈𝐔! 〕━━━╮\n┃\n┃ 💔 Você tentou roubar\n┃    @${alvo.split('@')[0]} mas fugiu!\n┃\n┃ 💰 Perdeu: *R$ 50*\n┃ ⚠️ +1 advertência\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                mentions: [alvo]
              }, { quoted: msg });
            }
          }
          break;

        case 'assaltar':
          {
            const u = shizukiUser(sender);
            const cd = checarCooldown(u.ultimoAssaltar, 30 * 60 * 1000);
            if (!cd.ok) { await sock.sendMessage(from, { text: `⏰ Aguarde *${cd.minutos} min*!` }, { quoted: msg }); break; }
            const locais = [
              { nome: '🏚️ Casa abandonada', min: 100, max: 500, chance: 30 },
              { nome: '🏪 Loja de bairro', min: 500, max: 2000, chance: 40 },
              { nome: '🏦 Banco pequeno', min: 2000, max: 5000, chance: 20 },
              { nome: '🏛️ Banco Central', min: 5000, max: 15000, chance: 10 }
            ];
            let r = Math.random() * 100, acum = 0, local = locais[0];
            for (const l of locais) { acum += l.chance; if (r <= acum) { local = l; break; } }
            u.ultimoAssaltar = Date.now();
            if (Math.random() < 0.5) {
              const ganho = local.min + Math.floor(Math.random() * (local.max - local.min));
              u.reais += ganho;
              salvarShizuki(sender, u);
              await sock.sendMessage(from, {
                text: `╭━━━〔 🏦 𝐀𝐒𝐒𝐀𝐋𝐓𝐎! 〕━━━╮\n┃\n┃ 💜 Você assaltou:\n┃ ${local.nome}\n┃\n┃ 💰 Levou: *${formatarReais(ganho)}*\n┃\n┃ 🕊️ Foge antes da polícia!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                mentions: [sender]
              }, { quoted: msg });
            } else {
              u.reais = Math.max(0, u.reais - 50);
              let advs = carregarJSON(FILE_ADVS);
              if (!advs[from]) advs[from] = {};
              if (!advs[from][sender]) advs[from][sender] = 0;
              advs[from][sender] += 1;
              salvarJSON(FILE_ADVS, advs);
              salvarShizuki(sender, u);
              await sock.sendMessage(from, {
                text: `╭━━━〔 🚨 𝐅𝐔𝐆𝐈𝐔! 〕━━━╮\n┃\n┃ 💔 Você tentou assaltar:\n┃ ${local.nome}\n┃\n┃ 💰 Perdeu: *R$ 50*\n┃ ⚠️ +1 advertência\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                mentions: [sender]
              }, { quoted: msg });
            }
          }
          break;

        case 'sequestrar':
          {
            if (!isGroup) break;
            const u = shizukiUser(sender);
            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;
            if (!alvo) { await sock.sendMessage(from, { text: '⚠️ Marque a pessoa!\n\nEx: `!sequestrar @pessoa`' }, { quoted: msg }); break; }
            const uAlvoProt = shizukiUser(alvo);
            if (uAlvoProt.vipprotecao && uAlvoProt.vipprotecao.expira > Date.now()) {
              const resta = uAlvoProt.vipprotecao.expira - Date.now();
              const h = Math.floor(resta / 3600000);
              const m = Math.floor((resta % 3600000) / 60000);
              await sock.sendMessage(from, {
                text: '╭━━━〔 🛡️ 𝐁𝐋𝐎𝐐𝐔𝐄𝐀𝐃𝐎 🛡️ 〕━━━╮\n┃\n┃ 😈 @' + sender.split('@')[0] + ' tentou te roubar!\n┃\n┃ 🛡️ Mas a proteção VIP bloqueou!\n┃\n┃ 💎 @' + alvo.split('@')[0] + ' tá protegido(a)!\n┃ ⏰ Proteção restante: *' + h + 'h ' + m + 'min*\n┃\n┃ 💜 Tenta outra hora, parça...\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [alvo, sender]
              }, { quoted: msg });
              break;
            }
            if (alvo === sender) { await sock.sendMessage(from, { text: '😅 Não pode sequestrar a si mesmo!' }, { quoted: msg }); break; }
            const cd = checarCooldown(u.ultimoSequestrar, 30 * 60 * 1000);
            if (!cd.ok) { await sock.sendMessage(from, { text: `⏰ Aguarde *${cd.minutos} min*!` }, { quoted: msg }); break; }
            const uAlvo = shizukiUser(alvo);
            u.ultimoSequestrar = Date.now();
            if (Math.random() < 0.5) {
              const qtd = Math.min(Math.max(Math.floor(uAlvo.reais * 0.3), 100), 5000);
              const real = Math.max(100, qtd);
              u.reais += real; uAlvo.reais = Math.max(0, uAlvo.reais - real);
              salvarShizuki(sender, u); salvarShizuki(alvo, uAlvo);
              await sock.sendMessage(from, {
                text: `╭━━━〔 😈 𝐒𝐄𝐐𝐔𝐄𝐒𝐓𝐑𝐎! 〕━━━╮\n┃\n┃ 💜 Você sequestrou @${alvo.split('@')[0]}!\n┃\n┃ 💰 Resgate: *${formatarReais(real)}*\n┃\n┃ 🕊️ Solta só se pagarem!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                mentions: [alvo]
              }, { quoted: msg });
            } else {
              u.reais = Math.max(0, u.reais - 50);
              let advs = carregarJSON(FILE_ADVS);
              if (!advs[from]) advs[from] = {};
              if (!advs[from][sender]) advs[from][sender] = 0;
              advs[from][sender] += 1;
              salvarJSON(FILE_ADVS, advs);
              salvarShizuki(sender, u);
              await sock.sendMessage(from, {
                text: `╭━━━〔 🚨 𝐏𝐑𝐄𝐒𝐎! 〕━━━╮\n┃\n┃ 💔 Você foi pego pela polícia!\n┃\n┃ 💰 Perdeu: *R$ 50*\n┃ ⚠️ +1 advertência\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                mentions: [sender]
              }, { quoted: msg });
            }
          }
          break;


// PACOTE 5
        // ═══════════════════════════════════════════════
        //           PACOTE 5 — ECONOMIA
        // ═══════════════════════════════════════════════

        case 'banco':
          {
            const u = shizukiUser(sender);
            const sub = (args[0] || '').toLowerCase();
            const valor = parseInt(args[1] || '0', 10);

            if (sub === 'depositar' || sub === 'dep') {
              if (!valor || valor < 1) { await sock.sendMessage(from, { text: '⚠️ Use: `!banco depositar <valor>`' }, { quoted: msg }); break; }
              if (valor > u.reais) { await sock.sendMessage(from, { text: `💸 Saldo insuficiente!\n\n💰 Você tem: *${formatarReais(u.reais)}*` }, { quoted: msg }); break; }
              u.reais -= valor;
              u.banco = (u.banco || 0) + valor;
              u.ultimoRendBanco = u.ultimoRendBanco || Date.now();
              salvarShizuki(sender, u);
              await sock.sendMessage(from, {
                text: `╭━━━〔 🏦 𝐃𝐄𝐏𝐎́𝐒𝐈𝐓𝐎 〕━━━╮\n┃\n┃ 💜 Você depositou *${formatarReais(valor)}*\n┃\n┃ 🏦 No banco: *${formatarReais(u.banco)}*\n┃ 💰 Em mãos: *${formatarReais(u.reais)}*\n┃\n┃ 🕊️ Rende 1%/dia~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                mentions: [sender]
              }, { quoted: msg });
            } else if (sub === 'sacar' || sub === 'saque') {
              if (!valor || valor < 1) { await sock.sendMessage(from, { text: '⚠️ Use: `!banco sacar <valor>`' }, { quoted: msg }); break; }
              if (valor > (u.banco || 0)) { await sock.sendMessage(from, { text: `💸 Você só tem *${formatarReais(u.banco || 0)}* no banco!` }, { quoted: msg }); break; }
              u.banco -= valor;
              u.reais += valor;
              salvarShizuki(sender, u);
              await sock.sendMessage(from, {
                text: `╭━━━〔 🏦 𝐒𝐀𝐐𝐔𝐄 〕━━━╮\n┃\n┃ 💜 Você sacou *${formatarReais(valor)}*\n┃\n┃ 🏦 No banco: *${formatarReais(u.banco)}*\n┃ 💰 Em mãos: *${formatarReais(u.reais)}*\n┃\n┃ 🕊️ Pronto!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                mentions: [sender]
              }, { quoted: msg });
            } else {
              const banco = u.banco || 0;
              await sock.sendMessage(from, {
                text: `╭━━━〔 🏦 𝐁𝐀𝐍𝐂𝐎 〕━━━╮\n┃\n┃ 💜 Bem-vindo ao banco!\n┃\n┃ 💰 Em mãos: *${formatarReais(u.reais)}*\n┃ 🏦 Guardado: *${formatarReais(banco)}*\n┃ 📈 Rendimento: *+1%/dia*\n┃\n┃ 💡 Use: !banco depositar <valor>\n┃ 💡 Use: !banco sacar <valor>\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                mentions: [sender]
              }, { quoted: msg });
            }
          }
          break;

        case 'emprestar':
          {
            if (!isGroup) break;
            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;
            if (!alvo) { await sock.sendMessage(from, { text: '⚠️ Marque a pessoa!\n\nEx: `!emprestar @pessoa 500`' }, { quoted: msg }); break; }
            if (alvo === sender) { await sock.sendMessage(from, { text: '😅 Não pode emprestar pra si mesmo!' }, { quoted: msg }); break; }
            const valor = parseInt(args.find(a => /^\d+$/.test(a)) || '0', 10);
            if (!valor || valor < 100) { await sock.sendMessage(from, { text: '⚠️ Mínimo: *R$ 100*\n\nEx: `!emprestar @pessoa 500`' }, { quoted: msg }); break; }
            const u = shizukiUser(sender);
            if (valor > u.reais) { await sock.sendMessage(from, { text: `💸 Saldo insuficiente!\n\n💰 Você tem: *${formatarReais(u.reais)}*` }, { quoted: msg }); break; }
            const uAlvo = shizukiUser(alvo);
            u.reais -= valor;
            uAlvo.reais += valor;
            uAlvo.divida = (uAlvo.divida || 0) + Math.floor(valor * 1.1);
            salvarShizuki(sender, u);
            salvarShizuki(alvo, uAlvo);
            await sock.sendMessage(from, {
              text: `╭━━━〔 💸 𝐄𝐌𝐏𝐑𝐄́𝐒𝐓𝐈𝐌𝐎 〕━━━╮\n┃\n┃ 💜 Você emprestou *${formatarReais(valor)}*\n┃    para @${alvo.split('@')[0]}!\n┃\n┃ ⏰ Prazo: *7 dias*\n┃ 💰 Devolução: *${formatarReais(Math.floor(valor * 1.1))}*\n┃\n┃ 🕊️ Cobre na data!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [alvo]
            }, { quoted: msg });
          }
          break;

        case 'doardinheiro':
        case 'doar':
          {
            if (!isGroup) break;
            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;
            if (!alvo) { await sock.sendMessage(from, { text: '⚠️ Marque a pessoa!\n\nEx: `!doardinheiro @pessoa 100`' }, { quoted: msg }); break; }
            if (alvo === sender) { await sock.sendMessage(from, { text: '😅 Não pode doar pra si mesmo!' }, { quoted: msg }); break; }
            const valor = parseInt(args.find(a => /^\d+$/.test(a)) || '0', 10);
            if (!valor || valor < 1) { await sock.sendMessage(from, { text: '⚠️ Informe o valor!\n\nEx: `!doardinheiro @pessoa 100`' }, { quoted: msg }); break; }
            const u = shizukiUser(sender);
            if (valor > u.reais) { await sock.sendMessage(from, { text: `💸 Saldo insuficiente!\n\n💰 Você tem: *${formatarReais(u.reais)}*` }, { quoted: msg }); break; }
            const uAlvo = shizukiUser(alvo);
            u.reais -= valor;
            uAlvo.reais += valor;
            salvarShizuki(sender, u);
            salvarShizuki(alvo, uAlvo);
            await sock.sendMessage(from, {
              text: `╭━━━〔 💜 𝐃𝐎𝐀𝐂̧𝐀̃𝐎 〕━━━╮\n┃\n┃ 💜 Você doou *${formatarReais(valor)}*\n┃    para @${alvo.split('@')[0]}!\n┃\n┃ 🕊️ Que coração generoso!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [alvo]
            }, { quoted: msg });
          }
          break;

        // ═══════════════════════════════════════════════
        //     VIDA ÚTIL DOS VEÍCULOS
        // ═══════════════════════════════════════════════

        case 'meusveiculos':
        case 'meuscarros':
          {
            const u = shizukiUser(sender);
            const meus = (u.itens || []).filter(x => typeof x === 'object' && x.vida !== undefined);
            if (!meus.length) {
              await sock.sendMessage(from, {
                text: `╔══════════════════════════════╗\n║  🚗 𝐌𝐄𝐔𝐒 𝐕𝐄𝐈́𝐂𝐔𝐋𝐎𝐒  🚗  ║\n╚══════════════════════════════╝\n\n📭 Você ainda não tem nenhum veículo!\n\n💡 Compre em: *!comprarloja*\n\n🌸 𝐒𝐡𝐢𝐳𝐮𝐤𝐢 𝐁𝐨𝐭 - 𝐌𝐃 🌸`
              }, { quoted: msg });
              break;
            }
            let txt = `╔══════════════════════════════╗\n║  🚗 𝐌𝐄𝐔𝐒 𝐕𝐄𝐈́𝐂𝐔𝐋𝐎𝐒  🚗  ║\n╚══════════════════════════════╝\n\n`;
            meus.forEach(v => {
              const cheios = Math.round(v.vida / 10);
              const barra = '▓'.repeat(cheios) + '░'.repeat(10 - cheios);
              let status = '✅ Em perfeito estado';
              if (v.vida <= 0) status = '💀 QUEBRADO (arrume!)';
              else if (v.vida < 30) status = '⚠️ Muito desgastado';
              else if (v.vida < 60) status = '🟡 Precisa de revisão';
              txt += `${v.emoji} *${v.nome}*\n`;
              txt += `   🔋 ${barra} ${v.vida}%\n`;
              txt += `   ${status}\n\n`;
            });
            txt += `💡 Use: *!arrumar <nome>* pra consertar\n`;
            txt += `🌸 𝐒𝐡𝐢𝐳𝐮𝐤𝐢 𝐁𝐨𝐭 - 𝐌𝐃 🌸`;
            await sock.sendMessage(from, { text: txt }, { quoted: msg });
          }
          break;

        case 'arrumar':
        case 'consertar':
          {
            const u = shizukiUser(sender);
            const nomeBusca = args.join(' ').toLowerCase().trim();
            if (!nomeBusca) {
              await sock.sendMessage(from, { text: '⚠️ Use: *!arrumar <nome do veículo>*\n\nEx: *!arrumar carro*' }, { quoted: msg });
              break;
            }
            const meus = (u.itens || []).filter(x => typeof x === 'object' && x.vida !== undefined);
            const veic = meus.find(v =>
              v.id.toLowerCase() === nomeBusca ||
              v.nome.toLowerCase() === nomeBusca ||
              v.nome.toLowerCase().includes(nomeBusca)
            );
            if (!veic) {
              await sock.sendMessage(from, { text: `❌ Você não tem *${nomeBusca}*! Use *!meusveiculos* pra ver.` }, { quoted: msg });
              break;
            }
            if (veic.vida >= 100) {
              await sock.sendMessage(from, { text: `✅ Seu *${veic.nome}* já tá 100%! Não precisa arrumar.` }, { quoted: msg });
              break;
            }
            const custo = veic.preco;
            if (u.reais < custo) {
              await sock.sendMessage(from, {
                text: `╔══════════════════════════════╗\n║      ❌  𝐒𝐄𝐌  𝐒𝐀𝐋𝐃𝐎  ❌      ║\n╚══════════════════════════════╝\n\n` +
                      `╭─❖ 🔧 𝐀𝐑𝐑𝐔𝐌𝐀𝐑 ❖─╮\n│\n` +
                      `│  ${veic.emoji} ${veic.nome}\n│\n` +
                      `│  🔧 Custo: ${formatarReais(custo)}\n` +
                      `│  💵 Você tem: ${formatarReais(u.reais)}\n│\n` +
                      `│  📉 Falta: *${formatarReais(custo - u.reais)}*\n│\n` +
                      `╰─────────────────────╯\n\n🌸 𝐒𝐡𝐢𝐳𝐮𝐤𝐢 𝐁𝐨𝐭 - 𝐌𝐃 🌸`
              }, { quoted: msg });
              break;
            }
            u.reais -= custo;
            veic.vida = 100;
            veic.ultimaRevisao = Date.now();
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `╔══════════════════════════════╗\n║  ⋆｡°✩  🔧 𝐀𝐑𝐑𝐔𝐌𝐀𝐃𝐎! 🔧  ✩°｡⋆  ║\n╚══════════════════════════════╝\n\n` +
                    `╭─❖ ✅ 𝐑𝐄𝐕𝐈𝐒𝐀̃𝐎 𝐎𝐊 ❖─╮\n│\n` +
                    `│  ${veic.emoji} ${veic.nome}\n│\n` +
                    `│  🔋 Vida útil: *100%*\n` +
                    `│  💰 Pago: ${formatarReais(custo)}\n` +
                    `│  💵 Saldo: ${formatarReais(u.reais)}\n│\n` +
                    `╰─────────────────────╯\n\n💜 Como novo!\n\n🌸 𝐒𝐡𝐢𝐳𝐮𝐤𝐢 𝐁𝐨𝐭 - 𝐌𝐃 🌸`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'comprarloja':
        case 'loja':
          {
            const u = shizukiUser(sender);
            let sub = args.join(' ').toLowerCase().trim();
            // Normaliza: tira espaço e acento pra comparar com os IDs
            const normSub = sub.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');

            // ═══ CATÁLOGO COMPLETO ═══
            const itens = {
              // 🚗 VEÍCULOS
              bicicleta:    { nome: 'Bicicleta',        emoji: '🚲', preco: 800,      cat: 'veiculos' },
              moto:         { nome: 'Moto',             emoji: '🛵', preco: 3500,     cat: 'veiculos' },
              carro:        { nome: 'Carro Popular',    emoji: '🚗', preco: 12000,    cat: 'veiculos' },
              carroesportivo: { nome: 'Carro Esportivo', emoji: '🏎️', preco: 45000,   cat: 'veiculos' },
              helicoptero:  { nome: 'Helicóptero',      emoji: '🚁', preco: 150000,   cat: 'veiculos' },
              iate:         { nome: 'Iate',             emoji: '🛥️', preco: 350000,   cat: 'veiculos' },
              jato:         { nome: 'Jato Particular',  emoji: '✈️', preco: 1500000,  cat: 'veiculos' },
              jatosupersonico: { nome: 'Jato Supersônico', emoji: '🛸', preco: 5000000, cat: 'veiculos' },
              // 🏝️ ILHAS
              ilhapequena:  { nome: 'Ilha Pequena',     emoji: '🏖️', preco: 500000,   cat: 'ilhas' },
              ilhamedia:    { nome: 'Ilha Média',       emoji: '🏝️', preco: 1500000,  cat: 'ilhas' },
              ilhaparadisiaca: { nome: 'Ilha Paradisíaca', emoji: '🌴', preco: 5000000, cat: 'ilhas' },
              // 💎 ITENS DE LUXO
              anel:         { nome: 'Anel',             emoji: '💍', preco: 1500,     cat: 'luxo' },
              relogio:      { nome: 'Relógio Rolex',    emoji: '⌚', preco: 8000,     cat: 'luxo' },
              coroa:        { nome: 'Coroa',            emoji: '👑', preco: 15000,    cat: 'luxo' },
              diamante:     { nome: 'Diamante',         emoji: '💎', preco: 30000,    cat: 'luxo' },
              // 📱 ELETRÔNICOS
              celular:      { nome: 'Celular Top',      emoji: '📱', preco: 800,      cat: 'eletronicos' },
              notebook:     { nome: 'Notebook Gamer',   emoji: '💻', preco: 2000,     cat: 'eletronicos' },
              trofeu:       { nome: 'Troféu',           emoji: '🏆', preco: 800,      cat: 'eletronicos' }
            };

            // ═══ SE NÃO TEM ARGUMENTO: MOSTRA A LOJA ═══
            if (!sub) {
              let txt = `╔══════════════════════════════╗\n` +
                        `║  ⋆｡°✩  🛒 𝐋𝐎𝐉𝐀 𝐒𝐇𝐈𝐙𝐔𝐊𝐈 🛒  ✩°｡⋆  ║\n` +
                        `║         💜 Sua vida virtual 💜        ║\n` +
                        `╚══════════════════════════════╝\n\n` +
                        `┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n` +
                        `┃ 💰 𝐒𝐄𝐔 𝐒𝐀𝐋𝐃𝐎: ${formatarReais(u.reais).padEnd(15)} ┃\n` +
                        `┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;

              // 🚗 VEÍCULOS
              txt += `╭─❖ 🚗 𝐕𝐄Í𝐂𝐔𝐋𝐎𝐒 ❖─╮\n│\n`;
              for (const [id, it] of Object.entries(itens)) {
                if (it.cat !== 'veiculos') continue;
                txt += `│  ${it.emoji} ${it.nome.padEnd(22, ".")} ${formatarPrecoCurto(it.preco)}\n`;
              }
              txt += `│\n╰─────────────────────╯\n\n`;

              // 🏝️ ILHAS
              txt += `╭─❖ 🏝️ 𝐈𝐋𝐇𝐀𝐒 ❖─╮\n│\n`;
              for (const [id, it] of Object.entries(itens)) {
                if (it.cat !== 'ilhas') continue;
                txt += `│  ${it.emoji} ${it.nome} ··· ${formatarPrecoCurto(it.preco)}\n`;
              }
              txt += `│\n╰─────────────────────╯\n\n`;

              // 💎 LUXO
              txt += `╭─❖ 💎 𝐋𝐔𝐗𝐎 ❖─╮\n│\n`;
              for (const [id, it] of Object.entries(itens)) {
                if (it.cat !== 'luxo') continue;
                txt += `│  ${it.emoji} ${it.nome} ··· ${formatarPrecoCurto(it.preco)}\n`;
              }
              txt += `│\n╰─────────────────────╯\n\n`;

              // 📱 ELETRÔNICOS
              txt += `╭─❖ 📱 𝐄𝐋𝐄𝐓𝐑𝐎̂𝐍𝐈𝐂𝐎𝐒 ❖─╮\n│\n`;
              for (const [id, it] of Object.entries(itens)) {
                if (it.cat !== 'eletronicos') continue;
                txt += `│  ${it.emoji} ${it.nome} ··· ${formatarPrecoCurto(it.preco)}\n`;
              }
              txt += `│\n╰─────────────────────╯\n\n`;

              txt += `┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n` +
                     `┃ 💡 *!comprarloja <item>*             ┃\n` +
                     `┃ 📝 Ex: *!comprarloja carro*          ┃\n` +
                     `┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +
                     `🌸 𝐒𝐡𝐢𝐳𝐮𝐤𝐢 𝐁𝐨𝐭 - 𝐌𝐃 🌸`;

              await sock.sendMessage(from, { text: txt, mentions: [sender] }, { quoted: msg });
              break;
            }

            // ═══ COMPRA ═══
            // Procura pelo ID normalizado (aceita espaço e acento)
            let itemId = null;
            for (const [id, it] of Object.entries(itens)) {
              const normId = id.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
              const normNome = it.nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '').toLowerCase();
              if (normId === normSub || normNome === normSub) { itemId = id; break; }
            }
            const item = itemId ? itens[itemId] : null;
            sub = itemId; // atualiza sub pro ID correto
            if (!item) {
              await sock.sendMessage(from, { text: '⚠️ Item inválido! Use *!comprarloja* pra ver a lista.' }, { quoted: msg });
              break;
            }

            // Verifica se já tem
            u.itens = u.itens || [];
            const jaTem = u.itens.some(x => (typeof x === 'string' ? x : x.id) === sub);
            if (jaTem) {
              await sock.sendMessage(from, { text: `❌ Você já tem *${item.nome}*!` }, { quoted: msg });
              break;
            }

            // Verifica saldo
            if (u.reais < item.preco) {
              await sock.sendMessage(from, {
                text: `╔══════════════════════════════╗\n` +
                      `║  ⋆｡°✩  ❌ 𝐒𝐄𝐌 𝐒𝐀𝐋𝐃𝐎 ❌  ✩°｡⋆  ║\n` +
                      `╚══════════════════════════════╝\n\n` +
                      `╭─❖ 💸 𝐅𝐀𝐋𝐓𝐀 𝐃𝐈𝐍𝐇𝐄𝐈𝐑𝐎 ❖─╮\n│\n` +
                      `│  ${item.emoji} ${item.nome}\n│\n` +
                      `│  💰 Preço: ${formatarReais(item.preco)}\n` +
                      `│  💵 Você tem: ${formatarReais(u.reais)}\n│\n` +
                      `│  📉 Falta: *${formatarReais(item.preco - u.reais)}*\n│\n` +
                      `╰─────────────────────╯\n\n` +
                      `🌸 𝐒𝐡𝐢𝐳𝐮𝐤𝐢 𝐁𝐨𝐭 - 𝐌𝐃 🌸`
              }, { quoted: msg });
              break;
            }

            // Compra!
            u.reais -= item.preco;
            u.itens = u.itens || [];
            // Se é veículo, salva com vida útil
            if (item.cat === 'veiculos') {
              u.itens.push({
                id: sub,
                nome: item.nome,
                emoji: item.emoji,
                preco: item.preco,
                vida: 100,
                compradoEm: Date.now()
              });
            } else {
              u.itens.push(sub);
            }
            salvarShizuki(sender, u);

            await sock.sendMessage(from, {
              text: `╔══════════════════════════════╗\n` +
                    `║  ⋆｡°✩  ✅ 𝐂𝐎𝐌𝐏𝐑𝐀 𝐎𝐊! ✅  ✩°｡⋆  ║\n` +
                    `╚══════════════════════════════╝\n\n` +
                    `╭─❖ 🛒 𝐑𝐄𝐂𝐈𝐁𝐎 ❖─╮\n│\n` +
                    `│  ${item.emoji} ${item.nome}\n│\n` +
                    `│  💰 Pago: ${formatarReais(item.preco)}\n` +
                    `│  💵 Saldo: ${formatarReais(u.reais)}\n│\n` +
                    `╰─────────────────────╯\n\n` +
                    `💜 Parabéns pela conquista!\n\n` +
                    `🌸 𝐒𝐡𝐢𝐳𝐮𝐤𝐢 𝐁𝐨𝐭 - 𝐌𝐃 🌸`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'vender':
        case 'vendercarro':
          {
            const u = shizukiUser(sender);
            const sub = (args[0] || '').toLowerCase();
            const itens = {
              carro: { nome: 'Carro', emoji: '🚗', venda: 2400 },
              moto: { nome: 'Moto', emoji: '🏍️', venda: 1200 },
              celular: { nome: 'Celular', emoji: '📱', venda: 640 },
              notebook: { nome: 'Notebook', emoji: '💻', venda: 1600 },
              anel: { nome: 'Anel', emoji: '💍', venda: 400 },
              relogio: { nome: 'Relógio', emoji: '⌚', venda: 960 },
              coroa: { nome: 'Coroa', emoji: '👑', venda: 4000 },
              trofeu: { nome: 'Troféu', emoji: '🏆', venda: 640 }
            };

            if (!sub) {
              await sock.sendMessage(from, { text: '⚠️ Use: `!vender <item>`\n\nEx: `!vender carro`' }, { quoted: msg });
              break;
            }
            const item = itens[sub];
            if (!item) { await sock.sendMessage(from, { text: '⚠️ Item inválido!' }, { quoted: msg }); break; }
            if (!(u.itens || []).includes(sub)) { await sock.sendMessage(from, { text: `❌ Você não tem *${item.nome}*!` }, { quoted: msg }); break; }

            const idx = u.itens.indexOf(sub);
            u.itens.splice(idx, 1);
            u.reais += item.venda;
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `╭━━━〔 💰 𝐕𝐄𝐍𝐃𝐀! 〕━━━╮\n┃\n┃ 💜 Você vendeu!\n┃\n┃ ${item.emoji} *${item.nome}*\n┃ 💰 Recebeu: *${formatarReais(item.venda)}*\n┃\n┃ 🕊️ Bom negócio~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;


        // BLACKLIST CASE
        case 'blacklist':
        case 'bl':
          {
            if (!isGroup) break;
            const gm = await sock.groupMetadata(from);
            const ehAdm = !!gm.participants.find(p => p.id === sender)?.admin;
            if (!ehAdm && !isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg });
              break;
            }

            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;
            if (!alvo) {
              await sock.sendMessage(from, {
                text: `╭━━━〔 🚫 𝐁𝐋𝐀𝐂𝐊𝐋𝐈𝐒𝐓 〕━━━╮\n┃\n┃ 💜 Como usar:\n┃\n┃ 📝 *!blacklist @pessoa*\n┃    ➜ Bane a pessoa do bot\n┃\n┃ 📝 *!blacklist @pessoa off*\n┃    ➜ Remove da blacklist\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
              break;
            }

            const sub = (args.find(a => a.toLowerCase() === 'off') || '').toLowerCase();
            const db = carregarJSON(FILE_BLACKLIST);
            db[from] = db[from] || [];

            if (sub === 'off') {
              const idx = db[from].indexOf(alvo);
              if (idx === -1) {
                await sock.sendMessage(from, { text: `ℹ️ @${alvo.split('@')[0]} não está na blacklist.`, mentions: [alvo] }, { quoted: msg });
                break;
              }
              db[from].splice(idx, 1);
              salvarJSON(FILE_BLACKLIST, db);
              await sock.sendMessage(from, {
                text: `╭━━━〔 ✅ 𝐁𝐋𝐀𝐂𝐊𝐋𝐈𝐒𝐓 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐎 〕━━━╮\n┃\n┃ 💜 @${alvo.split('@')[0]} foi removido(a)\n┃    da blacklist!\n┃\n┃ 🕊️ Agora pode usar o bot\n┃    novamente~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                mentions: [alvo]
              }, { quoted: msg });
            } else {
              if (db[from].includes(alvo)) {
                await sock.sendMessage(from, { text: `ℹ️ @${alvo.split('@')[0]} já está na blacklist!`, mentions: [alvo] }, { quoted: msg });
                break;
              }
              db[from].push(alvo);
              salvarJSON(FILE_BLACKLIST, db);
              await sock.sendMessage(from, {
                text: `╭━━━〔 🚫 𝐁𝐋𝐀𝐂𝐊𝐋𝐈𝐒𝐓 〕━━━╮\n┃\n┃ 💔 @${alvo.split('@')[0]} foi adicionado(a)\n┃    à blacklist!\n┃\n┃ 🚫 Você não pode mais usar\n┃    o bot neste grupo.\n┃\n┃ 💌 Espere algum adm remover~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                mentions: [alvo]
              }, { quoted: msg });
            }
          }
          break;

// ESPIAO GLOBAL
        case 'espiao':
          {
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono pode usar isso! 💜' }, { quoted: msg }); break; }

            const db = carregarJSON('./logs.json');
            db.__global = db.__global || { ativo: false };
            const sub = (args[0] || '').toLowerCase();

            if (sub === 'on') {
              db.__global.ativo = true;
              salvarJSON('./logs.json', db);
              await sock.sendMessage(from, {
                text: `╭━━━〔 🕵️ 𝐄𝐒𝐏𝐈𝐀̃𝐎 〕━━━╮\n┃\n┃ 💜 *Ativado com sucesso~* ✨\n┃\n┃ 👁️ Agora eu vou ficar de\n┃    olho em *TODOS* os\n┃    grupos, tá?\n┃\n┃ 📝 Registrando: mensagens,\n┃    comandos e mídias~ 🎀\n┃\n┃ 💜 Só você (dono) vê!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
            } else if (sub === 'off') {
              db.__global.ativo = false;
              salvarJSON('./logs.json', db);
              await sock.sendMessage(from, {
                text: `╭━━━〔 🕵️ 𝐄𝐒𝐏𝐈𝐀̃𝐎 〕━━━╮\n┃\n┃ 💤 *Desativado~*\n┃\n┃ 👁️ Fechei os olhos em\n┃    todos os grupos! 🕊️\n┃\n┃ 💜 Os logs já salvos\n┃    ficam com *!verlogs*\n┃\n┃ ✨ Até a próxima~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
            } else {
              const status = db.__global.ativo ? '✅ Ativo' : '❌ Desativado';
              const grupos = Object.keys(db).filter(k => k !== '__global');
              await sock.sendMessage(from, {
                text: `╭━━━〔 🕵️ 𝐄𝐒𝐏𝐈𝐀̃𝐎 〕━━━╮\n┃\n┃ 💜 Como usar:\n┃\n┃ 📝 *!espiao on*\n┃    ➜ Ativa em todos os grupos\n┃\n┃ 📝 *!espiao off*\n┃    ➜ Desativa global\n┃\n┃ 📝 *!verlogs <grupo> [qtd]*\n┃    ➜ Ver logs de um grupo\n┃\n┃ 🔘 Status: *${status}*\n┃ 📊 Grupos salvos: *${grupos.length}*\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
            }
          }
          break;

        case 'verlogs':
        case 'logs':
          {
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono pode usar~ 💜' }, { quoted: msg }); break; }

            const db = carregarJSON('./logs.json');
            const nomeBusca = (args[0] || '').toLowerCase().trim();
            const qtd = Math.min(parseInt(args[1] || '20', 10) || 20, 100);

            if (!nomeBusca) {
              const grupos = Object.keys(db).filter(k => k !== '__global');
              if (!grupos.length) {
                await sock.sendMessage(from, {
                  text: `╭━━━〔 💤 𝐒𝐄𝐌 𝐋𝐎𝐆𝐒 〕━━━╮\n┃\n┃ 💜 Tô de olhos fechados\n┃    ainda~ 🕊️\n┃\n┃ 💡 Ative com: *!espiao on*\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
                }, { quoted: msg });
                break;
              }
              let txt = `╭━━━〔 📋 𝐆𝐑𝐔𝐏𝐎𝐒 𝐂𝐎𝐌 𝐋𝐎𝐆𝐒 〕━━━╮\n┃\n┃ 💜 Aqui estão os grupos\n┃    que eu espiei~ 👁️\n┃\n`;
              for (const g of grupos) {
                const total = (db[g].mensagens || []).length;
                let nome = g;
                try { const m = await sock.groupMetadata(g); nome = m.subject; } catch (e) {}
                txt += `┃ 📁 *${nome}*\n┃    ┗ 📊 ${total} mensagens\n┃\n`;
              }
              txt += `┃ 💡 Use: *!verlogs <nome>* 🎀\n┃\n╰━━━━━━━━━━━━━━━━━━╯`;
              await sock.sendMessage(from, { text: txt }, { quoted: msg });
              break;
            }

            let grupoEncontrado = null;
            for (const g of Object.keys(db)) {
              if (g === '__global') continue;
              try {
                const m = await sock.groupMetadata(g);
                if (m.subject.toLowerCase().includes(nomeBusca)) { grupoEncontrado = g; break; }
              } catch (e) {}
            }

            if (!grupoEncontrado || !db[grupoEncontrado] || !db[grupoEncontrado].mensagens) {
              await sock.sendMessage(from, { text: `❌ Nenhum log salvo pra *${nomeBusca}*~` }, { quoted: msg });
              break;
            }

            const todas = db[grupoEncontrado].mensagens;
            const ultimas = todas.slice(-qtd);
            const gm = await sock.groupMetadata(grupoEncontrado).catch(() => ({ subject: 'Grupo' }));

            let txt = `╭━━━〔 📋 𝐔́𝐋𝐓𝐈𝐌𝐀𝐒 𝐌𝐄𝐍𝐒𝐀𝐆𝐄𝐍𝐒 〕━━━╮\n┃\n┃ 🕵️ *Grupo:* ${gm.subject}\n┃ 📊 *Total:* ${todas.length}/200\n┃ 📝 *Mostrando:* ${ultimas.length}\n┃\n╰━━━━━━━━━━━━━━━━━━╯\n\n🎀 *Aqui está o que rolou~*\n\n`;

            for (const m of ultimas) {
              const hora = new Date(m.hora).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
              const emojiTipo = m.tipo === 'foto' ? '🖼️' : m.tipo === 'video' ? '🎥' : m.tipo === 'audio' ? '🎵' : m.tipo === 'sticker' ? '🎨' : m.tipo === 'comando' ? '⚙️' : '💬';
              const conteudo = m.tipo === 'foto' ? '[foto]' : m.tipo === 'video' ? '[vídeo]' : m.tipo === 'audio' ? '[áudio]' : m.tipo === 'sticker' ? '[sticker]' : (m.texto || '').slice(0, 80);
              txt += `👤 *${m.nome}* ─ [${hora}]\n    ${emojiTipo} ${conteudo}\n\n`;
            }

            await sock.sendMessage(from, { text: txt }, { quoted: msg });
          }
          break;
        case 'ping':
          {
            const tIniPing = Date.now();
            let tsPing = msg.messageTimestamp;
            if (tsPing && typeof tsPing === 'object' && typeof tsPing.toNumber === 'function') tsPing = tsPing.toNumber();
            tsPing = Number(tsPing);

            const dadosPing = {
              recebe: tsPing ? Math.max(0, tIniPing - tsPing * 1000) : null,
              envio: null,
              edicao: null,
              internet: null
            };

            let enviadoPing;
            try {
              const t1 = Date.now();
              enviadoPing = await sock.sendMessage(from, { text: textoPingProgresso(0, '🔎 Iniciando medição...') }, { quoted: msg });
              dadosPing.envio = Date.now() - t1;
            } catch (err) {
              console.error('Erro no comando !ping:', err);
              break;
            }

            let podeEditarPing = !!(enviadoPing && enviadoPing.key);
            const temposEdicao = [];
            const editarPing = async (texto) => {
              if (!podeEditarPing) return null;
              try {
                const t = Date.now();
                await sock.sendMessage(from, { text: texto, edit: enviadoPing.key });
                return Date.now() - t;
              } catch (e) {
                podeEditarPing = false;
                return null;
              }
            };

            await esperarPing(400);
            let rPing = await editarPing(textoPingProgresso(25, '📤 Medindo latência de envio...'));
            if (rPing !== null) temposEdicao.push(rPing);

            await esperarPing(400);
            rPing = await editarPing(textoPingProgresso(50, '🌐 Testando conexão com a internet...'));
            if (rPing !== null) temposEdicao.push(rPing);
            try {
              const tNet = Date.now();
              await fetch('https://www.google.com/generate_204', { signal: AbortSignal.timeout(5000) });
              dadosPing.internet = Date.now() - tNet;
            } catch (e) {}

            await esperarPing(300);
            rPing = await editarPing(textoPingProgresso(75, '🧠 Lendo memória e processador...'));
            if (rPing !== null) temposEdicao.push(rPing);

            if (temposEdicao.length) {
              dadosPing.edicao = Math.round(temposEdicao.reduce((a, b) => a + b, 0) / temposEdicao.length);
            }

            await esperarPing(300);
            const textoFinalPing = textoPingFinal(dadosPing, config.nomeBot);
            const okFinalPing = await editarPing(textoFinalPing);
            if (okFinalPing === null) {
              await sock.sendMessage(from, { text: textoFinalPing }, { quoted: msg });
            }
          }
          break;

        case 'criador':
        case 'owner':
          await sock.sendMessage(from, { text: `Aqui esta o contato do meu criador! 😍 https://wa.me/${NUMERO_CRIADOR}` }, { quoted: msg });
          break;

        case 'beijo':
        case 'beijar':
          {
            const ctxBj = msg.message.extendedTextMessage?.contextInfo;
            const quemRecebeu = ctxBj?.mentionedJid?.[0] || ctxBj?.participant;
            if (!quemRecebeu) {
              await sock.sendMessage(from, { text: '⚠️ Marque alguém com @ ou responda à mensagem de quem você quer beijar!\n\nEx: `!beijo @pessoa`' }, { quoted: msg });
              break;
            }
            if (sender === quemRecebeu) {
              await sock.sendMessage(from, { text: '😳 Beijar a si mesmo(a)? Procure outra pessoa pra esse momento!' }, { quoted: msg });
              break;
            }
            const textoBj = montarAcao('💋', '𝐁𝐄𝐈𝐉𝐎', montarFrase(FRASE_BEIJO, sender, quemRecebeu), '😳 Será que vai rolar um clima?');
            await enviarAcao(sock, from, msg, 'beijo', textoBj, [quemRecebeu, sender]);
          }
          break;

        case 'abraço':
        case 'abraco':
        case 'abracar':
        case 'abraçar':
          {
            const ctxAb = msg.message.extendedTextMessage?.contextInfo;
            const quemRecebeu = ctxAb?.mentionedJid?.[0] || ctxAb?.participant;
            if (!quemRecebeu) {
              await sock.sendMessage(from, { text: '⚠️ Marque alguém com @ ou responda à mensagem de quem você quer abraçar!\n\nEx: `!abraço @pessoa`' }, { quoted: msg });
              break;
            }
            if (sender === quemRecebeu) {
              await sock.sendMessage(from, { text: '🤗 Você se abraçou bem forte! Mas um abraço de outra pessoa é melhor, marque alguém!' }, { quoted: msg });
              break;
            }
            const textoAb = montarAcao('🤗', '𝐀𝐁𝐑𝐀𝐂̧𝐎', montarFrase(FRASE_ABRACO, sender, quemRecebeu), '💜 Abraço é sempre bom demais!');
            await enviarAcao(sock, from, msg, 'abraco', textoAb, [quemRecebeu, sender]);
          }
          break;

        case 'matar':
        case 'kill':
          {
            const ctxMt = msg.message.extendedTextMessage?.contextInfo;
            const quemRecebeu = ctxMt?.mentionedJid?.[0] || ctxMt?.participant;
            if (!quemRecebeu) {
              await sock.sendMessage(from, { text: '⚠️ Marque alguém com @ ou responda à mensagem de quem você quer eliminar!\n\nEx: `!matar @pessoa`' }, { quoted: msg });
              break;
            }
            if (sender === quemRecebeu) {
              await sock.sendMessage(from, { text: '☠️ Calma! Você não pode eliminar a si mesmo(a). A vida vale a pena!' }, { quoted: msg });
              break;
            }
            const textoMt = montarAcao('💀', '𝐌𝐀𝐓𝐀𝐑', montarFrase(FRASE_MATAR, sender, quemRecebeu), '🪦 Descanse em paz...');
            await enviarAcao(sock, from, msg, 'matar', textoMt, [quemRecebeu, sender]);
          }
          break;

        case 'perfil':
          {
            let alvo = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                       msg.message.extendedTextMessage?.contextInfo?.participant || 
                       sender;

            let numeroFormatado = alvo.split('@')[0].replace(/[^0-9]/g, '');

            if (!numeroFormatado || numeroFormatado.length < 5) {
              alvo = sender;
              numeroFormatado = sender.split('@')[0].replace(/[^0-9]/g, '');
            }

            let nomeAlvo = obterNomeSalvo(alvo) || obterNomeSalvo(alvo.split('@')[0] + '@s.whatsapp.net');
            
            if (!nomeAlvo) {
              if (alvo === sender || alvo.includes(sender.split('@')[0])) {
                nomeAlvo = pushName;
              } else {
                nomeAlvo = `Utilizador ${numeroFormatado.slice(-4)}`;
              }
            }

            let numeroReal = numeroFormatado;
            let isAdminGrupo = '❌';
            let isLiderGrupo = '❌';

            if (isGroup) {
              try {
                const groupMetadata = await sock.groupMetadata(from);
                const participants = groupMetadata.participants;
                const participanteAlvo = participants.find(p => p.id === alvo || p.id.includes(numeroFormatado));
                if (participanteAlvo) {
                  const pn = participanteAlvo.phoneNumber || participanteAlvo.jid;
                  if (pn && pn.includes('@s.whatsapp.net')) numeroReal = pn.split('@')[0].replace(/[^0-9]/g, '');
                  if (participanteAlvo.admin === 'admin') isAdminGrupo = '✅';
                  if (participanteAlvo.admin === 'superadmin') isLiderGrupo = '✅';
                }
              } catch (e) {
                console.error('Erro ao verificar dados do grupo para o perfil:', e);
              }
            }

            const donoAlvoLimpo = String(config.numeroDono).replace(/[^0-9]/g, '');
            const isDonoAlvo = numeroFormatado === donoAlvoLimpo || alvo === config.numeroDono;

            const statusDono = isDonoAlvo ? '🟢' : '🔴';
            const statusLider = isLiderGrupo === '✅' ? '🟢' : '🔴';
            const statusAdm = isAdminGrupo === '✅' ? '🟢' : '🔴';
            const statusVip = '🔴';

            let stats = carregarJSON(FILE_STATS);
            let dadosAlvo = stats[alvo] || stats[alvo.split('@')[0] + '@s.whatsapp.net'] || { mensagens: 0, comandos: 0, stickers: 0, saldo: 360 };

            let hashNum = Number(numeroFormatado.slice(-3)) || 50;
            let nivelGado = (hashNum * 7) % 101;
            let nivelPuta = (hashNum * 13) % 101;
            let nivelGostosura = ((hashNum * 17) % 60) + 40;
            let nivelBeleza = ((hashNum * 19) % 50) + 50;
            let valorPrograma = nivelGostosura * 45;

            const textoPerfil = 
              `╔═══━━━─── ◈ ───━━━═══╗\n` +
              `𖤐 𝐌𝐄𝐔 𝐏𝐄𝐑𝐅𝐈𝐋 𖤐\n` +
              `╚═══━━━─── ◈ ───━━━═══╝\n\n` +
              `╭───〔 🪪 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐂̧𝐎̃𝐄𝐒 〕───╮\n` +
              `│\n` +
              `│  🕶️ 𝐍𝐨𝐦𝐞 ➜ 『 @${alvo.split('@')[0]}${(typeof badgeVip === 'function' && badgeVip(alvo)) ? ' 💎 VIP' : ''} 』\n` + // BADGE VIP
              `│  ☎️ 𝐍𝐮́𝐦𝐞𝐫𝐨 ➜ 『 +${numeroReal} 』\n` +
              `│  📝 𝐁𝐢𝐨 ➜ 『 Sem Bio 』\n` +
              `│  💻 𝐂𝐨𝐧𝐞𝐜𝐭𝐚𝐝𝐨 𝐞𝐦 ➜ 『 Android 』\n` +
              `│\n` +
              `├─────────────── ◈\n` +
              `│\n` +
              `│  ♛ 𝐃𝐨𝐧𝐨 ➜ 〘 ${statusDono} 〙\n` +
              `│  ⚔️ 𝐋𝐢́𝐝𝐞𝐫 ➜ 〘 ${statusLider} 〙\n` +
              `│  🛡️ 𝐀𝐝𝐦 ➜ 〘 ${statusAdm} 〙\n` +
              `│  💎 𝐏𝐫𝐞𝐦𝐢𝐮𝐦 ➜ 〘 ${statusVip} 〙\n` +
              `│  🪙 𝐒𝐚𝐥𝐝𝐨 ➜ 〘 ${dadosAlvo.saldo}$ 〙\n` +
              `│  💍 𝐂𝐚𝐬𝐚𝐝𝐨 ➜ 〘 Não 😿 〙\n` +
              `│\n` +
              `╰───────────────────╯\n\n` +
              `╔═══━━━─── ◈ ───━━━═══╗\n` +
              `𖤐 𝐏𝐄𝐑𝐒𝐎𝐍𝐀𝐋𝐈𝐃𝐀𝐃𝐄 𖤐\n` +
              `╚═══━━━─── ◈ ───━━━═══╝\n\n` +
              `╭───〔 📊 𝐒𝐓𝐀𝐓𝐔𝐒 〕───╮\n` +
              `│\n` +
              `│  🐃 𝐍𝐢́𝐯𝐞𝐥 𝐆𝐚𝐝𝐨 ➜ ${nivelGado}%\n` +
              `│  🌺 𝐍𝐢́𝐯𝐞𝐥 𝐏𝐮𝐭𝐚 ➜ ${nivelPuta}%\n` +
              `│  🌶 𝐍𝐢́𝐯𝐞𝐥 𝐆𝐨𝐱𝐭𝐨𝐬𝐮𝐫𝐚 ➜ ${nivelGostosura}%\n` +
              `│  🪞 𝐍𝐢́𝐯𝐞𝐥 𝐁𝐞𝐥𝐞𝐳𝐚 ➜ ${nivelBeleza}%\n` +
              `│  💵 𝐏𝐫𝐨𝐠𝐫𝐚𝐦𝐚 ➜ R$${valorPrograma}\n` +
              `│\n` +
              `╰───────────────────╯\n\n` +
              `╔═══━━━─── ◈ ───━━━═══╗\n` +
              `𖤐 𝐒𝐄𝐔𝐒 𝐃𝐀𝐃𝐎𝐒 𖤐\n` +
              `╚═══━━━─── ◈ ───━━━═══╝\n\n` +
              `╭───〔 📌 𝐄𝐒𝐓𝐀𝐓𝐈́𝐒𝐓𝐈𝐂𝐀𝐒 〕───╮\n` +
              `│\n` +
              `│  🗨 𝐌𝐞𝐧𝐬𝐚𝐠𝐞𝐧𝐬 ➜ ${dadosAlvo.mensagens}\n` +
              `│  ⚙ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 ➜ ${dadosAlvo.comandos}\n` +
              `│  🖼️ 𝐒𝐭𝐢𝐜𝐤𝐞𝐫𝐬 ➜ ${dadosAlvo.stickers}\n` +
              `│\n` +
              `╰───────────────────╯\n\n` +
              `╭━━━━━━━━━━━━━━━━━━╮\n` +
              `┃ 𖤐 𝐒𝐇𝐈𝐙𝐔𝐊𝐈 𝐁𝐎𝐓 𖤐 ┃\n` +
              `╰━━━━━━━━━━━━━━━━━━╯`;

            await sock.sendMessage(from, {
              text: textoPerfil,
              mentions: [alvo]
            }, { quoted: msg });
          }
          break;

        case 'streak':
        case 'sequencia':
          {
            const alvo = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
                         msg.message.extendedTextMessage?.contextInfo?.participant ||
                         sender;

            const streaks = carregarJSON(FILE_STREAK);
            const d = streaks[alvo] || { dias: 0, ultimo: null, recorde: 0 };
            const ativo = d.ultimo === dataBR(0) || d.ultimo === dataBR(-1);
            const diasAtuais = ativo ? d.dias : 0;
            const emoji = diasAtuais >= 30 ? '👑' : diasAtuais >= 7 ? '🔥' : diasAtuais >= 1 ? '✨' : '💤';

            const textoStreak =
              `╭───〔 ${emoji} 𝐒𝐓𝐑𝐄𝐀𝐊 〕───╮\n` +
              `│\n` +
              `│  🕶️ 𝐍𝐨𝐦𝐞 ➜ 『 @${alvo.split('@')[0]} 』\n` +
              `│  🔥 𝐒𝐞𝐪𝐮𝐞̂𝐧𝐜𝐢𝐚 ➜ ${diasAtuais} dia(s)\n` +
              `│  🏆 𝐑𝐞𝐜𝐨𝐫𝐝𝐞 ➜ ${d.recorde} dia(s)\n` +
              `│\n` +
              `╰───────────────────╯\n` +
              (diasAtuais === 0 ? `\n💤 Sem sequência ativa. Use o bot hoje para começar!` : `\n✅ Use o bot todo dia para não perder a sequência!`);

            await sock.sendMessage(from, {
              text: textoStreak,
              mentions: [alvo]
            }, { quoted: msg });
          }
          break;

        case 'menubaixar':
        case 'baixar':
          {
            const menuBaixar =
              `╭─〔 💜 _${config.nomeBot}_ 〕─╮\n\n` +
              `╭─〔 📥 _Menu Baixar_ 〕─╮\n\n` +
              `╭─〔 📥 _Downloads_ 〕─╮\n\n` +
              `💜 !play <nome>\n` +
              `💜 !playvideo <nome>\n` +
              `💜 !instagram <link>\n` +
              `💜 !s (figurinha)\n` +
              `💜 !brat <texto>\n` +
              `💜 !toimg\n` +
              `💜 !take\n\n` +
              `╰────────────────────╯`;
            await sock.sendMessage(from, { text: menuBaixar }, { quoted: msg });
          }
          break;

        // ═══════════════════════════════════════════════
        //       !take  +  !revelar
        // ═══════════════════════════════════════════════

        case 'take':
          {
            const ctxTk = msg.message.extendedTextMessage?.contextInfo;
            const alvoTk = ctxTk?.quotedMessage || msg.message;
            const figTk = alvoTk.stickerMessage;

            if (!figTk) {
              await sock.sendMessage(from, { text: '⚠️ Marque uma figurinha com *!take* pra colocar sua marca!' }, { quoted: msg });
              break;
            }

            try {
              const nomeAutor = pushName || 'Anônimo';
              const streamTk = await downloadContentFromMessage(figTk, 'sticker');
              let bufTk = Buffer.from([]);
              for await (const chunk of streamTk) {
                bufTk = Buffer.concat([bufTk, chunk]);
              }

              const packTk = nomeAutor;
              const autorTk = '';

              // ═══ Só usa ffmpeg se for ANIMADA de verdade ═══
              // Verifica pelo mimetype E pelo isAnimated
              // Detecta animação verificando o byte ANIM no header do webp
              const isAnimTk = figTk.isAnimated === true ||
                (bufTk && bufTk.length > 12 && bufTk.toString('ascii', 0, 4) === 'RIFF' && bufTk.toString('ascii', 8, 12) === 'WEBP' &&
                 (bufTk.toString('ascii', 12, 16) === 'VP8X' || bufTk.toString('ascii', 12, 16) === 'VP8 ' || bufTk.toString('ascii', 12, 16) === 'VP8L') &&
                 bufTk.includes(Buffer.from('ANIM')));

              let novaFig;
              // ═══ Aplica marca em qualquer figurinha (estática ou animada) SEM ffmpeg ═══
              try {
                novaFig = await criarStickerTk(bufTk, isAnimTk, packTk, autorTk);
              } catch (eMarca) {
                console.log('Erro ao aplicar marca:', eMarca.message);
                // Se falhar, tenta usar criarSticker normal
                novaFig = await criarSticker(bufTk, isAnimTk, packTk, autorTk);
              }

              await sock.sendMessage(from, { sticker: novaFig }, { quoted: msg });
              await sock.sendMessage(from, { text: '✅ Figurinha com sua marca: *' + nomeAutor + '*' }, { quoted: msg });
            } catch (errTk) {
              console.error('Erro no take:', errTk);
              await sock.sendMessage(from, { text: '❌ Não consegui processar a figurinha.' }, { quoted: msg });
            }
          }
          break;

        case 'revelar':
          {
            // ═══ Só adm/líder/dono pode usar ═══
            if (isGroup) {
              const gmRev = await sock.groupMetadata(from);
              const ehAdmRev = !!gmRev.participants.find(p => p.id === sender)?.admin;
              if (!ehAdmRev && !isDono) {
                await sock.sendMessage(from, {
                  text: '╭━━━〔 🚫 𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎 🚫 〕━━━╮\n┃\n┃ 💔 Apenas *admins*, *líderes*\n┃    e o *dono* podem usar!\n┃\n╰─────────────────────────────╯'
                }, { quoted: msg });
                break;
              }
            }

            const ctxRv = msg.message.extendedTextMessage?.contextInfo;
            const alvoRv = ctxRv?.quotedMessage;
            const msgOriginal = msg.message;

            let midiaRv = null;
            let tipoRv = null;

            // ═══ USA normalizeMessageContent pra desembrulhar ═══
            const fontes = [alvoRv, msgOriginal].filter(Boolean);
            for (const fonte of fontes) {
              try {
                const normalizado = normalizeMessageContent(fonte);
                if (normalizado?.imageMessage) { midiaRv = normalizado.imageMessage; tipoRv = 'image'; break; }
                if (normalizado?.videoMessage) { midiaRv = normalizado.videoMessage; tipoRv = 'video'; break; }
                // Fallback: tenta pelo viewOnce direto
                if (fonte?.viewOnceMessageV2?.message?.imageMessage) { midiaRv = fonte.viewOnceMessageV2.message.imageMessage; tipoRv = 'image'; break; }
                if (fonte?.viewOnceMessageV2?.message?.videoMessage) { midiaRv = fonte.viewOnceMessageV2.message.videoMessage; tipoRv = 'video'; break; }
                if (fonte?.viewOnceMessage?.message?.imageMessage) { midiaRv = fonte.viewOnceMessage.message.imageMessage; tipoRv = 'image'; break; }
                if (fonte?.viewOnceMessage?.message?.videoMessage) { midiaRv = fonte.viewOnceMessage.message.videoMessage; tipoRv = 'video'; break; }
              } catch (eN) {
                console.log('Erro normalize:', eN.message);
              }
            }

            if (!midiaRv) {
              await sock.sendMessage(from, { text: '⚠️ Marque uma foto ou vídeo de *visualização única* com *!revelar*!' }, { quoted: msg });
              break;
            }

            try {
              const streamRv = await downloadContentFromMessage(midiaRv, tipoRv);
              let bufRv = Buffer.from([]);
              for await (const chunk of streamRv) {
                bufRv = Buffer.concat([bufRv, chunk]);
              }

              const donoMidia = ctxRv?.participant || ctxRv?.mentionedJid?.[0] || sender;

              let legendaRv = '╔══════════════════════════════╗\n' +
                              '║  😈  𝐀𝐂𝐇𝐎𝐔  𝐐𝐔𝐄  𝐄𝐑𝐀  𝐒𝐄𝐆𝐑𝐄𝐃𝐎?  😈  ║\n' +
                              '╚══════════════════════════════╝\n\n' +
                              '🔥 *VISUALIZAÇÃO ÚNICA REVELADA!*\n\n' +
                              '   👤 @' + donoMidia.split('@')[0] + '\n' +
                              '   👁️ Revelada por @' + sender.split('@')[0] + '\n\n' +
                              '   💬 _"Peguei tudo, safadinho(a)!"_\n\n' +
                              '🌸 Shizuki Bot - MD 🌸';

              if (tipoRv === 'image') {
                await sock.sendMessage(from, { image: bufRv, caption: legendaRv, mentions: [donoMidia, sender] }, { quoted: msg });
              } else {
                await sock.sendMessage(from, { video: bufRv, caption: legendaRv, mentions: [donoMidia, sender] }, { quoted: msg });
              }
            } catch (errRv) {
              console.error('Erro no revelar:', errRv);
              await sock.sendMessage(from, { text: '❌ Não consegui revelar. Talvez já tenha sido vista?' }, { quoted: msg });
            }
          }
          break;

        case 's':
        case 'sticker':
        case 'figurinha':
          {
            const ctxS = msg.message.extendedTextMessage?.contextInfo;
            const alvoMsg = ctxS?.quotedMessage || msg.message;
            const imgS = alvoMsg.imageMessage;
            const vidS = alvoMsg.videoMessage;

            if (!imgS && !vidS) {
              await sock.sendMessage(from, { text: '⚠️ Marque uma foto ou vídeo curto com !s' }, { quoted: msg });
              break;
            }

            if (vidS && vidS.seconds > 10) {
              await sock.sendMessage(from, { text: '⚠️ O vídeo pode ter no máximo 10 segundos!' }, { quoted: msg });
              break;
            }

            try {
              const stream = await downloadContentFromMessage(imgS || vidS, imgS ? 'image' : 'video');
              let bufferS = Buffer.from([]);
              for await (const chunk of stream) {
                bufferS = Buffer.concat([bufferS, chunk]);
              }

              const figurinha = await criarSticker(bufferS, !!vidS, ...(await montarMarca(sock, from, isGroup, pushName)));
              await sock.sendMessage(from, { text: `@${sender.split('@')[0]} ${sortearFrase()}`, mentions: [sender] }, { quoted: msg });
              await sock.sendMessage(from, { sticker: figurinha }, { quoted: msg });
            } catch (err) {
              console.error('Erro ao criar figurinha:', err);
              await sock.sendMessage(from, { text: '❌ Não consegui criar a figurinha.' }, { quoted: msg });
            }
          }
          break;

        case 'brat':
          {
            const qBrat = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            const textoBrat = (args.join(' ') || qBrat?.conversation || qBrat?.extendedTextMessage?.text || '').trim().toLowerCase();

            if (!textoBrat) {
              await sock.sendMessage(from, { text: '⚠️ Escreva um texto ou marque uma mensagem. Ex: `!brat oi`' }, { quoted: msg });
              break;
            }

            if (textoBrat.length > 200) {
              await sock.sendMessage(from, { text: '⚠️ O texto pode ter no máximo 200 caracteres!' }, { quoted: msg });
              break;
            }

            try {
              const imgBrat = await criarBrat(textoBrat);
              const figBrat = await criarSticker(imgBrat, false, ...(await montarMarca(sock, from, isGroup, pushName)));
              await sock.sendMessage(from, { sticker: figBrat }, { quoted: msg });
            } catch (err) {
              console.error('Erro ao criar brat:', err);
              await sock.sendMessage(from, { text: '❌ Não consegui criar o brat.' }, { quoted: msg });
            }
          }
          break;

        case 'totag':
        case 'hidetag':
          if (!isGroup) {
            await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
            break;
          }

          try {
            const gmTag = await sock.groupMetadata(from);
            const partTag = gmTag.participants;
            const senderAdminTag = partTag.find(p => p.id === sender)?.admin;

            if (!senderAdminTag) {
              await sock.sendMessage(from, { text: '🚫 Apenas administradores do grupo podem usar este comando!' }, { quoted: msg });
              break;
            }

            const qTag = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            const textoTag = qTag?.conversation || qTag?.extendedTextMessage?.text || args.join(' ');

            if (!textoTag) {
              await sock.sendMessage(from, { text: '⚠️ Marque uma mensagem de texto ou escreva o texto. Ex: `!totag reunião agora`' }, { quoted: msg });
              break;
            }

            await sock.sendMessage(from, {
              text: textoTag,
              mentions: partTag.map(p => p.id)
            });
          } catch (err) {
            console.error('Erro no comando !totag:', err);
            await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao marcar todos.' }, { quoted: msg });
          }
          break;

        case 'admins':
        case 'adms':
          if (!isGroup) {
            await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
            break;
          }

          try {
            const gmAdm = await sock.groupMetadata(from);
            const listaAdm = gmAdm.participants.filter(p => p.admin).map(p => p.id);

            if (listaAdm.length === 0) {
              await sock.sendMessage(from, { text: 'ℹ️ Não encontrei administradores neste grupo.' }, { quoted: msg });
              break;
            }

            const qAdm = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            const motivo = args.join(' ') || qAdm?.conversation || qAdm?.extendedTextMessage?.text || '';

            const textoAdm =
              `🚨 *CHAMANDO OS ADMS!* 🚨\n\n` +
              `👤 *Pedido por:* @${sender.split('@')[0]}\n` +
              (motivo ? `💬 *Motivo:* ${motivo}\n` : '') +
              `\n` +
              listaAdm.map(j => `🛡️ @${j.split('@')[0]}`).join('\n');

            await sock.sendMessage(from, {
              text: textoAdm,
              mentions: [...listaAdm, sender]
            }, { quoted: msg });
          } catch (err) {
            console.error('Erro no comando !admins:', err);
            await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao chamar os admins.' }, { quoted: msg });
          }
          break;

        case 'toimg':
        case 'toimage':
          {
            const qToImg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            const figuraToImg = qToImg?.stickerMessage;

            if (!figuraToImg) {
              await sock.sendMessage(from, { text: '⚠️ Marque uma figurinha com !toimg' }, { quoted: msg });
              break;
            }

            try {
              const streamToImg = await downloadContentFromMessage(figuraToImg, 'sticker');
              let bufToImg = Buffer.from([]);
              for await (const chunk of streamToImg) {
                bufToImg = Buffer.concat([bufToImg, chunk]);
              }
              const pngToImg = await stickerParaPng(bufToImg);
              await sock.sendMessage(from, { image: pngToImg, caption: '🖼️ Sua figurinha virou foto!' }, { quoted: msg });
            } catch (err) {
              console.error('Erro no comando !toimg:', err);
              await sock.sendMessage(from, { text: '❌ Não consegui converter. Figurinhas animadas ainda não são suportadas.' }, { quoted: msg });
            }
          }
          break;

        case 'blockcmdg':
        case 'blockcmd':
          {
            if (!isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono e os líderes podem usar este comando!' }, { quoted: msg });
              break;
            }
            if (!isGroup) {
              await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
              break;
            }

            const blocks = carregarJSON(FILE_BLOCK);
            const bloqGrupo = Array.isArray(blocks[from]) ? blocks[from] : [];

            if (!args[0]) {
              const textoBloq = bloqGrupo.length
                ? `🔒 *COMANDOS BLOQUEADOS NESTE GRUPO*\n\n` + bloqGrupo.map(x => `❌ !${x}`).join('\n') + `\n\nPara desbloquear: !unblockcmdg [comando]`
                : `ℹ️ Nenhum comando bloqueado neste grupo.\n\nPara bloquear: !blockcmdg [comando]\nExemplo: !blockcmdg s`;
              await sock.sendMessage(from, { text: textoBloq }, { quoted: msg });
              break;
            }

            const cmdBloq = canonicoCmd(args[0]);

            if (cmdBloq === 'blockcmdg' || cmdBloq === 'unblockcmdg') {
              await sock.sendMessage(from, { text: '⚠️ Esse comando não pode ser bloqueado.' }, { quoted: msg });
              break;
            }

            if (bloqGrupo.includes(cmdBloq)) {
              await sock.sendMessage(from, { text: `ℹ️ O comando *!${cmdBloq}* já está bloqueado. Para liberar use: !unblockcmdg ${cmdBloq}` }, { quoted: msg });
              break;
            }

            bloqGrupo.push(cmdBloq);
            blocks[from] = bloqGrupo;
            salvarJSON(FILE_BLOCK, blocks);
            await sock.sendMessage(from, { text: 'Comando bloqueado com sucesso! Agora, apenas os líderes e dono podem usar!' }, { quoted: msg });
          }
          break;

        case 'unblockcmdg':
        case 'unblockcmd':
          {
            if (!isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono e os líderes podem usar este comando!' }, { quoted: msg });
              break;
            }
            if (!isGroup) {
              await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
              break;
            }
            if (!args[0]) {
              await sock.sendMessage(from, { text: '⚠️ Informe o comando que quer desbloquear. Ex: `!unblockcmdg s`' }, { quoted: msg });
              break;
            }

            const blocksU = carregarJSON(FILE_BLOCK);
            const bloqU = Array.isArray(blocksU[from]) ? blocksU[from] : [];
            const cmdU = canonicoCmd(args[0]);

            if (!bloqU.includes(cmdU)) {
              await sock.sendMessage(from, { text: `ℹ️ O comando *!${cmdU}* não está bloqueado neste grupo.` }, { quoted: msg });
              break;
            }

            const novaU = bloqU.filter(x => x !== cmdU);
            if (novaU.length) blocksU[from] = novaU;
            else delete blocksU[from];
            salvarJSON(FILE_BLOCK, blocksU);
            await sock.sendMessage(from, { text: 'Comando desbloqueado com sucesso! Agora, todos podem usar esse comando!' }, { quoted: msg });
          }
          break;

        case 'listaadv':
        case 'listadv':
          {
            if (!isGroup) {
              await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
              break;
            }
            try {
              const gmLista = await sock.groupMetadata(from);
              const admLista = gmLista.participants.find(p => p.id === sender)?.admin;
              if (!admLista && !isDono) {
                await sock.sendMessage(from, { text: '🚫 Apenas administradores do grupo podem usar este comando!' }, { quoted: msg });
                break;
              }
              const ctxLista = msg.message.extendedTextMessage?.contextInfo;
              const alvoLista = ctxLista?.mentionedJid?.[0] || ctxLista?.participant;
              if (!alvoLista) {
                await sock.sendMessage(from, { text: '⚠️ Marque a pessoa com @ ou responda à mensagem dela.' }, { quoted: msg });
                break;
              }
              const advsLista = carregarJSON(FILE_ADVS);
              const qtdAdv = advsLista[from]?.[alvoLista] || 0;
              const textoLista =
                `📋 *LISTA DE ADVERTÊNCIAS*\n\n` +
                `👤 *Membro:* @${alvoLista.split('@')[0]}\n` +
                `⚠️ *Advertências:* [${qtdAdv}/3]\n\n` +
                (qtdAdv === 0 ? `✅ Essa pessoa não tem advertências.` : `📢 Faltam ${3 - qtdAdv} para ser removido(a) do grupo.`);
              await sock.sendMessage(from, { text: textoLista, mentions: [alvoLista] }, { quoted: msg });
            } catch (err) {
              console.error('Erro no comando !listaadv:', err);
              await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao consultar as advertências.' }, { quoted: msg });
            }
          }
          break;

        case 'lideres':
        case 'líderes':
          {
            const slotsL = Array.from({ length: 6 }, (_, i) => (config.lideres || [])[i] || null);
            const donoStrL = String(config.numeroDono);
            const donoJidL = donoStrL.includes('@') ? donoStrL : `${donoStrL}@s.whatsapp.net`;
            const numerosL = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'];

            let textoL =
              `╭───〔 👑 *LÍDERES* 〕───╮\n` +
              `│\n` +
              `│  ♛ *Dono* ➜ @${donoJidL.split('@')[0]}\n` +
              `│  ↳ Controle total do bot\n` +
              `│\n` +
              `├─────────────── ◈\n` +
              `│\n`;
            slotsL.forEach((j, i) => {
              textoL += `│  ${numerosL[i]} *Líder ${i + 1}* ➜ ${j ? '@' + j.split('@')[0] : '『 Vaga livre 』'}\n`;
            });
            textoL +=
              `│\n` +
              `├─────────────── ◈\n` +
              `│\n` +
              `│  ℹ️ Líderes têm os mesmos poderes do dono.\n` +
              `│  ➕ Adicionar: !lider1 até !lider6 (marcando a pessoa)\n` +
              `│  ➖ Remover: !rmlider1 até !rmlider6\n` +
              `│\n` +
              `╰───────────────────╯`;

            await sock.sendMessage(from, {
              text: textoL,
              mentions: [donoJidL, ...slotsL.filter(Boolean)]
            }, { quoted: msg });
          }
          break;

        case 'modoaluguel':
          {
            if (!isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono e os líderes podem usar este comando!' }, { quoted: msg });
              break;
            }
            config.modoAluguel = !config.modoAluguel;
            salvarConfig(config);
            if (config.modoAluguel) {
              await sock.sendMessage(from, { text: '💼 *Modo aluguel ATIVADO!*\n\nAgora só grupos com aluguel ativo podem usar o bot. O dono e os líderes sempre podem.\n\nUse !rgaluguel [dias] dentro do grupo para registrar.' }, { quoted: msg });
            } else {
              await sock.sendMessage(from, { text: '🔓 *Modo aluguel DESATIVADO!*\n\nTodos os grupos podem usar o bot novamente.' }, { quoted: msg });
            }
          }
          break;

        case 'rgaluguel':
          {
            if (!isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono e os líderes podem usar este comando!' }, { quoted: msg });
              break;
            }
            if (!isGroup) {
              await sock.sendMessage(from, { text: '❌ Use este comando dentro do grupo que será alugado!' }, { quoted: msg });
              break;
            }
            const diasAlug = parseInt(args[0], 10);
            if (!diasAlug || diasAlug < 1 || diasAlug > 3650) {
              await sock.sendMessage(from, { text: '⚠️ Informe os dias do aluguel. Ex: `!rgaluguel 30`' }, { quoted: msg });
              break;
            }

            let nomeGpAlug = 'Grupo';
            let linkAlug = 'Indisponível (o bot precisa ser ADM)';
            try {
              const gmAlug = await sock.groupMetadata(from);
              nomeGpAlug = gmAlug.subject;
            } catch (e) {}
            try {
              const codAlug = await sock.groupInviteCode(from);
              if (codAlug) linkAlug = `https://chat.whatsapp.com/${codAlug}`;
            } catch (e) {}

            const alugueisReg = carregarJSON(FILE_ALUGUEIS);
            alugueisReg[from] = {
              nome: nomeGpAlug,
              inicio: dataAlug(0),
              expira: dataAlug(diasAlug),
              link: linkAlug
            };
            salvarJSON(FILE_ALUGUEIS, alugueisReg);

            await sock.sendMessage(from, {
              text: `✅ *ALUGUEL REGISTRADO!*\n\n` +
                    `👥 *Grupo:* ${nomeGpAlug}\n` +
                    `📅 *Início:* ${formatarDataBR(alugueisReg[from].inicio)}\n` +
                    `⏳ *Expira:* ${formatarDataBR(alugueisReg[from].expira)}\n` +
                    `🕒 *Duração:* ${diasAlug} dia(s)`
            }, { quoted: msg });
          }
          break;

        case 'rmaluguel':
          {
            if (!isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono e os líderes podem usar este comando!' }, { quoted: msg });
              break;
            }
            if (!isGroup) {
              await sock.sendMessage(from, { text: '❌ Use este comando dentro do grupo!' }, { quoted: msg });
              break;
            }
            const alugueisRm = carregarJSON(FILE_ALUGUEIS);
            if (!alugueisRm[from]) {
              await sock.sendMessage(from, { text: 'ℹ️ Este grupo não tem aluguel registrado.' }, { quoted: msg });
              break;
            }
            delete alugueisRm[from];
            salvarJSON(FILE_ALUGUEIS, alugueisRm);
            await sock.sendMessage(from, { text: '🗑️ Aluguel removido deste grupo com sucesso!' }, { quoted: msg });
          }
          break;

        case 'alugueis':
        case 'aluguéis':
          {
            if (!isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono e os líderes podem usar este comando!' }, { quoted: msg });
              break;
            }
            const alugueisLista = carregarJSON(FILE_ALUGUEIS);
            const idsAlug = Object.keys(alugueisLista);
            if (idsAlug.length === 0) {
              await sock.sendMessage(from, { text: 'ℹ️ Nenhum grupo alugado no momento.' }, { quoted: msg });
              break;
            }
            const hojeAlug = dataAlug(0);
            let textoAlug = `╭───〔 💼 *GRUPOS ALUGADOS* 〕───╮\n\n`;
            idsAlug.forEach((id, i) => {
              const g = alugueisLista[id];
              const ativo = g.expira >= hojeAlug;
              textoAlug +=
                `*${i + 1}. ${g.nome}*\n` +
                `📅 Alugou: ${formatarDataBR(g.inicio)}\n` +
                `⏳ Expira: ${formatarDataBR(g.expira)} ${ativo ? '🟢' : '🔴 (expirado)'}\n` +
                `🔗 ${g.link}\n\n`;
            });
            textoAlug += `╰───────────────────╯`;
            await sock.sendMessage(from, { text: textoAlug }, { quoted: msg });
          }
          break;

        case 'promover':
        case 'promote':
          {
            if (!isGroup) {
              await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
              break;
            }
            try {
              const gmPro = await sock.groupMetadata(from);
              const partPro = gmPro.participants;
              const senderAdmPro = partPro.find(p => p.id === sender)?.admin;
              if (!senderAdmPro && !isDono) {
                await sock.sendMessage(from, { text: '🚫 Apenas administradores do grupo podem promover membros!' }, { quoted: msg });
                break;
              }
              const ctxPro = msg.message.extendedTextMessage?.contextInfo;
              const alvoPro = ctxPro?.mentionedJid?.[0] || ctxPro?.participant;
              if (!alvoPro) {
                await sock.sendMessage(from, { text: '⚠️ Marque a pessoa com @ ou responda à mensagem dela para promover.\n\nEx: `!promover @pessoa`' }, { quoted: msg });
                break;
              }
              if (partPro.find(p => p.id === alvoPro)?.admin) {
                await sock.sendMessage(from, { text: `👑 @${alvoPro.split('@')[0]} já é administrador(a) do grupo!`, mentions: [alvoPro] }, { quoted: msg });
                break;
              }
              await sock.groupParticipantsUpdate(from, [alvoPro], 'promote');
              await sock.sendMessage(from, {
                text: `🎉 *PROMOÇÃO!* 🎉\n\n` +
                      `👤 @${alvoPro.split('@')[0]} acaba de subir de cargo!\n` +
                      `👑 Agora é *administrador(a)* do grupo\n` +
                      `🛡️ Promovido(a) por: @${sender.split('@')[0]}\n\n` +
                      `Use seus poderes com sabedoria! ✨`,
                mentions: [alvoPro, sender]
              });
            } catch (err) {
              console.error('Erro no comando !promover:', err);
              await sock.sendMessage(from, { text: '❌ Não consegui promover. Verifique se o bot é ADM do grupo!' }, { quoted: msg });
            }
          }
          break;

        case 'rebaixar':
        case 'demote':
          {
            if (!isGroup) {
              await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
              break;
            }
            try {
              const gmReb = await sock.groupMetadata(from);
              const partReb = gmReb.participants;
              const senderAdmReb = partReb.find(p => p.id === sender)?.admin;
              if (!senderAdmReb && !isDono) {
                await sock.sendMessage(from, { text: '🚫 Apenas administradores do grupo podem rebaixar membros!' }, { quoted: msg });
                break;
              }
              const ctxReb = msg.message.extendedTextMessage?.contextInfo;
              const alvoReb = ctxReb?.mentionedJid?.[0] || ctxReb?.participant;
              if (!alvoReb) {
                await sock.sendMessage(from, { text: '⚠️ Marque o adm com @ ou responda à mensagem dele para rebaixar.\n\nEx: `!rebaixar @pessoa`' }, { quoted: msg });
                break;
              }
              const infoReb = partReb.find(p => p.id === alvoReb);
              if (!infoReb?.admin) {
                await sock.sendMessage(from, { text: `ℹ️ @${alvoReb.split('@')[0]} não é administrador(a) do grupo.`, mentions: [alvoReb] }, { quoted: msg });
                break;
              }
              if (infoReb.admin === 'superadmin') {
                await sock.sendMessage(from, { text: '👑 O criador do grupo não pode ser rebaixado!' }, { quoted: msg });
                break;
              }
              await sock.groupParticipantsUpdate(from, [alvoReb], 'demote');
              await sock.sendMessage(from, {
                text: `📉 *REBAIXAMENTO!* 📉\n\n` +
                      `👤 @${alvoReb.split('@')[0]} perdeu a coroa!\n` +
                      `🛡️ Não é mais *administrador(a)* do grupo\n` +
                      `👮 Ação feita por: @${sender.split('@')[0]}\n\n` +
                      `Quem sabe numa próxima... 😔`,
                mentions: [alvoReb, sender]
              });
            } catch (err) {
              console.error('Erro no comando !rebaixar:', err);
              await sock.sendMessage(from, { text: '❌ Não consegui rebaixar. Verifique se o bot é ADM do grupo!' }, { quoted: msg });
            }
          }
          break;

        case 'botoff':
          {
            if (!isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono e os líderes podem usar este comando!' }, { quoted: msg });
              break;
            }
            const estOff = carregarJSON(FILE_BOTSTATE);
            if (estOff.__global && estOff.__global.off) {
              await sock.sendMessage(from, { text: 'ℹ️ O bot já está desligado em todos os grupos. Para ligar use: !boton' }, { quoted: msg });
              break;
            }
            estOff.__global = { off: true };
            salvarJSON(FILE_BOTSTATE, estOff);
            await sock.sendMessage(from, {
              text: `🔇 *BOT DESLIGADO EM TODOS OS GRUPOS!*\n\n` +
                    `😴 O bot foi colocado para dormir em todos os grupos.\n` +
                    `🚫 Os membros não conseguem usar nenhum comando.\n` +
                    `👑 Só o dono e os líderes continuam com acesso.\n\n` +
                    `Para acordar o bot use: !boton`
            }, { quoted: msg });
          }
          break;

        case 'boton':
          {
            if (!isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono e os líderes podem usar este comando!' }, { quoted: msg });
              break;
            }
            const estOn = carregarJSON(FILE_BOTSTATE);
            let estavaOff = !!(estOn.__global && estOn.__global.off);
            delete estOn.__global;
            for (const k of Object.keys(estOn)) {
              if (estOn[k] && estOn[k].off) {
                estavaOff = true;
                delete estOn[k].off;
                if (!Object.keys(estOn[k]).length) delete estOn[k];
              }
            }
            if (!estavaOff) {
              await sock.sendMessage(from, { text: 'ℹ️ O bot já está ligado em todos os grupos.' }, { quoted: msg });
              break;
            }
            salvarJSON(FILE_BOTSTATE, estOn);
            await sock.sendMessage(from, {
              text: `🔊 *BOT LIGADO EM TODOS OS GRUPOS!*\n\n` +
                    `⚡ O bot acordou e está pronto pra ação!\n` +
                    `✅ Todos os membros já podem usar os comandos novamente.`
            }, { quoted: msg });
          }
          break;

        case 'soadm':
          {
            if (!isGroup) {
              await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
              break;
            }
            try {
              const gmSo = await sock.groupMetadata(from);
              const admSo = gmSo.participants.find(p => p.id === sender)?.admin;
              if (!admSo && !isDono) {
                await sock.sendMessage(from, { text: '🚫 Apenas administradores do grupo podem usar este comando!' }, { quoted: msg });
                break;
              }
              const estSo = carregarJSON(FILE_BOTSTATE);
              const gSo = estSo[from] || {};
              if (gSo.soadm) {
                delete gSo.soadm;
                if (Object.keys(gSo).length) estSo[from] = gSo;
                else delete estSo[from];
                salvarJSON(FILE_BOTSTATE, estSo);
                await sock.sendMessage(from, {
                  text: `🔓 *MODO SÓ ADM DESATIVADO!*\n\n` +
                        `🎉 Todos os membros já podem usar o bot novamente.`
                }, { quoted: msg });
              } else {
                gSo.soadm = true;
                estSo[from] = gSo;
                salvarJSON(FILE_BOTSTATE, estSo);
                await sock.sendMessage(from, {
                  text: `🛡️ *MODO SÓ ADM ATIVADO!*\n\n` +
                        `🔒 A partir de agora, somente administradores (além do dono e dos líderes) podem usar o bot neste grupo.\n\n` +
                        `Para desativar use !soadm novamente.`
                }, { quoted: msg });
              }
            } catch (err) {
              console.error('Erro no comando !soadm:', err);
              await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao alterar o modo só adm.' }, { quoted: msg });
            }
          }
          break;

        case 'rgaviso':
          {
            if (!isGroup) {
              await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
              break;
            }
            try {
              const gmAv = await sock.groupMetadata(from);
              const admAv = gmAv.participants.find(p => p.id === sender)?.admin;
              if (!admAv && !isDono) {
                await sock.sendMessage(from, { text: '🚫 Apenas administradores do grupo podem programar avisos!' }, { quoted: msg });
                break;
              }

              const mHora = /^(\d{1,2}):(\d{2})$/.exec(args[0] || '');
              const hhAv = mHora ? parseInt(mHora[1], 10) : -1;
              const mmAv = mHora ? parseInt(mHora[2], 10) : -1;
              if (hhAv < 0 || hhAv > 23 || mmAv < 0 || mmAv > 59) {
                await sock.sendMessage(from, { text: '⚠️ Informe o horário e a mensagem.\n\nEx: `!rgaviso 18:00 Reunião começando, pessoal!`' }, { quoted: msg });
                break;
              }
              const horaAv = String(hhAv).padStart(2, '0') + ':' + String(mmAv).padStart(2, '0');

              const qAv = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
              const textoAv = (args.slice(1).join(' ') || qAv?.conversation || qAv?.extendedTextMessage?.text || '').trim();
              if (!textoAv) {
                await sock.sendMessage(from, { text: '⚠️ Escreva a mensagem do aviso depois do horário.\n\nEx: `!rgaviso 18:00 Reunião começando, pessoal!`' }, { quoted: msg });
                break;
              }
              if (textoAv.length > 1000) {
                await sock.sendMessage(from, { text: '⚠️ O aviso pode ter no máximo 1000 caracteres!' }, { quoted: msg });
                break;
              }

              const avisosReg = carregarJSON(FILE_AVISOS);
              const pendentesGrupo = Object.values(avisosReg).filter(a => a.groupId === from).length;
              if (pendentesGrupo >= 10) {
                await sock.sendMessage(from, { text: '⚠️ Este grupo já tem 10 avisos aguardando. Espere algum ser enviado!' }, { quoted: msg });
                break;
              }

              const idAv = Date.now() + '_' + Math.floor(Math.random() * 1000);
              avisosReg[idAv] = { groupId: from, horario: horaAv, texto: textoAv, adm: sender };
              salvarJSON(FILE_AVISOS, avisosReg);

              await sock.sendMessage(from, {
                text: `⏰ *AVISO PROGRAMADO!*\n\n` +
                      `🕒 *Horário:* ${horaAv}\n` +
                      `💬 *Mensagem:* ${textoAv}\n` +
                      `👤 *Agendado por:* @${sender.split('@')[0]}\n\n` +
                      `✅ Pode deixar, vou avisar o grupo na hora certa!`,
                mentions: [sender]
              }, { quoted: msg });
            } catch (err) {
              console.error('Erro no comando !rgaviso:', err);
              await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao programar o aviso.' }, { quoted: msg });
            }
          }
          break;

        case 'reiniciar':
        case 'restart':
          {
            if (!isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono e os líderes podem reiniciar o bot!' }, { quoted: msg });
              break;
            }
            const tsRei = Number(msg.messageTimestamp);
            if (tsRei && Date.now() / 1000 - tsRei > 60) break;

            fs.writeFileSync(FILE_RESTART, JSON.stringify({ chat: from, texto: '✅ *Bot reiniciado com sucesso!*\n\nVoltei mais forte e pronto pra ação! 💜' }));
            await sock.sendMessage(from, { text: '🔄 *Reiniciando o bot...*\n\nVolto em alguns segundinhos! ⏳' }, { quoted: msg });
            setTimeout(() => process.exit(42), 1500);
          }
          break;

        case 'uptadestart':
        case 'upgradestart':
        case 'updatestart':
        case 'atualizar':
          {
            if (!isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono e os líderes podem atualizar o bot!' }, { quoted: msg });
              break;
            }
            const tsUpd = Number(msg.messageTimestamp);
            if (tsUpd && Date.now() / 1000 - tsUpd > 60) break;

            await sock.sendMessage(from, { text: '🔄 *Baixando atualização do GitHub...*\n\nSó um instante! ⏳' }, { quoted: msg });

            (async () => {
              const GITHUB_RAW = 'https://raw.githubusercontent.com/nicolascapitaogamer-source/shizuki-bot---MD/main/index.js';
              let codigoNovo = '';
              try {
                const r = await fetch(GITHUB_RAW + '?t=' + Date.now(), { signal: AbortSignal.timeout(30000) });
                if (!r.ok) throw new Error('HTTP ' + r.status);
                codigoNovo = await r.text();
                if (!codigoNovo || codigoNovo.length < 5000) throw new Error('Resposta vazia');
              } catch (e) {
                await sock.sendMessage(from, { text: '❌ *Erro ao baixar do GitHub!*\n\n' + e.message }, { quoted: msg });
                return;
              }

              // Compara com o atual
              const codigoAtual = fs.readFileSync('index.js', 'utf8');
              if (codigoAtual.trim() === codigoNovo.trim()) {
                await sock.sendMessage(from, { text: '✅ *Já tá atualizado!*\n\nNão tem nada novo no GitHub. 💜' }, { quoted: msg });
                return;
              }

              // Backup do antigo
              fs.writeFileSync('index.js.bak', codigoAtual);

              // Salva o novo
              fs.writeFileSync('index.js', codigoNovo);
              await sock.sendMessage(from, { text: '📥 *Código baixado!*\n\n🔍 Validando...' }, { quoted: msg });

              execFile(process.execPath, ['--check', 'index.js'], { timeout: 30000 }, async (errChk, stdoutChk, stderrChk) => {
              if (errChk) {
                const detalhe = String(stderrChk || errChk.message).split('\n').slice(0, 6).join('\n').slice(0, 600);
                await sock.sendMessage(from, { text: '❌ *Atualização cancelada!*\n\nEncontrei erro no código novo, então o bot continua rodando na versão antiga. Nada quebrou.\n\n```' + detalhe + '```' }, { quoted: msg });
                return;
              }
                if (errChk) {
                  const detalhe = String(stderrChk || errChk.message).split('\n').slice(0, 6).join('\n').slice(0, 600);
                  // Restaura o backup
                  const bak = fs.readFileSync('index.js.bak', 'utf8');
                  fs.writeFileSync('index.js', bak);
                  await sock.sendMessage(from, { text: '❌ *Atualização cancelada!*\n\nEncontrei erro no código novo, restaurei o antigo.\n\n' + detalhe.slice(0, 400) }, { quoted: msg });
                  return;
                }
                fs.writeFileSync(FILE_RESTART, JSON.stringify({ chat: from, texto: '✅ *Atualização concluída!*\n\nO bot está online com as novidades! 🚀💜' }));
                await sock.sendMessage(from, { text: '🚀 *Código novo validado!*\n\nAtualizando agora... já volto com as novidades! ⏳' }, { quoted: msg });
                setTimeout(() => process.exit(42), 1500);
              });
              })();
          }
          break;

        case 'channel':
        case 'canal':
          {
            if (!isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono e os líderes podem configurar o canal!' }, { quoted: msg });
              break;
            }

            const qCan = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            const textoCan = args.join(' ') || qCan?.conversation || qCan?.extendedTextMessage?.text || '';
            const mCan = /whatsapp\.com\/channel\/([A-Za-z0-9_-]+)/.exec(textoCan);

            if (!mCan) {
              const atual = config.canal && config.canal.id
                ? `\n\n📢 *Canal atual:* ${config.canal.nome || 'Canal'}\n🔗 ${config.canal.link || ''}`
                : '';
              await sock.sendMessage(from, { text: '⚠️ Envie o link do seu canal junto com o comando.\n\nEx: `!channel https://whatsapp.com/channel/0029VbXXXXXXXX`' + atual }, { quoted: msg });
              break;
            }

            const codigoCan = mCan[1];
            await sock.sendMessage(from, { text: '🔎 *Procurando o seu canal...*\n\nSó um instante! ⏳' }, { quoted: msg });

            try {
              const metaCan = await sock.newsletterMetadata('invite', codigoCan);
              if (!metaCan || !metaCan.id) throw new Error('Canal sem ID');

              const nomeCan = metaCan.name || metaCan.thread_metadata?.name?.text || 'Canal';
              const linkCan = `https://whatsapp.com/channel/${codigoCan}`;

              config.canal = { id: metaCan.id, nome: nomeCan, link: linkCan };
              salvarConfig(config);

              await sock.sendMessage(from, {
                text: `✨ *CHANNEL ATIVO COM SUCESSO, SENHOR(A)!* ✨\n\n` +
                      `🥇 → *ID:* ${metaCan.id}\n` +
                      `📢 → *NOME:* ${nomeCan}\n` +
                      `📎 → *LINK:* ${linkCan}\n\n` +
                      `💜 Agora o menu do bot aparece como encaminhado do seu canal!\n` +
                      `Para remover use: !rmchannel`
              }, { quoted: msg });
            } catch (err) {
              console.error('Erro no comando !channel:', err);
              await sock.sendMessage(from, { text: '❌ Não consegui encontrar esse canal.\n\nConfira se o link está certo e completo e tente de novo.' }, { quoted: msg });
            }
          }
          break;

        case 'rmchannel':
        case 'rmcanal':
          {
            if (!isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono e os líderes podem remover o canal!' }, { quoted: msg });
              break;
            }
            if (!config.canal || !config.canal.id) {
              await sock.sendMessage(from, { text: 'ℹ️ Nenhum canal está configurado no bot.' }, { quoted: msg });
              break;
            }
            const nomeRm = config.canal.nome || 'Canal';
            config.canal = null;
            salvarConfig(config);
            await sock.sendMessage(from, { text: `🗑️ *CANAL REMOVIDO!*\n\nO canal *${nomeRm}* foi desvinculado do bot.\nPara colocar outro use: !channel [link]` }, { quoted: msg });
          }
          break;

        case 'jogodavelha':
        case 'velha':
          {
            if (!isGroup) {
              await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
              break;
            }
            const vlSub = (args[0] || '').toLowerCase();
            const vlAtual = velhaJogos.get(from);

            if (vlSub === 'parar' || vlSub === 'cancelar') {
              if (!vlAtual) {
                await sock.sendMessage(from, { text: 'ℹ️ Não há nenhum jogo da velha rolando neste grupo.' }, { quoted: msg });
                break;
              }
              let podeParar = isDono || vlAtual.j.some((x) => mesmoJid(x, sender));
              if (!podeParar) {
                try {
                  const gmVl = await sock.groupMetadata(from);
                  podeParar = !!gmVl.participants.find((p) => p.id === sender)?.admin;
                } catch (e) {}
              }
              if (!podeParar) {
                await sock.sendMessage(from, { text: '🚫 Só os jogadores ou os admins podem cancelar o jogo!' }, { quoted: msg });
                break;
              }
              velhaJogos.delete(from);
              await sock.sendMessage(from, { text: '🛑 *Jogo da velha cancelado!*' }, { quoted: msg });
              break;
            }

            const vlAdv = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            if (!vlAdv) {
              await sock.sendMessage(from, { text: '⚠️ Marque quem você quer desafiar!\n\nEx: `!jogodavelha @pessoa`' }, { quoted: msg });
              break;
            }
            if (mesmoJid(vlAdv, sender)) {
              await sock.sendMessage(from, { text: '😅 Você não pode jogar contra você mesmo(a)! Marque outra pessoa.' }, { quoted: msg });
              break;
            }
            if (sock.user && mesmoJid(vlAdv, sock.user.id)) {
              await sock.sendMessage(from, { text: '🤖 Eu não jogo, só organizo a bagunça! Marque outra pessoa.' }, { quoted: msg });
              break;
            }
            if (vlAtual && Date.now() - vlAtual.ultimo < 15 * 60 * 1000) {
              await sock.sendMessage(from, { text: '⚠️ Já tem um jogo da velha rolando neste grupo! Espere acabar ou use `!jogodavelha parar`.' }, { quoted: msg });
              break;
            }

            const gVl = { j: [sender, vlAdv], pts: [0, 0], sim: ['X', 'O'], tab: Array(9).fill(null), vez: 0, inicia: 0, rodada: 1, ultimo: Date.now() };
            velhaJogos.set(from, gVl);
            await sock.sendMessage(from, {
              text: velhaTexto(gVl, `🎮 @${numDe(sender)} desafiou @${numDe(vlAdv)}!\n⚔️ Que vença o melhor!`),
              mentions: [sender, vlAdv]
            }, { quoted: msg });
          }
          break;

        case 'quiz':
          {
            if (!isGroup) {
              await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
              break;
            }
            const qzSub = (args[0] || '').toLowerCase();
            const qzAtual = quizJogos.get(from);

            if (qzSub === 'parar' || qzSub === 'stop') {
              if (!qzAtual) {
                await sock.sendMessage(from, { text: 'ℹ️ Não há nenhum quiz rolando neste grupo.' }, { quoted: msg });
                break;
              }
              let podeQz = isDono || mesmoJid(qzAtual.dono, sender);
              if (!podeQz) {
                try {
                  const gmQz = await sock.groupMetadata(from);
                  podeQz = !!gmQz.participants.find((p) => p.id === sender)?.admin;
                } catch (e) {}
              }
              if (!podeQz) {
                await sock.sendMessage(from, { text: '🚫 Só quem iniciou o quiz ou os admins podem cancelar!' }, { quoted: msg });
                break;
              }
              clearTimeout(qzAtual.timer);
              quizJogos.delete(from);
              await sock.sendMessage(from, { text: '🛑 *Quiz cancelado!*' }, { quoted: msg });
              break;
            }

            if (qzAtual && Date.now() - qzAtual.ultimo < 10 * 60 * 1000) {
              await sock.sendMessage(from, { text: '⚠️ Já tem um quiz rolando neste grupo! Responda a pergunta ou use `!quiz parar`.' }, { quoted: msg });
              break;
            }
            if (qzAtual) clearTimeout(qzAtual.timer);

            const qzNovo = { dono: sender, pts: {}, num: 0, fila: null, atual: null, timer: null, ultimo: Date.now() };
            quizJogos.set(from, qzNovo);

            await sock.sendMessage(from, {
              text: `╭━━━〔 🧠 𝐐𝐔𝐈𝐙 𝐒𝐇𝐈𝐙𝐔𝐊𝐈 🧠 〕━━━╮\n┃\n` +
                    `┃ 🎯 Animais, anime, filmes,\n┃ desenhos e séries!\n┃\n` +
                    `┃ 🏁 Quem fizer *${QUIZ_META} pontos* vence!\n` +
                    `┃ ✍️ Responda *marcando a pergunta*,\n┃ sem prefixo.\n┃\n` +
                    `┃ ⏳ Prepare-se...\n` +
                    `╰━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });

            for (const n of ['1️⃣', '2️⃣', '3️⃣']) {
              await esperar(1200);
              await sock.sendMessage(from, { text: n });
            }
            await esperar(1200);
            await sock.sendMessage(from, { text: '🚀 *VALENDO!*' });
            await quizProxima(from);
          }
          break;

        case 'cassino':
        case 'casino':
          {
            const csSaldo = saldoCassino(sender);
            const csSub = normTxt(args[0] || '');
            const csMapa = {
              '1': 'gratis', gratis: 'gratis', gratuito: 'gratis', free: 'gratis',
              '2': 'slot', slot: 'slot', caca: 'slot', niquel: 'slot', 'caca niquel': 'slot',
              '3': 'dados', dados: 'dados', dado: 'dados',
              '4': 'moeda', moeda: 'moeda', cara: 'moeda', coroa: 'moeda',
              '5': 'bitcoin', bitcoin: 'bitcoin', btc: 'bitcoin'
            };
            const csJogo = csMapa[csSub];

            if (!csJogo) {
              await sock.sendMessage(from, { text: textoMenuCassino(csSaldo, sender), mentions: [sender] }, { quoted: msg });
              break;
            }

            // Jogo grátis
            if (csJogo === 'gratis') {
              const stCs = carregarJSON(FILE_STATS);
              const agoraCs = Date.now();
              const usosCs = ((stCs[sender] && stCs[sender].gratisUsos) || []).filter((t) => agoraCs - t < CASSINO_JANELA);

              if (usosCs.length >= CASSINO_GIROS_GRATIS) {
                const minCs = Math.ceil((CASSINO_JANELA - (agoraCs - usosCs[0])) / 60000);
                await sock.sendMessage(from, {
                  text: `╭━━━〔 🎁 𝐑𝐎𝐋𝐄𝐓𝐀 𝐆𝐑𝐀́𝐓𝐈𝐒 🎁 〕━━━╮\n┃\n` +
                        `┃ ⏳ Você já usou seus *${CASSINO_GIROS_GRATIS} giros*!\n` +
                        `┃ 🕒 Novo giro em *${minCs} minuto(s)*\n` +
                        `┃ 💰 Saldo: *${csSaldo}* moedas\n┃\n` +
                        `┃ 🎰 Enquanto isso, jogue com *!cassino*\n` +
                        `╰━━━━━━━━━━━━━━━━━━╯\n\n👤 @${numDe(sender)}`,
                  mentions: [sender]
                }, { quoted: msg });
                break;
              }

              usosCs.push(agoraCs);
              const premio = 10 + Math.floor(Math.pow(Math.random(), 1.5 + (usosCs.length - 1) * 0.5) * 990);
              const novoCs = ajustarSaldo(sender, premio, { gratisUsos: usosCs });
              const restamCs = CASSINO_GIROS_GRATIS - usosCs.length;
              const tituloCs = premio >= 700 ? '🎉 𝐉𝐀𝐂𝐊𝐏𝐎𝐓 𝐆𝐑𝐀́𝐓𝐈𝐒! 🎉'
                             : premio >= 300 ? '✨ 𝐁𝐎𝐀 𝐒𝐎𝐑𝐓𝐄! ✨'
                             : '🍀 𝐆𝐀𝐍𝐇𝐎𝐔 𝐔𝐌 𝐓𝐑𝐎𝐂𝐀𝐃𝐎 🍀';
              const fraseCs = premio >= 700 ? '🤑 A sorte hoje está do seu lado!'
                            : premio >= 300 ? '😎 Nada mal, hein?'
                            : '😅 Já é um começo, mas os prêmios vão ficando mais difíceis...';

              await sock.sendMessage(from, {
                text: `╭━━━〔 🎁 𝐑𝐎𝐋𝐄𝐓𝐀 𝐆𝐑𝐀́𝐓𝐈𝐒 🎁 〕━━━╮\n┃\n` +
                      `┃ ${tituloCs}\n┃\n` +
                      `┃ 💵 Prêmio: *+${premio}* moedas\n` +
                      `┃ 💰 Saldo: *${novoCs}* moedas\n` +
                      `┃ 🎟️ Giros restantes: *${restamCs}/${CASSINO_GIROS_GRATIS}*\n┃\n` +
                      `┃ ${fraseCs}\n` +
                      `╰━━━━━━━━━━━━━━━━━━╯\n\n👤 @${numDe(sender)}`,
                mentions: [sender]
              }, { quoted: msg });
              break;
            }

            // Jogos pagos
            const csTokens = args.slice(1);
            if (csSub === 'cara' || csSub === 'coroa') csTokens.unshift(csSub);
            const csValorStr = csTokens.find((x) => /^\d+$/.test(x));
            const csValor = csValorStr ? parseInt(csValorStr, 10) : 0;

            if (csSaldo < CASSINO_MIN) {
              await sock.sendMessage(from, { text: `😢 Você está sem moedas para apostar!\n\n🎁 Use *!cassino gratis* para ganhar mais.` }, { quoted: msg });
              break;
            }
            if (!csValor || csValor < CASSINO_MIN || csValor > CASSINO_MAX) {
              await sock.sendMessage(from, { text: `⚠️ Informe um valor entre *${CASSINO_MIN}* e *${CASSINO_MAX}*.\n\nEx: \`!cassino ${csJogo === 'moeda' ? 'moeda cara' : csJogo} 100\`` }, { quoted: msg });
              break;
            }
            if (csValor > csSaldo) {
              await sock.sendMessage(from, { text: `💸 Saldo insuficiente!\n\n💰 Você tem *${csSaldo}* moedas e tentou apostar *${csValor}*.` }, { quoted: msg });
              break;
            }

            const nivelCs = nivelCassino(sender);
            const azarCs = chanceAzar(nivelCs);
            const extraNivel = { cassinoNivel: { n: nivelCs + 1, em: Date.now() } };
            let csTexto = '';

            if (csJogo === 'slot') {
              let sl = girarSlot();
              if (sl.mult > 0 && Math.random() < azarCs) sl = girarSlot();
              const retorno = Math.floor(csValor * sl.mult);
              const novo = ajustarSaldo(sender, retorno - csValor, extraNivel);
              const resultado = sl.mult >= 8
                ? `🎉 *JACKPOT!* Três iguais!\n┃ 💵 Ganhou *+${retorno - csValor}* moedas!`
                : sl.mult > 0
                  ? `✨ Duas iguais!\n┃ 💵 Ganhou *+${retorno - csValor}* moedas!`
                  : `😭 Nada alinhou...\n┃ 💸 Perdeu *${csValor}* moedas.`;
              csTexto = `╭━━━〔 🎰 𝐂𝐀𝐂̧𝐀-𝐍𝐈́𝐐𝐔𝐄𝐋 🎰 〕━━━╮\n┃\n┃      ${sl.r.join('  ┃  ')}\n┃\n┃ ${resultado}\n┃ 💰 Saldo: *${novo}* moedas\n┃\n╰━━━━━━━━━━━━━━━━━━╯`;
            } else if (csJogo === 'dados') {
              const d = () => Math.floor(Math.random() * 6) + 1;
              const v1 = d(), v2 = d();
              let b1 = d(), b2 = d();
              if (v1 + v2 > b1 + b2 && Math.random() < azarCs) {
                const c1 = d(), c2 = d();
                if (c1 + c2 > b1 + b2) { b1 = c1; b2 = c2; }
              }
              const vs = v1 + v2, bs = b1 + b2;
              let delta = -csValor;
              let resultado = `😭 O bot venceu...\n┃ 💸 Perdeu *${csValor}* moedas.`;
              if (vs > bs) { delta = csValor; resultado = `🎉 Você venceu!\n┃ 💵 Ganhou *+${csValor}* moedas!`; }
              else if (vs === bs) { resultado = `🤝 Empate! Na casa, empate é do bot.\n┃ 💸 Perdeu *${csValor}* moedas.`; }
              const novo = ajustarSaldo(sender, delta, extraNivel);
              csTexto = `╭━━━〔 🎲 𝐃𝐀𝐃𝐎𝐒 🎲 〕━━━╮\n┃\n┃ 👤 Você: 🎲${v1} 🎲${v2} = *${vs}*\n┃ 🤖 Bot: 🎲${b1} 🎲${b2} = *${bs}*\n┃\n┃ ${resultado}\n┃ 💰 Saldo: *${novo}* moedas\n┃\n╰━━━━━━━━━━━━━━━━━━╯`;
            } else if (csJogo === 'moeda') {
              const escolha = csTokens.map((x) => normTxt(x)).find((x) => x === 'cara' || x === 'coroa');
              if (!escolha) {
                await sock.sendMessage(from, { text: '⚠️ Escolha *cara* ou *coroa*.\n\nEx: `!cassino moeda cara 100`' }, { quoted: msg });
                break;
              }
              let lado = Math.random() < 0.5 ? 'cara' : 'coroa';
              if (lado === escolha && Math.random() < azarCs) lado = Math.random() < 0.5 ? 'cara' : 'coroa';
              const ganhou = lado === escolha;
              const retorno = ganhou ? Math.floor(csValor * 1.8) : 0;
              const novo = ajustarSaldo(sender, retorno - csValor, extraNivel);
              const resultado = ganhou
                ? `🎉 Deu *${lado}*!\n┃ 💵 Ganhou *+${retorno - csValor}* moedas!`
                : `😭 Deu *${lado}*...\n┃ 💸 Perdeu *${csValor}* moedas.`;
              csTexto = `╭━━━〔 🪙 𝐂𝐀𝐑𝐀 𝐎𝐔 𝐂𝐎𝐑𝐎𝐀 🪙 〕━━━╮\n┃\n┃ 🎯 Sua escolha: *${escolha}*\n┃ 🪙 Resultado: *${lado}*\n┃\n┃ ${resultado}\n┃ 💰 Saldo: *${novo}* moedas\n┃\n╰━━━━━━━━━━━━━━━━━━╯`;
            } else if (csJogo === 'bitcoin') {
              const sorteioBtc = () => { const r = Math.random(); return r < 0.55 ? 0 : r < 0.80 ? 1.5 : r < 0.92 ? 2 : 3; };
              let mult = sorteioBtc();
              if (mult > 0 && Math.random() < azarCs) mult = sorteioBtc();
              const retorno = Math.floor(csValor * mult);
              const novo = ajustarSaldo(sender, retorno - csValor, extraNivel);
              const resultado = mult === 0
                ? `📉 O bitcoin despencou!\n┃ 💸 Perdeu *${csValor}* moedas.`
                : `📈 O bitcoin subiu *${mult}x*!\n┃ 💵 Ganhou *+${retorno - csValor}* moedas!`;
              csTexto = `╭━━━〔 ₿ 𝐁𝐈𝐓𝐂𝐎𝐈𝐍 ₿ 〕━━━╮\n┃\n┃ 💵 Investido: *${csValor}* moedas\n┃\n┃ ${resultado}\n┃ 💰 Saldo: *${novo}* moedas\n┃\n╰━━━━━━━━━━━━━━━━━━╯`;
            }

            await sock.sendMessage(from, {
              text: csTexto + `\n\n🔥 Dificuldade: *${rotuloNivel(nivelCs)}* ➜ próxima: *${rotuloNivel(nivelCs + 1)}*\n👤 @${numDe(sender)}`,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'adivinhe':
          {
            const perguntasAnime = [
              { pergunta: "Quem tem cabelo verde no anime One Piece?", resposta: "Zoro" },
              { pergunta: "Qual o nome do protagonista de Naruto?", resposta: "Naruto" },
              { pergunta: "Quem é o capitão dos Piratas do Chapéu de Palha em One Piece?", resposta: "Luffy" },
              { pergunta: "Qual o nome do ninja copiador do time 7 em Naruto?", resposta: "Kakashi" },
              { pergunta: "Quem usa uma espada e é o espadachim mais forte do mundo em One Piece?", resposta: "Mihawk" },
              { pergunta: "Qual o nome do Saiyajin criado na Terra que adora comer em Dragon Ball?", resposta: "Goku" },
              { pergunta: "Quem tem o braço elástico e quer ser o Rei dos Piratas?", resposta: "Luffy" },
              { pergunta: "Qual é o pilar da chama no anime Demon Slayer?", resposta: "Rengoku" },
              { pergunta: "Qual personagem de Death Note escreve nomes num caderno?", resposta: "Light Yagami" }
            ];

            const desafioSorteado = perguntasAnime[Math.floor(Math.random() * perguntasAnime.length)];

            const textoAdivinhe = 
              `🤔 *JOGO DA ADIVINHAÇÃO* 🔮\n\n` +
              `💬 ${desafioSorteado.pergunta}\n\n` +
              `✨ *Responda apenas marcando esta mensagem com o seu palpite (sem usar comandos/prefixo)!*`;

            const sentMsg = await sock.sendMessage(from, { text: textoAdivinhe }, { quoted: msg });

            if (sentMsg && sentMsg.key) {
              let jogos = carregarJSON(FILE_JOGOS);
              jogos[from] = {
                stanzaId: sentMsg.key.id,
                resposta: desafioSorteado.resposta
              };
              salvarJSON(FILE_JOGOS, jogos);
            }
          }
          break;

        case 'mute':
        case 'mutar':
          if (!isGroup) {
            await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
            break;
          }

          try {
            const groupMetadata = await sock.groupMetadata(from);
            const participants = groupMetadata.participants;

            const senderAdmin = participants.find(p => p.id === sender)?.admin;

            if (!senderAdmin) {
              await sock.sendMessage(from, { text: '🚫 Apenas administradores do grupo podem mutar membros!' }, { quoted: msg });
              break;
            }

            let targetUser = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                             msg.message.extendedTextMessage?.contextInfo?.participant;

            if (!targetUser) {
              await sock.sendMessage(from, { text: '⚠️ Marque a pessoa com @ ou responda à mensagem para mutar.' }, { quoted: msg });
              break;
            }

            const targetAdmin = participants.find(p => p.id === targetUser)?.admin;
            if (targetAdmin) {
              await sock.sendMessage(from, { text: '🛡️ Administradores do grupo não podem ser mutados!' }, { quoted: msg });
              break;
            }

            let mutes = carregarJSON(FILE_MUTES);
            if (!mutes[from]) mutes[from] = {};
            mutes[from][targetUser] = true;
            salvarJSON(FILE_MUTES, mutes);

            const mensagemMute = 
              `🔇 *VOCÊ FOI MUTADO(A)!* 🔇\n\n` +
              `👤 *Membro:* @${targetUser.split('@')[0]}\n\n` +
              `⚠️ *AVISO CRÍTICO:* Você está proibido(a) de mandar qualquer mensagem neste grupo.\n` +
              `🚫 *Se enviar qualquer mensagem enquanto estiver mutado(a), você será BANIDO(A) AUTOMATICAMENTE!*`;

            await sock.sendMessage(from, {
              text: mensagemMute,
              mentions: [targetUser]
            });

          } catch (err) {
            console.error('Erro no comando !mute:', err);
            await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao mutar o membro.' }, { quoted: msg });
          }
          break;

        case 'unmute':
        case 'desmutar':
          if (!isGroup) {
            await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
            break;
          }

          try {
            const groupMetadata = await sock.groupMetadata(from);
            const participants = groupMetadata.participants;

            const senderAdmin = participants.find(p => p.id === sender)?.admin;

            if (!senderAdmin) {
              await sock.sendMessage(from, { text: '🚫 Apenas administradores do grupo podem desmutar membros!' }, { quoted: msg });
              break;
            }

            let targetUser = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                             msg.message.extendedTextMessage?.contextInfo?.participant;

            if (!targetUser) {
              await sock.sendMessage(from, { text: '⚠️ Marque a pessoa com @ ou responda à mensagem para desmutar.' }, { quoted: msg });
              break;
            }

            let mutes = carregarJSON(FILE_MUTES);
            if (mutes[from] && mutes[from][targetUser]) {
              delete mutes[from][targetUser];
              salvarJSON(FILE_MUTES, mutes);

              await sock.sendMessage(from, {
                text: `🔊 @${targetUser.split('@')[0]} você não esta mais mutado, esta livre! 🕊️✨`,
                mentions: [targetUser]
              });
            } else {
              await sock.sendMessage(from, { text: 'ℹ️ Este membro não está mutado.' }, { quoted: msg });
            }

          } catch (err) {
            console.error('Erro no comando !unmute:', err);
            await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao desmutar o membro.' }, { quoted: msg });
          }
          break;

        case 'adv':
        case 'advertir':
          if (!isGroup) {
            await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
            break;
          }

          try {
            const groupMetadata = await sock.groupMetadata(from);
            const participants = groupMetadata.participants;

            const senderAdmin = participants.find(p => p.id === sender)?.admin;

            if (!senderAdmin) {
              await sock.sendMessage(from, { text: '🚫 Apenas administradores do grupo podem aplicar advertências!' }, { quoted: msg });
              break;
            }

            const ctxAdv = msg.message.extendedTextMessage?.contextInfo;
            const targetUser = ctxAdv?.mentionedJid?.[0] || ctxAdv?.participant;

            if (!targetUser) {
              await sock.sendMessage(from, { text: '⚠️ Marque a pessoa com @ ou responda à mensagem para aplicar a advertência.' }, { quoted: msg });
              break;
            }

            const targetAdmin = participants.find(p => p.id === targetUser)?.admin;
            if (targetAdmin) {
              await sock.sendMessage(from, { text: '🛡️ Administradores do grupo não podem receber advertências!' }, { quoted: msg });
              break;
            }

            // Pega o motivo (tudo que vem depois do @ ou da resposta)
            let motivo = args.join(' ').trim();
            if (ctxAdv?.mentionedJid && ctxAdv.mentionedJid[0]) {
              motivo = motivo.replace(new RegExp('@' + ctxAdv.mentionedJid[0].split('@')[0], 'g'), '').trim();
            }
            if (!motivo) motivo = 'Não informado';

            let advs = carregarJSON(FILE_ADVS);
            if (!advs[from]) advs[from] = {};
            if (!advs[from][targetUser]) advs[from][targetUser] = 0;
            if (!advs[from + '_motivos']) advs[from + '_motivos'] = {};
            if (!advs[from + '_motivos'][targetUser]) advs[from + '_motivos'][targetUser] = [];

            advs[from][targetUser] += 1;
            const totalAdvs = advs[from][targetUser];

            // Salva o motivo no histórico
            advs[from + '_motivos'][targetUser].push({
              motivo: motivo,
              por: sender,
              data: Date.now()
            });
            salvarJSON(FILE_ADVS, advs);

            if (totalAdvs >= 3) {
              delete advs[from][targetUser];
              salvarJSON(FILE_ADVS, advs);

              await sock.sendMessage(from, {
                text: '╭━━━〔 🚨 𝐋𝐈𝐌𝐈𝐓𝐄 𝐀𝐓𝐈𝐍𝐆𝐈𝐃𝐎 🚨 〕━━━╮\n' +
                      '┃\n' +
                      '┃ 👤 𝐌𝐞𝐦𝐛𝐫𝐨: @' + targetUser.split('@')[0] + '\n' +
                      '┃ 📝 𝐌𝐨𝐭𝐢𝐯𝐨: ' + motivo + '\n' +
                      '┃ 📊 𝐂𝐨𝐧𝐭𝐚𝐠𝐞𝐦: 3/3\n' +
                      '┃ 👮 𝐀𝐩𝐥𝐢𝐜𝐚𝐝𝐚 𝐩𝐨𝐫: @' + sender.split('@')[0] + '\n' +
                      '┃\n' +
                      '┃ 🛑 O membro foi removido!\n' +
                      '┃\n' +
                      '╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [targetUser, sender]
              });

              await sock.groupParticipantsUpdate(from, [targetUser], 'remove');
            } else {
              const faltam = 3 - totalAdvs;
              await sock.sendMessage(from, {
                text: '╭━━━〔 ⚠️ 𝐀𝐃𝐕𝐄𝐑𝐓𝐄̂𝐍𝐂𝐈𝐀 ⚠️ 〕━━━╮\n' +
                      '┃\n' +
                      '┃ 👤 𝐌𝐞𝐦𝐛𝐫𝐨: @' + targetUser.split('@')[0] + '\n' +
                      '┃ 📝 𝐌𝐨𝐭𝐢𝐯𝐨: ' + motivo + '\n' +
                      '┃ 📊 𝐂𝐨𝐧𝐭𝐚𝐠𝐞𝐦: ' + totalAdvs + '/3\n' +
                      '┃ 👮 𝐀𝐩𝐥𝐢𝐜𝐚𝐝𝐚 𝐩𝐨𝐫: @' + sender.split('@')[0] + '\n' +
                      '┃\n' +
                      '┃ ⚠️ Mais ' + faltam + ' e você será removido!\n' +
                      '┃\n' +
                      '╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [targetUser, sender]
              });
            }

          } catch (err) {
            console.error('Erro no comando !adv:', err);
            await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao aplicar a advertência. Verifique se o bot é administrador do grupo!' }, { quoted: msg });
          }
          break;

        case 'rmadv':
        case 'unadv':
        case 'remadv':
          if (!isGroup) {
            await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
            break;
          }

          try {
            const groupMetadata = await sock.groupMetadata(from);
            const participants = groupMetadata.participants;

            const senderAdmin = participants.find(p => p.id === sender)?.admin;

            if (!senderAdmin) {
              await sock.sendMessage(from, { text: '🚫 Apenas administradores do grupo podem remover advertências!' }, { quoted: msg });
              break;
            }

            const ctxRm = msg.message.extendedTextMessage?.contextInfo;
            const targetUser = ctxRm?.mentionedJid?.[0] || ctxRm?.participant;

            if (!targetUser) {
              await sock.sendMessage(from, { text: '⚠️ Marque a pessoa com @ ou responda à mensagem para remover a advertência.' }, { quoted: msg });
              break;
            }

            let advs = carregarJSON(FILE_ADVS);
            if (!advs[from] || !advs[from][targetUser] || advs[from][targetUser] <= 0) {
              await sock.sendMessage(from, { text: 'ℹ️ Essa pessoa não tem advertências!' }, { quoted: msg });
              break;
            }

            const antesRm = advs[from][targetUser];
            advs[from][targetUser] -= 1;
            const depoisRm = advs[from][targetUser];

            if (depoisRm <= 0) {
              delete advs[from][targetUser];
            }

            if (advs[from + '_motivos'] && advs[from + '_motivos'][targetUser] && advs[from + '_motivos'][targetUser].length > 0) {
              advs[from + '_motivos'][targetUser].pop();
            }

            salvarJSON(FILE_ADVS, advs);

            await sock.sendMessage(from, {
              text: '╭━━━〔 ✅ 𝐀𝐃𝐕𝐄𝐑𝐓𝐄̂𝐍𝐂𝐈𝐀 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐀 ✅ 〕━━━╮\n' +
                    '┃\n' +
                    '┃ 👤 𝐌𝐞𝐦𝐛𝐫𝐨: @' + targetUser.split('@')[0] + '\n' +
                    '┃ 📊 𝐀𝐧𝐭𝐞𝐬: ' + antesRm + '/3\n' +
                    '┃ 📊 𝐀𝐠𝐨𝐫𝐚: ' + depoisRm + '/3\n' +
                    '┃ 👮 𝐑𝐞𝐦𝐨𝐯𝐢𝐝𝐚 𝐩𝐨𝐫: @' + sender.split('@')[0] + '\n' +
                    '┃\n' +
                    (depoisRm > 0 ? '┃ 💜 Mais uma chance!\n' : '┃ 💜 Histórico zerado!\n') +
                    '┃\n' +
                    '╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [targetUser, sender]
            });

          } catch (err) {
            console.error('Erro no comando !rmadv:', err);
            await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao remover a advertência.' }, { quoted: msg });
          }
          break;

        case 'ban':
        case 'kick':
          if (!isGroup) {
            await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
            break;
          }

          try {
            const groupMetadata = await sock.groupMetadata(from);
            const participants = groupMetadata.participants;

            const senderAdmin = participants.find(p => p.id === sender)?.admin;

            if (!senderAdmin) {
              await sock.sendMessage(from, { text: '🚫 Apenas administradores do grupo podem usar este comando!' }, { quoted: msg });
              break;
            }

            let targetUser = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                             msg.message.extendedTextMessage?.contextInfo?.participant;

            if (!targetUser) {
              await sock.sendMessage(from, { text: '⚠️ Marque a pessoa com @ ou responda à mensagem de quem deseja banir.' }, { quoted: msg });
              break;
            }

            await sock.groupParticipantsUpdate(from, [targetUser], 'remove');
            await sock.sendMessage(from, { 
              text: `🚫 O usuário @${targetUser.split('@')[0]} foi removido do grupo por um administrador.`,
              mentions: [targetUser]
            });

          } catch (err) {
            console.error('Erro no comando !ban:', err);
            await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao tentar banir. Certifique-se de que o bot é ADM do grupo!' }, { quoted: msg });
          }
          break;

        case 'boasvindas':
          const testeTexto = `👋 *Boas-vindas Automáticas*:\n\nSempre que alguém entrar no grupo, o bot enviará uma mensagem personalizada mencionando o novo participante!`;
          await sock.sendMessage(from, { text: testeTexto }, { quoted: msg });
          break;


        case 'ship':
        case 'corno':
        case 'gay':
        case 'gostosa':
        case 'gostoso':
        case 'feio':
        case 'bonito':
        case 'bonita':
        case 'rico':
        case 'pobre':
        case 'gado':
        case 'safado':
        case 'safada':
        case 'chato':
        case 'louco':
        case 'louca':
        case 'sortudo':
        case 'sortuda':
        case 'azarado':
        case 'azarada':
        case 'pau':
        case 'bunda':
        case 'chifre':
        case 'inteligente':
        case 'burro':
        case 'burra':
          {
            const cmdPct = canonicoCmd(command);
            const cmdFinal = cmdPct === 'bonita' ? 'bonito'
                           : cmdPct === 'safada' ? 'safado'
                           : cmdPct === 'louca' ? 'louco'
                           : cmdPct === 'sortuda' ? 'sortudo'
                           : cmdPct === 'azarada' ? 'azarado'
                           : cmdPct === 'burra' ? 'burro'
                           : cmdPct;
            const ctxPct = msg.message.extendedTextMessage?.contextInfo;
            const mencoesPct = ctxPct?.mentionedJid || [];
            const alvoPct = mencoesPct[0] || ctxPct?.participant || sender;
            await enviarPorcentagem(sock, from, msg, cmdFinal, alvoPct, sender);
          }
          break;

        case 'vipprotecao':
          {
            if (!eVIP(sender) && !isDono) {
              await sock.sendMessage(from, {
                text: '╭━━━〔 🚫 𝐒𝐎́ 𝐕𝐈𝐏 🚫 〕━━━╮\n┃\n┃ 😢 Você não é VIP!\n┃\n┃ 💎 A proteção VIP é um\n┃    benefício exclusivo.\n┃\n┃ 💌 Fale com o *5519988953961*\n┃    pra adquirir o seu!\n┃\n╰━━━━━━━━━━━━━━━━━━╯'
              }, { quoted: msg });
              break;
            }

            const sub = (args[0] || '').toLowerCase();
            const u = shizukiUser(sender);
            const agora = Date.now();

            if (sub === 'status') {
              const protecaoAtiva = u.vipprotecao && u.vipprotecao.expira > agora;
              if (protecaoAtiva) {
                const resta = u.vipprotecao.expira - agora;
                const h = Math.floor(resta / 3600000);
                const m = Math.floor((resta % 3600000) / 60000);
                const expDate = new Date(u.vipprotecao.expira).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
                await sock.sendMessage(from, {
                  text: '╭━━━〔 🛡️ 𝐒𝐓𝐀𝐓𝐔𝐒 𝐕𝐈𝐏 🛡️ 〕━━━╮\n┃\n┃ 👤 @' + sender.split('@')[0] + '\n┃\n┃ 🛡️ Proteção: *ATIVA*\n┃ ⏰ Expira em: *' + h + 'h ' + m + 'min*\n┃ 📅 Expira em: *' + expDate + '*\n┃\n┃ 💎 Você tá protegido(a)!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                  mentions: [sender]
                }, { quoted: msg });
              } else {
                await sock.sendMessage(from, {
                  text: '╭━━━〔 🛡️ 𝐒𝐓𝐀𝐓𝐔𝐒 𝐕𝐈𝐏 🛡️ 〕━━━╮\n┃\n┃ 👤 @' + sender.split('@')[0] + '\n┃\n┃ 🛡️ Proteção: *INATIVA*\n┃\n┃ 💡 Use *!vipprotecao* pra ativar!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                  mentions: [sender]
                }, { quoted: msg });
              }
              break;
            }

            const protecaoAtiva = u.vipprotecao && u.vipprotecao.expira > agora;
            let texto = '';
            if (!protecaoAtiva) {
              u.vipprotecao = { expira: agora + 24 * 3600000, ativadaEm: agora };
              salvarShizuki(sender, u);
              texto = '╭━━━〔 🛡️ 𝐏𝐑𝐎𝐓𝐄𝐂̧𝐀̃𝐎 𝐕𝐈𝐏 🛡️ 〕━━━╮\n┃\n┃ ✨ Proteção ativada com sucesso!\n┃\n┃ 🛡️ Status: *ATIVADA*\n┃ ⏰ Expira em: *24 horas*\n┃ 💰 Custo: *GRÁTIS* (1ª ativação)\n┃\n┃ 💎 Protegido contra:\n┃    ┣ ❌ !roubar\n┃    ┣ ❌ !assaltar\n┃    ┗ ❌ !sequestrar\n┃\n┃ 👑 Aproveite, chefe!\n┃\n╰━━━━━━━━━━━━━━━━━━╯';
            } else {
              if (u.reais < 30) {
                await sock.sendMessage(from, {
                  text: '╭━━━〔 💸 𝐒𝐄𝐌 𝐒𝐀𝐋𝐃𝐎 💸 〕━━━╮\n┃\n┃ 😢 Você não tem R$ 30,00\n┃    pra renovar!\n┃\n┃ 💰 Seu saldo: *' + formatarReais(u.reais) + '*\n┃ 💵 Precisa: *R$ 30,00*\n┃\n┃ 💡 Trabalha mais, chefe!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                  mentions: [sender]
                }, { quoted: msg });
                break;
              }
              u.reais -= 30;
              u.vipprotecao = { expira: agora + 24 * 3600000, ativadaEm: agora };
              salvarShizuki(sender, u);
              texto = '╭━━━〔 🛡️ 𝐑𝐄𝐍𝐎𝐕𝐀𝐂̧𝐀̃𝐎 𝐕𝐈𝐏 🛡️ 〕━━━╮\n┃\n┃ 🔄 Proteção renovada!\n┃\n┃ 🛡️ Status: *ATIVADA*\n┃ ⏰ Expira em: *24 horas*\n┃ 💰 Custo: *R$ 30,00*\n┃ 💵 Saldo: *' + formatarReais(u.reais) + '*\n┃\n┃ 💎 Protegido contra:\n┃    ┣ ❌ !roubar\n┃    ┣ ❌ !assaltar\n┃    ┗ ❌ !sequestrar\n┃\n┃ 👑 Boa, chefe!\n┃\n╰━━━━━━━━━━━━━━━━━━╯';
            }
            await sock.sendMessage(from, { text: texto, mentions: [sender] }, { quoted: msg });
          }
          break;
        case 'servip':
          {
            if (!isDono) {
              await sock.sendMessage(from, {
                text: '╭━━━〔 🚫 𝐀𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐃𝐎 🚫 〕━━━╮\n┃\n┃ 😠 Pera aí! Você não é o meu dono,\n┃    não pode fazer esse comando!\n┃\n┃ 👑 Apenas o *nick dev* pode\n┃    usar isso aqui.\n┃\n╰━━━━━━━━━━━━━━━━━━╯'
              }, { quoted: msg });
              break;
            }

            const dbVip = vipDB();
            dbVip.vips = dbVip.vips || {};
            dbVip.vips[sender] = {
              desde: dbVip.vips[sender]?.desde || Date.now(),
              expira: null,
              infinito: true
            };
            salvarVipDB(dbVip);

            await sock.sendMessage(from, {
              text: '╭━━━〔 👑 𝐕𝐈𝐏 𝐈𝐍𝐅𝐈𝐍𝐈𝐓𝐎 👑 〕━━━╮\n' +
                    '┃\n' +
                    '┃ ✨ A realeza foi servida!\n' +
                    '┃\n' +
                    '┃ 👤 Membro: @' + sender.split('@')[0] + '\n' +
                    '┃ 💎 Status: *VIP INFINITO*\n' +
                    '┃ ⏰ Expira em: *NUNCA*\n' +
                    '┃\n' +
                    '┃ 💜 Bem-vindo(a) à realeza!\n' +
                    '┃\n' +
                    '╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [sender]
            }, { quoted: msg });
          }
          break;
        // ═══ PRESIDENTE — CANDIDATURA E PROPOSTAS ═══
        case 'candidatar':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            if (!grupoTemAluguelAtivo(from)) { await sock.sendMessage(from, { text: '❌ Este grupo não tem aluguel ativo do bot!' }, { quoted: msg }); break; }
            console.log('[DEBUG] sender:', sender, '| from:', from, '| pushName:', pushName);
            const ehAdmC = await ehAdmDoGrupoP(sock, from, sender);
            console.log('[DEBUG] ehAdmC:', ehAdmC, '| isDono:', isDono);
            if (!ehAdmC && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas administradores do grupo podem se candidatar!' }, { quoted: msg }); break; }

            const dbEle = carregarEleicao();
            dbEle.candidatos = dbEle.candidatos || {};

            const candsDoGrupo = Object.values(dbEle.candidatos).filter(c => c.grupo === from);
            if (candsDoGrupo.length >= 3) {
              await sock.sendMessage(from, { text: '⚠️ Este grupo já tem 3 candidatos (limite máximo)!' }, { quoted: msg });
              break;
            }
            if (dbEle.candidatos[sender]) {
              await sock.sendMessage(from, { text: '⚠️ Você já é candidato!' }, { quoted: msg });
              break;
            }

            const idCand = proximoIdProposta(dbEle.candidatos);
            dbEle.candidatos[sender] = {
              id: idCand,
              grupo: from,
              nome: pushName,
              propostas: [],
              desde: Date.now()
            };
            salvarEleicao(dbEle);

            const gmC = await sock.groupMetadata(from);
            await sock.sendMessage(from, {
              text: '╭━━━〔 🗳️ 𝐂𝐀𝐍𝐃𝐈𝐃𝐀𝐓𝐔𝐑𝐀 🗳️ 〕━━━╮\n' +
                    '┃\n' +
                    '┃ ✅ Você se candidatou!\n' +
                    '┃\n' +
                    '┃ 📊 ID: *' + idCand + '*\n' +
                    '┃ 👤 @' + sender.split('@')[0] + '\n' +
                    '┃ 👥 Grupo: ' + gmC.subject + '\n' +
                    '┃ 📝 Propostas: *0/4*\n' +
                    '┃\n' +
                    '┃ 💡 Use: *!enviarproposta <texto>*\n' +
                    '┃\n' +
                    '╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'candidatos':
          {
            const dbE = carregarEleicao();
            const cands = dbE.candidatos || {};
            const lista = Object.values(cands);
            if (!lista.length) {
              await sock.sendMessage(from, { text: 'ℹ️ Nenhum candidato ainda. Use *!candidatar* pra participar!' }, { quoted: msg });
              break;
            }
            let txt = '╭━━━〔 🗳️ 𝐂𝐀𝐍𝐃𝐈𝐃𝐀𝐓𝐎𝐒 🗳️ 〕━━━╮\n┃\n┃ 👥 Total: *' + lista.length + ' candidato(s)*\n┃\n';
            const mencs = [];
            for (const c of lista) {
              txt += '┣━━━〔 📊 ' + String(c.id).padStart(3, '0') + ' 〕━━━\n';
              const jidC = Object.keys(cands).find(k => cands[k].id === c.id) || '';
              txt += '┃ 👤 @' + jidC.split('@')[0] + '\n';
              txt += '┃ 👥 Grupo: ' + (c.grupoNome || 'grupo') + '\n';
              txt += '┃ 📝 Propostas: *' + c.propostas.length + '/4*\n┃\n';
              mencs.push(Object.keys(cands).find(k => cands[k].id === c.id));
            }
            txt += '┃ 💡 Use: *!votar <id>*\n┃\n╰━━━━━━━━━━━━━━━━━━╯';
            await sock.sendMessage(from, { text: txt, mentions: mencs }, { quoted: msg });
          }
          break;

        case 'enviarproposta':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const textoProp = args.join(' ').trim();
            if (!textoProp) {
              await sock.sendMessage(from, { text: '⚠️ Use: *!enviarproposta <texto>*' }, { quoted: msg });
              break;
            }
            const dbEl = carregarEleicao();
            dbEl.candidatos = dbEl.candidatos || {};
            if (!dbEl.candidatos[sender]) {
              await sock.sendMessage(from, { text: '❌ Você não é candidato! Use *!candidatar* primeiro.' }, { quoted: msg });
              break;
            }
            if (dbEl.candidatos[sender].propostas.length >= 4) {
              await sock.sendMessage(from, { text: '⚠️ Você já enviou 4 propostas (máximo)!' }, { quoted: msg });
              break;
            }
            const dbProps = carregarPropostas();
            const idProp = proximoIdProposta(dbProps);
            dbProps[idProp] = {
              id: idProp,
              candidato: sender,
              grupo: from,
              texto: textoProp,
              status: 'pendente',
              criadoEm: Date.now()
            };
            salvarPropostas(dbProps);
            dbEl.candidatos[sender].propostas.push(idProp);
            salvarEleicao(dbEl);

            await sock.sendMessage(from, {
              text: '╭━━━〔 📜 𝐏𝐑𝐎𝐏𝐎𝐒𝐓𝐀 𝐄𝐍𝐕𝐈𝐀𝐃𝐀 📜 〕━━━╮\n' +
                    '┃\n' +
                    '┃ ✅ Proposta registrada!\n' +
                    '┃\n' +
                    '┃ 📜 ID: *' + idProp + '*\n' +
                    '┃ 👤 De: @' + sender.split('@')[0] + '\n' +
                    '┃ 📝 "' + textoProp + '"\n' +
                    '┃ 📊 Propostas: *' + dbEl.candidatos[sender].propostas.length + '/4*\n' +
                    '┃\n' +
                    '┃ 💡 Aguardando aprovação do dono!\n' +
                    '┃\n' +
                    '╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'minhaspropostas':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const dbM = carregarEleicao();
            if (!dbM.candidatos || !dbM.candidatos[sender]) {
              await sock.sendMessage(from, { text: '❌ Você não é candidato!' }, { quoted: msg });
              break;
            }
            const meusIds = dbM.candidatos[sender].propostas || [];
            if (!meusIds.length) {
              await sock.sendMessage(from, { text: '📝 Você ainda não enviou propostas!\n\nUse: *!enviarproposta <texto>*' }, { quoted: msg });
              break;
            }
            const dbP = carregarPropostas();
            let txt = '╭━━━〔 📜 𝐌𝐈𝐍𝐇𝐀𝐒 𝐏𝐑𝐎𝐏𝐎𝐒𝐓𝐀𝐒 📜 〕━━━╮\n┃\n┃ 👤 @' + sender.split('@')[0] + '\n┃ 📊 Total: *' + meusIds.length + '/4*\n┃\n';
            for (const id of meusIds) {
              const p = dbP[id];
              if (!p) continue;
              const emoji = p.status === 'aprovada' ? '✅' : p.status === 'rejeitada' ? '❌' : '⏳';
              txt += '┃ ' + emoji + ' *' + id + '* — ' + p.status + '\n┃    "' + p.texto.slice(0, 60) + '"\n┃\n';
            }
            txt += '╰━━━━━━━━━━━━━━━━━━╯';
            await sock.sendMessage(from, { text: txt, mentions: [sender] }, { quoted: msg });
          }
          break;

        case 'propostas':
          {
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono!' }, { quoted: msg }); break; }
            const dbPend = carregarPropostas();
            const pendentes = Object.values(dbPend).filter(p => p.status === 'pendente');
            if (!pendentes.length) {
              await sock.sendMessage(from, { text: '✅ Nenhuma proposta pendente!' }, { quoted: msg });
              break;
            }
            let txt = '╭━━━〔 📋 𝐏𝐑𝐎𝐏𝐎𝐒𝐓𝐀𝐒 𝐏𝐄𝐍𝐃𝐄𝐍𝐓𝐄𝐒 📋 〕━━━╮\n┃\n┃ 👥 Total: *' + pendentes.length + '*\n┃\n';
            const mencsP = [];
            for (const p of pendentes) {
              txt += '┃ 📜 *' + p.id + '* — @' + p.candidato.split('@')[0] + '\n┃    "' + p.texto.slice(0, 60) + '"\n┃\n';
              mencsP.push(p.candidato);
            }
            txt += '┃ 💡 Use: *!aprovarproposta <id>*\n┃         *!rejeitarproposta <id>*\n┃\n╰━━━━━━━━━━━━━━━━━━╯';
            await sock.sendMessage(from, { text: txt, mentions: mencsP }, { quoted: msg });
          }
          break;

        case 'verproposta':
          {
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono!' }, { quoted: msg }); break; }
            const idV = args[0];
            if (!idV) { await sock.sendMessage(from, { text: '⚠️ Use: *!verproposta <id>*' }, { quoted: msg }); break; }
            const idVf = idV.startsWith('#') ? idV : '#' + idV.padStart(3, '0');
            const dbVP = carregarPropostas();
            const pV = dbVP[idVf];
            if (!pV) { await sock.sendMessage(from, { text: '❌ Proposta ' + idVf + ' não encontrada!' }, { quoted: msg }); break; }
            const gP = pV.grupo ? (await sock.groupMetadata(pV.grupo).catch(() => ({ subject: 'Grupo' }))).subject : 'Grupo';
            await sock.sendMessage(from, {
              text: '╭━━━〔 👁️ 𝐃𝐄𝐓𝐀𝐋𝐇𝐄𝐒 👁️ 〕━━━╮\n┃\n┃ 📜 ID: *' + pV.id + '*\n┃ 👤 Candidato: @' + pV.candidato.split('@')[0] + '\n┃ 👥 Grupo: ' + gP + '\n┃ 📅 Status: *' + pV.status + '*\n┃\n┃ 📝 Proposta:\n┃ "' + pV.texto + '"\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [pV.candidato]
            }, { quoted: msg });
          }
          break;

        case 'aprovarproposta':
          {
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono!' }, { quoted: msg }); break; }
            const idA = args[0];
            if (!idA) { await sock.sendMessage(from, { text: '⚠️ Use: *!aprovarproposta <id>*' }, { quoted: msg }); break; }
            const idAf = idA.startsWith('#') ? idA : '#' + idA.padStart(3, '0');
            const dbAP = carregarPropostas();
            if (!dbAP[idAf]) { await sock.sendMessage(from, { text: '❌ Proposta ' + idAf + ' não encontrada!' }, { quoted: msg }); break; }
            dbAP[idAf].status = 'aprovada';
            dbAP[idAf].aprovadaEm = Date.now();
            salvarPropostas(dbAP);
            await sock.sendMessage(from, {
              text: '╭━━━〔 ✅ 𝐏𝐑𝐎𝐏𝐎𝐒𝐓𝐀 𝐀𝐏𝐑𝐎𝐕𝐀𝐃𝐀 ✅ 〕━━━╮\n┃\n┃ 📜 Proposta: *' + dbAP[idAf].id + '*\n┃ 👤 De: @' + dbAP[idAf].candidato.split('@')[0] + '\n┃\n┃ 📝 "' + dbAP[idAf].texto.slice(0, 80) + '"\n┃\n┃ ✅ Status: *APROVADA*\n┃ 👑 Por: dono\n┃\n┃ 💜 Boa sorte na eleição!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [dbAP[idAf].candidato]
            }, { quoted: msg });
          }
          break;

        case 'rejeitarproposta':
          {
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono!' }, { quoted: msg }); break; }
            const idR = args[0];
            if (!idR) { await sock.sendMessage(from, { text: '⚠️ Use: *!rejeitarproposta <id>*' }, { quoted: msg }); break; }
            const idRf = idR.startsWith('#') ? idR : '#' + idR.padStart(3, '0');
            const dbRP = carregarPropostas();
            if (!dbRP[idRf]) { await sock.sendMessage(from, { text: '❌ Proposta ' + idRf + ' não encontrada!' }, { quoted: msg }); break; }
            dbRP[idRf].status = 'rejeitada';
            dbRP[idRf].rejeitadaEm = Date.now();
            salvarPropostas(dbRP);
            await sock.sendMessage(from, {
              text: '╭━━━〔 ❌ 𝐏𝐑𝐎𝐏𝐎𝐒𝐓𝐀 𝐑𝐄𝐉𝐄𝐈𝐓𝐀𝐃𝐀 ❌ 〕━━━╮\n┃\n┃ 📜 Proposta: *' + dbRP[idRf].id + '*\n┃ 👤 De: @' + dbRP[idRf].candidato.split('@')[0] + '\n┃\n┃ 📝 "' + dbRP[idRf].texto.slice(0, 80) + '"\n┃\n┃ ❌ Status: *REJEITADA*\n┃ 👑 Por: dono\n┃\n┃ 💜 Tenta outra próxima vez!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [dbRP[idRf].candidato]
            }, { quoted: msg });
          }
          break;
        // ═══ PARTE 2 — VOTACAO ═══
        case 'iniciareleicao':
          {
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono!' }, { quoted: msg }); break; }
            const dbIE = carregarEleicao();
            if (dbIE.fase === 'votacao') { await sock.sendMessage(from, { text: '⚠️ Já tem uma votação em andamento!' }, { quoted: msg }); break; }
            const candsIE = Object.values(dbIE.candidatos || {});
            if (!candsIE.length) { await sock.sendMessage(from, { text: '❌ Nenhum candidato se registrou ainda!' }, { quoted: msg }); break; }
            dbIE.fase = 'votacao';
            dbIE.iniciadaEm = Date.now();
            dbIE.votos = {};
            salvarEleicao(dbIE);
            await sock.sendMessage(from, {
              text: '╭━━━〔 🚀 𝐄𝐋𝐄𝐈𝐂̧𝐀̃𝐎 𝐈𝐍𝐈𝐂𝐈𝐀𝐃𝐀 🚀 〕━━━╮\n┃\n┃ 📊 Fase: *VOTAÇÃO*\n┃ 👥 Candidatos: *' + candsIE.length + '*\n┃\n┃ 💡 Use: *!votar <id>*\n┃ 📋 Veja: *!candidatos*\n┃\n╰━━━━━━━━━━━━━━━━━━╯'
            }, { quoted: msg });
          }
          break;

        case 'fasedaeleicao':
          {
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono!' }, { quoted: msg }); break; }
            const dbFE = carregarEleicao();
            const fase = dbFE.fase || 'nenhuma';
            const candsFE = Object.values(dbFE.candidatos || {});
            const votosFE = Object.keys(dbFE.votos || {}).length;
            await sock.sendMessage(from, {
              text: '╭━━━〔 📊 𝐅𝐀𝐒𝐄 𝐀𝐓𝐔𝐀𝐋 📊 〕━━━╮\n┃\n┃ 📊 Fase: *' + fase.toUpperCase() + '*\n┃ 👥 Candidatos: *' + candsFE.length + '*\n┃ 🗳️ Votos: *' + votosFE + '*\n┃\n╰━━━━━━━━━━━━━━━━━━╯'
            }, { quoted: msg });
          }
          break;

        case 'eleicao':
          {
            const dbEl2 = carregarEleicao();
            const fase2 = dbEl2.fase || 'nenhuma';
            if (fase2 === 'nenhuma') { await sock.sendMessage(from, { text: 'ℹ️ Nenhuma eleição em andamento!' }, { quoted: msg }); break; }
            const cands2 = Object.values(dbEl2.candidatos || {});
            const votos2 = Object.keys(dbEl2.votos || {}).length;
            await sock.sendMessage(from, {
              text: '╭━━━〔 🗳️ 𝐄𝐋𝐄𝐈𝐂̧𝐀̃𝐎 𝐒𝐇𝐈𝐙𝐔𝐊𝐈 🗳️ 〕━━━╮\n┃\n┃ 📊 Fase: *' + fase2.toUpperCase() + '*\n┃ 👥 Candidatos: *' + cands2.length + '*\n┃ 🗳️ Votos totais: *' + votos2 + '*\n┃\n┃ 💡 Use: *!votar <id>*\n┃ 📋 Veja: *!candidatos*\n┃\n╰━━━━━━━━━━━━━━━━━━╯'
            }, { quoted: msg });
          }
          break;

        case 'votar':
          {
            const idV = args[0];
            if (!idV) { await sock.sendMessage(from, { text: '⚠️ Use: *!votar <id>*\n\nEx: !votar 001' }, { quoted: msg }); break; }
            const dbVt = carregarEleicao();
            if (dbVt.fase !== 'votacao') { await sock.sendMessage(from, { text: '⏳ Não tem votação em andamento!' }, { quoted: msg }); break; }
            const idVf = idV.startsWith('#') ? idV : '#' + idV.padStart(3, '0');
            const candsVt = dbVt.candidatos || {};
            const candAlvo = Object.values(candsVt).find(c => c.id === idVf);
            if (!candAlvo) { await sock.sendMessage(from, { text: '❌ Candidato ' + idVf + ' não encontrado!\n\nUse *!candidatos* pra ver a lista.' }, { quoted: msg }); break; }
            dbVt.votos = dbVt.votos || {};
            if (dbVt.votos[sender]) { await sock.sendMessage(from, { text: '⚠️ Você já votou!\n\nSeu voto: *' + dbVt.votos[sender] + '*' }, { quoted: msg }); break; }
            dbVt.votos[sender] = candAlvo.id;
            salvarEleicao(dbVt);
            await sock.sendMessage(from, {
              text: '╭━━━〔 🗳️ 𝐕𝐎𝐓𝐎 𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐀𝐃𝐎 🗳️ 〕━━━╮\n┃\n┃ ✅ Seu voto foi computado!\n┃\n┃ 👤 Candidato: @' + candAlvo.id + '\n┃ 📊 ID: *' + candAlvo.id + '*\n┃\n┃ 💜 Obrigado por participar!\n┃\n╰━━━━━━━━━━━━━━━━━━╯'
            }, { quoted: msg });
          }
          break;

        case 'meuvoto':
          {
            const dbMv = carregarEleicao();
            const meuV = (dbMv.votos || {})[sender];
            if (!meuV) { await sock.sendMessage(from, { text: '❌ Você ainda não votou!\n\nUse: *!votar <id>*' }, { quoted: msg }); break; }
            await sock.sendMessage(from, {
              text: '╭━━━〔 🗳️ 𝐌𝐄𝐔 𝐕𝐎𝐓𝐎 🗳️ 〕━━━╮\n┃\n┃ ✅ Você votou em: *' + meuV + '*\n┃\n┃ 💜 Escolha registrada!\n┃\n╰━━━━━━━━━━━━━━━━━━╯'
            }, { quoted: msg });
          }
          break;

        case 'encerrareleicao':
          {
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono!' }, { quoted: msg }); break; }
            const dbEn = carregarEleicao();
            if (dbEn.fase !== 'votacao') { await sock.sendMessage(from, { text: '⚠️ Não tem votação em andamento!' }, { quoted: msg }); break; }
            const votosEn = dbEn.votos || {};
            const contagem = {};
            for (const v of Object.values(votosEn)) { contagem[v] = (contagem[v] || 0) + 1; }
            const candsEn = Object.values(dbEn.candidatos || {});
            let vencedor = null;
            let maxVotos = 0;
            for (const c of candsEn) {
              const q = contagem[c.id] || 0;
              if (q > maxVotos) { maxVotos = q; vencedor = c; }
            }
            if (!vencedor) { await sock.sendMessage(from, { text: '❌ Nenhum voto foi computado!' }, { quoted: msg }); break; }
            dbEn.fase = 'encerrada';
            dbEn.vencedor = vencedor;
            dbEn.encerradaEm = Date.now();
            salvarEleicao(dbEn);
            const dbPres = carregarPresidente();
            dbPres.grupos = dbPres.grupos || {};
            dbPres.grupos[from] = {
              jid: Object.keys(dbEn.candidatos).find(k => dbEn.candidatos[k].id === vencedor.id),
              id: vencedor.id,
              nome: vencedor.nome,
              grupo: vencedor.grupo,
              votos: maxVotos,
              eleitoEm: Date.now(),
              expiraEm: Date.now() + 7 * 24 * 3600000
            };
            dbPres.historico = dbPres.historico || [];
            dbPres.historico.push(dbPres.grupos[from]);
            salvarPresidente(dbPres);
            await sock.sendMessage(from, {
              text: '╭━━━〔 🏆 𝐄𝐋𝐄𝐈𝐂̧𝐀̃𝐎 𝐄𝐍𝐂𝐄𝐑𝐑𝐀𝐃𝐀 🏆 〕━━━╮\n┃\n┃ 👑 NOVO PRESIDENTE:\n┃    @' + dbPres.grupos[from].jid.split('@')[0] + '\n┃ 📅 Mandato: 7 dias\n┃ 🗳️ Votos: *' + maxVotos + '*\n┃\n┃ 💜 Parabéns, presidente!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [dbPres.grupos[from].jid]
            }, { quoted: msg });
          }
          break;

        case 'avaliar':
          {
            const subAv = (args[0] || '').toLowerCase();
            if (subAv !== 'sim' && subAv !== 'nao' && subAv !== 'não') {
              await sock.sendMessage(from, { text: '⚠️ Use: *!avaliar sim* ou *!avaliar nao*' }, { quoted: msg });
              break;
            }
            const dbAv = carregarPresidente();
            const gruposAv = dbAv.grupos || {};
            const pAv = gruposAv[from];
            if (!pAv || !pAv.avaliacao) {
              await sock.sendMessage(from, { text: 'ℹ️ Não tem avaliação aberta neste grupo!' }, { quoted: msg });
              break;
            }
            if (pAv.avaliacao.votaram.includes(sender)) {
              await sock.sendMessage(from, { text: '❌ Você já avaliou!' }, { quoted: msg });
              break;
            }
            const vAv = subAv === 'nao' || subAv === 'não' ? 'nao' : 'sim';
            pAv.avaliacao[vAv] += 1;
            pAv.avaliacao.votaram.push(sender);
            salvarPresidente(dbAv);
            await sock.sendMessage(from, {
              text: '✅ Você avaliou com *' + vAv.toUpperCase() + '*!\n\n' +
                    '📊 Parcial: SIM ' + pAv.avaliacao.sim + ' | NÃO ' + pAv.avaliacao.nao,
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'resultado':
          {
            const dbRes = carregarPresidente();
            const gruposRes = dbRes.grupos || {};
            if (!gruposRes[from]) { await sock.sendMessage(from, { text: 'ℹ️ Nenhum presidente eleito neste grupo ainda!' }, { quoted: msg }); break; }
            const atual = gruposRes[from];
            await sock.sendMessage(from, {
              text: '╭━━━〔 🏆 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎 🏆 〕━━━╮\n┃\n┃ 👑 NOVO PRESIDENTE:\n┃    @' + atual.jid.split('@')[0] + '\n┃ 🗳️ Votos: *' + atual.votos + '*\n┃ 📅 Mandato: 7 dias\n┃\n┃ 💜 Parabéns, presidente!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [atual.jid]
            }, { quoted: msg });
          }
          break;

        case 'presidente':
          {
            const dbPr = carregarPresidente();
            const gruposPr = dbPr.grupos || {};
            if (!gruposPr[from]) { await sock.sendMessage(from, { text: 'ℹ️ Nenhum presidente eleito neste grupo ainda!' }, { quoted: msg }); break; }
            const p = gruposPr[from];
            const resta = p.expiraEm - Date.now();
            const dias = Math.max(0, Math.floor(resta / 86400000));
            await sock.sendMessage(from, {
              text: '╭━━━〔 👑 𝐏𝐑𝐄𝐒𝐈𝐃𝐄𝐍𝐓𝐄 👑 〕━━━╮\n┃\n┃ 👤 Presidente: @' + p.jid.split('@')[0] + '\n┃ 📅 Mandato restante: *' + dias + ' dias*\n┃ 🗳️ Eleito com: *' + p.votos + '* votos\n┃\n┃ 💜 Liderando o Shizuki City!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [p.jid]
            }, { quoted: msg });
          }
          break;

        case 'cancelareleicao':
          {
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono!' }, { quoted: msg }); break; }
            const dbCn = carregarEleicao();
            dbCn.fase = 'nenhuma';
            dbCn.votos = {};
            salvarEleicao(dbCn);
            await sock.sendMessage(from, { text: '🛑 Eleição cancelada!' }, { quoted: msg });
          }
          break;

        case 'pularfase':
          {
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono!' }, { quoted: msg }); break; }
            const dbPf = carregarEleicao();
            if (dbPf.fase === 'votacao') { dbPf.fase = 'encerrada'; }
            else { dbPf.fase = 'votacao'; dbPf.votos = dbPf.votos || {}; }
            salvarEleicao(dbPf);
            await sock.sendMessage(from, { text: '⏭️ Fase pulada! Nova fase: *' + dbPf.fase + '*' }, { quoted: msg });
          }
          break;
        case 'proporlei':
          {
            const dbP = carregarPresidente();
            if (!dbP.atual) { await sock.sendMessage(from, { text: '❌ Nenhum presidente eleito!' }, { quoted: msg }); break; }
            if (dbP.atual.jid !== sender && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o presidente pode propor leis!' }, { quoted: msg }); break; }
            const textoL = args.join(' ').trim();
            if (!textoL) { await sock.sendMessage(from, { text: '⚠️ Use: *!proporlei <texto>*' }, { quoted: msg }); break; }
            const dbL = carregarLeis();
            const idL = proximoIdLei(dbL);
            dbL[idL] = { id: idL, presidente: sender, texto: textoL, status: 'pendente', criadoEm: Date.now() };
            salvarLeis(dbL);
            await sock.sendMessage(from, {
              text: '╭━━━〔 ⚖️ 𝐋𝐄𝐈 𝐏𝐑𝐎𝐏𝐎𝐒𝐓𝐀 ⚖️ 〕━━━╮\n┃\n┃ ✅ Lei registrada!\n┃\n┃ 📜 ID: *' + idL + '*\n┃ 👤 Por: @' + sender.split('@')[0] + '\n┃ 📝 "' + textoL + '"\n┃\n┃ 💡 Aguardando aprovação do dono!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'minhasleis':
          {
            const dbML = carregarLeis();
            const minhas = Object.values(dbML).filter(l => l.presidente === sender);
            if (!minhas.length) { await sock.sendMessage(from, { text: '📝 Você não propôs nenhuma lei ainda!' }, { quoted: msg }); break; }
            let txtML = '╭━━━〔 ⚖️ 𝐌𝐈𝐍𝐇𝐀𝐒 𝐋𝐄𝐈𝐒 ⚖️ 〕━━━╮\n┃\n┃ 👤 @' + sender.split('@')[0] + '\n┃ 📊 Total: *' + minhas.length + '*\n┃\n';
            for (const l of minhas) {
              const em = l.status === 'aprovada' ? '✅' : l.status === 'rejeitada' ? '❌' : '⏳';
              txtML += '┃ ' + em + ' *' + l.id + '* — ' + l.status + '\n┃    "' + l.texto.slice(0, 60) + '"\n┃\n';
            }
            txtML += '╰━━━━━━━━━━━━━━━━━━╯';
            await sock.sendMessage(from, { text: txtML, mentions: [sender] }, { quoted: msg });
          }
          break;

        case 'renunciar':
          {
            const dbR = carregarPresidente();
            if (!dbR.atual) { await sock.sendMessage(from, { text: '❌ Nenhum presidente eleito!' }, { quoted: msg }); break; }
            if (dbR.atual.jid !== sender) { await sock.sendMessage(from, { text: '🚫 Você não é o presidente!' }, { quoted: msg }); break; }
            const exP = dbR.atual;
            dbR.atual = null;
            salvarPresidente(dbR);
            await sock.sendMessage(from, {
              text: '╭━━━〔 👑 𝐑𝐄𝐍𝐔́𝐍𝐂𝐈𝐀 👑 〕━━━╮\n┃\n┃ ⚠️ O presidente renunciou!\n┃\n┃ 👤 @' + sender.split('@')[0] + '\n┃ 📅 Saiu do cargo\n┃\n┃ 🗳️ Novas eleições em breve!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'removerpresidente':
          {
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono!' }, { quoted: msg }); break; }
            const dbRP = carregarPresidente();
            if (!dbRP.atual) { await sock.sendMessage(from, { text: '❌ Nenhum presidente eleito!' }, { quoted: msg }); break; }
            const exRP = dbRP.atual;
            dbRP.atual = null;
            salvarPresidente(dbRP);
            await sock.sendMessage(from, {
              text: '╭━━━〔 👑 𝐏𝐑𝐄𝐒𝐈𝐃𝐄𝐍𝐓𝐄 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐎 👑 〕━━━╮\n┃\n┃ 👤 Ex-presidente: @' + exRP.jid.split('@')[0] + '\n┃ 📅 Removido pelo dono\n┃\n┃ 🗳️ Novas eleições em breve!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [exRP.jid]
            }, { quoted: msg });
          }
          break;

        case 'darmandato':
          {
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono!' }, { quoted: msg }); break; }
            const ctxDM = msg.message.extendedTextMessage?.contextInfo;
            const alvoDM = ctxDM?.mentionedJid?.[0] || ctxDM?.participant;
            if (!alvoDM) { await sock.sendMessage(from, { text: '⚠️ Marque a pessoa!\n\nEx: !darmandato @pessoa' }, { quoted: msg }); break; }
            const dbDM = carregarPresidente();
            dbDM.grupos = dbDM.grupos || {};
            dbDM.grupos[from] = { jid: alvoDM, nome: pushName, votos: 0, eleitoEm: Date.now(), expiraEm: Date.now() + 7 * 24 * 3600000, dadoPor: sender };
            dbDM.historico = dbDM.historico || [];
            dbDM.historico.push(dbDM.atual);
            salvarPresidente(dbDM);
            await sock.sendMessage(from, {
              text: '╭━━━〔 🎁 𝐌𝐀𝐍𝐃𝐀𝐓𝐎 𝐂𝐎𝐍𝐂𝐄𝐃𝐈𝐃𝐎 🎁 〕━━━╮\n┃\n┃ 👤 Novo Presidente: @' + alvoDM.split('@')[0] + '\n┃ 📅 Mandato: 7 dias\n┃ 👑 Por: dono\n┃\n┃ 💜 Boa sorte, presidente!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [alvoDM]
            }, { quoted: msg });
          }
          break;

        case 'estendermandato':
          {
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono!' }, { quoted: msg }); break; }
            const diasE = parseInt(args[0], 10);
            if (!diasE || diasE < 1) { await sock.sendMessage(from, { text: '⚠️ Use: *!estendermandato <dias>*' }, { quoted: msg }); break; }
            const dbEM = carregarPresidente();
            if (!dbEM.atual) { await sock.sendMessage(from, { text: '❌ Nenhum presidente eleito!' }, { quoted: msg }); break; }
            if (dbEM.grupos && dbEM.grupos[from]) {
              dbEM.grupos[from].expiraEm = (dbEM.grupos[from].expiraEm || Date.now()) + diasE * 86400000;
            }
            salvarPresidente(dbEM);
            await sock.sendMessage(from, { text: '⏰ Mandato estendido em *' + diasE + ' dias*!' }, { quoted: msg });
          }
          break;

        case 'presidentes':
          {
            const dbHs = carregarPresidente();
            const hist = dbHs.historico || [];
            if (!hist.length) { await sock.sendMessage(from, { text: 'ℹ️ Nenhum presidente no histórico!' }, { quoted: msg }); break; }
            let txtHs = '╭━━━〔 📚 𝐇𝐈𝐒𝐓𝐎́𝐑𝐈𝐂𝐎 📚 〕━━━╮\n┃\n';
            const meds = ['🥇', '🥈', '🥉'];
            const mencs = [];
            hist.slice(-10).forEach((p, i) => {
              txtHs += '┃ ' + (meds[i] || '•') + ' @' + p.jid.split('@')[0] + '\n┃    🗳️ ' + (p.votos || 0) + ' votos\n┃\n';
              mencs.push(p.jid);
            });
            txtHs += '┃ 💜 Total: *' + hist.length + '*\n┃\n╰━━━━━━━━━━━━━━━━━━╯';
            await sock.sendMessage(from, { text: txtHs, mentions: mencs }, { quoted: msg });
          }
          break;

        case 'leispendentes':
          {
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono!' }, { quoted: msg }); break; }
            const dbLP = carregarLeis();
            const pends = Object.values(dbLP).filter(l => l.status === 'pendente');
            if (!pends.length) { await sock.sendMessage(from, { text: '✅ Nenhuma lei pendente!' }, { quoted: msg }); break; }
            let txtLP = '╭━━━〔 ⚖️ 𝐋𝐄𝐈𝐒 𝐏𝐄𝐍𝐃𝐄𝐍𝐓𝐄𝐒 ⚖️ 〕━━━╮\n┃\n┃ 👥 Total: *' + pends.length + '*\n┃\n';
            for (const l of pends) {
              txtLP += '┃ 📜 *' + l.id + '* — @' + l.presidente.split('@')[0] + '\n┃    "' + l.texto.slice(0, 60) + '"\n┃\n';
            }
            txtLP += '┃ 💡 Use: *!aprovarlei <id>*\n┃         *!rejeitarlei <id>*\n┃\n╰━━━━━━━━━━━━━━━━━━╯';
            await sock.sendMessage(from, { text: txtLP }, { quoted: msg });
          }
          break;

        case 'aprovarlei':
          {
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono!' }, { quoted: msg }); break; }
            const idAL = args[0];
            if (!idAL) { await sock.sendMessage(from, { text: '⚠️ Use: *!aprovarlei <id>*' }, { quoted: msg }); break; }
            const idALf = idAL.startsWith('#') ? idAL : '#' + idAL.padStart(3, '0');
            const dbAL = carregarLeis();
            if (!dbAL[idALf]) { await sock.sendMessage(from, { text: '❌ Lei ' + idALf + ' não encontrada!' }, { quoted: msg }); break; }
            dbAL[idALf].status = 'aprovada';
            dbAL[idALf].aprovadaEm = Date.now();
            salvarLeis(dbAL);
            await sock.sendMessage(from, {
              text: '╭━━━〔 ✅ 𝐋𝐄𝐈 𝐀𝐏𝐑𝐎𝐕𝐀𝐃𝐀 ✅ 〕━━━╮\n┃\n┃ 📜 Lei: *' + dbAL[idALf].id + '*\n┃ 👤 Por: @' + dbAL[idALf].presidente.split('@')[0] + '\n┃ 📝 "' + dbAL[idALf].texto.slice(0, 80) + '"\n┃\n┃ ✅ Status: *EM VIGOR*\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [dbAL[idALf].presidente]
            }, { quoted: msg });
          }
          break;

        case 'rejeitarlei':
          {
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono!' }, { quoted: msg }); break; }
            const idRL = args[0];
            if (!idRL) { await sock.sendMessage(from, { text: '⚠️ Use: *!rejeitarlei <id>*' }, { quoted: msg }); break; }
            const idRLf = idRL.startsWith('#') ? idRL : '#' + idRL.padStart(3, '0');
            const dbRL = carregarLeis();
            if (!dbRL[idRLf]) { await sock.sendMessage(from, { text: '❌ Lei ' + idRLf + ' não encontrada!' }, { quoted: msg }); break; }
            dbRL[idRLf].status = 'rejeitada';
            dbRL[idRLf].rejeitadaEm = Date.now();
            salvarLeis(dbRL);
            await sock.sendMessage(from, {
              text: '╭━━━〔 ❌ 𝐋𝐄𝐈 𝐑𝐄𝐉𝐄𝐈𝐓𝐀𝐃𝐀 ❌ 〕━━━╮\n┃\n┃ 📜 Lei: *' + dbRL[idRLf].id + '*\n┃ 👤 Por: @' + dbRL[idRLf].presidente.split('@')[0] + '\n┃ 📝 "' + dbRL[idRLf].texto.slice(0, 80) + '"\n┃\n┃ ❌ Status: *REJEITADA*\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [dbRL[idRLf].presidente]
            }, { quoted: msg });
          }
          break;
        case 'rmaniversario':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const uR = shizukiUser(sender);
            if (!uR.aniversarioGrupos || !uR.aniversarioGrupos.includes(from)) {
              await sock.sendMessage(from, { text: 'ℹ️ Você não tem aniversário registrado neste grupo!' }, { quoted: msg });
              break;
            }
            uR.aniversarioGrupos = uR.aniversarioGrupos.filter(g => g !== from);
            salvarShizuki(sender, uR);
            await sock.sendMessage(from, {
              text: '🗑️ *Aniversário removido deste grupo!*\n\n💜 O bot não vai mais avisar aqui.\n📊 Grupos restantes: *' + uR.aniversarioGrupos.length + '*',
              mentions: [sender]
            }, { quoted: msg });
          }
          break;
        // ═══ ARENA VIP — COMANDOS ═══
        case 'arena':
          {
            if (!eVIP(sender) && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas VIP pode criar arena!' }, { quoted: msg }); break; }
            const dbAr = carregarArena();
            const chvAr = chaveArena(from);
            if (dbAr[chvAr] && !dbAr[chvAr].finalizada) { await sock.sendMessage(from, { text: '⚠️ Já tem um duelo rolando aqui!' }, { quoted: msg }); break; }
            const ctxAr = msg.message.extendedTextMessage?.contextInfo;
            const alvoAr = ctxAr?.mentionedJid?.[0] || ctxAr?.participant;
            if (!alvoAr) { await sock.sendMessage(from, { text: '⚠️ Marque alguém!\n\nEx: *!arena @pessoa 5000*' }, { quoted: msg }); break; }
            if (alvoAr === sender) { await sock.sendMessage(from, { text: '😅 Você não pode duelar consigo mesmo!' }, { quoted: msg }); break; }
            const valorAr = parseInt(args.find(a => /^\d+$/.test(a)) || '0', 10);
            if (!valorAr || valorAr < 40 || valorAr > 999) { await sock.sendMessage(from, { text: '⚠️ Valor inválido! Mínimo: *40* Máximo: *999*' }, { quoted: msg }); break; }
            const uAr1 = shizukiUser(sender);
            const uAr2 = shizukiUser(alvoAr);
            if (uAr1.reais < valorAr) { await sock.sendMessage(from, { text: '💸 Você não tem *R$ ' + valorAr + '*!' }, { quoted: msg }); break; }
            if (uAr2.reais < valorAr) { await sock.sendMessage(from, { text: '💸 @' + alvoAr.split('@')[0] + ' não tem *R$ ' + valorAr + '*!', mentions: [alvoAr] }, { quoted: msg }); break; }
            const agoraAr = Date.now();
            if (uAr1.ultimaArena && agoraAr - uAr1.ultimaArena < ARENA_COOLDOWN) {
              const resta = Math.ceil((ARENA_COOLDOWN - (agoraAr - uAr1.ultimaArena)) / 60000);
              await sock.sendMessage(from, { text: '⏰ Aguarde *' + resta + ' min* pra duelar de novo!' }, { quoted: msg });
              break;
            }
            dbAr[chvAr] = {
              j1: sender,
              j2: alvoAr,
              hp1: 100, hp2: 100,
              vez: 1,
              turno: 1,
              valor: valorAr,
              defender1: false, defender2: false,
              escudo1: false, escudo2: false,
              cd1: {}, cd2: {},
              criadoEm: agoraAr,
              finalizada: false,
              stanzaId: null
            };
            salvarArena(dbAr);
            const msgEnviado = await sock.sendMessage(from, {
              text: '╭━━━〔 ⚔️ 𝐀𝐑𝐄𝐍𝐀 𝐕𝐈𝐏 ⚔️ 〕━━━╮\n┃\n┃ 💎 @' + sender.split('@')[0] + ' desafiou @' + alvoAr.split('@')[0] + '!\n┃\n┃ 💰 Aposta: *R$ ' + valorAr + '*\n┃ ⚔️ Luta até a morte!\n┃\n┃ 🎯 @' + alvoAr.split('@')[0] + ', aceita?\n┃    ┣ ✅ Marque esta mensagem\n┃    ┃    e responda *sim*\n┃    ┗ ❌ Ou responda *nao*\n┃\n┃ ⏰ 2 minutos pra responder\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [sender, alvoAr]
            }, { quoted: msg });
            dbAr[chvAr].stanzaId = msgEnviado?.key?.id;
            salvarArena(dbAr);
          }
          break;

        case 'atacar':
          {
            const dbA = carregarArena();
            const chvA = chaveArena(from);
            const a = dbA[chvA];
            if (!a || a.finalizada) { await sock.sendMessage(from, { text: '❌ Nenhum duelo rolando!' }, { quoted: msg }); break; }
            if ((a.vez === 1 && a.j1 !== sender) || (a.vez === 2 && a.j2 !== sender)) { await sock.sendMessage(from, { text: '⏳ Não é sua vez!' }, { quoted: msg }); break; }
            const dano = calcularDanoArena();
            let danoFinal = dano;
            if (a.vez === 1) {
              if (a.defender2) { danoFinal = Math.floor(dano / 2); a.defender2 = false; }
              if (a.escudo2) { danoFinal = 0; a.escudo2 = false; }
              a.hp2 = Math.max(0, a.hp2 - danoFinal);
            } else {
              if (a.defender1) { danoFinal = Math.floor(dano / 2); a.defender1 = false; }
              if (a.escudo1) { danoFinal = 0; a.escudo1 = false; }
              a.hp1 = Math.max(0, a.hp1 - danoFinal);
            }
            const nomeAtk = a.vez === 1 ? a.j1 : a.j2;
            const nomeDef = a.vez === 1 ? a.j2 : a.j1;
            const hpAtk = a.vez === 1 ? a.hp1 : a.hp2;
            const hpDef = a.vez === 1 ? a.hp2 : a.hp1;
            if (hpDef <= 0) {
              a.finalizada = true;
              salvarArena(dbA);
              const venc = nomeAtk;
              const perd = nomeDef;
              const uV = shizukiUser(venc);
              const uP = shizukiUser(perd);
              uV.reais += a.valor;
              uP.reais -= a.valor;
              uV.ultimaArena = Date.now();
              uP.ultimaArena = Date.now();
              salvarShizuki(venc, uV);
              salvarShizuki(perd, uP);
              delete dbA[chvA];
              salvarArena(dbA);
              await sock.sendMessage(from, {
                text: '╭━━━〔 🏆 𝐕𝐈𝐓𝐎́𝐑𝐈𝐀 🏆 〕━━━╮\n┃\n┃ 🥇 Vencedor: @' + venc.split('@')[0] + '\n┃ 💰 Prêmio: *R$ ' + a.valor + '*\n┃\n┃ 💀 Perdedor: @' + perd.split('@')[0] + '\n┃\n┃ ⚔️ Dano final: *' + danoFinal + '*\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [venc, perd]
              }, { quoted: msg });
              break;
            }
            a.vez = a.vez === 1 ? 2 : 1;
            a.turno += 1;
            salvarArena(dbA);
            await sock.sendMessage(from, {
              text: '╭━━━〔 ⚔️ 𝐓𝐔𝐑𝐍𝐎 ' + a.turno + ' ⚔️ 〕━━━╮\n┃\n┃ ⚔️ @' + nomeAtk.split('@')[0] + ' atacou!\n┃ 💥 Dano: *' + danoFinal + '*\n┃\n┃ ❤️ @' + nomeDef.split('@')[0] + ': *' + hpDef + '/100*\n┃ ❤️ @' + nomeAtk.split('@')[0] + ': *' + hpAtk + '/100*\n┃\n┃ 🎯 Vez de @' + nomeDef.split('@')[0] + '!\n┃\n┃ ┣ 🗡️ !atacar\n┃ ┣ 🛡️ !defender\n┃ ┣ ✨ !magia <nome>\n┃ ┗ 🏳️ !desistir\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [nomeAtk, nomeDef]
            }, { quoted: msg });
          }
          break;

        case 'defender':
          {
            const dbD = carregarArena();
            const chvD = chaveArena(from);
            const d = dbD[chvD];
            if (!d || d.finalizada) { await sock.sendMessage(from, { text: '❌ Nenhum duelo rolando!' }, { quoted: msg }); break; }
            if ((d.vez === 1 && d.j1 !== sender) || (d.vez === 2 && d.j2 !== sender)) { await sock.sendMessage(from, { text: '⏳ Não é sua vez!' }, { quoted: msg }); break; }
            if (d.vez === 1) d.defender1 = true;
            else d.defender2 = true;
            const nomeD = d.vez === 1 ? d.j1 : d.j2;
            d.vez = d.vez === 1 ? 2 : 1;
            d.turno += 1;
            salvarArena(dbD);
            await sock.sendMessage(from, {
              text: '╭━━━〔 🛡️ 𝐃𝐄𝐅𝐄𝐒𝐀 🛡️ 〕━━━╮\n┃\n┃ @' + nomeD.split('@')[0] + ' se defendeu!\n┃ 🛡️ Próximo ataque: *-50%*\n┃\n┃ ❤️ @' + d.j1.split('@')[0] + ': *' + d.hp1 + '/100*\n┃ ❤️ @' + d.j2.split('@')[0] + ': *' + d.hp2 + '/100*\n┃\n┃ 🎯 Vez de @' + (d.vez === 1 ? d.j1 : d.j2).split('@')[0] + '!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [d.j1, d.j2]
            }, { quoted: msg });
          }
          break;

        case 'magia':
          {
            const dbMg = carregarArena();
            const chvMg = chaveArena(from);
            const m = dbMg[chvMg];
            if (!m || m.finalizada) { await sock.sendMessage(from, { text: '❌ Nenhum duelo rolando!' }, { quoted: msg }); break; }
            if ((m.vez === 1 && m.j1 !== sender) || (m.vez === 2 && m.j2 !== sender)) { await sock.sendMessage(from, { text: '⏳ Não é sua vez!' }, { quoted: msg }); break; }
            const nomeMg = args.join(' ').toLowerCase().trim();
            const mag = ARENA_MAGIAS[nomeMg];
            if (!mag) {
              let lista = '📜 *Magias disponíveis:*\n\n';
              for (const k in ARENA_MAGIAS) {
                const M = ARENA_MAGIAS[k];
                lista += M.emoji + ' *' + M.nome + '* — ' + (M.danoMin ? 'Dano ' + M.danoMin + '-' + M.danoMax : M.cura ? 'Cura ' + M.cura : 'Escudo') + ' (CD ' + M.cd + ')\n';
              }
              lista += '\n💡 Use: *!magia <nome>*';
              await sock.sendMessage(from, { text: lista }, { quoted: msg });
              break;
            }
            const meuCd = m.vez === 1 ? m.cd1 : m.cd2;
            if (meuCd[nomeMg] && meuCd[nomeMg] > m.turno) {
              await sock.sendMessage(from, { text: '⏳ Magia em cooldown! Volta no turno *' + meuCd[nomeMg] + '*.' }, { quoted: msg });
              break;
            }
            meuCd[nomeMg] = m.turno + mag.cd;
            let textoMag = '';
            if (mag.cura) {
              if (m.vez === 1) m.hp1 = Math.min(100, m.hp1 + mag.cura);
              else m.hp2 = Math.min(100, m.hp2 + mag.cura);
              textoMag = mag.emoji + ' @' + sender.split('@')[0] + ' usou *' + mag.nome + '* e recuperou *' + mag.cura + ' HP*!';
            } else if (mag.escudo) {
              if (m.vez === 1) m.escudo1 = true;
              else m.escudo2 = true;
              textoMag = mag.emoji + ' @' + sender.split('@')[0] + ' ativou *' + mag.nome + '*! Próximo ataque: *0 dano*!';
            } else {
              const danoMg = Math.floor(Math.random() * (mag.danoMax - mag.danoMin + 1)) + mag.danoMin;
              let danoAplicado = danoMg;
              if (m.vez === 1) {
                if (m.defender2) { danoAplicado = Math.floor(danoMg / 2); m.defender2 = false; }
                if (m.escudo2) { danoAplicado = 0; m.escudo2 = false; }
                m.hp2 = Math.max(0, m.hp2 - danoAplicado);
              } else {
                if (m.defender1) { danoAplicado = Math.floor(danoMg / 2); m.defender1 = false; }
                if (m.escudo1) { danoAplicado = 0; m.escudo1 = false; }
                m.hp1 = Math.max(0, m.hp1 - danoAplicado);
              }
              textoMag = mag.emoji + ' @' + sender.split('@')[0] + ' usou *' + mag.nome + '*!\n💥 Dano: *' + danoAplicado + '*';
            }
            const nomeAlvo = m.vez === 1 ? m.j2 : m.j1;
            const nomeMeu = sender;
            const hpAlvo = m.vez === 1 ? m.hp2 : m.hp1;
            const hpMeu = m.vez === 1 ? m.hp1 : m.hp2;
            if (hpAlvo <= 0) {
              m.finalizada = true;
              salvarArena(dbMg);
              const uV = shizukiUser(sender);
              const uP = shizukiUser(nomeAlvo);
              uV.reais += m.valor;
              uP.reais -= m.valor;
              uV.ultimaArena = Date.now();
              uP.ultimaArena = Date.now();
              salvarShizuki(sender, uV);
              salvarShizuki(nomeAlvo, uP);
              delete dbMg[chvMg];
              salvarArena(dbMg);
              await sock.sendMessage(from, {
                text: '╭━━━〔 🏆 𝐕𝐈𝐓𝐎́𝐑𝐈𝐀 🏆 〕━━━╮\n┃\n┃ 🥇 Vencedor: @' + sender.split('@')[0] + '\n┃ 💰 Prêmio: *R$ ' + m.valor + '*\n┃\n┃ 💀 Perdedor: @' + nomeAlvo.split('@')[0] + '\n┃\n┃ ✨ Finalização: *' + mag.nome + '*\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [sender, nomeAlvo]
              }, { quoted: msg });
              break;
            }
            m.vez = m.vez === 1 ? 2 : 1;
            m.turno += 1;
            salvarArena(dbMg);
            await sock.sendMessage(from, {
              text: '╭━━━〔 ✨ ' + mag.nome.toUpperCase() + ' ✨ 〕━━━╮\n┃\n┃ ' + textoMag + '\n┃\n┃ ❤️ @' + m.j1.split('@')[0] + ': *' + m.hp1 + '/100*\n┃ ❤️ @' + m.j2.split('@')[0] + ': *' + m.hp2 + '/100*\n┃\n┃ 🎯 Vez de @' + (m.vez === 1 ? m.j1 : m.j2).split('@')[0] + '!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [m.j1, m.j2]
            }, { quoted: msg });
          }
          break;

        case 'desistir':
          {
            const dbDs = carregarArena();
            const chvDs = chaveArena(from);
            const ds = dbDs[chvDs];
            if (!ds || ds.finalizada) { await sock.sendMessage(from, { text: '❌ Nenhum duelo rolando!' }, { quoted: msg }); break; }
            if (ds.j1 !== sender && ds.j2 !== sender) { await sock.sendMessage(from, { text: '❌ Você não está nesse duelo!' }, { quoted: msg }); break; }
            const oponente = ds.j1 === sender ? ds.j2 : ds.j1;
            const uDes = shizukiUser(sender);
            const uOp = shizukiUser(oponente);
            uDes.ultimaArena = Date.now();
            uOp.ultimaArena = Date.now();
            salvarShizuki(sender, uDes);
            salvarShizuki(oponente, uOp);
            delete dbDs[chvDs];
            salvarArena(dbDs);
            await sock.sendMessage(from, {
              text: '🏳️ @' + sender.split('@')[0] + ' desistiu!\n\n🏆 Vitória de @' + oponente.split('@')[0] + '! (só a aposta dele volta)',
              mentions: [sender, oponente]
            }, { quoted: msg });
          }
          break;
        case 'shizukicity':
          {
            const uS = shizukiUser(sender);
            const texto = textoShizukiCity(uS, sender, pushName);
            await sock.sendMessage(from, { text: texto, mentions: [sender] }, { quoted: msg });
          }
          break;
        case 'rmarena':
          {
            if (!isDono && !eVIP(sender)) { await sock.sendMessage(from, { text: '🚫 Apenas o dono e VIPs!' }, { quoted: msg }); break; }
            const dbRm = carregarArena();
            const chvRm = chaveArena(from);
            if (!dbRm[chvRm]) { await sock.sendMessage(from, { text: 'ℹ️ Não tem duelo rolando aqui!' }, { quoted: msg }); break; }
            delete dbRm[chvRm];
            salvarArena(dbRm);
            await sock.sendMessage(from, { text: '🛑 Duelo finalizado com sucesso!' }, { quoted: msg });
          }
          break;
        // ═══ FACÇÕES — COMANDO PRINCIPAL ═══
        case 'cla':
          {
            if (!eVIP(sender) && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas VIPs, líderes e dono podem usar facções!' }, { quoted: msg }); break; }
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const sub = (args[0] || '').toLowerCase();
            const rest = args.slice(1);

            // ── !cla criar <nome> ──
            if (sub === 'criar') {
              if (!eVIP(sender) && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas VIPs podem criar facções!' }, { quoted: msg }); break; }
              const nomeF = rest.join(' ').trim();
              if (!nomeF) { await sock.sendMessage(from, { text: '⚠️ Use: *!cla criar <nome>*' }, { quoted: msg }); break; }
              if (nomeF.length > 20) { await sock.sendMessage(from, { text: '⚠️ Nome muito grande! Máx 20 chars.' }, { quoted: msg }); break; }
              const existente = faccaoDoUsuario(from, sender);
              if (existente) { await sock.sendMessage(from, { text: '⚠️ Você já tá na facção *' + existente.nome + '*!' }, { quoted: msg }); break; }
              const todas = listarFaccoesDoGrupo(from);
              if (todas.length >= FACCAO_MAX_POR_GRUPO) { await sock.sendMessage(from, { text: '⚠️ Já tem 5 facções neste grupo!' }, { quoted: msg }); break; }
              const idF = gerarIdFaccao();
              const dbF = carregarFaccoes();
              dbF[idF] = {
                id: idF,
                nome: nomeF,
                grupo: from,
                lider: sender,
                membros: [sender],
                caixa: 0,
                vitorias: 0,
                derrotas: 0,
                guerrasSeguidas: 0,
                criadaEm: Date.now()
              };
              salvarFaccoes(dbF);
              await sock.sendMessage(from, {
                text: '╭━━━〔 🏴 𝐅𝐀𝐂𝐂̧𝐀̃𝐎 𝐂𝐑𝐈𝐀𝐃𝐀 🏴 〕━━━╮\n┃\n┃ ✅ Facção criada com sucesso!\n┃\n┃ 🏴 Nome: *' + nomeF + '*\n┃ 👑 Líder: @' + sender.split('@')[0] + '\n┃ 👥 Membros: *1/' + FACCAO_MAX_MEMBROS + '*\n┃ 💰 Caixa: *R$ 0*\n┃\n┃ 💡 Use: *!cla convidar @pessoa*\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [sender]
              }, { quoted: msg });
              break;
            }

            // ── !cla convidar @pessoa ──
            if (sub === 'convidar') {
              const f = faccaoDoUsuario(from, sender);
              if (!f) { await sock.sendMessage(from, { text: '❌ Você não tá em nenhuma facção!' }, { quoted: msg }); break; }
              if (f.lider !== sender) { await sock.sendMessage(from, { text: '🚫 Apenas o líder pode convidar!' }, { quoted: msg }); break; }
              if (f.membros.length >= FACCAO_MAX_MEMBROS) { await sock.sendMessage(from, { text: '⚠️ Facção cheia (' + FACCAO_MAX_MEMBROS + '/' + FACCAO_MAX_MEMBROS + ')!' }, { quoted: msg }); break; }
              const ctx = msg.message.extendedTextMessage?.contextInfo;
              const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;
              if (!alvo) { await sock.sendMessage(from, { text: '⚠️ Marque alguém!\n\nEx: *!cla convidar @pessoa*' }, { quoted: msg }); break; }
              if (f.membros.includes(alvo)) { await sock.sendMessage(from, { text: '⚠️ Essa pessoa já tá na facção!' }, { quoted: msg }); break; }
              const jaTem = faccaoDoUsuario(from, alvo);
              if (jaTem) { await sock.sendMessage(from, { text: '⚠️ Essa pessoa já tá em outra facção!' }, { quoted: msg }); break; }
              const dbC = carregarConvites();
              const idConv = gerarIdFaccao();
              dbC[idConv] = { id: idConv, faccaoId: f.id, de: sender, para: alvo, grupo: from, criadoEm: Date.now() };
              salvarConvites(dbC);
              const msgEnv = await sock.sendMessage(from, {
                text: '╭━━━〔 🏴 𝐂𝐎𝐍𝐕𝐈𝐓𝐄 🏴 〕━━━╮\n┃\n┃ 📩 @' + alvo.split('@')[0] + ' foi convidado(a)!\n┃\n┃ 🏴 Facção: *' + f.nome + '*\n┃ 👑 Líder: @' + sender.split('@')[0] + '\n┃\n┃ 🎯 Aceita entrar?\n┃    ┣ ✅ Marque esta mensagem\n┃    ┃    e responda *sim*\n┃    ┗ ❌ Ou responda *nao*\n┃\n┃ ⏰ 2 minutos\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [alvo, sender]
              }, { quoted: msg });
              dbC[idConv].stanzaId = msgEnv?.key?.id;
              salvarConvites(dbC);
              break;
            }

            // ── !cla info ──
            if (sub === 'info') {
              const f = faccaoDoUsuario(from, sender);
              if (!f) { await sock.sendMessage(from, { text: '❌ Você não tá em nenhuma facção!' }, { quoted: msg }); break; }
              const dataF = new Date(f.criadaEm).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
              await sock.sendMessage(from, {
                text: '╭━━━〔 🏴 ' + f.nome.toUpperCase() + ' 🏴 〕━━━╮\n┃\n┃ 📊 ID: *' + (f.numero || '???') + '*\n┃ 👑 Líder: @' + f.lider.split('@')[0] + '\n┃ 👥 Membros: *' + f.membros.length + '/' + FACCAO_MAX_MEMBROS + '*\n┃ 💰 Caixa: *R$ ' + f.caixa + '*\n┃\n┃ ⚔️ Guerras:\n┃    ┣ 🏆 Vitórias: ' + f.vitorias + '\n┃    ┗ 💀 Derrotas: ' + f.derrotas + '\n┃\n┃ 📅 Criada em: ' + dataF + '\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [f.lider]
              }, { quoted: msg });
              break;
            }

            // ── !cla membros ──
            if (sub === 'membros') {
              const f = faccaoDoUsuario(from, sender);
              if (!f) { await sock.sendMessage(from, { text: '❌ Você não tá em nenhuma facção!' }, { quoted: msg }); break; }
              let txt = '╭━━━〔 🏴 ' + f.nome.toUpperCase() + ' 🏴 〕━━━╮\n┃\n┃ 👥 Membros: *' + f.membros.length + '/' + FACCAO_MAX_MEMBROS + '*\n┃\n';
              f.membros.forEach((jid, i) => {
                const isLid = jid === f.lider ? ' 👑' : '';
                txt += '┃ ' + (i + 1) + '. @' + jid.split('@')[0] + isLid + '\n';
              });
              txt += '┃\n╰━━━━━━━━━━━━━━━━━━╯';
              await sock.sendMessage(from, { text: txt, mentions: f.membros }, { quoted: msg });
              break;
            }

            // ── !cla depositar <valor> ──
            if (sub === 'depositar') {
              const f = faccaoDoUsuario(from, sender);
              if (!f) { await sock.sendMessage(from, { text: '❌ Você não tá em nenhuma facção!' }, { quoted: msg }); break; }
              const valorDep = parseInt(rest[0], 10);
              if (!valorDep || valorDep < 1) { await sock.sendMessage(from, { text: '⚠️ Use: *!cla depositar <valor>*' }, { quoted: msg }); break; }
              const uDep = shizukiUser(sender);
              if (uDep.reais < valorDep) { await sock.sendMessage(from, { text: '💸 Você não tem *R$ ' + valorDep + '*!\n💰 Seu saldo: *R$ ' + uDep.reais + '*', mentions: [sender] }, { quoted: msg }); break; }
              uDep.reais -= valorDep;
              salvarShizuki(sender, uDep);
              const dbFDep = carregarFaccoes();
              dbFDep[f.id].caixa += valorDep;
              salvarFaccoes(dbFDep);
              await sock.sendMessage(from, {
                text: '╭━━━〔 💰 𝐃𝐄𝐏𝐎́𝐒𝐈𝐓𝐎 🏴 〕━━━╮\n┃\n┃ ✅ Depositado com sucesso!\n┃\n┃ 🏴 Facção: *' + f.nome + '*\n┃ 💰 Valor: *R$ ' + valorDep + '*\n┃ 💼 Seu saldo: *R$ ' + uDep.reais + '*\n┃ 🏦 Caixa da facção: *R$ ' + dbFDep[f.id].caixa + '*\n┃\n┃ 💜 Valeu pela contribuição!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [sender]
              }, { quoted: msg });
              break;
            }

            // ── !cla caixa ──
            if (sub === 'caixa') {
              const f = faccaoDoUsuario(from, sender);
              if (!f) { await sock.sendMessage(from, { text: '❌ Você não tá em nenhuma facção!' }, { quoted: msg }); break; }
              await sock.sendMessage(from, {
                text: '╭━━━〔 🏦 𝐂𝐀𝐈𝐗𝐀 🏴 〕━━━╮\n┃\n┃ 🏴 Facção: *' + f.nome + '*\n┃\n┃ 💰 Caixa atual: *R$ ' + f.caixa + '*\n┃ 👥 Membros: *' + f.membros.length + '/' + FACCAO_MAX_MEMBROS + '*\n┃ 👑 Líder: @' + f.lider.split('@')[0] + '\n┃\n┃ 💡 Use: *!cla depositar <valor>*\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [f.lider]
              }, { quoted: msg });
              break;
            }

            // ── !cla sair ──
            if (sub === 'sair') {
              const f = faccaoDoUsuario(from, sender);
              if (!f) { await sock.sendMessage(from, { text: '❌ Você não tá em nenhuma facção!' }, { quoted: msg }); break; }
              if (f.lider === sender) {
                const dbFD = carregarFaccoes();
                const membrosRestantes = f.membros.filter(m => m !== sender);
                delete dbFD[f.id];
                salvarFaccoes(dbFD);
                await sock.sendMessage(from, {
                  text: '╭━━━〔 🚪 𝐅𝐀𝐂𝐂̧𝐀̃𝐎 𝐃𝐈𝐒𝐒𝐎𝐋𝐕𝐈𝐃𝐀 🏴 〕━━━╮\n┃\n┃ ⚠️ O líder saiu!\n┃\n┃ 🏴 Facção: *' + f.nome + '*\n┃ 👤 Líder: @' + sender.split('@')[0] + '\n┃ 👥 Membros dispensados: *' + membrosRestantes.length + '*\n┃\n┃ 💜 A facção foi dissolvida!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                  mentions: [sender, ...membrosRestantes]
                }, { quoted: msg });
                break;
              }
              const dbSai = carregarSaidas();
              const idSai = 'sai_' + Date.now();
              const msgSai = await sock.sendMessage(from, {
                text: '╭━━━〔 🚪 𝐒𝐀𝐈𝐑 𝐃𝐀 𝐅𝐀𝐂𝐂̧𝐀̃𝐎 🏴 〕━━━╮\n┃\n┃ ⚠️ @' + sender.split('@')[0] + ' quer sair!\n┃\n┃ 🏴 Facção: *' + f.nome + '*\n┃ 👑 Líder: @' + f.lider.split('@')[0] + '\n┃\n┃ 📝 @' + f.lider.split('@')[0] + ', aprova?\n┃    ┣ ✅ Marque e responda *sim*\n┃    ┗ ❌ Ou responda *nao*\n┃\n┃ ⏰ 2 minutos\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [sender, f.lider]
              }, { quoted: msg });
              dbSai[idSai] = { id: idSai, faccaoId: f.id, quemSai: sender, lider: f.lider, stanzaId: msgSai?.key?.id, grupo: from, criadoEm: Date.now() };
              salvarSaidas(dbSai);
              break;
            }

            // ── !cla ranking ──
            if (sub === 'ranking') {
              const dbR = carregarFaccoes();
              const todas = Object.values(dbR).sort((a, b) => b.caixa - a.caixa).slice(0, 10);
              if (!todas.length) { await sock.sendMessage(from, { text: 'ℹ️ Nenhuma facção criada ainda!' }, { quoted: msg }); break; }
              const meds = ['🥇', '🥈', '🥉'];
              let txtR = '╭━━━〔 🏆 𝐑𝐀𝐍𝐊𝐈𝐍𝐆 𝐅𝐀𝐂𝐂̧𝐎̃𝐄𝐒 🏆 〕━━━╮\n┃\n';
              todas.forEach((f, i) => {
                const med = meds[i] || (i + 1) + '️⃣';
                txtR += '┃ ' + med + ' *' + f.nome + '*\n┃    💰 R$ ' + f.caixa + ' | 👥 ' + f.membros.length + ' membros\n┃\n';
              });
              txtR += '┃ 💜 Total: *' + Object.keys(dbR).length + ' facções*\n┃\n╰━━━━━━━━━━━━━━━━━━╯';
              await sock.sendMessage(from, { text: txtR }, { quoted: msg });
              break;
            }

            // ── !cla guerra @faccao <valor> ──
            // ── !cla guerra <id_faccao> <valor> ──
            if (sub === 'guerra') {
              const f = faccaoDoUsuario(from, sender);
              if (!f) { await sock.sendMessage(from, { text: '❌ Você não tá em nenhuma facção!' }, { quoted: msg }); break; }
              if (f.lider !== sender) { await sock.sendMessage(from, { text: '🚫 Apenas o líder pode declarar guerra!' }, { quoted: msg }); break; }
              const idAlvo = (rest[0] || '').replace('#', '').trim();
              if (!idAlvo) { await sock.sendMessage(from, { text: '⚠️ Use: *!cla guerra <id> <valor>*\n\nEx: *!cla guerra 002 200*' }, { quoted: msg }); break; }
              const dbGuerra = carregarFaccoes();
              const fAlvo = Object.values(dbGuerra).find(x => x.numero === idAlvo && x.grupo === from);
              if (!fAlvo) { await sock.sendMessage(from, { text: '❌ Facção de ID *' + idAlvo + '* não encontrada!' }, { quoted: msg }); break; }
              if (fAlvo.id === f.id) { await sock.sendMessage(from, { text: '⚠️ Não pode guerrear contra si mesmo!' }, { quoted: msg }); break; }
              const valorG = parseInt(rest.find(a => /^\d+$/.test(a) && a !== idAlvo) || '0', 10);
              if (!valorG || valorG < 60 || valorG > 999) { await sock.sendMessage(from, { text: '⚠️ Aposta inválida! Mín: *60* Máx: *999*' }, { quoted: msg }); break; }
              if (f.caixa < valorG) { await sock.sendMessage(from, { text: '💸 Sua facção não tem *R$ ' + valorG + '* no caixa!\n💰 Caixa: *R$ ' + f.caixa + '*' }, { quoted: msg }); break; }
              if (fAlvo.caixa < valorG) { await sock.sendMessage(from, { text: '💸 A facção alvo não tem *R$ ' + valorG + '* no caixa!' }, { quoted: msg }); break; }
              const dbG = carregarGuerras();
              const idG = 'guerra_' + Date.now();
              const msgG = await sock.sendMessage(from, {
                text: '╭━━━〔 ⚔️ 𝐆𝐔𝐄𝐑𝐑𝐀 𝐃𝐄𝐂𝐋𝐀𝐑𝐀𝐃𝐀 ⚔️ 〕━━━╮\n┃\n┃ 🏴 *' + f.nome + '* (' + (f.numero || '?') + ')\n┃    declarou guerra!\n┃\n┃ 🏴 *' + fAlvo.nome + '* (' + (fAlvo.numero || '?') + ')\n┃    foi desafiada!\n┃\n┃ 💰 Aposta: *R$ ' + valorG + '*\n┃ ⚔️ Luta: *3 vs 3*\n┃\n┃ 🎯 @' + fAlvo.lider.split('@')[0] + ', aceita?\n┃    ┣ ✅ Marque e responda *sim*\n┃    ┗ ❌ Ou responda *nao*\n┃\n┃ ⏰ 2 minutos\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [sender, fAlvo.lider]
              }, { quoted: msg });
              dbG[idG] = { id: idG, faccao1: f.id, faccao2: fAlvo.id, valor: valorG, stanzaId: msgG?.key?.id, grupo: from, criadoEm: Date.now() };
              salvarGuerras(dbG);
              break;
            }
            // ── !cla dissolver ──
            if (sub === 'dissolver') {
              const f = faccaoDoUsuario(from, sender);
              if (!f) { await sock.sendMessage(from, { text: '❌ Você não tá em nenhuma facção!' }, { quoted: msg }); break; }
              if (f.lider !== sender && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o líder pode dissolver!' }, { quoted: msg }); break; }
              const totalMembros = f.membros.length;
              const valorPorMembro = totalMembros > 0 ? Math.floor(f.caixa / totalMembros) : 0;
              for (const m of f.membros) {
                if (valorPorMembro > 0) {
                  const uM = shizukiUser(m);
                  uM.reais += valorPorMembro;
                  salvarShizuki(m, uM);
                }
              }
              const dbFd = carregarFaccoes();
              delete dbFd[f.id];
              salvarFaccoes(dbFd);
              await sock.sendMessage(from, {
                text: '╭━━━〔 🗑️ 𝐅𝐀𝐂𝐂̧𝐀̃𝐎 𝐃𝐈𝐒𝐒𝐎𝐋𝐕𝐈𝐃𝐀 🗑️ 〕━━━╮\n┃\n┃ ⚠️ A facção foi dissolvida!\n┃\n┃ 🏴 Facção: *' + f.nome + '*\n┃ 👑 Líder: @' + sender.split('@')[0] + '\n┃ 👥 Membros: *' + totalMembros + '*\n┃ 💰 Caixa: *R$ ' + f.caixa + '*\n┃ 💵 Cada um recebeu: *R$ ' + valorPorMembro + '*\n┃\n┃ 💜 Fim de uma era...\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [sender, ...f.membros]
              }, { quoted: msg });
              break;
            }
            // (sem ajuda — subcomando inválido)
          }
          break;
        case 'rmconvite':
          {
            if (!isDono && !eVIP(sender)) { await sock.sendMessage(from, { text: '🚫 Apenas o dono e VIPs!' }, { quoted: msg }); break; }
            const dbRC = carregarConvites();
            let removido = false;
            for (const id in dbRC) {
              if (dbRC[id].de === sender || dbRC[id].grupo === from) {
                delete dbRC[id];
                removido = true;
              }
            }
            if (!removido) { await sock.sendMessage(from, { text: 'ℹ️ Nenhum convite pendente!' }, { quoted: msg }); break; }
            salvarConvites(dbRC);
            await sock.sendMessage(from, {
              text: '╭━━━〔 🗑️ 𝐂𝐎𝐍𝐕𝐈𝐓𝐄 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐎 🗑️ 〕━━━╮\n┃\n┃ ✅ Convite(s) cancelado(s)!\n┃\n┃ 👤 @' + sender.split('@')[0] + '\n┃ 👥 Grupo: ' + (from.split('@')[0]) + '\n┃\n┃ 💜 Pode convidar de novo!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [sender]
            }, { quoted: msg });
          }
          break;
        // ═══ ACOES NOVAS ═══
        case 'cafune':
        case 'mordida':
        case 'colinho':
        case 'socar':
        case 'chutar':
        case 'esfaquear':
        case 'bater':
        case 'dancar':
        case 'cantar':
          {
            const ctxAc = msg.message.extendedTextMessage?.contextInfo;
            const alvoAc = ctxAc?.mentionedJid?.[0] || ctxAc?.participant;
            if (!alvoAc) {
              await sock.sendMessage(from, { text: '⚠️ Marque alguém com @!\n\nEx: *!' + command + ' @pessoa*' }, { quoted: msg });
              break;
            }
            if (alvoAc === sender) {
              await sock.sendMessage(from, { text: '😅 Você não pode fazer isso com si mesmo!' }, { quoted: msg });
              break;
            }
            const acFrases = {
              cafune: ['fez carinho na cabeça de', 'acariciou a cabeça de', 'afagou o cabelo de'],
              mordida: ['deu uma mordidinha em', 'mordeu o braço de', 'mordiscou'],
              colinho: ['puxou pra sentar no colo', 'chamou pra sentar no colo'],
              socar: ['deu um soco em', 'acertou um cruzado em', 'socou a cara de'],
              chutar: ['deu um chute em', 'chutou o traseiro de'],
              esfaquear: ['esfaqueou', 'deu uma facada em', 'atacou com a faca'],
              bater: ['bateu em', 'deu um tapa em', 'acertou um tapa em'],
              dancar: ['dançou com', 'chamou pra dançar', 'arrastou pra pista'],
              cantar: ['cantou pra', 'dedicou uma música pra', 'soltou a voz pra']
            };
            const acEmojis = {
              cafune: '👋', mordida: '😈', colinho: '🫂', socar: '👊', chutar: '🦵',
              esfaquear: '🗡️', bater: '👋', dancar: '💃', cantar: '🎤'
            };
            const acTitulos = {
              cafune: 'CAFUNE', mordida: 'MORDIDA', colinho: 'COLINHO', socar: 'SOCO',
              chutar: 'CHUTE', esfaquear: 'ESFAQUEAR', bater: 'TAPA', dancar: 'DANÇA', cantar: 'CANÇÃO'
            };
            const acRodapes = {
              cafune: '🥰 Fofura mil!', mordida: '😳 Ai!', colinho: '💜 Aconchego!',
              socar: '😱 Que pancada!', chutar: '💥 Foi longe!', esfaquear: '💀 Fim!',
              bater: '😬 Doeu!', dancar: '🎶 Que ritmo!', cantar: '🎤 Que voz!'
            };
            const emoji = acEmojis[command] || '✨';
            const titulo = acTitulos[command] || command.toUpperCase();
            const frase = acFrases[command][Math.floor(Math.random() * acFrases[command].length)];
            const rodape = acRodapes[command] || '💜';
            const textoFinal = '╭━━━〔 ' + emoji + ' 𝐀𝐂̧𝐀̃𝐎 ' + titulo + ' ' + emoji + ' 〕━━━╮\n' +
              '┃\n' +
              '┃ @' + sender.split('@')[0] + ' ' + frase + '\n' +
              '┃    @' + alvoAc.split('@')[0] + '!\n' +
              '┃\n' +
              '┃ ' + rodape + '\n' +
              '┃\n' +
              '╰━━━━━━━━━━━━━━━━━━╯';
            await enviarAcao(sock, from, msg, command, textoFinal, [alvoAc, sender]);
          }
          break;
        case 'limparadv':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gmL = await sock.groupMetadata(from);
            const ehAdmL = !!gmL.participants.find(p => p.id === sender)?.admin;
            if (!ehAdmL && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            const ctxL = msg.message.extendedTextMessage?.contextInfo;
            const alvoL = ctxL?.mentionedJid?.[0] || ctxL?.participant;
            if (!alvoL) { await sock.sendMessage(from, { text: '⚠️ Marque a pessoa!\n\nEx: *!limparadv @pessoa*' }, { quoted: msg }); break; }

            let advsL = carregarJSON(FILE_ADVS);
            if (!advsL[from] || !advsL[from][alvoL] || advsL[from][alvoL] <= 0) {
              await sock.sendMessage(from, { text: 'ℹ️ Essa pessoa não tem advertências!' }, { quoted: msg });
              break;
            }

            const antesL = advsL[from][alvoL];
            delete advsL[from][alvoL];
            if (advsL[from + '_motivos'] && advsL[from + '_motivos'][alvoL]) {
              delete advsL[from + '_motivos'][alvoL];
            }
            salvarJSON(FILE_ADVS, advsL);

            await sock.sendMessage(from, {
              text: '╭━━━〔 🧹 𝐀𝐃𝐕𝐄𝐑𝐓𝐄̂𝐍𝐂𝐈𝐀𝐒 𝐋𝐈𝐌𝐏𝐀𝐒 🧹 〕━━━╮\n' +
                    '┃\n' +
                    '┃ 👤 𝐌𝐞𝐦𝐛𝐫𝐨: @' + alvoL.split('@')[0] + '\n' +
                    '┃ 📊 𝐀𝐧𝐭𝐞𝐬: ' + antesL + '/3\n' +
                    '┃ 📊 𝐀𝐠𝐨𝐫𝐚: 0/3\n' +
                    '┃ 👮 𝐋𝐢𝐦𝐩𝐚𝐝𝐚𝐬 𝐩𝐨𝐫: @' + sender.split('@')[0] + '\n' +
                    '┃\n' +
                    '┃ 💜 Histórico zerado!\n' +
                    '┃\n' +
                    '╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [alvoL, sender]
            }, { quoted: msg });
          }
          break;
        // ═══ COMANDOS DE GRUPO ═══
        case 'nomegp':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gmN = await sock.groupMetadata(from);
            const ehAdmN = !!gmN.participants.find(p => p.id === sender)?.admin;
            if (!ehAdmN && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            const novoNome = args.join(' ').trim();
            if (!novoNome) { await sock.sendMessage(from, { text: '⚠️ Use: *!nomegp <nome>*' }, { quoted: msg }); break; }
            if (novoNome.length > 25) { await sock.sendMessage(from, { text: '⚠️ Nome muito longo! Máx 25 chars.' }, { quoted: msg }); break; }
            const nomeAntigo = gmN.subject;
            try {
              await sock.groupUpdateSubject(from, novoNome);
              await sock.sendMessage(from, {
                text: '╭━━━〔 ✏️ 𝐍𝐎𝐌𝐄 𝐀𝐋𝐓𝐄𝐑𝐀𝐃𝐎 ✏️ 〕━━━╮\n┃\n┃ 📛 Antes: ' + nomeAntigo + '\n┃ 📛 Agora: ' + novoNome + '\n┃ 👑 Por: @' + sender.split('@')[0] + '\n┃\n┃ 💜 Ficou top!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [sender]
              }, { quoted: msg });
            } catch (e) {
              await sock.sendMessage(from, { text: '❌ Não consegui mudar. O bot precisa ser admin!' }, { quoted: msg });
            }
          }
          break;

        case 'descgp':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gmD = await sock.groupMetadata(from);
            const ehAdmD = !!gmD.participants.find(p => p.id === sender)?.admin;
            if (!ehAdmD && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            const novaDesc = args.join(' ').trim();
            if (!novaDesc) { await sock.sendMessage(from, { text: '⚠️ Use: *!descgp <texto>*' }, { quoted: msg }); break; }
            try {
              await sock.groupUpdateDescription(from, novaDesc);
              await sock.sendMessage(from, {
                text: '╭━━━〔 📝 𝐃𝐄𝐒𝐂𝐑𝐈𝐂̧𝐀̃𝐎 📝 〕━━━╮\n┃\n┃ ✅ Descrição atualizada!\n┃\n┃ 📝 "' + novaDesc.slice(0, 80) + '"\n┃ 👑 Por: @' + sender.split('@')[0] + '\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [sender]
              }, { quoted: msg });
            } catch (e) {
              await sock.sendMessage(from, { text: '❌ Não consegui mudar. O bot precisa ser admin!' }, { quoted: msg });
            }
          }
          break;


        case 'gpinfo':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gmI = await sock.groupMetadata(from);
            const criado = gmI.creation ? new Date(gmI.creation * 1000).toLocaleDateString('pt-BR') : 'Desconhecido';
            const admins = gmI.participants.filter(p => p.admin).length;
            const membros = gmI.participants.length;
            await sock.sendMessage(from, {
              text: '╭━━━〔 📊 𝐈𝐍𝐅𝐎 𝐃𝐎 𝐆𝐑𝐔𝐏𝐎 📊 〕━━━╮\n┃\n┃ 📛 Nome: ' + gmI.subject + '\n┃ 🆔 ID: ' + from.split('@')[0] + '\n┃ 👥 Membros: ' + membros + '\n┃ 👑 Admins: ' + admins + '\n┃ 📅 Criado: ' + criado + '\n┃\n┃ 💜 Info completa!\n┃\n╰━━━━━━━━━━━━━━━━━━╯'
            }, { quoted: msg });
          }
          break;

        case 'novolink':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gmNv = await sock.groupMetadata(from);
            const ehAdmNv = !!gmNv.participants.find(p => p.id === sender)?.admin;
            if (!ehAdmNv && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            try {
              const novoLink = await sock.groupInviteCode(from);
              await sock.sendMessage(from, {
                text: '╭━━━〔 🔗 𝐍𝐎𝐕𝐎 𝐋𝐈𝐍𝐊 🔗 〕━━━╮\n┃\n┃ ✅ Link gerado!\n┃\n┃ 🔗 https://chat.whatsapp.com/' + novoLink + '\n┃ 👑 Por: @' + sender.split('@')[0] + '\n┃\n┃ ⚠️ Compartilhe com cuidado!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [sender]
              }, { quoted: msg });
            } catch (e) {
              await sock.sendMessage(from, { text: '❌ Não consegui gerar. O bot precisa ser admin!' }, { quoted: msg });
            }
          }
          break;

        case 'revogarlink':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gmRv = await sock.groupMetadata(from);
            const ehAdmRv = !!gmRv.participants.find(p => p.id === sender)?.admin;
            if (!ehAdmRv && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            try {
              await sock.groupRevokeInvite(from);
              await sock.sendMessage(from, {
                text: '╭━━━〔 🔗 𝐋𝐈𝐍𝐊 𝐑𝐄𝐕𝐎𝐆𝐀𝐃𝐎 🔗 〕━━━╮\n┃\n┃ ✅ Link revogado!\n┃ 👑 Por: @' + sender.split('@')[0] + '\n┃\n┃ 💡 Use *!novolink* pra gerar novo!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [sender]
              }, { quoted: msg });
            } catch (e) {
              await sock.sendMessage(from, { text: '❌ Não consegui revogar. O bot precisa ser admin!' }, { quoted: msg });
            }
          }
          break;
        // ═══ MEMBROS E REGRAS ═══
        case 'membrosinativos':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gmIn = await sock.groupMetadata(from);
            const statsIn = carregarJSON(FILE_STATS);
            const agoraIn = Date.now();
            const DIAS = 7 * 86400000;
            const inativos = [];
            for (const p of gmIn.participants) {
              const jid = p.id;
              const ult = (statsIn[jid] && statsIn[jid].ultimaMsg) || 0;
              if (ult === 0) continue; // Ignora quem nunca mandou mensagem
              const diff = agoraIn - ult;
              if (diff >= DIAS) {
                inativos.push({ jid, dias: Math.floor(diff / 86400000) });
              }
            }
            inativos.sort((a, b) => b.dias - a.dias);
            if (!inativos.length) {
              await sock.sendMessage(from, { text: '✅ Nenhum membro inativo! Grupo tá vivo!' }, { quoted: msg });
              break;
            }
            let txtIn = '╭━━━〔 💤 𝐌𝐄𝐌𝐁𝐑𝐎𝐒 𝐈𝐍𝐀𝐓𝐈𝐕𝐎𝐒 💤 〕━━━╮\n┃\n┃ 📊 Total: *' + inativos.length + '* membros\n┃ ⏰ Sem falar: *7+ dias*\n┃\n';
            const mencsIn = [];
            const limite = Math.min(inativos.length, 10);
            for (let i = 0; i < limite; i++) {
              txtIn += '┃ 💤 @' + inativos[i].jid.split('@')[0] + ' ➜ *' + inativos[i].dias + ' dias*\n';
              mencsIn.push(inativos[i].jid);
            }
            if (inativos.length > 10) txtIn += '┃ ... +' + (inativos.length - 10) + ' inativos\n';
            txtIn += '┃\n┃ 💜 Bora acordar essa galera!\n┃\n╰━━━━━━━━━━━━━━━━━━╯';
            await sock.sendMessage(from, { text: txtIn, mentions: mencsIn }, { quoted: msg });
          }
          break;

        case 'listarmembros':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gmLi = await sock.groupMetadata(from);
            const total = gmLi.participants.length;
            const adminsLi = gmLi.participants.filter(p => p.admin);
            const naoAdmins = gmLi.participants.filter(p => !p.admin);
            let txtLi = '╭━━━〔 📋 𝐋𝐈𝐒𝐓𝐀 𝐃𝐄 𝐌𝐄𝐌𝐁𝐑𝐎𝐒 📋 〕━━━╮\n┃\n┃ 📊 Total: *' + total + '* membros\n┃ 👑 Admins: *' + adminsLi.length + '*\n┃\n';
            const mencsLi = [];
            txtLi += '┣━━━〔 👑 𝐀𝐃𝐌𝐈𝐍𝐒 〕━━━\n┃\n';
            for (const a of adminsLi) {
              const emoji = a.admin === 'superadmin' ? '👑' : '🛡️';
              txtLi += '┃ ' + emoji + ' @' + a.id.split('@')[0] + '\n';
              mencsLi.push(a.id);
            }
            txtLi += '┃\n┣━━━〔 👥 𝐌𝐄𝐌𝐁𝐑𝐎𝐒 〕━━━\n┃\n';
            const limLi = Math.min(naoAdmins.length, 20);
            for (let i = 0; i < limLi; i++) {
              txtLi += '┃ 👤 @' + naoAdmins[i].id.split('@')[0] + '\n';
              mencsLi.push(naoAdmins[i].id);
            }
            if (naoAdmins.length > 20) txtLi += '┃ ... +' + (naoAdmins.length - 20) + ' membros\n';
            txtLi += '┃\n╰━━━━━━━━━━━━━━━━━━╯';
            await sock.sendMessage(from, { text: txtLi, mentions: mencsLi }, { quoted: msg });
          }
          break;

        case 'verregras':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const dbRegras = carregarJSON('./regras.json');
            const txtRegras = dbRegras[from];
            if (!txtRegras) {
              await sock.sendMessage(from, { text: '📜 Nenhuma regra definida!\n\n💡 Use: *!regras <texto>* pra definir.' }, { quoted: msg });
              break;
            }
            await sock.sendMessage(from, {
              text: '╭━━━〔 📜 𝐑𝐄𝐆𝐑𝐀𝐒 𝐃𝐎 𝐆𝐑𝐔𝐏𝐎 📜 〕━━━╮\n┃\n' + txtRegras.split('\n').map(l => '┃ ' + l).join('\n') + '\n┃\n╰━━━━━━━━━━━━━━━━━━╯'
            }, { quoted: msg });
          }
          break;
        case 'autoresposta':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gmAr = await sock.groupMetadata(from);
            const ehAdmAr = !!gmAr.participants.find(p => p.id === sender)?.admin;
            if (!ehAdmAr && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            const subAr = (args[0] || '').toLowerCase();
            const dbAr = carregarJSON(FILE_AUTORESPOSTA);
            dbAr[from] = dbAr[from] || { ativo: false };
            if (subAr === 'on') dbAr[from].ativo = true;
            else if (subAr === 'off') dbAr[from].ativo = false;
            else dbAr[from].ativo = !dbAr[from].ativo;
            salvarJSON(FILE_AUTORESPOSTA, dbAr);
            await sock.sendMessage(from, {
              text: dbAr[from].ativo
                ? '╭━━━〔 💬 𝐀𝐔𝐓𝐎𝐑𝐄𝐒𝐏𝐎𝐒𝐓𝐀 💬 〕━━━╮\n┃\n┃ ✅ *Ativado!*\n┃\n┃ 💜 Bot vai responder mensagens\n┃    automaticamente!\n┃\n┃ 😈 Modo: ignorante + engraçado + sério\n┃ 📊 Palavras: ' + Object.keys(RESPOSTAS_AUTO).length + '\n┃\n╰━━━━━━━━━━━━━━━━━━╯'
                : '╭━━━〔 💬 𝐀𝐔𝐓𝐎𝐑𝐄𝐒𝐏𝐎𝐒𝐓𝐀 💬 〕━━━╮\n┃\n┃ ❌ *Desativado!*\n┃\n╰━━━━━━━━━━━━━━━━━━╯'
            }, { quoted: msg });
          }
          break;
        case 'roleta':
          {
            const destino = sortear(ROLETA_DESTINOS);
            await sock.sendMessage(from, {
              text: '╭━━━〔 🎰 𝐑𝐎𝐋𝐄𝐓𝐀 🎰 〕━━━╮\n' +
                    '┃\n' +
                    '┃ 🎲 Girando...\n' +
                    '┃\n' +
                    '┃ 🎯 Resultado:\n' +
                    '┃ ' + destino + '\n' +
                    '┃\n' +
                    '╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'porcento':
          {
            const pergunta = args.join(' ').trim();
            if (!pergunta) {
              await sock.sendMessage(from, { text: '⚠️ Use: *!porcento <pergunta>*\n\nEx: *!porcento Eu vou passar de ano?*' }, { quoted: msg });
              break;
            }
            const pct = Math.floor(Math.random() * 101);
            let frasePct = '💜 Na fé, vai dar certo!';
            if (pct >= 80) frasePct = '🎉 Com certeza absoluta!';
            else if (pct >= 60) frasePct = '✨ Tá no caminho certo!';
            else if (pct >= 40) frasePct = '🤔 Mais ou menos, hein...';
            else if (pct >= 20) frasePct = '😬 Difícil, mas não impossível!';
            else frasePct = '💀 Esquece, não vai rolar.';
            await sock.sendMessage(from, {
              text: '╭━━━〔 📊 𝐏𝐎𝐑𝐂𝐄𝐍𝐓𝐎 📊 〕━━━╮\n' +
                    '┃\n' +
                    '┃ ❓ "' + pergunta + '"\n' +
                    '┃\n' +
                    '┃ 📊 Resultado: *' + pct + '%*\n' +
                    '┃\n' +
                    '┃ ' + frasePct + '\n' +
                    '┃\n' +
                    '╰━━━━━━━━━━━━━━━━━━╯'
            }, { quoted: msg });
          }
          break;

        case 'conselho':
          {
            const conselho = sortear(CONSELHOS);
            await sock.sendMessage(from, {
              text: '╭━━━〔 💡 𝐂𝐎𝐍𝐒𝐄𝐋𝐇𝐎 💡 〕━━━╮\n' +
                    '┃\n' +
                    '┃ "' + conselho + '"\n' +
                    '┃\n' +
                    '┃ 💜 Confia!\n' +
                    '┃\n' +
                    '╰━━━━━━━━━━━━━━━━━━╯'
            }, { quoted: msg });
          }
          break;

        case 'cantada':
          {
            const cantada = sortear(CANTADAS_ORIGINAIS);
            await sock.sendMessage(from, {
              text: '╭━━━〔 💘 𝐂𝐀𝐍𝐓𝐀𝐃𝐀 💘 〕━━━╮\n' +
                    '┃\n' +
                    '┃ "' + cantada + '"\n' +
                    '┃\n' +
                    '┃ 💜 Usa com moderação!\n' +
                    '┃\n' +
                    '╰━━━━━━━━━━━━━━━━━━╯'
            }, { quoted: msg });
          }
          break;

        case 'sorte':
          {
            const sorte = sortear(SORTE_DIA);
            await sock.sendMessage(from, {
              text: '╭━━━〔 🍀 𝐒𝐎𝐑𝐓𝐄 𝐃𝐎 𝐃𝐈𝐀 🍀 〕━━━╮\n' +
                    '┃\n' +
                    '┃ @' + sender.split('@')[0] + '\n' +
                    '┃\n' +
                    '┃ ' + sorte + '\n' +
                    '┃\n' +
                    '╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [sender]
            }, { quoted: msg });
          }
          break;
        case 'forca':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const ctxF = msg.message.extendedTextMessage?.contextInfo;
            const alvoF = ctxF?.mentionedJid?.[0];
            if (!alvoF) { await sock.sendMessage(from, { text: '⚠️ Marque alguém!\n\nEx: *!forca @pessoa*' }, { quoted: msg }); break; }
            if (alvoF === sender) { await sock.sendMessage(from, { text: '😅 Não pode jogar sozinho!' }, { quoted: msg }); break; }
            if (forcaJogos.has(from)) { await sock.sendMessage(from, { text: '⚠️ Já tem um jogo da forca rolando!' }, { quoted: msg }); break; }
            const palavraF = FORCA_PALAVRAS[Math.floor(Math.random() * FORCA_PALAVRAS.length)];
            forcaJogos.set(from, {
              palavra: palavraF.palavra,
              categoria: palavraF.categoria,
              letrasCertas: [],
              letrasErradas: [],
              acertos1: 0, acertos2: 0,
              erros1: 0, erros2: 0,
              j1: alvoF,
              j2: sender,
              vez: 1,
              criadoEm: Date.now()
            });
            const ocultoF = palavraF.palavra.split('').map(() => '＿').join(' ');
            await sock.sendMessage(from, {
              text: '╭━━━〔 🎮 𝐅𝐎𝐑𝐂𝐀 🎮 〕━━━╮\n┃\n┃ 👤 @' + sender.split('@')[0] + ' vs @' + alvoF.split('@')[0] + '\n┃\n┃ 📚 Categoria: *' + palavraF.categoria + '*\n┃\n┃ ' + ocultoF + '\n┃\n┃ 📊 PLACAR:\n┃ 👤 @' + alvoF.split('@')[0] + ': ✅ 0 | ❌ 0\n┃ 👤 @' + sender.split('@')[0] + ': ✅ 0 | ❌ 0\n┃\n┃ 🎯 Vez de @' + alvoF.split('@')[0] + '!\n┃    (marque esta mensagem)\n┃\n┃ 💡 Cancelar: !cancelarforca\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [alvoF, sender]
            }, { quoted: msg });
          }
          break;

        case 'memoria':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const ctxM = msg.message.extendedTextMessage?.contextInfo;
            const alvoM = ctxM?.mentionedJid?.[0];
            if (!alvoM) { await sock.sendMessage(from, { text: '⚠️ Marque alguém!\n\nEx: *!memoria @pessoa*' }, { quoted: msg }); break; }
            if (memoriaJogos.has(from)) { await sock.sendMessage(from, { text: '⚠️ Já tem um jogo da memória rolando!' }, { quoted: msg }); break; }
            const emojisEscolhidos = [...MEMORIA_EMOJIS].sort(() => Math.random() - 0.5).slice(0, 4);
            const msgMostra = await sock.sendMessage(from, {
              text: '╭━━━〔 🧠 𝐌𝐄𝐌𝐎𝐑𝐈𝐀 🧠 〕━━━╮\n┃\n┃ 🎯 Memorize a ordem:\n┃\n┃ ' + emojisEscolhidos.join(' ') + '\n┃\n┃ ⏰ 5 segundos...\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [alvoM]
            }, { quoted: msg });
            memoriaJogos.set(from, {
              ordem: emojisEscolhidos,
              jogador: alvoM,
              rodada: 1,
              pontos: 0,
              criadoEm: Date.now(),
              fase: 'mostrando',
              msgMostraId: msgMostra?.key?.id
            });
            setTimeout(async () => {
              const jogoM = memoriaJogos.get(from);
              if (!jogoM || jogoM.fase !== 'mostrando') return;
              // APAGA a mensagem com os emojis
              try {
                await sock.sendMessage(from, { delete: { remoteJid: from, fromMe: true, id: jogoM.msgMostraId, participant: sender } });
              } catch (e) {}
              jogoM.fase = 'respondendo';
              memoriaJogos.set(from, jogoM);
              await sock.sendMessage(from, {
                text: '╭━━━〔 🧠 𝐌𝐄𝐌𝐎𝐑𝐈𝐀 🧠 〕━━━╮\n┃\n┃ 🎯 Qual era a ordem?\n┃\n┃ 1️⃣ ? \n┃ 2️⃣ ? \n┃ 3️⃣ ? \n┃ 4️⃣ ? \n┃\n┃ 🎯 @' + alvoM.split('@')[0] + ', responda:\n┃    (marque esta mensagem)\n┃\n┃ 💡 Ex: 🍎🍌🍇🍓\n┃ ⏰ 30 segundos!\n┃\n┃ 💤 Cancelar: !cancelarmemoria\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [alvoM]
              }, { quoted: msg });
            }, 5000);
          }
          break;
       case 'cancelarforca':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gmcF = await sock.groupMetadata(from);
            const ehAdmCF = !!gmcF.participants.find(p => p.id === sender)?.admin;
            if (!ehAdmCF && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            if (!forcaJogos.has(from)) { await sock.sendMessage(from, { text: 'ℹ️ Não tem jogo da forca rolando!' }, { quoted: msg }); break; }
            forcaJogos.delete(from);
            await sock.sendMessage(from, { text: '🛑 Jogo da forca cancelado!' }, { quoted: msg });
          }
          break;

        case 'cancelarmemoria':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gmcM = await sock.groupMetadata(from);
            const ehAdmCM = !!gmcM.participants.find(p => p.id === sender)?.admin;
            if (!ehAdmCM && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); break; }
            if (!memoriaJogos.has(from)) { await sock.sendMessage(from, { text: 'ℹ️ Não tem jogo da memória rolando!' }, { quoted: msg }); break; }
            memoriaJogos.delete(from);
            await sock.sendMessage(from, { text: '🛑 Jogo da memória cancelado!' }, { quoted: msg });
          }
          break;
        case 'duelo':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const ctxD = msg.message.extendedTextMessage?.contextInfo;
            const alvoD = ctxD?.mentionedJid?.[0];
            if (!alvoD) { await sock.sendMessage(from, { text: '⚠️ Marque alguém!\n\nEx: *!duelo @pessoa*' }, { quoted: msg }); break; }
            if (alvoD === sender) { await sock.sendMessage(from, { text: '😅 Não pode duelar sozinho!' }, { quoted: msg }); break; }
            if (dueloJogos.has(from)) { await sock.sendMessage(from, { text: '⚠️ Já tem um duelo rolando!' }, { quoted: msg }); break; }
            const jogador1 = sender;
            const jogador2 = alvoD;
            dueloJogos.set(from, {
              j1: jogador1,
              j2: jogador2,
              fase: 'preparando',
              criadoEm: Date.now(),
              vencedor: null
            });
            await sock.sendMessage(from, {
              text: '╭━━━〔 🔫 𝐃𝐔𝐄𝐋𝐎 🔫 〕━━━╮\n┃\n┃ 👤 @' + jogador1.split('@')[0] + ' vs @' + jogador2.split('@')[0] + '\n┃\n┃ 🎯 Prepare-se!\n┃ ⏰ Mande *!atirar* o mais\n┃    rápido possível!\n┃\n┃ 🔫 3... 2... 1...\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [jogador1, jogador2]
            }, { quoted: msg });
            // Libera o !atirar depois de 3 segundos
            setTimeout(() => {
              const jogo = dueloJogos.get(from);
              if (jogo && jogo.fase === 'preparando') {
                jogo.fase = 'atirando';
                dueloJogos.set(from, jogo);
              }
            }, 3000);
          }
          break;

        case 'atirar':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const jogo = dueloJogos.get(from);
            if (!jogo) { await sock.sendMessage(from, { text: '❌ Não tem duelo rolando!' }, { quoted: msg }); break; }
            if (jogo.fase === 'preparando') { await sock.sendMessage(from, { text: '⏳ Calma! Aguarde o 3... 2... 1...' }, { quoted: msg }); break; }
            if (jogo.fase === 'finalizado') { await sock.sendMessage(from, { text: '❌ Esse duelo já acabou!' }, { quoted: msg }); break; }
            if (sender !== jogo.j1 && sender !== jogo.j2) { await sock.sendMessage(from, { text: '❌ Você não tá nesse duelo!' }, { quoted: msg }); break; }
            // Quem atirou primeiro vence
            jogo.vencedor = sender;
            jogo.fase = 'finalizado';
            dueloJogos.set(from, jogo);
            const perdedor = sender === jogo.j1 ? jogo.j2 : jogo.j1;
            await sock.sendMessage(from, {
              text: '╭━━━〔 💀 𝐌𝐎𝐑𝐓𝐎 💀 〕━━━╮\n┃\n┃ 🏆 @' + sender.split('@')[0] + ' venceu!\n┃\n┃ 💀 @' + perdedor.split('@')[0] + ' morreu\n┃\n┃ 🎯 Foi mais rápido!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [sender, perdedor]
            }, { quoted: msg });
            // Remove o duelo depois de 5 segundos
            setTimeout(() => dueloJogos.delete(from), 5000);
          }
          break;

        case 'cancelarduelo':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gmCD = await sock.groupMetadata(from);
            const ehAdmCD = !!gmCD.participants.find(p => p.id === sender)?.admin;
            const jogoCD = dueloJogos.get(from);
            if (!jogoCD) { await sock.sendMessage(from, { text: 'ℹ️ Não tem duelo rolando!' }, { quoted: msg }); break; }
            const ehJogador = sender === jogoCD.j1 || sender === jogoCD.j2;
            if (!ehAdmCD && !isDono && !ehJogador) { await sock.sendMessage(from, { text: '🚫 Apenas admins ou jogadores!' }, { quoted: msg }); break; }
            dueloJogos.delete(from);
            await sock.sendMessage(from, { text: '🛑 Duelo cancelado!' }, { quoted: msg });
          }
          break;


        case 'apitoken':
          {
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono pode configurar a API!' }, { quoted: msg }); break; }
            const token = args.join(' ').trim();
            if (!token) {
              const cfgT = carregarConfig();
              const atual = cfgT.apiKey ? cfgT.apiKey.slice(0, 8) + '...' : '_não configurada_';
              await sock.sendMessage(from, { text: '╭━━━〔 🔑 𝐀𝐏𝐈 𝐓𝐎𝐊𝐄𝐍 🔑 〕━━━╮\n┃\n┃ 📝 Use: *!apitoken SUA_CHAVE*\n┃\n┃ 🔒 Token atual: *' + atual + '*\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
              break;
            }
            const cfgN = carregarConfig();
            cfgN.apiKey = token;
            salvarConfig(cfgN);
            await sock.sendMessage(from, { text: '╭━━━〔 ✅ 𝐀𝐏𝐈 𝐂𝐎𝐍𝐅𝐈𝐆𝐔𝐑𝐀𝐃𝐀 ✅ 〕━━━╮\n┃\n┃ 🔑 Token salvo com sucesso!\n┃\n┃ 🧞 Akinator pronto pra usar!\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
          }
          break;
        case 'addlistanegra':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gmALN = await sock.groupMetadata(from);
            const ehAdmALN = !!gmALN.participants.find(p => p.id === sender)?.admin;
            if (!ehAdmALN && !isDono) { await sock.sendMessage(from, { text: '╭━━━〔 🚫 𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎 🚫 〕━━━╮\n┃\n┃ ❌ Apenas *admins*, *líderes*\n┃    e o *dono* podem usar!\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg }); break; }
            const numAdd = limparNumero(args[0]);
            if (!numAdd || numAdd.length < 10) { await sock.sendMessage(from, { text: '╭━━━〔 ⚠️ 𝐄𝐑𝐑𝐎 ⚠️ 〕━━━╮\n┃\n┃ ❌ Informe o número!\n┃\n┃ 💡 Use: *!addlistanegra <numero>*\n┃ 📝 Ex: *!addlistanegra 5511999999999*\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg }); break; }
            const dbLN = carregarListaNegra();
            dbLN[from] = dbLN[from] || [];
            if (dbLN[from].includes(numAdd)) { await sock.sendMessage(from, { text: '╭━━━〔 ⚠️ 𝐉𝐀́ 𝐄𝐒𝐓𝐀́ 𝐍𝐀 𝐋𝐈𝐒𝐓𝐀 ⚠️ 〕━━━╮\n┃\n┃ 📱 Número: *' + numAdd + '*\n┃\n┃ ❌ Já tá na lista negra!\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg }); break; }
            dbLN[from].push(numAdd);
            salvarListaNegra(dbLN);
            const agoraLN = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
            // ─── Verifica se já tá no grupo e bane ───
            const membroNoGrupo = gmALN.participants.find(p => {
              const pnum = limparNumero(p.id.split('@')[0]);
              return pnum === numAdd || pnum.endsWith(numAdd) || numAdd.endsWith(pnum);
            });
            // ═══ Guarda também o LID (se houver) pra detectar entrada depois ═══
            for (const part of gmALN.participants) {
              const pnum = limparNumero((part.phoneNumber || part.id || '').split('@')[0]);
              if (pnum === numAdd) {
                const lidPart = part.lid || (part.id && part.id.endsWith('@lid') ? part.id : null);
                if (lidPart) {
                  const lidLimpo = limparNumero(lidPart.split('@')[0]);
                  if (lidLimpo && !dbLN[from].includes(lidLimpo)) {
                    dbLN[from].push(lidLimpo);
                    salvarListaNegra(dbLN);
                    console.log('[LN] LID guardado:', lidLimpo);
                  }
                }
              }
            }
            if (membroNoGrupo) {
              try {
                await sock.groupParticipantsUpdate(from, [membroNoGrupo.id], 'remove');
                await sock.sendMessage(from, {
                  text: '╭━━━〔 🚨 𝐁𝐀𝐍𝐈𝐃𝐎 🚨 〕━━━╮\n┃\n┃ 💀 @' + membroNoGrupo.id.split('@')[0] + ', seu arrombado!\n┃\n┃ 📱 Número: *' + numAdd + '*\n┃ ⚠️ Foi adicionado à lista negra!\n┃\n┃ 🖕 VAI TOMAR NO CU, FILHO DA PUTA!\n┃ 🚫 Aqui não é teu lugar, desgraçado!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                  mentions: [membroNoGrupo.id]
                }, { quoted: msg });
                break;
              } catch (e) {
                console.error('Erro ao banir membro:', e.message);
              }
            }
            await sock.sendMessage(from, {
              text: '╭━━━〔 🚫 𝐀𝐃𝐈𝐂𝐈𝐎𝐍𝐀𝐃𝐎 🚫 〕━━━╮\n┃\n┃ ✅ Número adicionado!\n┃\n┃ 📱 Número: *' + numAdd + '*\n┃ 👮 Por: @' + sender.split('@')[0] + '\n┃ 📅 Data: ' + agoraLN + '\n┃\n┃ ⚠️ Se esse número tentar entrar\n┃    no grupo, será banido!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'tirardalista':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gmTLN = await sock.groupMetadata(from);
            const ehAdmTLN = !!gmTLN.participants.find(p => p.id === sender)?.admin;
            if (!ehAdmTLN && !isDono) { await sock.sendMessage(from, { text: '╭━━━〔 🚫 𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎 🚫 〕━━━╮\n┃\n┃ ❌ Apenas *admins*, *líderes*\n┃    e o *dono* podem usar!\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg }); break; }
            const numTirar = limparNumero(args[0]);
            if (!numTirar || numTirar.length < 10) { await sock.sendMessage(from, { text: '╭━━━〔 ⚠️ 𝐄𝐑𝐑𝐎 ⚠️ 〕━━━╮\n┃\n┃ ❌ Informe o número!\n┃\n┃ 💡 Use: *!tirardalista <numero>*\n┃ 📝 Ex: *!tirardalista 5511999999999*\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg }); break; }
            const dbTLN = carregarListaNegra();
            dbTLN[from] = dbTLN[from] || [];
            if (!dbTLN[from].includes(numTirar)) { await sock.sendMessage(from, { text: '╭━━━〔 ⚠️ 𝐍𝐀̃𝐎 𝐄𝐒𝐓𝐀́ 𝐍𝐀 𝐋𝐈𝐒𝐓𝐀 ⚠️ 〕━━━╮\n┃\n┃ 📱 Número: *' + numTirar + '*\n┃\n┃ ❌ Não tá na lista negra!\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg }); break; }
            // ═══ Remove o número E todos os LIDs/variações ligados a ele ═══
            const antesTLN = dbTLN[from].length;
            dbTLN[from] = dbTLN[from].filter(n => {
              // mantém se NÃO for o número direto
              if (n === numTirar) return false;
              // remove também se um termina com o outro (variações)
              if (n.endsWith(numTirar) || numTirar.endsWith(n)) return false;
              return true;
            });
            // ═══ Procura o LID da pessoa no grupo e remove também ═══
            try {
              for (const part of gmTLN.participants) {
                const pnum = limparNumero((part.phoneNumber || part.id || '').split('@')[0]);
                if (pnum === numTirar) {
                  const lidPart = part.lid || (part.id && part.id.endsWith('@lid') ? part.id : null);
                  if (lidPart) {
                    const lidLimpo = limparNumero(lidPart.split('@')[0]);
                    dbTLN[from] = dbTLN[from].filter(n => n !== lidLimpo);
                    console.log('[LN] LID removido:', lidLimpo);
                  }
                }
              }
            } catch (e) {}
            const removidos = antesTLN - dbTLN[from].length;
            console.log('[LN] Removidos', removidos, 'registros');
            salvarListaNegra(dbTLN);
            const agoraTLN = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
            await sock.sendMessage(from, {
              text: '╭━━━〔 ✅ 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐎 ✅ 〕━━━╮\n┃\n┃ ✅ Número removido!\n┃\n┃ 📱 Número: *' + numTirar + '*\n┃ 👮 Por: @' + sender.split('@')[0] + '\n┃ 📅 Data: ' + agoraTLN + '\n┃\n┃ 💜 Agora pode entrar no grupo!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [sender]
            }, { quoted: msg });
          }
          break;

        case 'listanegra':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const dbLNL = carregarListaNegra();
            const listaAtual = dbLNL[from] || [];
            if (listaAtual.length === 0) {
              await sock.sendMessage(from, { text: '╭━━━〔 📋 𝐋𝐈𝐒𝐓𝐀 𝐍𝐄𝐆𝐑𝐀 📋 〕━━━╮\n┃\n┃ ✅ Nenhum número na lista negra!\n┃\n┃ 💜 Tá tudo limpo~\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
              break;
            }
            let txtLN = '╭━━━〔 📋 𝐋𝐈𝐒𝐓𝐀 𝐍𝐄𝐆𝐑𝐀 📋 〕━━━╮\n┃\n┃ 📊 Total: *' + listaAtual.length + ' números*\n┃\n';
            listaAtual.forEach((n, i) => {
              txtLN += '┃ ' + (i + 1) + '️⃣ ' + n + '\n';
            });
            txtLN += '┃\n┃ 💜 Esses números estão banidos\n┃    de entrar no grupo!\n┃\n╰━━━━━━━━━━━━━━━━━━╯';
            await sock.sendMessage(from, { text: txtLN }, { quoted: msg });
          }
          break;
        default:
          if (!comandosValidos.includes(command)) {
            await sock.sendMessage(from, { 
              react: { text: '❌', key: msg.key } 
            });

            const msgErroComando = 
              `╭━━━〔 ⚠ 𝐂𝐎𝐌𝐀NDO 𝐈𝐍𝐕𝐀́𝐋𝐈𝐃𝐎 〕━━━╮\n`+
              `┃\n`+
              `┃ ✦ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨: "!${command}"\n`+
              `┃ ✦ 𝐒𝐭𝐚𝐭𝐮𝐬: 𝐍𝐚̃𝐨 𝐞𝐧𝐜𝐨𝐧𝐭𝐫𝐚𝐝𝐨\n`+
              `┃\n`+
              `┃ ❖ 𝐃𝐢𝐠𝐢𝐭𝐞 "!menu"\n`+
              `┃ ❖ 𝐏𝐚𝐫𝐚 𝐯𝐞𝐫 𝐨𝐬 𝐜𝐨𝐦𝐚𝐧𝐝𝐨𝐬\n`+
              `┃\n`+
              `╰━━━━━━━━━━━━━━━━━━━━╯\n`+
              `𝐒𝐡𝐢𝐳𝐮𝐤𝐢 𝐁𝐨𝐭 ✦`;

            await sock.sendMessage(from, { text: msgErroComando }, { quoted: msg });
          }
          break;
      }
    }
  });
}

connectToWhatsApp();
