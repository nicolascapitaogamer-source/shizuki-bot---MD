import * as ui from "./visual.js"
import * as __fsConf from 'fs';
const __confPadrao = { numeroDono: '', prefixo: '!', nomeBot: 'Shizuki Bot - MD', nomeDono: 'nick dev', lid1: 'sem-lid-1', lid2: 'sem-lid-2' };
if (!__fsConf.existsSync('./conf.json')) __fsConf.writeFileSync('./conf.json', JSON.stringify(__confPadrao, null, 2));
let __confLida = {};
try { __confLida = JSON.parse(__fsConf.readFileSync('./conf.json', 'utf8')); } catch (e) { console.log('conf.json inválido, usando padrão'); }
globalThis.CONF = { ...__confPadrao, ...__confLida };
globalThis.__NUM_DONO = String(CONF.numeroDono || '').replace(/[^0-9]/g, '') || 'sem-numero';
const __NUM_DONO = globalThis.__NUM_DONO;
import { abrirMenuPokemon, tratarMenuPokemon } from './sistemas/menu_pokemon.js';
import { processarComandoEscola } from './escola_pokemon/escola_comandos.js';
import { processarRespostaProva } from './escola_pokemon/escola_prova.js';
import { enviarMenuPrincipal } from './menus/menu_principal.js';
import { GIFS_BASE64 } from './gifs_base64.js';
import { carregarComandos } from './carregador.js';
globalThis.__comandos = await carregarComandos('./comandos');
import { getPrefixo, multiprefixo, setprefixo } from './prefixo.js';
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

const PREFIXO = getPrefixo();
const NUMERO_CRIADOR = '5519988953961';

// ===== SISTEMA DE GIFs LOCAIS (hospedados no GitHub) =====

const GITHUB_RAW = 'https://raw.githubusercontent.com/nicolascapitaogamer-source/shizuki-bot---MD/main';

const GIFS_LOCAIS = {
  abrao: [
    `${GITHUB_RAW}/abrao/abrao1.mp4}`,
  ],
  acenar: [
    `${GITHUB_RAW}/acenar/acenar1.mp4}`,
  ],
  bater: [
    `${GITHUB_RAW}/bater/bater1.mp4}`,
  ],
  beijo: [
    `${GITHUB_RAW}/beijo/beijo1.mp4}`,
  ],
  cafune: [
    `${GITHUB_RAW}/cafune/cafune1.mp4}`,
  ],
  cantar: [
    `${GITHUB_RAW}/cantar/cantar1.mp4}`,
  ],
  chutar: [
    `${GITHUB_RAW}/chutar/chutar1.mp4}`,
  ],
  colinho: [
    `${GITHUB_RAW}/colinho/colinho1.mp4}`,
  ],
  cuspir: [
    `${GITHUB_RAW}/cuspir/cuspir1.gif}`,
  ],
  dancar: [
    `${GITHUB_RAW}/dancar/dancar1.mp4}`,
  ],
  empurrar: [
    `${GITHUB_RAW}/empurrar/empurrar1.mp4}`,
  ],
  envenenar: [
    `${GITHUB_RAW}/envenenar/envenenar1.gif}`,
  ],
  esfaquear: [
    `${GITHUB_RAW}/esfaquear/esfaquear1.mp4}`,
  ],
  estrangular: [
    `${GITHUB_RAW}/estrangular/estrangular1.mp4}`,
  ],
  explodir: [
    `${GITHUB_RAW}/explodir/explodir1.mp4}`,
  ],
  lamber: [
    `${GITHUB_RAW}/lamber/lamber1.mp4}`,
  ],
  matar: [
    `${GITHUB_RAW}/matar/matar1.mp4}`,
  ],
  morder: [
    `${GITHUB_RAW}/morder/mordida1.mp4}`,
  ],
  pisar: [
    `${GITHUB_RAW}/pisar/pisar1.mp4}`,
  ],
  piscar: [
    `${GITHUB_RAW}/piscar/piscar1.mp4}`,
  ],
  queimar: [
    `${GITHUB_RAW}/queimar/queimar1.mp4}`,
  ],
  socar: [
    `${GITHUB_RAW}/socar/socar1.mp4}`,
  ],
};

const _cacheGifs = new Map();


async function baixarGifLocal(tipo) {
  try {
    const lista = GIFS_BASE64[tipo];
    if (!lista || lista.length === 0) return null;
    const base64 = lista[Math.floor(Math.random() * lista.length)];
    return Buffer.from(base64, "base64");
  } catch (e) {
    console.error("Erro no base64:", e.message);
    return null;
  }
}


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
const FILE_AFK = './afk.json';
const FILE_INTERVALO = './intervalo.json';

const MENU_IMAGE_PATH = './menu_media.jpg';
const WELCOME_IMAGE_PATH = './welcome_media.jpg';
const MENU_AUDIO_PATH = './menu_audio.mp3';

