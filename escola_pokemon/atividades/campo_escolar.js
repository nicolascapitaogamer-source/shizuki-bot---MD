import { getAluno, salvarEscola, carregarEscola, getParceiro } from '../escola_core.js';
import fs from 'fs';
const pokePath = './pokemon_users.json';

function getPokemon(sender, nome) {
    try { const db = JSON.parse(fs.readFileSync(pokePath, 'utf8')); return db[sender]?.time?.find(p => (p.nome || p.name).toLowerCase() === nome.toLowerCase()); } catch (e) { return null; }
}
function salvarPokemon(sender, poke) {
    try { const db = JSON.parse(fs.readFileSync(pokePath, 'utf8')); const idx = db[sender]?.time?.findIndex(p => (p.nome || p.name) === (poke.nome || poke.name)); if (idx !== -1) { db[sender].time[idx] = poke; fs.writeFileSync(pokePath, JSON.stringify(db, null, 2)); } } catch (e) {}
}

export async function campoEscolar(sock, msg, from, sender) {
    const aluno = getAluno(sender);
    const parceiro = getParceiro(sender);
    if (!parceiro) return sock.sendMessage(from, { text: '❌ Você precisa de um parceiro!' }, { quoted: msg });

    const poke = getPokemon(sender, parceiro);
    const eventos = [
        { msg: 'Vocês fizeram uma fogueira e cantaram com outros alunos!', fel: 15, xp: 10, medo: 0 },
        { msg: 'Você ajudou o professor a montar as barracas e ganhou XP!', xp: 25, fel: 5, medo: 0 },
        { msg: 'Você se perdeu na floresta e ficou com medo.', medo: 10, xp: 0, fel: 0 },
        { msg: 'A noite foi tranquila e vocês dormiram bem.', fel: 10, xp: 5, medo: 0 }
    ];
    const ev = eventos[Math.floor(Math.random() * eventos.length)];

    if (ev.xp > 0 && poke) { poke.xp = (poke.xp || 0) + ev.xp; salvarPokemon(sender, poke); }
    if (ev.fel > 0 && poke) { poke.felicidade = Math.min(100, (poke.felicidade || 50) + ev.fel); salvarPokemon(sender, poke); }
    if (ev.medo > 0) { const dbEscola = carregarEscola(); dbEscola[sender].medo = Math.min(100, dbEscola[sender].medo + ev.medo); salvarEscola(dbEscola); }

    await sock.sendMessage(from, {
        text: `╭━━━〔 ⛺ 𝐂𝐀𝐌𝐏𝐎 𝐄𝐒𝐂𝐎𝐋𝐀𝐑 〕━━━╮\n┃\n┃ 🌙 *Noite no acampamento...*\n┃\n┃ 🔥 *Evento:* ${ev.msg}\n┃\n┃ ${ev.xp ? `📈 *XP:* +${ev.xp}\n┃ ` : ''}${ev.fel ? `😊 *Felicidade:* +${ev.fel}\n┃ ` : ''}${ev.medo ? `😨 *Medo:* +${ev.medo}%\n┃ ` : ''}\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯`
    }, { quoted: msg });
}
