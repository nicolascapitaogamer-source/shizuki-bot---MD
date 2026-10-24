import fs from 'fs';
const FILE_PIRATA = './pirata_users.json';

function carregarJSON(caminho) {
  if (!fs.existsSync(caminho)) fs.writeFileSync(caminho, JSON.stringify({}));
  return JSON.parse(fs.readFileSync(caminho, 'utf-8'));
}
function salvarJSON(caminho, data) {
  fs.writeFileSync(caminho, JSON.stringify(data, null, 2));
}

const ILHAS = [
  { id: 'eastblue', nome: 'East Blue', emoji: '🌊', nivelMin: 1, xpBase: 50, ouroBase: 30, inimigos: ['Pirata Novato', 'Caranguejo Gigante', 'Peixe-Espada'], boss: 'Buggy' },
  { id: 'alabasta', nome: 'Alabasta', emoji: '🏜️', nivelMin: 10, xpBase: 250, ouroBase: 150, inimigos: ['Escorpião Rei', 'Nômade Selvagem', 'Múmia Marinha'], boss: 'Crocodile' },
  { id: 'skypiea', nome: 'Skypiea', emoji: '☁️', nivelMin: 20, xpBase: 500, ouroBase: 300, inimigos: ['Guerreiro Alado', 'Anjo Caído', 'Ave Trovão'], boss: 'Enel' },
  { id: 'water7', nome: 'Water 7', emoji: '🚢', nivelMin: 30, xpBase: 800, ouroBase: 500, inimigos: ['Carpinteiro Sombrio', 'Assassino da CP9', 'Lobo Marinho'], boss: 'Rob Lucci' },
  { id: 'enieslobby', nome: 'Enies Lobby', emoji: '🏛️', nivelMin: 40, xpBase: 1500, ouroBase: 900, inimigos: ['Juiz da CP9', 'Guarda do Governo', 'Agente Secreto'], boss: 'Spandam' },
  { id: 'thriller', nome: 'Thriller Bark', emoji: '👻', nivelMin: 50, xpBase: 3000, ouroBase: 2000, inimigos: ['Zumbi', 'Fantasma', 'Cavaleiro Sombrio'], boss: 'Moria' },
  { id: 'marineford', nome: 'Marineford', emoji: '⚔️', nivelMin: 60, xpBase: 6000, ouroBase: 4000, inimigos: ['Marinho Fuzileiro', 'Gigante da Marinha', 'Vice-Almirante'], boss: 'Akainu' },
  { id: 'wano', nome: 'Wano', emoji: '🏯', nivelMin: 80, xpBase: 10000, ouroBase: 7000, inimigos: ['Samurai', 'Oni', 'Ninja de Wano'], boss: 'Kaido' },
  { id: 'egghead', nome: 'Egghead', emoji: '🧪', nivelMin: 100, xpBase: 20000, ouroBase: 15000, inimigos: ['Cientista Louco', 'Robô Gigante', 'Serpente Cibernética'], boss: 'Vegapunk' },
  { id: 'laughtale', nome: 'Laugh Tale', emoji: '🏴‍☠️', nivelMin: 150, xpBase: 50000, ouroBase: 50000, inimigos: ['Pirata Lendário', 'Fantasma do Mar', 'Guardião Supremo'], boss: '𝐒𝐇𝐈𝐙𝐔𝐊𝐈𝐏𝐈𝐄𝐂𝐄' }
];

const ITENS_LOJA = {
  espada_madeira: { nome: 'Espada de Madeira', emoji: '🗡️', preco: 100, tipo: 'arma', forca: 5 },
  espada_ferro: { nome: 'Espada de Ferro', emoji: '🗡️', preco: 500, tipo: 'arma', forca: 15 },
  katana: { nome: 'Katana Afiada', emoji: '⚔️', preco: 2000, tipo: 'arma', forca: 35 },
  lamina_lunar: { nome: 'Lâmina Lunar', emoji: '🌙', preco: 8000, tipo: 'arma', forca: 70 },
  armadura_couro: { nome: 'Armadura de Couro', emoji: '🛡️', preco: 200, tipo: 'armadura', defesa: 10 },
  armadura_aco: { nome: 'Armadura de Aço', emoji: '🛡️', preco: 1500, tipo: 'armadura', defesa: 30 },
  armadura_dragao: { nome: 'Armadura de Dragão', emoji: '🐉', preco: 10000, tipo: 'armadura', defesa: 80 },
  comida: { nome: 'Comida', emoji: '🍖', preco: 50, tipo: 'consumivel', hp: 30 },
  pocao: { nome: 'Poção de Cura', emoji: '🧪', preco: 150, tipo: 'consumivel', hp: 100 }
};

