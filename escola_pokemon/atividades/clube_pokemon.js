import { getAluno, salvarEscola, carregarEscola, getParceiro } from '../escola_core.js';
import fs from 'fs';
const pokePath = './pokemon_users.json';

function getPokemon(sender, nome) {
    try { const db = JSON.parse(fs.readFileSync(pokePath, 'utf8')); return db[sender]?.time?.find(p => (p.nome || p.name).toLowerCase() === nome.toLowerCase()); } catch (e) { return null; }
}
function salvarPokemon(sender, poke) {
    try { const db = JSON.parse(fs.readFileSync(pokePath, 'utf8')); const idx = db[sender]?.time?.findIndex(p => (p.nome || p.name) === (poke.nome || poke.name)); if (idx !== -1) { db[sender].time[idx] = poke; fs.writeFileSync(pokePath, JSON.stringify(db, null, 2)); } } catch (e) {}
}

export async function clubePokemon(sock, msg, from, sender) {
    const aluno = getAluno(sender);
    const parceiro = getParceiro(sender);
    const poke = parceiro ? getPokemon(sender, parceiro) : null;

    const eventos = [
        { msg: 'Você trocou dicas com um aluno e aprimorou seu Pokémon!', xp: 15, fel: 10, nota: 0.5 },
        { msg: 'Vocês fizeram uma apresentação sobre Pokémon lendários. Sucesso!', xp: 10, fel: 15, nota: 0.3 },
        { msg: 'Um aluno te desafiou pra uma batalha amistosa. Você ganhou!', xp: 20, fel: 5, nota: 0.2 },
        { msg: 'A reunião foi cancelada. Que pena!', xp: 0, fel: 0, nota: 0 }
    ];
    const ev = eventos[Math.floor(Math.random() * eventos.length)];

    if (ev.xp > 0 && poke) { poke.xp = (poke.xp || 0) + ev.xp; poke.felicidade = Math.min(100, (poke.felicidade || 50) + ev.fel); salvarPokemon(sender, poke); }
    if (ev.nota > 0) { const dbEscola = carregarEscola(); dbEscola[sender].nota = Math.min(10, dbEscola[sender].nota + ev.nota); salvarEscola(dbEscola); }

    await sock.sendMessage(from, {
        text: `╭━━━〔 🎒 𝐂𝐋𝐔𝐁𝐄 𝐏𝐎𝐊𝐄́𝐌𝐎𝐍 〕━━━╮\n┃\n┃ 🏫 *Reunião do Clube Pokémon!*\n┃\n┃ 🗣️ *Evento:* ${ev.msg}\n┃\n┃ ${ev.xp ? `🐾 *XP Ganho:* +${ev.xp}\n┃ ` : ''}${ev.fel ? `😊 *Felicidade:* +${ev.fel}\n┃ ` : ''}${ev.nota ? `📈 *Nota:* +${ev.nota}\n┃ ` : ''}\n╰━━━━━━━━━━━━━━━━━━━━━━━╯`
    }, { quoted: msg });
}
