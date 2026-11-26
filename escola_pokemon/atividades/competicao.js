import { getAluno, salvarEscola, carregarEscola, getParceiro } from '../escola_core.js';
import fs from 'fs';
const pokePath = './pokemon_users.json';

function getPokemon(sender, nome) {
    try { const db = JSON.parse(fs.readFileSync(pokePath, 'utf8')); return db[sender]?.time?.find(p => (p.nome || p.name).toLowerCase() === nome.toLowerCase()); } catch (e) { return null; }
}
function salvarPokemon(sender, poke) {
    try { const db = JSON.parse(fs.readFileSync(pokePath, 'utf8')); const idx = db[sender]?.time?.findIndex(p => (p.nome || p.name) === (poke.nome || poke.name)); if (idx !== -1) { db[sender].time[idx] = poke; fs.writeFileSync(pokePath, JSON.stringify(db, null, 2)); } } catch (e) {}
}

export async function competicao(sock, msg, from, sender) {
    const aluno = getAluno(sender);
    const parceiro = getParceiro(sender);
    if (!parceiro) return sock.sendMessage(from, { text: '❌ Você precisa de um parceiro!' }, { quoted: msg });

    const agora = Date.now();
    const dbEscola = carregarEscola();
    if (agora - (dbEscola[sender].ultimaCompeticao || 0) < 5 * 60 * 1000) {
        return sock.sendMessage(from, { text: '⏳ *Calma!* Espere 5min pra próxima competição.' }, { quoted: msg });
    }

    const poke = getPokemon(sender, parceiro);
    if (!poke) return sock.sendMessage(from, { text: '❌ Erro ao carregar seu Pokémon.' }, { quoted: msg });

    const nivelPoke = poke.nivel || 1;
    const nomesAdversarios = ['Pikachu', 'Charizard', 'Blastoise', 'Venusaur', 'Gengar', 'Dragonite', 'Machamp', 'Alakazam'];
    const nomeAdversario = nomesAdversarios[Math.floor(Math.random() * nomesAdversarios.length)];
    const nivelAdversario = Math.floor(Math.random() * 20) + 1;
    const venceu = nivelPoke >= nivelAdversario;

    if (venceu) {
        poke.xp = (poke.xp || 0) + 30;
        poke.felicidade = Math.min(100, (poke.felicidade || 50) + 10);
        salvarPokemon(sender, poke);
        dbEscola[sender].nota = Math.min(10, dbEscola[sender].nota + 0.5);
        dbEscola[sender].medo = Math.max(0, dbEscola[sender].medo - 5);
    } else {
        poke.felicidade = Math.min(100, (poke.felicidade || 50) - 5);
        salvarPokemon(sender, poke);
        dbEscola[sender].medo = Math.min(100, dbEscola[sender].medo + 10);
    }
    dbEscola[sender].ultimaCompeticao = agora;
    salvarEscola(dbEscola);

    await sock.sendMessage(from, {
        text: `╭━━━〔 🏆 𝐂𝐎𝐌𝐏𝐄𝐓𝐈𝐂̧𝐀̃𝐎 〕━━━╮\n┃\n┃ 🏟️ *Competição Escolar!*\n┃\n┃ 🐾 *Seu Pokémon:* ${poke.nome} (Nv.${nivelPoke})\n┃ 🤖 *Adversário:* ${nomeAdversario} (Nv.${nivelAdversario})\n┃\n┃ ${venceu ? '🎉 *Você venceu!*' : '😢 *Você perdeu...*'}\n┃\n┃ ${venceu ? '📈 *Nota:* +0.5\n┃ 😊 *Felicidade:* +10\n┃ 📉 *Medo:* -5%' : '😨 *Medo:* +10%\n┃ 💡 _Treine mais e tente de novo._'}\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━╯`
    }, { quoted: msg });
}