const BARCOS = {
  dinghy: { nome: 'Barco a Remo', emoji: '🛶', preco: 500, energia: 5, ilhas: 1, desc: 'Simples e básico.' },
  merry: { nome: 'Going Merry', emoji: '🐏', preco: 2000, energia: 10, ilhas: 3, desc: 'O primeiro navio dos Chapéus de Palha.' },
  sunny: { nome: 'Thousand Sunny', emoji: '🦁', preco: 8000, energia: 20, ilhas: 6, desc: 'O navio de Franky, feito de madeira de Adam.' },
  polar_tang: { nome: 'Polar Tang', emoji: '🐻‍❄️', preco: 12000, energia: 25, ilhas: 6, desc: 'O submarino do Trafalgar Law.' },
  moby_dick: { nome: 'Moby Dick', emoji: '🐋', preco: 25000, energia: 35, ilhas: 8, desc: 'O navio do Barba Branca.' },
  red_force: { nome: 'Red Force', emoji: '🐉', preco: 30000, energia: 40, ilhas: 8, desc: 'O navio do Shanks.' },
  queen_mama: { nome: 'Queen Mama Chanter', emoji: '🍰', preco: 40000, energia: 45, ilhas: 9, desc: 'O navio da Big Mom.' },
  beast_pirate: { nome: 'Navio das Feras', emoji: '🐗', preco: 50000, energia: 50, ilhas: 9, desc: 'O navio de Kaido.' },
  oro_jackson: { nome: 'Oro Jackson', emoji: '👑', preco: 80000, energia: 60, ilhas: 10, desc: 'O navio do Rei dos Piratas, Gol D. Roger.' },
  marine_battleship: { nome: 'Navio de Guerra da Marinha', emoji: '⚓', preco: 60000, energia: 55, ilhas: 10, desc: 'Um navio de batalha da Marinha.' },
  buster_call: { nome: 'Buster Call', emoji: '💥', preco: 100000, energia: 70, ilhas: 10, desc: 'A frota de destruição do Governo Mundial.' }
};

const FRUTAS = [
  { id: 'gomu', nome: 'Gomu Gomu no Mi', emoji: '🍇', bonus: { forca: 30, hp: 20 }, raridade: 'comum', chance: 20 },
  { id: 'bari', nome: 'Bari Bari no Mi', emoji: '🕸️', bonus: { defesa: 30 }, raridade: 'comum', chance: 20 },
  { id: 'ito', nome: 'Ito Ito no Mi', emoji: '🧵', bonus: { forca: 25, combate: 20 }, raridade: 'comum', chance: 20 },
  { id: 'mera', nome: 'Mera Mera no Mi', emoji: '🔥', bonus: { forca: 50 }, raridade: 'incomum', chance: 10 },
  { id: 'hie', nome: 'Hie Hie no Mi', emoji: '❄️', bonus: { defesa: 40 }, raridade: 'incomum', chance: 10 },
  { id: 'moku', nome: 'Moku Moku no Mi', emoji: '💨', bonus: { defesa: 30, hp: 15 }, raridade: 'incomum', chance: 10 },
  { id: 'goro', nome: 'Goro Goro no Mi', emoji: '⚡', bonus: { forca: 45, defesa: 10 }, raridade: 'raro', chance: 4 },
  { id: 'yami', nome: 'Yami Yami no Mi', emoji: '🌑', bonus: { forca: 35, combate: 25 }, raridade: 'raro', chance: 4 },
  { id: 'gura', nome: 'Gura Gura no Mi', emoji: '🪨', bonus: { forca: 70 }, raridade: 'lendaria', chance: 1 },
  { id: 'uo', nome: 'Uo Uo no Mi', emoji: '🐉', bonus: { forca: 60 }, raridade: 'lendaria', chance: 1 }
];

const HAKIS = [
  { id: 'armamento', nome: 'Haki do Armamento', emoji: '🛡️', bonus: { forca: 30 }, chance: 60 },
  { id: 'observacao', nome: 'Haki da Observação', emoji: '👁️', bonus: { defesa: 30 }, chance: 35 },
  { id: 'rei', nome: 'Haki do Rei', emoji: '👑', bonus: { forca: 50, defesa: 50, combate: 50 }, chance: 5 }
];

const RACAS = [
  { id: 'humano', nome: 'Humano', emoji: '🧑', bonus: { forca: 20, defesa: 20, hp: 20, combate: 20 } },
  { id: 'gigante', nome: 'Gigante', emoji: '🧌', bonus: { forca: 50, defesa: -20, hp: 0, combate: 0 } },
  { id: 'tritao', nome: 'Tritão', emoji: '🧜', bonus: { forca: 0, defesa: -20, hp: 50, combate: 0 } },
  { id: 'anjo', nome: 'Anjo', emoji: '👼', bonus: { forca: -20, defesa: 0, hp: 0, combate: 30 } },
  { id: 'milk', nome: 'Milk', emoji: '🥛', bonus: { forca: 0, defesa: 30, hp: 20, combate: 0 } }
];

