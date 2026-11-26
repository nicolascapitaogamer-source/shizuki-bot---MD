import { getAluno, salvarEscola, carregarEscola, getParceiro } from '../escola_core.js';
import fs from 'fs';
const pokePath = './pokemon_users.json';

function getPokemon(sender, nome) {
    try {
        if (!fs.existsSync(pokePath)) return null;
        const db = JSON.parse(fs.readFileSync(pokePath, 'utf8'));
        const user = db[sender];
        if (!user || !user.time) return null;
        return user.time.find(p => (p.nome || p.name).toLowerCase() === nome.toLowerCase());
    } catch (e) { return null; }
}
function salvarPokemon(sender, poke) {
    try {
        const db = JSON.parse(fs.readFileSync(pokePath, 'utf8'));
        const user = db[sender];
        if (!user || !user.time) return;
        const idx = user.time.findIndex(p => (p.nome || p.name) === (poke.nome || poke.name));
        if (idx !== -1) { user.time[idx] = poke; fs.writeFileSync(pokePath, JSON.stringify(db, null, 2)); }
    } catch (e) {}
}

export async function treinoEscolar(sock, msg, from, sender) {
    const aluno = getAluno(sender);
    const parceiro = getParceiro(sender);
    if (!parceiro) return sock.sendMessage(from, { text: '❌ Você precisa de um parceiro!' }, { quoted: msg });

    const agora = Date.now();
    const dbEscola = carregarEscola();
    if (agora - (dbEscola[sender].ultimoTreino || 0) < 10 * 60 * 1000) {
        return sock.sendMessage(from, { text: '⏳ *Calma!* Espere 10 min pra treinar de novo.' }, { quoted: msg });
    }

    const poke = getPokemon(sender, parceiro);
    if (!poke) return sock.sendMessage(from, { text: '❌ Erro ao carregar seu Pokémon.' }, { quoted: msg });

    const eventos = [
        { msg: 'Você treinou duro e encontrou um Pokémon selvagem no pátio!', xp: 25, fel: 5, medo: 1 },
        { msg: 'O treino foi intenso, mas seu Pokémon ficou exausto.', xp: 15, fel: 0, medo: 0 },
        { msg: 'Você ajudou um aluno a treinar e ganhou XP extra!', xp: 30, fel: 10, medo: 1 },
        { msg: 'O treino foi cancelado por causa da chuva.', xp: 0, fel: 0, medo: 0 }
    ];
    const ev = eventos[Math.floor(Math.random() * eventos.length)];

    if (ev.xp > 0) {
        poke.xp = (poke.xp || 0) + ev.xp;
        poke.felicidade = Math.min(100, (poke.felicidade || 50) + ev.fel);
        salvarPokemon(sender, poke);
        dbEscola[sender].ultimoTreino = agora;
        dbEscola[sender].medo = Math.max(0, dbEscola[sender].medo - ev.medo);
        salvarEscola(dbEscola);
    }

    await sock.sendMessage(from, {
        text: `╭━━━〔 🏫 𝐓𝐑𝐄𝐈𝐍𝐎 𝐄𝐒𝐂𝐎𝐋𝐀𝐑 〕━━━╮\n┃\n┃ 🧑‍🏫 *Professor Kukui:*\n┃ "Vamos ver do que seu parceiro é capaz!"\n┃\n┃ 🐾 *Parceiro:* ${poke.nome}\n┃\n┃ ⚡ *Evento:* ${ev.msg}\n┃\n┃ 📈 *XP Ganho:* +${ev.xp}\n┃ 😊 *Felicidade:* +${ev.fel}\n┃ 😨 *Medo:* -${ev.medo}%\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
    }, { quoted: msg });
}
