import { getAluno, salvarEscola, carregarEscola } from './escola_core.js';
import fs from 'fs';

const pokePath = './pokemon_users.json';

// ============ MINHA MISSÃO ============
export async function minhaMissao(sock, msg, from, sender) {
    const db = carregarEscola();
    const aluno = db[sender];

    if (!aluno || !aluno.missaoAtiva || !aluno.missaoAtiva.aceita) {
        await sock.sendMessage(from, { text: '📜 *Você não tem nenhuma missão ativa no momento!* \n\nUse *!missao* para receber uma nova missão.' }, { quoted: msg });
        return;
    }

    const m = aluno.missaoAtiva;
    const infos = {
        facil: { emoji: '🟢', nome: 'Fácil' },
        normal: { emoji: '🔵', nome: 'Normal' },
        dificil: { emoji: '🟣', nome: 'Difícil' },
        lendario: { emoji: '🟡', nome: 'Lendária' }
    };
    const info = infos[m.dificuldade] || infos.facil;

    await sock.sendMessage(from, {
        text: `╭━━━〔 📜 𝐒𝐔𝐀 𝐌𝐈𝐒𝐒𝐀̃𝐎 〕━━━╮\n┃\n┃ 🌟 *${m.titulo}*\n┃ ${info.emoji} *Dificuldade:* ${info.nome}\n┃ 🏷️ *Categoria:* ${m.categoria}\n┃\n┃ 🎯 *Objetivo:*\n┃ ${m.objetivo}\n┃\n┃ ⚔️ *Boss:* HP ${m.hp} / Dano ${m.dano}\n┃\n┃ 💡 _Use !missao para ir pra luta._\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━╯`
    }, { quoted: msg });
}

// ============ ABANDONAR MISSÃO ============
export async function abandonarMissao(sock, msg, from, sender) {
    const db = carregarEscola();
    const aluno = db[sender];

    if (!aluno || !aluno.missaoAtiva || !aluno.missaoAtiva.aceita) {
        await sock.sendMessage(from, { text: '❌ Você não tem nenhuma missão ativa para abandonar.' }, { quoted: msg });
        return;
    }

    delete db[sender].missaoAtiva;
    salvarEscola(db);

    await sock.sendMessage(from, {
        text: `╭━━━〔 🏳️ 𝐌𝐈𝐒𝐒𝐀̃𝐎 𝐀𝐁𝐀𝐍𝐃𝐎𝐍𝐀𝐃𝐀 〕━━━╮\n┃\n┃ 😔 Você abandonou a missão atual.\n┃\n┃ 💡 _Use !missao para tentar_ \n┃ _uma nova aventura._\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━╯`
    }, { quoted: msg });
}

// ============ HISTÓRICO DE MISSÕES ============
export async function historicoMissoes(sock, msg, from, sender) {
    const db = carregarEscola();
    const aluno = db[sender];

    if (!aluno || !aluno.historico || aluno.historico.length === 0) {
        await sock.sendMessage(from, { text: '📜 *Você ainda não completou nenhuma missão!* \n\nUse *!missao* para começar sua jornada.' }, { quoted: msg });
        return;
    }

    let texto = `╭━━━〔 📚 𝐇𝐈𝐒𝐓𝐎́𝐑𝐈𝐂𝐎 〕━━━╮\n┃\n`;
    
    aluno.historico.slice(-10).forEach((m, i) => {
        const infos = {
            facil: { emoji: '🟢', nome: 'Fácil' },
            normal: { emoji: '🔵', nome: 'Normal' },
            dificil: { emoji: '🟣', nome: 'Difícil' },
            lendario: { emoji: '🟡', nome: 'Lendária' }
        };
        const info = infos[m.dificuldade] || infos.facil;
        texto += `┃ ${i + 1}️⃣ *${m.titulo}*\n`;
        texto += `┃    ${info.emoji} ${info.nome} | ${m.data}\n┃\n`;
    });

    texto += `┃ 💡 _Total de missões: ${aluno.historico.length}_\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━╯`;

    await sock.sendMessage(from, { text: texto }, { quoted: msg });
}