const TRIPULANTES = [
  // --- CHAPÉUS DE PALHA ---
  { id: 'luffy', nome: 'Luffy', emoji: '👑', funcao: 'Capitão', nivel: 50, forca: 250, chance: 1, custo: 100000 },
  { id: 'zoro', nome: 'Zoro', emoji: '🗡️', funcao: 'Espadachim', nivel: 35, forca: 150, chance: 3, custo: 50000 },
  { id: 'nami', nome: 'Nami', emoji: '🧭', funcao: 'Navegadora', nivel: 15, forca: 40, chance: 40, custo: 5000 },
  { id: 'usopp', nome: 'Usopp', emoji: '🎯', funcao: 'Atirador', nivel: 12, forca: 30, chance: 50, custo: 3000 },
  { id: 'sanji', nome: 'Sanji', emoji: '🍳', funcao: 'Cozinheiro', nivel: 30, forca: 120, chance: 10, custo: 25000 },
  { id: 'chopper', nome: 'Chopper', emoji: '🩺', funcao: 'Médico', nivel: 18, forca: 60, chance: 30, custo: 8000 },
  { id: 'robin', nome: 'Robin', emoji: '📚', funcao: 'Arqueóloga', nivel: 28, forca: 110, chance: 12, custo: 20000 },
  { id: 'franky', nome: 'Franky', emoji: '🔧', funcao: 'Carpinteiro', nivel: 25, forca: 100, chance: 15, custo: 15000 },
  { id: 'brook', nome: 'Brook', emoji: '🎻', funcao: 'Músico', nivel: 26, forca: 105, chance: 15, custo: 15000 },
  { id: 'jinbe', nome: 'Jinbe', emoji: '🐋', funcao: 'Timoneiro', nivel: 40, forca: 180, chance: 5, custo: 60000 },

  // --- SUPERNOVAS ---
  { id: 'law', nome: 'Trafalgar Law', emoji: '⚕️', funcao: 'Cirurgião', nivel: 38, forca: 160, chance: 6, custo: 50000 },
  { id: 'kid', nome: 'Eustass Kid', emoji: '🧲', funcao: 'Capitão', nivel: 38, forca: 160, chance: 6, custo: 50000 },
  { id: 'killer', nome: 'Killer', emoji: '🔪', funcao: 'Combatente', nivel: 30, forca: 120, chance: 10, custo: 25000 },
  { id: 'bege', nome: 'Capone Bege', emoji: '🏰', funcao: 'Mafioso', nivel: 32, forca: 130, chance: 8, custo: 30000 },
  { id: 'bonney', nome: 'Jewelry Bonney', emoji: '🍔', funcao: 'Pirata', nivel: 28, forca: 110, chance: 12, custo: 20000 },
  { id: 'apoo', nome: 'Scratchmen Apoo', emoji: '🎵', funcao: 'Músico', nivel: 30, forca: 120, chance: 10, custo: 25000 },
  { id: 'hawkins', nome: 'Basil Hawkins', emoji: '🃏', funcao: 'Vidente', nivel: 32, forca: 130, chance: 8, custo: 30000 },
  { id: 'drake', nome: 'X Drake', emoji: '🦖', funcao: 'Espião', nivel: 34, forca: 140, chance: 7, custo: 35000 },
  { id: 'urouge', nome: 'Urouge', emoji: '🦍', funcao: 'Monge', nivel: 33, forca: 135, chance: 8, custo: 30000 },

  // --- YONKOUS E COMANDANTES ---
  { id: 'shanks', nome: 'Shanks', emoji: '🗡️', funcao: 'Yonkou', nivel: 55, forca: 280, chance: 1, custo: 150000 },
  { id: 'newgate', nome: 'Barba Branca', emoji: '🌊', funcao: 'Yonkou', nivel: 60, forca: 300, chance: 1, custo: 200000 },
  { id: 'kaido', nome: 'Kaido', emoji: '🐉', funcao: 'Yonkou', nivel: 60, forca: 320, chance: 1, custo: 250000 },
  { id: 'bigmom', nome: 'Big Mom', emoji: '🍰', funcao: 'Yonkou', nivel: 58, forca: 300, chance: 1, custo: 200000 },
  { id: 'teach', nome: 'Barba Negra', emoji: '🌑', funcao: 'Yonkou', nivel: 55, forca: 270, chance: 1, custo: 150000 },
  { id: 'beckman', nome: 'Benn Beckman', emoji: '🚬', funcao: 'Imediato', nivel: 45, forca: 210, chance: 2, custo: 80000 },
  { id: 'marco', nome: 'Marco', emoji: '🔥', funcao: 'Comandante', nivel: 42, forca: 200, chance: 3, custo: 70000 },
  { id: 'katakuri', nome: 'Katakuri', emoji: '🍩', funcao: 'Comandante', nivel: 48, forca: 230, chance: 2, custo: 90000 },
  { id: 'king', nome: 'King', emoji: '🦖', funcao: 'Comandante', nivel: 48, forca: 230, chance: 2, custo: 90000 },

  // --- OUTROS VILÕES E PERSONAGENS ---
  { id: 'ace', nome: 'Portgas D. Ace', emoji: '🔥', funcao: 'Capitão', nivel: 40, forca: 180, chance: 4, custo: 60000 },
  { id: 'sabo', nome: 'Sabo', emoji: '🔥', funcao: 'Revolucionário', nivel: 38, forca: 170, chance: 5, custo: 50000 },
  { id: 'mihawk', nome: 'Mihawk', emoji: '⚔️', funcao: 'Espadachim', nivel: 52, forca: 260, chance: 1, custo: 120000 },
  { id: 'crocodile', nome: 'Crocodile', emoji: '🐊', funcao: 'Shichibukai', nivel: 35, forca: 150, chance: 6, custo: 40000 },
  { id: 'doflamingo', nome: 'Doflamingo', emoji: '🕸️', funcao: 'Shichibukai', nivel: 42, forca: 190, chance: 3, custo: 70000 },
  { id: 'moria', nome: 'Moria', emoji: '👻', funcao: 'Shichibukai', nivel: 34, forca: 140, chance: 7, custo: 35000 },
  { id: 'rayleigh', nome: 'Rayleigh', emoji: '🌟', funcao: 'Vice-Capitão', nivel: 50, forca: 240, chance: 2, custo: 100000 },
  { id: 'garp', nome: 'Garp', emoji: '🥊', funcao: 'Marinha', nivel: 55, forca: 280, chance: 1, custo: 150000 },
  { id: 'buggy', nome: 'Buggy', emoji: '🤡', funcao: 'Shichibukai', nivel: 20, forca: 80, chance: 25, custo: 10000 }
];