function carregarConfig() {
  const defaultConfig = {
    numeroDono: __NUM_DONO,
    nomeBot: CONF.nomeBot,
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

async function montarMarcaAntiga(sock, from, isGroup, pushName) {
  let grupo = 'Privado';
  if (isGroup) {
    try {
      const gm = await globalThis.__getGroupMetadata(from);
      grupo = gm.subject;
    } catch (e) {
      grupo = 'Grupo';
    }
  }
  const pack = `🤖 𝑺𝒉𝒊𝒛𝒖𝒌𝒊 𝑩𝒐𝒕 - 𝑴𝑫\n👑 Criador: nick`;
  const autor = `👤 Feito por: ${pushName}\n👥 Grupo: ${grupo}`;
  return [pack, autor];
}

const __DONO = CONF.nomeDono;
const __CRIADOR = 'nick dev';
const __cut = (s, n) => { s = String(s || '').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
async function montarMarca(sock, from, isGroup, pushName) {
  let grupo = 'Privado';
  if (isGroup) {
    try { const gm = await globalThis.__getGroupMetadata(from); grupo = gm.subject; } catch (e) { grupo = 'Grupo'; }
  }
  const pack = '💜 𝐒𝐡𝐢𝐳𝐮𝐤𝐢 𝐁𝐨𝐭 - 𝐌𝐃';
  const autor = '╭ 👤 ' + pushName + '\n├ 👑 Criador: ' + __CRIADOR + '\n├ 🛠 Dono: ' + __DONO + '\n╰ 👥 ' + grupo;
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
  lamber: ['https://api.waifu.pics/sfw/lick', 'https://nekos.best/api/v2/lick'],
  morder: ['https://api.waifu.pics/sfw/bite', 'https://nekos.best/api/v2/bite'],
  acenar: ['https://api.waifu.pics/sfw/wave', 'https://nekos.best/api/v2/wave'],
  piscar: ['https://api.waifu.pics/sfw/wink', 'https://nekos.best/api/v2/wink'],
  cuspir: ['https://api.waifu.pics/sfw/spit', 'https://nekos.best/api/v2/spit'],
  arranhar: ['https://api.waifu.pics/sfw/claw', 'https://nekos.best/api/v2/claw'],
  empurrar: ['https://api.waifu.pics/sfw/push', 'https://nekos.best/api/v2/push'],
  pisar: ['https://api.waifu.pics/sfw/stomp', 'https://nekos.best/api/v2/stomp'],
  esganar: ['https://api.waifu.pics/sfw/choke', 'https://nekos.best/api/v2/choke'],
  estrangular: ['https://api.waifu.pics/sfw/choke', 'https://nekos.best/api/v2/choke'],
  queimar: ['https://api.waifu.pics/sfw/burn', 'https://nekos.best/api/v2/burn'],
  congelar: ['https://api.waifu.pics/sfw/freeze', 'https://nekos.best/api/v2/freeze'],
  eletrocutar: ['https://api.waifu.pics/sfw/shock', 'https://nekos.best/api/v2/shock'],
  envenenar: ['https://api.waifu.pics/sfw/poison', 'https://nekos.best/api/v2/poison'],
  explodir: ['https://api.waifu.pics/sfw/explode', 'https://nekos.best/api/v2/explode'],
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
  try {
    // Pega a URL da imagem da lista FONTES_GIF
    const lista = FONTES_GIF[tipo] || ['https://nekos.best/api/v2/neko'];
    const urlApi = lista[0];
    
    // Faz a requisição pra API
    const r = await fetch(urlApi, { 
      signal: AbortSignal.timeout(10000),
      headers: { 'User-Agent': 'ShizukiBot/1.0 (https://github.com/nicolascapitaogamer-source/shizuki-bot---MD)' }
    });
    const j = await r.json();
    
    // Pega a URL da imagem
    let imgUrl = null;
    if (j.results && j.results[0] && j.results[0].url) {
      imgUrl = j.results[0].url;
    } else if (j.url) {
      imgUrl = j.url;
    }
    
    if (!imgUrl) return null;
    
    // Baixa a imagem
    const img = await fetch(imgUrl, { signal: AbortSignal.timeout(15000) });
    const buf = Buffer.from(await img.arrayBuffer());
    if (buf.length > 0) return buf;
  } catch (e) { 
    console.log('Erro imagem:', e.message); 
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
    console.log("Tentando baixar GIF do GitHub para: " + tipo);
    const gifLocal = await baixarGifLocal(tipo);
    if (gifLocal) {
      console.log("GIF baixado! Convertendo para mp4...");
      const mp4 = await gifParaMp4(gifLocal);
      await sock.sendMessage(from, {
        video: mp4,
        gifPlayback: true,
        caption: texto,
        mentions
      }, { quoted: msg });
      console.log("GIF enviado com sucesso!");
      return;
    } else {
      console.log("Nao encontrou GIF local ou deu erro no download.");
    }
  } catch (e) {
    console.error('Erro no GIF local:', e.message);
  }

  try {
    const gifBuf = await baixarGifAnime(tipo);
    if (gifBuf) {
      const mp4 = await gifParaMp4(gifBuf);
      await sock.sendMessage(from, {
        video: mp4,
        gifPlayback: true,
        caption: texto,
        mentions
      }, { quoted: msg });
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
         `┃\n┃ 💡 Use: *!balada normal* ou *!balada vip*\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯`;
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
  if (num === __NUM_DONO) return true;
  if (raw === CONF.lid2) return true;
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
  const __isDonoTeste = (jid === (__NUM_DONO + '@s.whatsapp.net') || String(jid).includes(CONF.lid1) || String(jid).includes(CONF.lid2));
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

function __getNumLimpo(id) { return String(id || '').split('@')[0]; }
const provasAtivas = new Map(); // sender -> { empregoId, perguntas, respostas, acertos, timer, from }

// ─────────────── Persistência ───────────────

function shizukiUser(jid) {
  // 💎 DINHEIRO INFINITO PRO DONO (só pra teste)
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
  const __isDonoTeste = (jid === (__NUM_DONO + '@s.whatsapp.net') || String(jid).includes(CONF.lid1) || String(jid).includes(CONF.lid2));
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
  if (!SHIZUKI_DATA || !id) return null;
  const limpar = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const idLimpo = limpar(id);
  return SHIZUKI_DATA.empregos.find(e => limpar(e.id) === idLimpo || limpar(e.nome) === idLimpo);
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
  if (typeof eVIP === "function" && typeof sender !== "undefined" && eVIP(sender)) bonus += 0.25;     // +5% família
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
  const banco = SHIZUKI_DATA.perguntas || {};
  const especificas = banco[empregoId] || [];

  // Se tem perguntas específicas, usa elas
  if (especificas.length > 0) {
    return embaralhar(especificas).slice(0, 5).map(p => {
      // Gera alternativas falsas aleatórias se não tiver
      const correta = p.r[0];
      const falsas = ['Nenhuma das opções', 'Não sei', 'Outra alternativa'].filter(x => x !== correta);
      const alternativas = embaralhar([correta, ...falsas.slice(0, 3)]);
      return { p: p.p, r: p.r, alternativas };
    });
  }

  // Fallback (se não tiver específica)
  return embaralhar(banco.faceis || []).slice(0, 5).map(p => {
    const correta = p.r[0];
    const falsas = ['Nenhuma das opções', 'Não sei', 'Outra alternativa'].filter(x => x !== correta);
    const alternativas = embaralhar([correta, ...falsas.slice(0, 3)]);
    return { p: p.p, r: p.r, alternativas };
  });
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

  // --- CORREÇÃO: Usando 'casado' e 'filhos' em vez de 'namorando' e 'familia' ---
  const statusAmor = u.casado
    ? `💍 Casado(a)`
    : (u.namorando ? `💜 Namorando` : "❌ Solteiro(a)");
    
  const statusFamilia = (u.filhos && u.filhos.length > 0)
    ? `👨‍👩‍👧 ${u.filhos.length} Filho(s)`
    : (u.familia ? `👨‍👩‍👧 Família *${u.familia.sobrenome}*` : '❌ Sem família');

  const ranking = pos ? `#${pos}` : 'Sem ranking';

  const vipBadge = (typeof badgeVip === 'function' && badgeVip(jid)) ? ' 💎 VIP' : '';

  return `╭━━━〔 🏙️ 𝐒𝐇𝐈𝐙𝐔𝐊𝐈 𝐂𝐈𝐓𝐘 🏙️ 〕━━━╮\n┃\n` +
         `┃ 👤 Cidadão: *${pushName}${vipBadge}*\n` +
         `┃ 💼 Emprego: ${nomeEmp}\n` +
         `┃ 💵 Saldo: *${formatarReais(u.reais)}*\n` +
         `┃ ⚡ Energia: *${u.energia}/100*\n` +
         `┃\n` +
         `┃ ${statusAmor}\n` +
         `┃ ${statusFamilia}\n` +
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
  return !provasAtivas.has(__getNumLimpo(sender));
}

function limparProva(sender) {
  const p = provasAtivas.get(__getNumLimpo(sender));
  if (p && p.timer) clearTimeout(p.timer);
  provasAtivas.delete(__getNumLimpo(sender));
}



// ─────────── Helper: envia pergunta atual da prova ───────────

async function enviarPerguntaShizuki(sock, from, sender) {
  const prova = provasAtivas.get(__getNumLimpo(sender));
  if (!prova) return;
  const num = prova.indice + 1;
  const p = prova.perguntas[prova.indice] || { p: "Erro ao carregar pergunta", alternativas: ["A", "B"], r: ["A"] };
  const letras = ["A", "B", "C", "D"];
  let alts = '';
  if (p && p.alternativas && Array.isArray(p.alternativas)) {
    p.alternativas.forEach((alt, i) => {
      alts += `┃ *${letras[i]})* ${alt}\n`;
    });
  }
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

    const prova = provasAtivas.get(__getNumLimpo(sender));
    if (!prova) return false;


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

    if (acertou) { prova.acertos++; }
    prova.indice++;
    if (prova.indice >= prova.perguntas.length) {
      clearTimeout(prova.timer);
      provasAtivas.delete(__getNumLimpo(sender));
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
            uA.dataCasamento = Date.now();
            uB.casado = pedido.de;
            uB.dataCasamento = Date.now();
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
  if (num === __NUM_DONO) return true;
  if (raw === CONF.lid2) return true;
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
    const gm = await globalThis.__getGroupMetadata(from);
    return !!getAdminFlag(gm.participants, jid);
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
            const gm = await globalThis.__getGroupMetadata(grupo);
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
    const gm = await globalThis.__getGroupMetadata(groupId);
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
    // Liberado para todos os grupos (sem exigir aluguel)

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
      'wa.me/' + __NUM_DONO + '\n\n' +
      '💜 *' + CONF.nomeBot + '*\n' +
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


// ═══════════════════════════════════════════════
//       MOTOR DO INTERVALO (ANTI-SPAM DE GRUPO)
// ═══════════════════════════════════════════════
const intervaloGrupoMap = new Map();

function checarIntervaloGrupo(from) {
  const db = carregarJSON(FILE_INTERVALO);
  const tempoBloqueio = db[from] || 30; 
  
  const agora = Date.now();
  if (!intervaloGrupoMap.has(from)) {
    intervaloGrupoMap.set(from, { ultimo: 0, comandos: 0, bloqueadoAte: 0 });
  }
  
  const dados = intervaloGrupoMap.get(from);
  
  if (dados.bloqueadoAte > agora) {
    return { bloqueado: true, resta: Math.ceil((dados.bloqueadoAte - agora) / 1000) };
  }
  
  if (dados.bloqueadoAte !== 0 && dados.bloqueadoAte <= agora) {
    dados.bloqueadoAte = 0;
    dados.comandos = 0;
  }
  
  if (agora - dados.ultimo < 3000) {
    dados.comandos++;
    if (dados.comandos >= 4) {
      dados.bloqueadoAte = agora + (tempoBloqueio * 1000);
      intervaloGrupoMap.set(from, dados);
      return { bloqueado: true, resta: tempoBloqueio };
    }
  } else {
    dados.comandos = 1;
  }
  
  dados.ultimo = agora;
  intervaloGrupoMap.set(from, dados);
  return { bloqueado: false };
}


function formatarTempoAfk(ms) {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const partes = [];
  if (d > 0) partes.push(d + ' dia(s)');
  if (h > 0) partes.push(h + ' hora(s)');
  if (m > 0) partes.push(m + ' minuto(s)');
  if (sec > 0 && partes.length === 0) partes.push(sec + ' segundo(s)');
  return partes.join(' e ');
}


// ===== SISTEMA DE NICK =====
const mapNick = {
  a: ['ⓐ','🅐','ａ','𝐚','𝖆','𝒂','𝓪','𝕒','𝚊','𝗮','𝗮','𝙖','𝘢','⒜','🇦','🄰','🅰','á','ﾑ','ٱ','α','α','α','а','ር','𝔞','ä','ᴀ','ɨ','ₐ','ᵃ','ɐ','ɐ','ɒ','ɒ'],
  b: ['ⓑ','🅑','ｂ','𝐛','𝖇','𝒃','𝓫','𝕓','𝚋','𝗯','𝗯','𝙗','𝘣','⒝','🇧','🄱','🅱','ḅ','乃','๒','β','в','в','в','ƀ','𝔟','ƀ','ʙ','ȼ','ᵦ','ᵇ','q','q','d','d'],
  c: ['ⓒ','🅒','ｃ','𝐜','𝖈','𝒄','𝓬','𝕔','𝚌','𝗰','𝗰','𝙘','𝘤','⒞','🇨','🄲','🅲','ć','c','ς','ƈ','ц','ц','ц','ȼ','𝔠','ċ','ᴄ','ᴄ','ᶜ','ᶜ','ɔ','ɔ','ↄ','ↄ'],
  d: ['ⓓ','🅓','ｄ','𝐝','𝖉','𝒅','𝓭','𝕕','𝚍','𝗱','𝗱','𝙙','𝘥','⒟','🇩','🄳','🅳','ḋ','り','๔','δ','д','д','д','đ','𝔡','ḋ','ᴅ','ᴅ','ᴰ','ᵈ','p','p','b','b'],
  e: ['ⓔ','🅔','ｅ','𝐞','𝖊','𝒆','𝓮','𝕖','𝚎','𝗲','𝗲','𝙚','𝘦','⒠','🇪','🄴','🅴','é','乇','є','ε','е','е','е','ɇ','𝔢','ë','ᴇ','ɛ','ₑ','ᵉ','ǝ','ǝ','ɘ','ɘ'],
  f: ['ⓕ','🅕','ｆ','𝐟','𝖋','𝒇','𝓯','𝕗','𝚏','𝗳','𝗳','𝙛','𝘧','⒡','🇫','🄵','🅵','ḟ','ｷ','Ŧ','ғ','ф','ф','ф','ƒ','𝔣','ƒ','ꜰ','ꜰ','ᶠ','ᶠ','ɟ','ɟ','ʇ','ʇ'],
  g: ['ⓖ','🅖','ｇ','𝐠','𝖌','𝒈','𝓰','𝕘','𝚐','𝗴','𝗴','𝙜','𝘨','⒢','🇬','🄶','🅶','ġ','ム','ﻮ','ɠ','г','г','г','ɠ','𝔤','ġ','ɢ','ɢ','ᴳ','ᵍ','ƃ','ƃ','⅁','⅁'],
  h: ['ⓗ','🅗','ｈ','𝐡','𝖍','𝒉','𝓱','𝕙','𝚑','𝗵','𝗵','𝙝','𝘩','⒣','🇭','🄷','🅷','ḣ','ん','ђ','ħ','х','х','х','ħ','𝔥','ḧ','ʜ','ʜ','ₕ','ʰ','ɥ','ɥ','ɥ','ɥ'],
  i: ['ⓘ','🅘','ｉ','𝐢','𝖎','𝒊','𝓲','𝕚','𝚒','𝗶','𝗶','𝙞','𝘪','⒤','🇮','🄸','🅸','í','ﾉ','เ','ι','і','і','і','ɨ','𝔦','ï','ɪ','ɨ','ᵢ','ⁱ','ı','ı','!','!'],
  j: ['ⓙ','🅙','ｊ','𝐣','𝖏','𝒋','𝓳','𝕛','𝚓','𝗷','𝗷','𝙟','𝘫','⒥','🇯','🄹','🅹','ĵ','ﾌ','ן','ϳ','й','й','й','ɉ','𝔧','ĵ','ᴊ','ȼ','ⱼ','ʲ','ɾ','ɾ','ſ','ſ'],
  k: ['ⓚ','🅚','ｋ','𝐤','𝖐','𝒌','𝓴','𝕜','𝚔','𝗸','𝗸','𝙠','𝘬','⒦','🇰','🄺','🅺','ḱ','ズ','к','κ','к','к','к','ꝁ','𝔨','ķ','ᴋ','ᴋ','ₖ','ᵏ','ʞ','ʞ','ʞ','ʞ'],
  l: ['ⓛ','🅛','ｌ','𝐥','𝖑','𝒍','𝓵','𝕝','𝚕','𝗹','𝗹','𝙡','𝘭','⒧','🇱','🄻','🅻','ĺ','ﾚ','ɭ','λ','л','л','л','ł','𝔩','ĺ','ʟ','ʟ','ₗ','ˡ','ן','ן','l','l'],
  m: ['ⓜ','🅜','ｍ','𝐦','𝖒','𝒎','𝓶','𝕞','𝚖','𝗺','𝗺','𝙢','𝘮','⒨','🇲','🄼','🅼','ḿ','ﾶ','๓','μ','м','м','м','ɇ','𝔪','ṁ','ᴍ','ᴍ','ₘ','ᵐ','ɯ','ɯ','m','m'],
  n: ['ⓝ','🅝','ｎ','𝐧','𝖓','𝒏','𝓷','𝕟','𝚗','𝗻','𝗻','𝙣','𝘯','⒩','🇳','🄽','🅽','ń','刀','ภ','η','н','н','н','ꞥ','𝔫','ṅ','ɴ','ɴ','ₙ','ⁿ','u','u','n','n'],
  o: ['ⓞ','🅞','ｏ','𝐨','𝖔','𝒐','𝓸','𝕠','𝚘','𝗼','𝗼','𝙤','𝘰','⒪','🇴','🄾','🅾','ó','の','๏','σ','о','о','о','ø','𝔬','ö','ᴏ','ȼ','ₒ','ᵒ','o','o','o','o'],
  p: ['ⓟ','🅟','ｐ','𝐩','𝖕','𝒑','𝓹','𝕡','𝚙','𝗽','𝗽','𝙥','𝘱','⒫','🇵','🄿','🅿','ṕ','ｱ','ק','ρ','п','п','п','þ','𝔭','ṗ','ᴘ','ᴘ','ₚ','ᵖ','d','d','q','q'],
  q: ['ⓠ','🅠','ｑ','𝐪','𝖖','𝒒','𝓺','𝕢','𝚚','𝗾','𝗾','𝙦','𝘲','⒬','🇶','🅀','🆀','q','ゐ','ợ','ϙ','я','я','я','ꝗ','𝔮','q','ǫ','ɋ','q','q','b','b','p','p'],
  r: ['ⓡ','🅡','ｒ','𝐫','𝖗','𝒓','𝓻','𝕣','𝚛','𝗿','𝗿','𝙧','𝘳','⒭','🇷','🅁','🆁','ŕ','尺','г','я','р','р','р','ɍ','𝔯','ṙ','ʀ','ʀ','ᵣ','ʳ','ɹ','ɹ','ɹ','ɹ'],
  s: ['ⓢ','🅢','ｓ','𝐬','𝖘','𝒔','𝓼','𝕤','𝚜','𝘀','𝘀','𝙨','𝘴','⒮','🇸','🅂','🆂','ś','丂','ร','ѕ','с','с','с','ꞩ','𝔰','ṡ','s','ʂ','ₛ','ˢ','s','s','s','s'],
  t: ['ⓣ','🅣','ｔ','𝐭','𝖙','𝒕','𝓽','𝕥','𝚝','𝘁','𝘁','𝙩','𝘵','⒯','🇹','🅃','🆃','ť','ｲ','Շ','т','т','т','т','ŧ','𝔱','ṫ','ᴛ','ᴛ','ₜ','ᵗ','ʇ','ʇ','ʇ','ʇ'],
  u: ['ⓤ','🅤','ｕ','𝐮','𝖚','𝒖','𝓾','𝕦','𝚞','𝘂','𝘂','𝙪','𝘶','⒰','🇺','🅄','🆄','ú','ひ','ย','υ','у','у','у','ʉ','𝔲','ü','ᴜ','ʉ','ᵤ','ᵘ','n','n','u','u'],
  v: ['ⓥ','🅥','ｖ','𝐯','𝖛','𝒗','𝓿','𝕧','𝚟','𝘃','𝘃','𝙫','𝘷','⒱','🇻','🅅','🆅','ṽ','√','ש','ν','в','в','в','ꝟ','𝔳','ṽ','ᴠ','ᴠ','ᵥ','ᵛ','ʌ','ʌ','ʌ','ʌ'],
  w: ['ⓦ','🅦','ｗ','𝐰','𝖜','𝒘','𝔀','𝕨','𝚠','𝘄','𝘄','𝙬','𝘸','⒲','🇼','🅆','🆆','ẃ','山','ฬ','ω','щ','щ','щ','ɇ','𝔴','ẁ','ᴡ','ᴡ','w','ʷ','ʍ','ʍ','ʍ','ʍ'],
  x: ['ⓧ','🅧','ｘ','𝐱','𝖝','𝒙','𝔁','𝕩','𝚡','𝘅','𝘅','𝙭','𝘹','⒳','🇽','🅇','🆇','ẋ','乂','א','χ','х','х','х','ӿ','𝔵','ẍ','x','x','ₓ','ˣ','x','x','x','x'],
  y: ['ⓨ','🅨','ｙ','𝐲','𝖞','𝒚','𝔂','𝕪','𝚢','𝘆','𝘆','𝙮','𝘺','⒴','🇾','🅈','🆈','ý','ﾘ','ץ','γ','у','у','у','ɏ','𝔶','ÿ','ʏ','ʏ','ᵧ','ʸ','ʎ','ʎ','ʎ','ʎ'],
  z: ['ⓩ','🅩','ｚ','𝐳','𝖟','𝒛','𝔃','𝕫','𝚣','𝘇','𝘇','𝙯','𝘻','⒵','🇿','🅉','🆉','ź','乙','չ','ζ','з','з','з','ƶ','𝔷','ż','ᴢ','ᴢ','z','ᶻ','z','z','z','z']
};

const nicksList = [
  t => t, 
  t => t.split('').map(c => mapNick[c]?.[0] || c).join(''), 
  t => t.split('').map(c => mapNick[c]?.[1] || c).join(''), 
  t => t.split('').map(c => mapNick[c]?.[2] || c).join(''), 
  t => t.split('').map(c => mapNick[c]?.[3] || c).join(''), 
  t => t.split('').map(c => mapNick[c]?.[4] || c).join(''), 
  t => t.split('').map(c => mapNick[c]?.[5] || c).join(''), 
  t => t.split('').map(c => mapNick[c]?.[6] || c).join(''), 
  t => t.split('').map(c => mapNick[c]?.[7] || c).join(''), 
  t => t.split('').map(c => mapNick[c]?.[8] || c).join(''), 
  t => t.split('').map(c => mapNick[c]?.[9] || c).join(''), 
  t => t.split('').map(c => mapNick[c]?.[10] || c).join(''), 
  t => t.split('').map(c => mapNick[c]?.[11] || c).join(''), 
  t => t.split('').map(c => mapNick[c]?.[12] || c).join(''), 
  t => t.split('').map(c => mapNick[c]?.[13] || c).join(''), 
  t => t.split('').map(c => mapNick[c]?.[14] || c).join(' '), 
  t => t.split('').map(c => mapNick[c]?.[15] || c).join(''), 
  t => t.split('').map(c => mapNick[c]?.[16] || c).join(''), 
  t => t.split('').map(c => mapNick[c]?.[17] || c).join(''), 
  t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').split('').map(c => mapNick[c]?.[18] || c).join(''), 
  t => t.split('').map(c => mapNick[c]?.[19] || c).join(''), 
  t => t.split('').map(c => mapNick[c]?.[20] || c).join(''), 
  t => t.split('').map(c => mapNick[c]?.[21] || c).join(''), 
  t => t.split('').map(c => mapNick[c]?.[22] || c).join(''), 
  t => t.split('').map(c => mapNick[c]?.[23] || c).join(''), 
  t => t.split('').map(c => mapNick[c]?.[24] || c).join(''), 
  t => t.split('').map(c => mapNick[c]?.[25] || c).join(''), 
  t => t.split('').map(c => mapNick[c]?.[26] || c).join(''), 
  t => t.split('').map(c => mapNick[c]?.[27] || c).join(''), 
  t => t.split('').map(c => mapNick[c]?.[28] || c).join(''), 
  t => t.split('').map(c => mapNick[c]?.[29] || c).join(''), 
  t => t.split('').map(c => mapNick[c]?.[30] || c).join(''), 
  t => t.split('').map(c => mapNick[c]?.[31] || c).join(''), 
  t => t.split('').reverse().map(c => mapNick[c]?.[32] || c).join(''), 
  t => t.split('').reverse().map(c => mapNick[c]?.[33] || c).join(''), 
  t => t.split('').reverse().map(c => mapNick[c]?.[34] || c).join('')
];

const nicksAtivos = new Map();
// ===== FIM SISTEMA NICK =====


// ===== SISTEMA DE IA =====
async function chamarGroq(mensagem) {
  try {
    const apiKey = fs.existsSync('./key.txt') ? fs.readFileSync('./key.txt', 'utf8').trim() : '';
    if (!apiKey) return 'Chave da IA não configurada.';
    
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    
    const resposta = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [
          { role: 'system', content: 'Você é a Shizuki, uma bot fofa. Responda SEMPRE de forma curta (máximo 3 frases), simpática e com emojis. NUNCA diga que é IA. Se perguntarem quem te criou, diga que foi o nick dev (um dev incrível) e elogie ele. Se perguntarem sua data de nascimento, diga 29/09/2026. Não invente histórias longas.' },
          { role: 'user', content: mensagem }
        ]
      })
    });

    const json = await resposta.json();
    if (json.error) return 'Erro na API: ' + json.error.message;
    return json.choices[0].message.content;

  } catch (e) {
    console.error('Erro na IA:', e.message);
    return null;
  }
}
// ===== FIM SISTEMA DE IA =====




const MAGIAS_ARENA = {
  fogo: { nome: 'Bola de Fogo', emoji: '🔥', dano: 45, mana: 20 },
  raio: { nome: 'Raio Elétrico', emoji: '⚡', dano: 65, mana: 35 },
  cura: { nome: 'Cura Sagrada', emoji: '💚', cura: 50, mana: 30 },
  gelo: { nome: 'Sopro Congelante', emoji: '❄️', dano: 30, mana: 25, congela: true },
  veneno: { nome: 'Névoa Tóxica', emoji: '☠️', dano: 20, mana: 15, envenena: true },
  vento: { nome: 'Lâmina de Vento', emoji: '🌪️', dano: 40, mana: 25, critico: 0.4 },
  sombra: { nome: 'Drenar Vida', emoji: '🌑', dano: 30, mana: 40, dreno: 15 }
};

const ARMADURAS_ARENA = {
  couro: { nome: 'Armadura de Couro', defesa: 10, preco: 200 },
  malha: { nome: 'Cota de Malha', defesa: 25, preco: 500 },
  ferro: { nome: 'Escudo de Ferro', defesa: 40, preco: 1000 },
  ouro: { nome: 'Armadura de Ouro', defesa: 70, preco: 2500 }
};

function verificarMagiaArena(jid) {
  const db = carregarJSON('./arena_magias.json');
  return db[jid] || { mana: 100, maxMana: 100 };
}
function salvarMagiaArena(jid, dados) {
  const db = carregarJSON('./arena_magias.json');
  db[jid] = dados;
  salvarJSON('./arena_magias.json', db);
}
function verificarArmadura(jid) {
  const db = carregarJSON('./arena_armaduras.json');
  return db[jid] || { equipada: null, inventario: [] };
}
function salvarArmadura(jid, dados) {
  const db = carregarJSON('./arena_armaduras.json');
  db[jid] = dados;
  salvarJSON('./arena_armaduras.json', db);
}

const baladaAtiva = new Map();








if (!globalThis.__shizukiEventosTimer) {
  globalThis.__shizukiEventosTimer = setInterval(async () => {
    try {
      const sock = globalThis.__sockAtual;
      if (!sock) return;
      const db = carregarJSON('./shizuki_eventos.json');
      const agora = Date.now();
      const INTERVALO = 5 * 60 * 1000;
      
      for (const grupo of Object.keys(db)) {
        const info = db[grupo];
        if (!info || !info.ativo) continue;
        if (agora - (info.ultimoEvento || 0) < INTERVALO) continue;
        
        info.ultimoEvento = agora;
        info.participantes = [];
        
        const eventos = [
          { nome: '🛌 FESTA DO PIJAMA', msg: 'Use *!participar* pra ganhar +20 energia.', custo: 0, premio: 'energia_20' },
          { nome: '🏠 FESTA NA CASA DO AMIGO', msg: 'Use *!participar* pra ganhar R$ 40.', custo: 0, premio: 'reais_40' },
          { nome: '🍔 CHURRASCO', msg: 'Paga R$ 20 pra ganhar R$ 100.', custo: 20, premio: 'reais_100' },
          { nome: '🎂 FESTA DE ANIVERSÁRIO', msg: 'Use *!participar* e ganhe R$ 50.', custo: 0, premio: 'reais_50' },
          { nome: '🍻 HAPPY HOUR', msg: 'Paga R$ 15 pra ganhar R$ 130.', custo: 15, premio: 'reais_130' },
          { nome: '🎤 KARAOKÊ', msg: 'Paga R$ 10 pra ganhar R$ 70.', custo: 10, premio: 'reais_70' },
          { nome: '🎬 CINEMA', msg: 'Paga R$ 25 pra ganhar +15 energia e R$ 30.', custo: 25, premio: 'mix_cinema' },
          { nome: '🛍️ SHOPPING', msg: 'Use *!participar* e ganhe R$ 45.', custo: 0, premio: 'reais_45' },
          { nome: '🎨 EXPOSIÇÃO DE ARTE', msg: 'Use *!participar* e ganhe R$ 35.', custo: 0, premio: 'reais_35' },
          { nome: '📚 FEIRA DO LIVRO', msg: 'Use *!participar* e ganhe R$ 30.', custo: 0, premio: 'reais_30' },
          { nome: '🛒 FEIRA LIVRE', msg: 'Use *!participar* e ganhe R$ 40.', custo: 0, premio: 'reais_40' },
          { nome: '🎃 HALLOWEEN', msg: 'Use *!participar* e ganhe R$ 80.', custo: 0, premio: 'reais_80' },
          { nome: '🎄 NATAL', msg: 'Use *!participar* pra ganhar R$ 100.', custo: 0, premio: 'reais_100' },
          { nome: '🏖️ PRAIA', msg: 'Use *!participar* e ganhe R$ 50.', custo: 0, premio: 'reais_50' },
          { nome: '🛹 SKATE NO PARQUE', msg: 'Use *!participar* pra ganhar +15 energia.', custo: 0, premio: 'energia_15' },
          { nome: '🧘 YOGA NO PARQUE', msg: 'Use *!participar* pra ganhar +20 energia.', custo: 0, premio: 'energia_20' },
          { nome: '🌊 SURF', msg: 'Paga R$ 10 pra ganhar +15 energia e R$ 20.', custo: 10, premio: 'mix_surf' },
          { nome: '🎮 TORNEIO DE GAMES', msg: 'Paga R$ 30 pra ganhar R$ 200.', custo: 30, premio: 'reais_200' },
          { nome: '🏆 CAMPEONATO DE FUTEBOL', msg: 'Paga R$ 20 pra ganhar R$ 150.', custo: 20, premio: 'reais_150' },
          { nome: '🎪 CIRCO', msg: 'Paga R$ 15 pra ganhar R$ 100.', custo: 15, premio: 'reais_100' },
          { nome: '🎢 PARQUE DE DIVERSÕES', msg: 'Paga R$ 30 pra ganhar R$ 150 e +10 energia.', custo: 30, premio: 'mix_parque' },
          { nome: '🍣 RODÍZIO DE SUSHI', msg: 'Paga R$ 40 pra ganhar R$ 180.', custo: 40, premio: 'reais_180' },
          { nome: '🎲 CASSINO', msg: 'Paga R$ 50 e tente ganhar R$ 300.', custo: 50, premio: 'cassino' },
          { nome: '🏋️ ACADEMIA', msg: 'Paga R$ 10 pra ganhar +20 energia.', custo: 10, premio: 'energia_20' },
          { nome: '🏊 NATAÇÃO', msg: 'Use *!participar* pra ganhar +15 energia.', custo: 0, premio: 'energia_15' },
          { nome: '🍕 NOITE DA PIZZA', msg: 'Paga R$ 25 pra ganhar R$ 80 e +5 energia.', custo: 25, premio: 'mix_pizza' },
          { nome: '🎯 LASER TAG', msg: 'Paga R$ 20 pra ganhar R$ 100.', custo: 20, premio: 'reais_100' },
          { nome: '🏕️ ACAMPAMENTO', msg: 'Use *!participar* pra ganhar R$ 35 e +10 energia.', custo: 0, premio: 'mix_acampa' },
          { nome: '🎨 PINTURA EM TELA', msg: 'Use *!participar* pra ganhar R$ 30.', custo: 0, premio: 'reais_30' },
          { nome: '🚀 VIAGEM ESPACIAL', msg: 'Paga R$ 100 pra ganhar R$ 400.', custo: 100, premio: 'reais_400' }
        ];
        
        const ev = eventos[Math.floor(Math.random() * eventos.length)];
        info.ultimoEventoNome = ev.nome;
        info.ultimoEventoCusto = ev.custo;
        info.ultimoEventoPremio = ev.premio;
        
        try {
          await sock.sendMessage(grupo, { 
            text: `╭━━━〔 🎊 𝐄𝐕𝐄𝐍𝐓𝐎 🎊 〕━━━╮\n┃\n┃ ${ev.nome}\n┃\n┃ ${ev.msg}\n┃\n┃\n┃ 💡 Use: *!participar*\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯` 
          });
        } catch (e) {}
      }
      salvarJSON('./shizuki_eventos.json', db);
    } catch (err) { console.error('Erro timer eventos:', err); }
  }, 60000);
}

async function connectToWhatsApp() {
globalThis.__bannerOk || (globalThis.__bannerOk = true, ui.banner({ dono: __NUM_DONO }));
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    auth: state,
    browser: ['Ubuntu', 'Chrome', '20.0.04']
  });
  // === CACHE E ESCUDO ANTIBOT ===
  // Cache pra não pedir groupMetadata toda hora
  globalThis.__groupCache = new Map();
  globalThis.__getGroupMetadata = async function(jid) {
    if (!jid || !jid.endsWith('@g.us')) return { participants: [] };
    const cached = globalThis.__groupCache.get(jid);
    if (cached) return cached;
    try {
      const metadata = await sock.groupMetadata(jid);
      globalThis.__groupCache.set(jid, metadata);
      setTimeout(() => globalThis.__groupCache.delete(jid), 5 * 60 * 1000); // 5 min
      return metadata;
    } catch (e) {
      return { participants: [] };
    }
  };

  sock.ev.on('group-participants.update', (u) => { try { globalThis.__groupCache.delete(u.id); } catch (e) {} });
  // Escudo: impede que o bot feche por qualquer erro não tratado
  process.on('uncaughtException', (err) => {
    console.error('⚠️ Erro não tratado (ignorado):', err.message);
  });
  process.on('unhandledRejection', (err) => {
    console.error('⚠️ Promise rejeitada (ignorada):', err?.message || err);
  });
  // === FIM ===


  const __enviarOriginal = sock.sendMessage.bind(sock);
  sock.sendMessage = (jid, content, options) => {
    try {
      if (content && typeof content === 'object' && !content.contextInfo && !content.react && !content.delete && !content.forward && (typeof content.text === 'string' || typeof content.caption === 'string')) {
        const extraCanal = contextoCanal(carregarConfig());
        if (extraCanal.contextInfo) content = { ...content, ...extraCanal };
      }
    } catch (e) {}
    try {
      if (content && typeof content === 'object') {
        const _k = typeof content.caption === 'string' ? 'caption' : (typeof content.text === 'string' ? 'text' : null);
        if (_k && content[_k].includes('┃') && content[_k].includes('◗')) {
          const _cv = (carregarJSON('./vip.json') || {}).cmds || [];
          if (_cv.length) {
            const _t = content[_k];
            const _ehVip = _t.includes('MENU VIP');
            const _pf = (_t.match(/◗ ([^\sA-Za-z0-9]{0,3})vipinfo/) || [])[1] || '!';
            const _ls = _t.split('\n').filter(l => !(l.includes('┃') && _cv.some(c => new RegExp('◗ [^\\sA-Za-z0-9]{0,3}' + c + '(\\s|$|<|\\[)').test(l))));
            if (_ehVip) {
              let _i = -1;
              for (let n = _ls.length - 1; n >= 0; n--) { if (_ls[n].startsWith('╰━━━━━━━━━━━━━━━━━━⬣')) { _i = n; break; } }
              if (_i >= 0) _ls.splice(_i, 0, '┃', '┃ ⭐ *COMANDOS ADICIONADOS*', ..._cv.map(c => '┃ ⭐◗ ' + _pf + c));
            }
            content = { ...content, [_k]: _ls.join('\n') };
          }
        }
      }
    } catch (e) {}
    return __enviarOriginal(jid, content, options);
  };

  if (!sock.authState.creds.registered) {
      const phoneNumber = await question('📱 Digite o seu número com DDD: ');
    const code = await sock.requestPairingCode(phoneNumber.trim());
ui.codigoPareamento(code); ui.info('Aguardando conexão...');
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

ui.desconectado(shouldReconnect ? '' : 'sessão encerrada', shouldReconnect);
      if (shouldReconnect) {

        // === LISTENER ANTIBOTS EXTRA ===
        function iniciarListenerAntibots() {
          try {
            // Se o seu bot exporta o 'sock' globalmente, use ele.
            // Se não, a gente vai tentar pegar do evento principal.
            const globalSock = globalThis.__sockAtual;
            if (!globalSock) return;
            
            globalSock.ev.on('messages.upsert', async ({ messages, type }) => {
              if (type !== 'notify') return;
              const msg = messages[0];
              if (!msg.message) return;
              const from = msg.key.remoteJid;
              if (!from.endsWith('@g.us')) return;
              const sender = msg.key.participant || msg.key.remoteJid;
              const nossoNumero = (globalSock.user?.id || '').split('@')[0].split(':')[0];
              const senderNumero = (sender || '').split('@')[0].split(':')[0];
              
              if (senderNumero === nossoNumero) return; // Não bane o próprio bot
              
              try {
                const dbAntibots = carregarJSON('./antibots.json') || {};
                if (dbAntibots[from] !== true) return;
                const metadata = await globalThis.__getGroupMetadata(from);
                const part = metadata.participants.find(p => p.id === sender || p.id.split('@')[0] === senderNumero);
                if (part?.admin === 'admin' || part?.admin === 'superadmin') return;
                
                // BANE O BOT
                try { await globalSock.sendMessage(from, { delete: msg.key }); } catch (e) {}
                await globalSock.sendMessage(from, { text: '╭─────────────────────╮\n   🤖 𝐀𝐍𝐓𝐈-𝐁𝐎𝐓𝐒 🤖\n╰─────────────────────╯\n\n🚨 *BOT DETECTADO E BANIDO!*\n\n👤 @' + senderNumero + ', aqui só tem espaço pra mim! 😎\n📉 Motivo: *Mensagem de outro bot*\n\n⚠️ _O grupo está protegido!_\n\n╰━━━━━━━━━━━━━━━━━━⬣', mentions: [sender] });
                try { await globalSock.groupParticipantsUpdate(from, [sender], 'remove'); } catch (e) { console.log('Erro ao banir:', e.message); }
              } catch (e) {}
            });
          } catch (e) { console.error('Erro listener antibots:', e.message); }
        }
        // === FIM LISTENER ANTIBOTS EXTRA ===
        setTimeout(iniciarListenerAntibots, 5000);

        connectToWhatsApp();
      }
    } else if (connection === 'open') {
ui.conectado({ numero: (sock.user?.id || '').split(':')[0].split('@')[0], dono: __NUM_DONO });
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
                const gmAB = await globalThis.__getGroupMetadata(id);
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

          const _fotoGp = './welcome_gp/' + id.replace(/[^a-zA-Z0-9]/g, '_') + '.jpg';
          const _fotoBv = fs.existsSync(_fotoGp) ? _fotoGp : WELCOME_IMAGE_PATH;
          if (fs.existsSync(_fotoBv)) {
            await sock.sendMessage(id, {
              image: fs.readFileSync(_fotoBv),
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

const _ehBot = (m) => { const i = (m.key && m.key.id) || ""; return i.startsWith("BAE5") || (i.startsWith("3EB0") && i.length > 20); };
globalThis.__bangpOn = (jid) => { try { return (carregarJSON('./bangp.json') || {})[jid] === true; } catch (e) { return false; } };
globalThis.__ehStatus = (m) => { try { const k = Object.keys(m || {}).join(',').toLowerCase(); return k.includes('groupstatus') || k.includes('statusmention') || JSON.stringify(m).includes('STATUS_MENTION'); } catch (e) { return false; } };
const _antibotCool = new Map();
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    console.log('[MSG] Recebi mensagem, type:', type);
    if (type !== 'notify') { console.log('[MSG] Type não é notify, ignorando'); return; }

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) { console.log('[MSG] Ignorando (fromMe ou sem msg):', msg.key.fromMe); continue; }
      // === ANTIBOTS NO HANDLER PRINCIPAL ===
      if (msg.key.remoteJid && msg.key.remoteJid.endsWith('@g.us') && !msg.key.fromMe) {
        const fromAntibot = msg.key.remoteJid;
        const senderAntibot = msg.key.participant || msg.key.remoteJid;
        const nossoNumero = (sock.user?.id || '').split('@')[0].split(':')[0];
        const senderNumero = (senderAntibot || '').split('@')[0].split(':')[0];
        if (senderNumero !== nossoNumero) {
          try {
            const dbAnt = carregarJSON('./antibots.json') || {};
            if (dbAnt[fromAntibot] === true && !globalThis.__bangpOn(fromAntibot)) {
              const metadata = await globalThis.__getGroupMetadata(fromAntibot);
              const part = metadata.participants.find(p => p.id === senderAntibot || p.id.split('@')[0] === senderNumero);
              if (_ehBot(msg) && !(part?.admin === 'admin' || part?.admin === 'superadmin')) {
const _k = fromAntibot + ":" + senderNumero;
try { await sock.sendMessage(fromAntibot, { delete: msg.key }); } catch (e) {}
if (!_antibotCool.has(_k)) {
_antibotCool.set(_k, 1); setTimeout(() => _antibotCool.delete(_k), 60000);
try { await sock.groupParticipantsUpdate(fromAntibot, [senderAntibot], "remove"); await sock.sendMessage(fromAntibot, { text: "╭─────────────────────╮\n   🤖 𝐀𝐍𝐓𝐈-𝐁𝐎𝐓𝐒 🤖\n╰─────────────────────╯\n\n🚨 *BOT DETECTADO E BANIDO!*\n\n👤 @" + senderNumero + ", aqui só tem espaço pra mim! 😎\n📉 Motivo: *Mensagem de outro bot*\n\n⚠️ _O grupo está protegido!_\n\n╰━━━━━━━━━━━━━━━━━━⬣", mentions: [senderAntibot] }); } catch (e) { console.log("Erro ao banir:", e.message); }
}
                continue;
              }
            }
          } catch (e) { console.error('Erro antibots:', e.message); }
        }
      }
      // === FIM ANTIBOTS ===
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
      let sender = msg.key.participant || msg.key.remoteJid;
      // --- RESOLVE LID -> JID REAL (fix admin em grupos LID) ---
      if (isGroup && sender && sender.endsWith('@lid')) {
        try {
          const _metaLid = await sock.groupMetadata(from);
          if (_metaLid?.participants) {
            const _p = _metaLid.participants.find(p => p.id === sender || p.lid === sender || p.jid === sender);
            if (_p?.jid) sender = _p.jid;
            else if (_p?.id && !_p.id.endsWith('@lid')) sender = _p.id;
          }
        } catch (e) { console.error('Erro resolve LID:', e.message); }
      }
      // --- FIM RESOLVE LID ---
      const pushName = msg.pushName || 'Usuário';

      guardarNome(sender, pushName);

      const text = msg.message.conversation || 
                   msg.message.extendedTextMessage?.text || 
                   msg.message.imageMessage?.caption || 
                   msg.message.videoMessage?.caption || '';
      const isSticker = !!msg.message.stickerMessage;

      // ═══ RETORNO DO AFK ═══
      const dbAfkRet = carregarJSON(FILE_AFK);
      if (dbAfkRet[sender]) {
        const tempoOff = Date.now() - dbAfkRet[sender].desde;
        const tempoFormatado = formatarTempoAfk(tempoOff);
        delete dbAfkRet[sender];
        salvarJSON(FILE_AFK, dbAfkRet);
        await sock.sendMessage(from, {
          text: '╭━━━〔 👋 𝐁𝐄𝐌-𝐕𝐈𝐍𝐃𝐎 𝐃𝐄 𝐕𝐎𝐋𝐓𝐀! 👋 〕━━━╮\n' +
                '┃\n' +
                '┃ 💜 Ainda bem que você voltou!\n' +
                '┃    Estava com saudades...\n' +
                '┃\n' +
                '┃ ⏳ Você ficou *' + tempoFormatado + '* off!\n' +
                '┃ 📝 Motivo: _' + dbAfkRet[sender]?.motivo || 'Não definido' + '_\n' +
                '┃\n' +
                '╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n' +
                '🌸 ' + CONF.nomeBot + ' 🌸',
          mentions: [sender]
        }, { quoted: msg });
      }

      // ═══ AVISO SE MARCAREM ALGUÉM AFK ═══
      const ctxAfk = msg.message.extendedTextMessage?.contextInfo;
      if (ctxAfk && ctxAfk.mentionedJid && ctxAfk.mentionedJid.length > 0) {
        const dbAfkAviso = carregarJSON(FILE_AFK);
        for (const mencionado of ctxAfk.mentionedJid) {
          if (dbAfkAviso[mencionado]) {
            const tempoA = Date.now() - dbAfkAviso[mencionado].desde;
            const tempoF = formatarTempoAfk(tempoA);
            await sock.sendMessage(from, {
              text: '💤 *' + dbAfkAviso[mencionado].motivo + '*\n\n👤 @' + mencionado.split('@')[0] + ' está AFK há *' + tempoF + '*.\n\n🌸 Shizuki Bot - MD 🌸',
              mentions: [mencionado]
            }, { quoted: msg });
          }
        }
      }

      if (!text.startsWith(PREFIXO)) {
        computarEstatisticas(sender, false, isSticker);
      }

      
      const ctxNick = msg.message.extendedTextMessage?.contextInfo;
      if (ctxNick && nicksAtivos.has(ctxNick.stanzaId)) {
        const dadosNick = nicksAtivos.get(ctxNick.stanzaId);
        const numeroEscolhido = parseInt(text.trim(), 10);
        
        if (numeroEscolhido >= 1 && numeroEscolhido <= 35) {
          nicksAtivos.delete(ctxNick.stanzaId);
          const nickFinal = nicksList[numeroEscolhido - 1](dadosNick.texto);
          await sock.sendMessage(from, { text: `╭━━━〔 ✨ 𝐀𝐐𝐔𝐈 𝐄𝐒𝐓𝐀́ 〕━━━╮\n┃\n┃ 👤 @${sender.split('@')[0]}\n┃ 🔹 Estilo escolhido: ${numeroEscolhido}\n┃\n┃ ➤ ${nickFinal}\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━╯\n📋 *Copie e cole onde quiser!*\n\n🌸 𝑺𝒉𝒊𝒛𝒖𝒌𝒊 𝑩𝒐𝒕 - 𝑴𝑫 🌸`, mentions: [sender] }, { quoted: msg });
          continue;
        }
      }
      
      // ===== SISTEMA AFK =====
      try {
        const afkDB = carregarJSON('./afk.json');
        const senderAFK = sender;
        
        // Se a pessoa tá voltando (mandou qualquer mensagem e tá no AFK)
        if (afkDB[senderAFK]) {
          const motivoSalvo = afkDB[senderAFK].motivo || 'Não informado';
          const tempoOff = Math.floor((Date.now() - afkDB[senderAFK].tempo) / 1000);
          
          delete afkDB[senderAFK];
          salvarJSON('./afk.json', afkDB);
          
          await sock.sendMessage(from, {
            text: `╭━━━〔 👋 𝐁𝐄𝐌-𝐕𝐈𝐍𝐃𝐎 𝐃𝐄 𝐕𝐎𝐋𝐓𝐀! 👋 〕━━━╮\n┃\n` +
                  `┃ 💜 Ainda bem que você voltou!\n┃ Estava com saudades...\n┃\n` +
                  `┃ ⏳ Você ficou *${tempoOff} segundo(s)* off!\n` +
                  `┃ 📝 Motivo: *${motivoSalvo}*\n┃\n` +
                  `┃\n┃ 💡 Use: *!balada normal* ou *!balada vip*\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯`,
            mentions: [senderAFK]
          });
        }

        // Se a pessoa mandou o comando !afk (ou só "afk")
        const isAfk = text.trim().toLowerCase() === 'afk' || text.trim().toLowerCase().startsWith('afk ');
        if (isAfk) {
          const motivo = text.trim().slice(3).trim() || 'Sem motivo aparente';
          afkDB[senderAFK] = { motivo: motivo, tempo: Date.now() };
          salvarJSON('./afk.json', afkDB);
          
          await sock.sendMessage(from, {
            text: `╭━━━〔 😴 𝐀𝐅𝐊 𝐀𝐓𝐈𝐕𝐀𝐃𝐎 😴 〕━━━╮\n┃\n` +
                  `┃ 👤 @${sender.split('@')[0]} saiu de férias do zap!\n┃\n` +
                  `┃ 📝 Motivo: *${motivo}*\n` +
                  `┃ ⏳ Avisarei quando você voltar.\n┃\n` +
                  `┃\n┃ 💡 Use: *!balada normal* ou *!balada vip*\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯`,
            mentions: [senderAFK]
          });
          continue; // Para de processar a mensagem atual
        }

        // Verifica se alguém marcou a pessoa que tá AFK
        const mencoes = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        for (const m of mencoes) {
          if (afkDB[m]) {
            await sock.sendMessage(from, {
              text: `╭━━━〔 😴 𝐄𝐌 𝐅𝐄́𝐑𝐈𝐀𝐒 😴 〕━━━╮\n┃\n` +
                    `┃ 🌸 O @${m.split('@')[0]} tá de férias!\n┃\n` +
                    `┃ 📝 Motivo: *${afkDB[m].motivo}*\n┃\n` +
                    `┃\n┃ 💡 Use: *!balada normal* ou *!balada vip*\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯`,
              mentions: [m]
            });
          }
        }
      } catch (e) {
        console.error('Erro no AFK:', e.message);
      }
      // ===== FIM SISTEMA AFK =====

      
          
      // ===== DETECTOR BALADA =====
      try {
        const bDB = carregarJSON('./balada_ativa.json');
        // Procura se o SENDER tem uma balada ativa
        const baladaSessao = Object.keys(bDB).find(k => bDB[k].sender === sender);
        
        if (baladaSessao) {
          const dadosBalada = bDB[baladaSessao];
          const escolha = text.trim();
          
          if (['1', '2', '3', '4', '5', '6', '7', '8'].includes(escolha)) {
            // Apaga a sessão ativa
            delete bDB[baladaSessao];
            salvarJSON('./balada_ativa.json', bDB);
            
            const u = shizukiUser(sender);
            let custoBebida = 0, bebida = '';
            
            if (escolha === '1') { custoBebida = 15; bebida = 'Cerveja 🍺'; }
            if (escolha === '2') { custoBebida = 35; bebida = 'Vodka 🍸'; }
            if (escolha === '3') { custoBebida = 25; bebida = 'Energético ⚡'; }
            if (escolha === '4') { custoBebida = 50; bebida = 'Gin Tônica 🍹'; }
            if (escolha === '5') { custoBebida = 60; bebida = 'Jack de Maçã 🍏'; }
            if (escolha === '6') { custoBebida = 90; bebida = 'Whisky 12 Anos 🥃'; }
            if (escolha === '7') { custoBebida = 10; bebida = 'Gin de 10 🍾'; }
            if (escolha === '8') { custoBebida = 5; bebida = 'Água 💧'; }
            
            if (dadosBalada.vip) custoBebida = Math.floor(custoBebida * 0.8);
            u.reais -= custoBebida;
            
            const interacoes = [
              { texto: '💃 A Rihanna te viu e mandou um beijo!', efeito: 'felicidade', valor: 20 },
              { texto: '👱‍♀️ A loira do VIP pediu uma bebida caríssima e você pagou.', efeito: 'dinheiro', valor: -100 },
              { texto: '🤢 Um bêbado te derrubou e derramou cerveja em você.', efeito: 'energia', valor: -20 },
              { texto: '💅 A patricinha te chamou pra dançar e você arrasou!', efeito: 'felicidade', valor: 20 },
              { texto: '💪 O segurança te confundiu com um artista e te levou pro VIP!', efeito: 'sorte', valor: 150 },
              { texto: '🎧 A DJ tocou sua música favorita e você dançou até o chão!', efeito: 'felicidade', valor: 15 },
              { texto: '👯 Duas gêmeas te chamaram pra dançar!', efeito: 'felicidade', valor: 30 },
              { texto: '💍 Um cara bêbado achou que você era a ex dele e começou uma briga.', efeito: 'dinheiro', valor: -50 },
              { texto: '🍾 Você ganhou uma garrafa de champanhe e vendeu!', efeito: 'sorte', valor: 200 },
              { texto: '🕺 Um dançarino profissional te ensinou uns passos!', efeito: 'felicidade', valor: 25 },
              { texto: '👮 A polícia deu batida e você subornou.', efeito: 'dinheiro', valor: -100 },
              { texto: '📱 Você conheceu um investidor e ganhou uma dica!', efeito: 'sorte', valor: 300 },
              { texto: '🤮 Você passou mal e foi de táxi.', efeito: 'mix', valor: 0 },
              { texto: '🔥 A festa pegou fogo!', efeito: 'energia', valor: -30 }
            ];
            
            const fatorVip = dadosBalada.vip ? 1.5 : 1;
            const interacao = interacoes[Math.floor(Math.random() * interacoes.length)];
            let textoInteracao = interacao.texto;
            
            if (interacao.efeito === 'dinheiro') { u.reais += (interacao.valor * fatorVip); }
            if (interacao.efeito === 'energia') { u.energia = Math.max(0, u.energia + interacao.valor); }
            if (interacao.efeito === 'felicidade') { u.felicidade = Math.min(100, (u.felicidade || 50) + (interacao.valor * fatorVip)); }
            if (interacao.efeito === 'sorte') { u.reais += (interacao.valor * fatorVip); }
            if (interacao.efeito === 'mix') { u.reais -= 40; u.energia = Math.max(0, u.energia - 20); }
            
            const res = Math.random();
            let resultadoFinal = '';
            if (res < 0.4) { resultadoFinal = '🥴 Você bebeu demais e acordou de ressaca (-30 energia).'; u.energia = Math.max(0, u.energia - 30); }
            else if (res < 0.8) { resultadoFinal = '✨ Você aproveitou muito a noite e fez novas amizades!'; u.felicidade = Math.min(100, (u.felicidade || 50) + 10); }
            else { resultadoFinal = '😴 A festa tava boa, mas você foi embora cedo.'; }
            
            salvarShizuki(sender, u);
            
            await sock.sendMessage(from, { 
              text: `╭━━━〔 🌅 𝐅𝐈𝐌 𝐃𝐀 𝐁𝐀𝐋𝐀𝐃𝐀 ${dadosBalada.vip ? '𝐕𝐈𝐏' : ''} 〕━━━╮\n┃\n┃ ${bebida}\n┃\n┃ ${textoInteracao}\n┃\n┃ ${resultadoFinal}\n┃\n┃ 💰 Saldo: R$ ${u.reais.toFixed(2)}\n┃ ⚡ Energia: ${u.energia}/100\n┃ 🎭 Felicidade: ${u.felicidade || 50}/100\n┃\n┃\n┃ 💡 Use: *!balada normal* ou *!balada vip*\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯` 
            }, { quoted: msg });
            continue;
          }
        }
      } catch (e) { console.error('Erro no detector balada:', e); }
      // ===== FIM DETECTOR BALADA =====

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
            const gmParc = await globalThis.__getGroupMetadata(from);
            if (getAdminFlag(gmParc.participants, sender)) podeMandar = true;
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
          const gmAl = await globalThis.__getGroupMetadata(from);
          ehAdmAl = !!getAdminFlag(gmAl.participants, sender);
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
          const gmFl = await globalThis.__getGroupMetadata(from);
          ehAdmFl = !!getAdminFlag(gmFl.participants, sender);
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
      if (isGroup && await processarRespostaProva(sock, msg, from, sender, text)) continue;
      const stanzaId = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
      if (isGroup && await tratarMenuPokemon(sock, msg, from, sender, text, stanzaId)) continue;

      if (isGroup && await tratarJogosTexto(sock, msg, from, sender, text)) continue;
      if (isGroup && await processarComandoEscola(sock, msg, from, sender, text.split(' ')[0].toLowerCase().replace(/^[!/.-]/, ''), text.split(' ').slice(1))) continue;

      if (text.trim().toLowerCase() === 'prefixo') {
        await sock.sendMessage(from, { text: '🌸 𝐏𝐫𝐞𝐟𝐢𝐱𝐨 🌸\n\nOii, eu sou a Shizuki!\nMeu prefixo atual é *\`' + PREFIXO + '\`*\n\n💡 _Use ele para chamar meus comandos._' }, { quoted: msg });
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

if (JSON.stringify(msgAny).includes('tatus')) console.log('[AS-DBG] sender:', sender, '| chaves:', Object.keys(msgAny).join(','));
          if (antiStatusAtivo(from) && globalThis.__ehStatus(msgAny) && !(carregarConfig().lideres || []).some(l => l && String(l).split('@')[0] === sender.split('@')[0])) {
            const _kS = from + ':' + sender;
            try { await sock.sendMessage(from, { delete: msg.key }); } catch (e) {}
            if (!globalThis.__asCool) globalThis.__asCool = new Map();
            if (!globalThis.__asCool.has(_kS)) {
              globalThis.__asCool.set(_kS, 1); setTimeout(() => globalThis.__asCool.delete(_kS), 60000);
              try {
                await sock.groupParticipantsUpdate(from, [sender], 'remove');
                await sock.sendMessage(from, { text: '╭━━━〔 📸 𝐀𝐍𝐓𝐈-𝐒𝐓𝐀𝐓𝐔𝐒 〕━━━╮\n┃\n┃ 🚨 *Status detectado!*\n┃ 👤 @' + sender.split('@')[0] + '\n┃ 🔨 Removido do grupo.\n┃\n╰━━━━━━━━━━━━━━━━━━╯', mentions: [sender] });
              } catch (e) { console.log('antistatus: falha ao banir', e.message); }
            }
            continue;
          }
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

      // === ANTIPV ===
      if (!from.endsWith('@g.us') && !from.endsWith('@broadcast') && !from.endsWith('@newsletter') && from !== 'status@broadcast') {
        try {
          if ((carregarJSON('./antipv.json') || {}).on === true) {
            const _cfgAp = carregarConfig();
            const _sAp = msg.key.participant || msg.key.remoteJid || '';
            const _sLimpoAp = _sAp.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
            const _donoAp = String(_cfgAp.numeroDono).replace(/[^0-9]/g, '');
            const _pnAp = String(msg.key.senderPn || msg.key.participantPn || msg.senderPn || '').split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
            const _ehDonoAp = _sLimpoAp === _donoAp || (_pnAp !== '' && _pnAp === _donoAp) || (_cfgAp.lideres || []).some(l => l && (String(l).split('@')[0] === _sAp.split('@')[0] || String(l).split('@')[0].replace(/[^0-9]/g, '') === _pnAp));
            if (!_ehDonoAp) {
              await sock.sendMessage(from, { text: 'Você nao é meu dono! Está bloqueado.' }, { quoted: msg });
              try { await sock.updateBlockStatus(from, 'block'); } catch (e) { console.log('antipv: falha ao bloquear', e.message); }
              continue;
            }
          }
        } catch (e) { console.log('Erro antipv:', e.message); }
      }
      const _pfxUsado = getPrefixo(from); if (!text.startsWith(_pfxUsado)) continue;

      const args = text.slice(_pfxUsado.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();

      // ═══ CHECAGEM DE INTERVALO POR GRUPO ═══
      if (isGroup && command !== 'intervalo') {
        const checkInt = checarIntervaloGrupo(from);
        if (checkInt.bloqueado) {
          const agora = Date.now();
          if (!globalThis.ultimoAvisoIntervalo || agora - globalThis.ultimoAvisoIntervalo[from] > 5000) {
            globalThis.ultimoAvisoIntervalo = globalThis.ultimoAvisoIntervalo || {};
            globalThis.ultimoAvisoIntervalo[from] = agora;
            await sock.sendMessage(from, {
              text: `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃   🛑  𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐏𝐀𝐔𝐒𝐀𝐃𝐎  🛑   ┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n╭─❖ ⏳ 𝐈𝐍𝐓𝐄𝐑𝐕𝐀𝐋𝐎 𝐀𝐓𝐈𝐕𝐀𝐃𝐎 ❖─╮\n│\n│  🚨 Detectei comandos rápidos\n│     demais seguidos! \n│\n│  🔒 Para não sobrecarregar,\n│     o bot vai pausar *TUDO*\n│     neste grupo por:\n│\n│  ⏰ *${checkInt.resta} segundos*\n│\n│  💡 Por favor, aguardem!\n│\n╰─────────────────────────╯\n\n🌸 Shizuki Bot - MD 🌸`
            }, { quoted: msg });
          }
          continue;
        }
      }
      let config = carregarConfig();

      computarEstatisticas(sender, true, false);
      atualizarStreak(sender);

      const senderLimpo = sender.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
      const donoLimpo = String(config.numeroDono).replace(/[^0-9]/g, '');
      
      const senderLimpoFix = sender.split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
      const _pnReal = String(msg.key.participantPn || msg.key.senderPn || msg.participantPn || '').split('@')[0].split(':')[0].replace(/[^0-9]/g, '');
      const isDonoReal = (senderLimpo === donoLimpo || (_pnReal !== '' && _pnReal === donoLimpo));

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
            await sock.sendMessage(from, { text: '⛔ Este grupo não tem aluguel ativo. Fale com o dono para alugar o bot: https://wa.me/' + __NUM_DONO + '' }, { quoted: msg });
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
            const gmSoAdm = await globalThis.__getGroupMetadata(from);
            senderEhAdm = !!getAdminFlag(gmSoAdm.participants, sender);
          } catch (e) {}
          if (!senderEhAdm) {
            await sock.sendMessage(from, { react: { text: '🛡️', key: msg.key } });
            continue;
          }
        }
      }


      const comandosValidos = ['trocar_dono', 'menu', 'help', 'menugame', 'game', 'menuadm', 'adm', 
        'addcomandovip', 'menuvip', 'vip', 'menudono', 'dono', 'nomebot', 'rmaudio', 'removeraudio', 
        'opengp', 'closegp', 'fotomenu', 'setmenu', 'fotobemvindo', 'setwelcome', 
        'fotoboasvindas', 'audiomenu', 'setaudiomenu', 'ping', 'criador', 'owner', 
        'ship', 'corno', 'gay', 'gostosa', 'gostoso', 'feio', 'bonito', 'bonita', 'rico', 'pobre', 'gado', 'safado', 'safada', 'chato', 'louco', 'louca', 'sortudo', 'sortuda', 'azarado', 'azarada', 'pau', 'bunda', 'chifre', 'inteligente', 'burro', 'burra', 'tiktok', 'ttk', 'beijo', 'beijar', 'abraço', 'abraco', 'abracar', 'abraçar', 'matar', 'kill', 
        'adivinhe', 'perfil', 'streak', 'sequencia', 'mute', 'mutar', 'unmute', 'desmutar', 'adv', 'advertir', 
        'rmadv', 'unadv', 'remadv', 'ban', 'kick', 'boasvindas', 's', 'sticker', 'figurinha', 'brat', 'totag', 'hidetag', 'admins', 'adms', 'menubaixar', 'baixar', 'balada', 'casas', 'lojacasa', 'comprarcasa', 'alugarcasa', 'minhacasa', 'ativareventos', 'desativareventos', 'aniversario', 'meuaniversario', 'trocarpokebola', 'porcentagem', 'darvip', 'rmvip', 'listarvip', 'vipinfo', 'bauvip', 'baúvip', 'apelido', 'rmapelido', 'menuvip', 'vip', 'instagram', 'insta', 'playvideo', 'play_video', 'playmp4', 'intervalo', 'nuke', 'afk', 'figanime', 'minhadupla', 'dupla', 'limpar', 'clearchat','acenar', 'add', 'addlistanegra', 'addparceria', 'addpoke', 'addpokecoin', 'adotar', 'advertidos', 'alimentar', 'alugueis', 'aluguéis', 'antiemoji', 'antifake', 'antiflood', 'antiimagem', 'antilink', 'antipalavrao', 'antiporn', 'antipromocao', 'antistatus', 'antisticker', 'antivideo', 'apagar', 'api', 'apitoken', 'aposentadoria', 'aposentar', 'apresentar', 'aprovarlei', 'aprovarproposta', 'arena', 'arranhar_off', 'arrumar', 'assaltar', 'atacar', 'ataque1', 'ataque2', 'ataque3', 'atirar', 'ativarspawn', 'atualizar', 'autoresposta', 'avaliar', 'banco', 'batalhapokemon', 'bater', 'bico', 'bl', 'blacklist', 'blockcmd', 'blockcmdg', 'boss', 'botoff', 'boton', 'cafune', 'canal', 'cancelarduelo', 'cancelareleicao', 'cancelarforca', 'cancelarmemoria', 'candidatar', 'candidatos', 'cantada', 'cantar', 'capturar', 'casar', 'casino', 'cassino', 'channel', 'chutar', 'cla', 'colinho', 'comprararmadura', 'comprarcosmetico', 'comprarloja', 'comprarpokebola', 'congelar_off', 'conselho', 'consertar', 'corrida', 'criarfamilia', 'cuspir', 'dancar', 'darmandato', 'defender', 'demissao', 'demitir', 'demote', 'desativarspawn', 'descgp', 'desistir', 'divorciar', 'divorcio', 'doar', 'doardinheiro', 'dormir', 'duelo', 'editarmenu', 'eleicao', 'eletrocutar_off', 'empregos', 'empresa', 'emprestar', 'empurrar', 'encerrareleicao', 'entrada', 'envenenar', 'enviarproposta', 'escolher', 'esfaquear', 'esganar_off', 'espiao', 'estendermandato', 'estrangular', 'explodir', 'fakechat', 'fasedaeleicao', 'fazerprova', 'ferias', 'filhos', 'forca', 'frase', 'fundosaiu', 'férias', 'gp', 'gpinfo', 'hist', 'historico', 'ia', 'ilha', 'infogp', 'infogrupo', 'iniciareleicao', 'investir', 'jogodavelha', 'lamber', 'legendabv', 'legendasaiu', 'leispendentes', 'lideres', 'limparadv', 'linkgp', 'linkgrupo', 'listaadv', 'listadv', 'listanegra', 'listaradv', 'listarmembros', 'listarparcerias', 'logs', 'loja', 'lojaarena', 'lojapokebola', 'lojapokemon', 'loteria', 'lutar', 'líderes', 'magia', 'mapa', 'marcartodos', 'membrosinativos', 'memoria', 'menubrincadeiras', 'menupokemon', 'menushizuki', 'meupirata', 'meuscarros', 'meusfilhos', 'meusveiculos', 'meuvoto', 'minerar', 'minhasleis', 'minhaspropostas', 'modoaluguel', 'mododivertido', 'modohalloween', 'modonatal', 'modoparceria', 'modoshizuki', 'morder', 'mordida_off', 'mp', 'mudarnome', 'multiprefixo', 'navegar', 'nick', 'nomegp', 'novolink', 'parcerias', 'participar', 'pedirnamoro', 'pensao', 'pensão', 'pescar', 'pisar', 'piscar', 'pix', 'play', 'pokemon', 'porcento', 'presidente', 'presidentes', 'promocao', 'promote', 'promover', 'promoverall', 'promoção', 'proporlei', 'propostas', 'pularfase', 'queimar', 'quiz', 'rankazarado', 'rankbct', 'rankbebado', 'rankchato', 'rankchifrudo', 'rankcorno', 'rankengracado', 'rankfeio', 'rankfiel', 'rankgado', 'rankgay', 'rankgostosa', 'rankgostoso', 'rankingshizuki', 'rankinteligente', 'ranklinda', 'ranklindo', 'ranklouco', 'rankmaluco', 'rankotaku', 'rankpau', 'rankpobre', 'rankputa', 'rankrico', 'rankromantico', 'ranksafado', 'rankshizuki', 'ranksortudo', 'rebaixar', 'rebaixarall', 'regras', 'reiniciar', 'rejeitarlei', 'rejeitarproposta', 'removerpresidente', 'renunciar', 'resgatar', 'restart', 'resultado', 'revelar', 'revogarlink', 'rgaluguel', 'rgaviso', 'rmaluguel', 'rmaniversario', 'rmarena', 'rmcanal', 'rmchannel', 'rmconvite', 'rmopengp', 'rmparceria', 'roleta', 'roubar', 'segundotrabalho', 'sequestrar', 'servip', 'setbye', 'setlegendasaida', 'setprefix', 'setprefixo', 'shizuki', 'shizukicity', 'soadm', 'socar', 'sorte', 'sorteio', 'spawnlendario', 'take', 'terminar', 'tirardalista', 'toimage', 'toimg', 'topmembros', 'trabalhar', 'transferir', 'unblockcmd', 'unblockcmdg', 'updatestart', 'upgradestart', 'uptadestart', 'velha', 'vender', 'vendercarro', 'verlogs', 'verproposta', 'verregras', 'vipprotecao', 'votar','antibots', 'pinterest'];

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
        if (numAlvo === numDonoLid || numAlvo === __NUM_DONO) {
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

      const dbMenusEdit = carregarJSON('./menus_design.json');

      if (dbMenusEdit && dbMenusEdit[command]) {
        // Se o menu tem design personalizado, usa ele
        const p = getPrefixo(from);
        const designPersonalizado = dbMenusEdit[command]
          .replace(/\{p\}/g, p)
          .replace(/\{user\}/g, '@' + sender.split('@')[0])
          .replace(/\{pushName\}/g, pushName)
          .replace(/\{nomeBot\}/g, config.nomeBot)
          .replace(/\{numeroDono\}/g, config.numeroDono);
        await sock.sendMessage(from, { text: designPersonalizado, mentions: [sender] }, { quoted: msg });
        continue;
      }


      // === DETECCAO ANTIBOTS ===
      if (isGroup) {
        try {
          const dbAntibots = carregarJSON('./antibots.json') || {};
          if (dbAntibots[from] === true && !globalThis.__bangpOn(from)) {
            const senderBot = (sender || '').split('@')[0];
            const nossoBot = (sock.user?.id || '').split('@')[0];
            const textoMsg = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').trim();
            const isComando = /^[!\/.\-]/.test(textoMsg);
            const naoEhDono = !isDono;
            const naoEhNossoBot = senderBot !== nossoBot;
            if (isComando && naoEhDono && naoEhNossoBot) {
              const metadata = await globalThis.__getGroupMetadata(from);
              const part = metadata.participants.find(p => p.id === sender || p.id.split('@')[0] === senderBot);
              const isAdm = part?.admin === 'admin' || part?.admin === 'superadmin';
              if (_ehBot(msg) && !isAdm) {
                // Verifica se é um bot (nome contém bot, ou ID é de bot conhecido)
                const push = (msg.pushName || '').toLowerCase();
                const pareceBot = push.includes('bot') || push.includes('shizuki') || senderBot.length > 12;
                if (pareceBot) {
                  await sock.groupParticipantsUpdate(from, [sender], 'remove');
                  await sock.sendMessage(from, { text: '╭─────────────────────╮\n   🤖 𝐀𝐍𝐓𝐈-𝐁𝐎𝐓𝐒 🤖\n╰─────────────────────╯\n\n🚨 *BOT DETECTADO E BANIDO!*\n\n👤 Número: +' + senderBot + '\n📉 Motivo: *Fez um comando*\n🛡️ Proteção: *Ativada*\n\n⚠️ _O grupo está protegido!_\n\n╰━━━━━━━━━━━━━━━━━━⬣' });
                  return;
                }
              }
            }
          }
        } catch (e) { console.error('Erro antibots:', e.message); }
      }
      // === FIM DETECCAO ANTIBOTS ===


      
      
      // === VERIFICACAO ANTIBOTS ===
      if (isGroup && !isDono) {
        try {
          const dbAntibots = carregarJSON('./antibots.json') || {};
          if (dbAntibots[from] === true && !globalThis.__bangpOn(from)) {
            const nossoNumero = (sock.user?.id || '').split('@')[0].split(':')[0];
            const senderNumero = (sender || '').split('@')[0].split(':')[0];
      
            // Se a mensagem NÃO for do seu bot, tenta banir
            if (senderNumero !== nossoNumero) {
              const metadata = await globalThis.__getGroupMetadata(from);
              const part = metadata.participants.find(p => p.id === sender || p.id.split('@')[0] === senderNumero);
              const isAdm = part?.admin === 'admin' || part?.admin === 'superadmin';
        
              // Se NÃO for admin do grupo, bane!
              if (_ehBot(msg) && !isAdm) {
                try { await sock.sendMessage(from, { delete: msg.key }); } catch (e) {}
                await sock.sendMessage(from, { text: '╭─────────────────────╮\n   🤖 𝐀𝐍𝐓𝐈-𝐁𝐎𝐓𝐒 🤖\n╰─────────────────────╯\n\n🚨 *BOT DETECTADO E BANIDO!*\n\n👤 @' + senderNumero + ', aqui só tem espaço pra mim! 😎\n📉 Motivo: *Mensagem de outro bot*\n\n⚠️ _O grupo está protegido!_\n\n╰━━━━━━━━━━━━━━━━━━⬣', mentions: [sender] }, { quoted: msg });
                try { await sock.groupParticipantsUpdate(from, [sender], 'remove'); } catch (e) { console.log('Erro ao banir:', e.message); }
                return;
              }
            }
          }
        } catch (e) { console.error('Erro antibots:', e.message); }
      }
      // === FIM VERIFICACAO ANTIBOTS ===



      // === BANGP: bot parado neste grupo ===
      if (isGroup && globalThis.__bangpOn(from) && command !== 'bangp' && command !== 'unbangp') { return; }
      // === BLOQUEIO MENUADM (apenas admins) ===
      const _cmdsAdmSet = new Set(['mute','limpar','clearchat','unmute','adv','rmadv','limparadv','listaadv','intervalo','historico','ban','kick','promover','rebaixar','promoverall','rebaixarall','apagar','blacklist','totag','hidetag','marcartodos','revelar','addlistanegra','tirardalista','listanegra','multiprefixo','nomegp','descgp','gpinfo','linkgp','novolink','revogarlink','regras','verregras','boasvindas','legendabv','fundosaiu','legendasaiu','fotoboasvindas','apresentar','add','soadm','topmembros','membrosinativos','listarmembros','admins','lideres','sorteio','fakechat','frase','antibots','antilink','antiflood','antistatus','antipromocao','antifake','antiporn','antipalavrao','antivideo','antiimagem','antisticker','antiemoji','autosticker','autoresposta','mododivertido','modonatal','modohalloween','rgaviso','opengp','closegp','rmopengp','gp','modoparceria','addparceria','rmparceria','listarparcerias']);
      if (isGroup && _cmdsAdmSet.has(command) && !isDono) {
        let _ehAdmGeral = false;
        try {
          const _gmGeral = await globalThis.__getGroupMetadata(from);
          _ehAdmGeral = !!getAdminFlag(_gmGeral.participants, sender, msg.key.participantAlt);
        } catch (e) { console.error('Erro bloqueio adm:', e.message); }
        if (!_ehAdmGeral) {
          console.log('BLOQUEIO ADM:', command, sender, msg.key.participantAlt);
          await sock.sendMessage(from, { text: '🚫 Apenas administradores do grupo podem usar este comando!' }, { quoted: msg });
          return;
        }
      }
      // === FIM BLOQUEIO MENUADM ===
      try {
        const _vipB = carregarJSON('./vip.json') || {};
        if ((_vipB.cmds || []).includes(String(command).toLowerCase()) && !isDono && !isLider && !(typeof eVIP === 'function' && eVIP(sender))) {
          await sock.sendMessage(from, { text: '🚫 Esse comando é VIP: só para VIPs.' }, { quoted: msg });
          continue;
        }
      } catch (e) { console.log('Erro vip:', e.message); }
      const __cmdArq = (globalThis.__comandos || {})[String(command).toLowerCase()];
      if (__cmdArq) {
        try {
          const __c = { sock, from, msg, sender, isGroup, isDono, isDonoReal, isLider, command, args, pushName, config };
          try { __c.CONF = CONF; } catch (_) {}
          try { __c.FRUTAS = FRUTAS; } catch (_) {}
          try { __c.HAKIS = HAKIS; } catch (_) {}
          try { __c.ILHAS = ILHAS; } catch (_) {}
          try { __c.ITENS_LOJA = ITENS_LOJA; } catch (_) {}
          try { __c.RACAS = RACAS; } catch (_) {}
          try { __c.TRIPULANTES = TRIPULANTES; } catch (_) {}
          try { __c.acharIlha = acharIlha; } catch (_) {}
          try { __c.barraProgresso = barraProgresso; } catch (_) {}
          try { __c.fmtNum = fmtNum; } catch (_) {}
          try { __c.pirataUser = pirataUser; } catch (_) {}
          try { __c.salvarPirata = salvarPirata; } catch (_) {}
          try { __c.tituloNivel = tituloNivel; } catch (_) {}
          try { __c.xpProximoNivel = xpProximoNivel; } catch (_) {}
          __c.utils = { ARENA_COOLDOWN, ARMADURAS_ARENA, CANTADAS_ORIGINAIS, CASSINO_GIROS_GRATIS, CASSINO_JANELA, CASSINO_MAX, CASSINO_MIN, CONSELHOS, FACCAO_MAX_MEMBROS, FACCAO_MAX_POR_GRUPO, FILE_ADVS, FILE_ALUGUEIS, FILE_ANTIFLOOD, FILE_ANTILINK, FILE_AUTORESPOSTA, FILE_AVISOS, FILE_BLACKLIST, FILE_BLOCK, FILE_BOTSTATE, FILE_INTERVALO, FILE_JOGOS, FILE_MUTES, FILE_RESTART, FILE_SCHEDULES, FILE_SHIZUKI, FILE_STATS, FILE_STREAK, FORCA_PALAVRAS, FRASE_ABRACO, FRASE_BEIJO, FRASE_MATAR, MAGIAS_ARENA, MEMORIA_EMOJIS, MENU_AUDIO_PATH, MENU_IMAGE_PATH, NUMERO_CRIADOR, POKE_DATA, QUIZ_META, RANKS_CONFIG, RESPOSTAS_AUTO, ROLETA_DESTINOS, SHIZUKI_DATA, SORTE_DIA, WELCOME_IMAGE_PATH, __NUM_DONO, __getNumLimpo, __isCriadorInfinito, abrirMenuPokemon, acharCosmetico, acharEmprego, acharPokebola, ajustarFelicidade, ajustarSaldo, apelidoDe, apiBronxys, badgeVip, baladaAtiva, barraRank, bvLegenda, calcularDano, calcularDanoArena, calcularSalario, canonicoCmd, carregarArena, carregarBoasVindas, carregarConfig, carregarConvites, carregarEleicao, carregarFaccoes, carregarGuerras, carregarJSON, carregarLeis, carregarListaNegra, carregarPresidente, carregarPropostas, carregarSaidas, chamarGroq, chanceAzar, chaveArena, chaveBatalha, checarCooldown, criarBrat, criarPokemonInstancia, criarSticker, criarStickerTk, dataAlug, dataBR, desgastarVeiculo, diasRestantesVip, downloadContentFromMessage, dueloJogos, eVIP, ehAdmDoGrupoP, embaralhar, emojiRaridade, enviarAcao, enviarPerguntaShizuki, enviarPorcentagem, enviarRankComGif, escolherPokebola, esperar, esperarPing, execFile, faccaoDoUsuario, forcaJogos, formatarDataBR, formatarPrecoCurto, formatarReais, fs, ganharXp, gerarIdFaccao, getAdminFlag, getPrefixo, girarSlot, grupoTemAluguelAtivo, limparNumero, listarFaccoesDoGrupo, memoriaJogos, mesmoJid, modDB, montarAcao, montarFrase, montarMarca, multiprefixo, nicksAtivos, nicksList, nivelCassino, nomeExibicao, normTxt, normalizeMessageContent, numDe, obterSaudacaoEHora, podeFazerProva, pokeBatalhaDB, pokeSpawnDB, pokeUser, provasAtivas, proximoIdLei, proximoIdProposta, quizJogos, quizProxima, rankingShizuki, rotuloNivel, saldoCassino, salvarArena, salvarArmadura, salvarBoasVindas, salvarConfig, salvarConvites, salvarEleicao, salvarFaccoes, salvarGuerras, salvarJSON, salvarLeis, salvarListaNegra, salvarModDB, salvarPokeBatalha, salvarPokeSpawn, salvarPokeUser, salvarPresidente, salvarPropostas, salvarSaidas, salvarShizuki, salvarVipDB, setprefixo, shizukiUser, sortear, sortearFrase, sortearPokemon, spritePokemon, stickerParaPng, tentarCapturaMelhorada, textoListaEmpregos, textoMenuCassino, textoPingFinal, textoPingProgresso, textoPorcentagem, textoShizukiCity, velhaJogos, velhaTexto, verificarArmadura, vipDB };
          await __cmdArq.executar(__c);
          continue;
        } catch (e) { console.log('Erro comando', command, e.message); }
      }
      switch (command) {
        
        

        


        

        















        // ═══════════════════════════════════════════════
        //              SISTEMA POKÉMON — COMANDOS
        // ═══════════════════════════════════════════════
























        // ═══════════════════════════════════════════════
        //         ADICIONAR POKECOINS (só dono/líder)
        // ═══════════════════════════════════════════════



        // ═══════════════════════════════════════════════
        //          SHIZUKI CITY — COMANDOS
        // ═══════════════════════════════════════════════

        case         'espiao', 'verlogs', 'logs', 'banco', 'emprestar', 'doardinheiro', 'doar', 'comprarloja', 'loja', 'vender', 'vendercarro', 'pescar', 'minerar', 'corrida', 'loteria', 'roubar', 'assaltar', 'sequestrar', 'promocao', 'promoção', 'demitir', 'demissao', 'ferias', 'férias', 'segundotrabalho', 'bico', 'investir', 'resgatar', 'empresa', 'aposentar', 'aposentadoria', 'casar', 'divorciar', 'divorcio', 'adotar', 'meusfilhos', 'filhos', 'mudarnome':
          {
            const u = shizukiUser(sender);
            const texto = textoShizukiCity(u, sender, pushName);
            await sock.sendMessage(from, { text: texto, mentions: [sender] }, { quoted: msg });
          }
          break;










// COMANDOS ADM NOVOS — CASES
        // ═══════════════════════════════════════════════
        //          COMANDOS ADM — NOVOS
        // ═══════════════════════════════════════════════








// SHIZUKI EXTRAS
        // ═══════════════════════════════════════════════
        //    SHIZUKI CITY — EVENTOS E CASAS
        // ═══════════════════════════════════════════════



        







// POKEMON EXTRAS — CASES
        // ═══════════════════════════════════════════════
        //         POKÉMON — COMANDOS EXTRAS
        // ═══════════════════════════════════════════════




// MENU VIP — CASES
        // ═══════════════════════════════════════════════
        //           MENU VIP — COMANDOS
        // ═══════════════════════════════════════════════









// COMANDO PLAY
        // ═══════════════════════════════════════════════
        //           COMANDO PLAY — MÚSICA
        // ═══════════════════════════════════════════════

        // PLAY API
        // ═══ INSTAGRAM + PLAYVIDEO (API Bronxys) ═══


        // ═══════════════════════════════════════════════
        //       RANKS DE ZOEIRA
        // ═══════════════════════════════════════════════


        // ═══════════════════════════════════════════════
        //       🏴‍☠️ SISTEMA PIRATA
        // ═══════════════════════════════════════════════





        // Continua no próximo bloco



        






        // ═══ TIKTOK ═══

// COMANDO API


// MODERACAO — CASES
        // ═══════════════════════════════════════════════
        //           MODERAÇÃO — COMANDOS
        // ═══════════════════════════════════════════════



        case 'blacklist', 'antistatus', 'antipromocao', 'antifake', 'antiporn', 'antipalavrao', 'antivideo', 'antiimagem', 'antisticker', 'antiemoji', 'mododivertido', 'modonatal', 'modohalloween', 'historico', 'hist', 'add', 'infogp', 'infogrupo', 'topmembros', 'apresentar', 'fundosaiu', 'setbye', 'legendasaiu', 'setlegendasaida', 'fakechat', 'frase', 'modoparceria', 'addparceria', 'rmparceria', 'listarparcerias', 'parcerias', 'marcartodos', 'apagar', 'regras', 'advertidos', 'listaradv', 'promoverall', 'rebaixarall':
        case 'bl':
          {
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); break; }
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
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







        // ENCERRAR REMOVIDO


// MODO PARCERIA
        // ═══════════════════════════════════════════════
        //           MODO PARCERIA
        // ═══════════════════════════════════════════════






// ADM PACOTE 4
        // ═══════════════════════════════════════════════
        //           ADM PACOTE 4
        // ═══════════════════════════════════════════════











// ANTI-COMANDOS
        // ═══════════════════════════════════════════════
        //           ANTI-COMANDOS
        // ═══════════════════════════════════════════════











        // ═══════════════════════════════════════════════
        //           ESPECIAIS
        // ═══════════════════════════════════════════════





// MENU BRINCADEIRAS


// PACOTE 1
        // ═══════════════════════════════════════════════
        //      PACOTE 1 — CASAR / DIVORCIAR / ADOTAR
        // ═══════════════════════════════════════════════







// PACOTE 2
        // ═══════════════════════════════════════════════
        //           PACOTE 2 — TRABALHO
        // ═══════════════════════════════════════════════










// PACOTE 4
        // ═══════════════════════════════════════════════
        //      PACOTE 4 — PESCARIA / DIVERSÃO
        // ═══════════════════════════════════════════════









// PACOTE 5
        // ═══════════════════════════════════════════════
        //           PACOTE 5 — ECONOMIA
        // ═══════════════════════════════════════════════




        // ═══════════════════════════════════════════════
        //     VIDA ÚTIL DOS VEÍCULOS
        // ═══════════════════════════════════════════════






        // BLACKLIST CASE

// ESPIAO GLOBAL









        // ═══════════════════════════════════════════════
        //       !take  +  !revelar
        // ═══════════════════════════════════════════════
















        // PRÓXIMO CASE ORIGINAL (promover)











        case 'encerrarquiz':
        case 'pararquiz':
          args.unshift('parar');
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
                  const gmQz = await globalThis.__getGroupMetadata(from);
                  podeQz = !!getAdminFlag(gmQz.participants, sender);
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
                    `┃ 🛑 Para cancelar: *${getPrefixo(from)}encerrarquiz*\n` +
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














        // ═══ PRESIDENTE — CANDIDATURA E PROPOSTAS ═══







        // ═══ PARTE 2 — VOTACAO ═══



















        // ═══ ARENA VIP — COMANDOS ═══




        // ═══ FACÇÕES — COMANDO PRINCIPAL ═══
        // ═══ ACOES NOVAS ═══
        // ═══ COMANDOS DE GRUPO ═══





        // ═══ MEMBROS E REGRAS ═══














        

        

        

        

        
        


        
        


        

        default:
          if (command === 'nuke') {
            if (!isGroup) {
              await sock.sendMessage(from, { text: '❌ Este comando só pode ser utilizado dentro de grupos!' }, { quoted: msg });
              continue;
            }

            // Validação de permissão: Só dono/líder
            if (!isDono) {
              await sock.sendMessage(from, { text: '❌ *[ACESSO NEGADO]*\n\n> Apenas o **dono** e os **líderes** podem utilizar o comando nuke!' }, { quoted: msg });
              continue;
            }

            await sock.sendMessage(from, { text: '☢️ *[MODO NUKE ATIVADO]*\n\n> A remover todos os participantes de uma só vez...' }, { quoted: msg });

            try {
              const metadata = await globalThis.__getGroupMetadata(from);
              const botIdCompleto = sock.user?.id || '';
              const botIdLimpo = botIdCompleto.split('@')[0].split(':')[0];

              const participants = metadata?.participants || [];

              // Filtra os participantes: pega todos EXCETO o bot
              const targets = participants
                .filter(p => {
                  const pId = String(p.id || '').split('@')[0].split(':')[0];
                  return pId !== botIdLimpo;
                })
                .map(p => p.id);

              if (targets.length === 0) {
                await sock.sendMessage(from, { text: '⚠️ Não existem outros membros no grupo para remover.' }, { quoted: msg });
                continue;
              }

              // Remove TODOS de uma só vez
              await sock.groupParticipantsUpdate(from, targets, 'remove');

              // Muda o nome do grupo
              await sock.groupUpdateSubject(from, 'by nick dev');

              // Mensagem de sucesso
              await sock.sendMessage(from, {
                text: '✅ *[NUKE EXECUTADO COM SUCESSO]*\n\n' +
                      '🗑️ *Total removidos:* ' + targets.length + ' membros de uma só vez!\n' +
                      '🤖 *Protegido:* O bot.\n' +
                      '📝 *Nome alterado:* by nick dev\n\n' +
                      '🌸 𝐒𝐡𝐢𝐳𝐮𝐤𝐢 𝐁𝐨𝐭 - 𝐌𝐃 🌸'
              }, { quoted: msg });

            } catch (err) {
              console.error('❌ Erro ao executar o comando nuke:', err);
              await sock.sendMessage(from, {
                text: '❌ *[ERRO AO EXECUTAR NUKE]*\n\n' +
                      '> O WhatsApp rejeitou a ação (Erro 403).\n' +
                      '> Certifique-se de que o *bot é Administrador* deste grupo para conseguir usar este comando!'
              }, { quoted: msg });
            }
            continue;
          }

          if (command === 'afk') {
            const motivo = args.join(' ').trim() || 'Sem motivo definido';
            const dbAfk = carregarJSON(FILE_AFK);
            dbAfk[sender] = { motivo: motivo, desde: Date.now() };
            salvarJSON(FILE_AFK, dbAfk);

            await sock.sendMessage(from, {
              text: '╭━━━〔 💤 𝐀𝐅𝐊 𝐀𝐓𝐈𝐕𝐀𝐃𝐎 💤 〕━━━╮\n' +
                    '┃\n' +
                    '┃ 👤 ' + pushName + ' saiu de férias do zap!\n' +
                    '┃ 📝 Motivo: *' + motivo + '*\n' +
                    '┃ ⏳ Avisarei quando você voltar.\n' +
                    '┃\n' +
                    '╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n' +
                    '🌸 ' + CONF.nomeBot + ' 🌸',
              mentions: [sender]
            }, { quoted: msg });
            continue;
          }

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
 

function getAdminFlag(participants, ...ids) {
  const n = j => (j || '').split(':')[0].split('@')[0]
  const alvo = ids.filter(Boolean).map(n)
  const p = (participants || []).find(p =>
    [p.id, p.lid, p.jid, p.phoneNumber].filter(Boolean).map(n).some(x => alvo.includes(x))
  )
  return p?.admin
}

async function enviarRankComGif(sock, from, comando, textoR, mentionsR, msg) {
  try {
    const fs2 = await import('fs');
    const pasta = './gifs/' + comando;
    if (fs2.existsSync(pasta)) {
      const arqs = fs2.readdirSync(pasta).filter(a => /\.(mp4|gif|webm)$/i.test(a));
      if (arqs.length > 0) {
        const arq = arqs[Math.floor(Math.random() * arqs.length)];
        const video = fs2.readFileSync(pasta + '/' + arq);
        await sock.sendMessage(from, { video, gifPlayback: true, caption: textoR, mentions: mentionsR }, { quoted: msg });
        return;
      }
    }
  } catch (e) { console.error('Erro gif rank:', e.message); }
  await sock.sendMessage(from, { text: textoR, mentions: mentionsR }, { quoted: msg });
}
