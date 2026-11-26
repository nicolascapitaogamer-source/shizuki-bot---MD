import { getAluno, salvarEscola, carregarEscola, getParceiro } from '../escola_core.js';
import fs from 'fs';
const pokePath = './pokemon_users.json';

function getPokemon(sender, nome) {
    try { const db = JSON.parse(fs.readFileSync(pokePath, 'utf8')); return db[sender]?.time?.find(p => (p.nome || p.name).toLowerCase() === nome.toLowerCase()); } catch (e) { return null; }
}
function salvarPokemon(sender, poke) {
    try { const db = JSON.parse(fs.readFileSync(pokePath, 'utf8')); const idx = db[sender]?.time?.findIndex(p => (p.nome || p.name) === (poke.nome || poke.name)); if (idx !== -1) { db[sender].time[idx] = poke; fs.writeFileSync(pokePath, JSON.stringify(db, null, 2)); } } catch (e) {}
}

export async function excursao(sock, msg, from, sender) {
    const aluno = getAluno(sender);
    const parceiro = getParceiro(sender);
    if (!parceiro) return sock.sendMessage(from, { text: '❌ Você precisa de um parceiro!' }, { quoted: msg });

    const agora = Date.now();
    const dbEscola = carregarEscola();
    if (agora - (dbEscola[sender].ultimaExcursao || 0) < 30 * 60 * 1000) {
        return sock.sendMessage(from, { text: '⏳ *Calma!* Espere 30 min pra próxima excursão.' }, { quoted: msg });
    }

    const poke = getPokemon(sender, parceiro);
    const eventos = [
        { msg: 'Vocês encontraram um Pokémon raro escondido nas árvores!', xp: 30, item: 'berry', medo: 0 },
        { msg: 'Vocês se perderam, mas encontraram um item raro.', xp: 10, item: 'oran', medo: 5 },
        { msg: 'Um Pokémon selvagem atacou! Vocês fugiram.', xp: 5, medo: 10 },
        { msg: 'A excursão foi tranquila. Vocês voltaram sem novidades.', xp: 0, medo: 0 }
    ];
    const ev = eventos[Math.floor(Math.random() * eventos.length)];

    if (ev.xp > 0 && poke) { poke.xp = (poke.xp || 0) + ev.xp; salvarPokemon(sender, poke); }
    if (ev.medo > 0) { dbEscola[sender].medo = Math.min(100, dbEscola[sender].medo + ev.medo); }
    if (ev.item) {
        const db = JSON.parse(fs.readFileSync(pokePath, 'utf8'));
        db[sender].cosmeticos[ev.item] = (db[sender].cosmeticos[ev.item] || 0) + 1;
        fs.writeFileSync(pokePath, JSON.stringify(db, null, 2));
    }
    dbEscola[sender].ultimaExcursao = agora;
    salvarEscola(dbEscola);

    await sock.sendMessage(from, {
        text: `╭━━━〔 🌿 𝐄𝐗𝐂𝐔𝐑𝐒𝐀̃𝐎 〕━━━╮\n┃\n┃ 🚌 *Vocês foram para a Floresta Verde!*\n┃\n┃ 🐾 *Parceiro:* ${parceiro}\n┃\n┃ ✨ *Evento:* ${ev.msg}\n┃\n┃ ${ev.xp ? `📈 *XP Ganho:* +${ev.xp}\n┃ ` : ''}${ev.item ? `🎁 *Item encontrado:* ${ev.item}\n┃ ` : ''}${ev.medo ? `😨 *Medo:* +${ev.medo}%\n┃ ` : ''}\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯`
    }, { quoted: msg });
}