function xpProximoNivel(nivel) { return Math.floor(100 * Math.pow(nivel, 1.8)); }
function tituloNivel(nivel) {
  if (nivel >= 150) return '👑 𝐑𝐄𝐈 𝐃𝐎𝐒 𝐌𝐀𝐑𝐄𝐒';
  if (nivel >= 100) return '👑 Yonkou';
  if (nivel >= 50) return '💀 Supernova';
  if (nivel >= 30) return '⚔️ Corsário';
  if (nivel >= 15) return '🏴‍☠️ Capitão';
  if (nivel >= 5) return '⚔️ Pirata';
  return '🐣 Novato';
}
function pirataUser(jid) {
  const db = carregarJSON(FILE_PIRATA);
  if (!db[jid]) {
    db[jid] = { nome: 'Pirata Anônimo', nivel: 1, xp: 0, ouro: 500, hp: 100, hpMax: 100, forca: 10, combate: 5, defesa: 5, energia: 100, energiaMax: 100, reputacao: 0, ilhaAtual: 'eastblue', tripulacao: [], inventario: [], armaEquipada: null, armaduraEquipada: null, fruta: null, haki: null, raca: null, barco: null, bossesDerrotados: [], criadoEm: Date.now() };
    salvarJSON(FILE_PIRATA, db);
  }
  return db[jid];
}
function salvarPirata(jid, dados) { const db = carregarJSON(FILE_PIRATA); db[jid] = dados; salvarJSON(FILE_PIRATA, db); }
function calcularDanoPirata(atacante, defensor) { const variacao = 0.8 + Math.random() * 0.4; const base = (atacante.forca * 2) - defensor.defesa; return Math.max(5, Math.floor(Math.max(5, base) * variacao)); }
function acharIlha(id) { return ILHAS.find(i => i.id === id); }
function fmtNum(n) { if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'; if (n >= 1000) return (n / 1000).toFixed(1) + 'K'; return String(n); }
function barraProgresso(atual, max) { const pct = Math.max(0, Math.min(100, Math.floor((atual / max) * 100))); const cheios = Math.round(pct / 10); return '▓'.repeat(cheios) + '░'.repeat(10 - cheios) + ' ' + pct + '%'; }

export { FILE_PIRATA, ILHAS, ITENS_LOJA, BARCOS, FRUTAS, HAKIS, RACAS, TRIPULANTES, xpProximoNivel, tituloNivel, pirataUser, salvarPirata, calcularDanoPirata, acharIlha, fmtNum, barraProgresso };
