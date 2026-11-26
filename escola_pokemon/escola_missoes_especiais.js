import { getAluno, salvarEscola, carregarEscola } from './escola_core.js';
import fs from 'fs';

const pokePath = './pokemon_users.json';

// ============ MISSÃO DIÁRIA ============
export async function missaoDiaria(sock, msg, from, sender) {
    const db = carregarEscola();
    const aluno = db[sender];

    const hoje = new Date().toLocaleDateString('pt-BR');
    if (aluno.ultimaMissaoDiaria === hoje) {
        await sock.sendMessage(from, { text: `╭━━━〔 📅 𝐌𝐈𝐒𝐒𝐀̃𝐎 𝐃𝐈𝐀́𝐑𝐈𝐀 〕━━━╮\n┃\n┃ ⏳ *Você já fez a missão diária hoje!*\n┃\n┃ 💡 _Volte amanhã para uma nova missão._\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━╯` }, { quoted: msg });
        return;
    }

    const missoesDiarias = [
        {
            titulo: "O Ovo Misterioso",
            categoria: "🥚 Mistério",
            historia: "Você encontrou um ovo brilhante abandonado perto do Centro Pokémon. A Enfermeira Joy disse que ele pode chocar a qualquer momento. Mas há algo estranho: o ovo pulsa com uma energia que nenhum Pokémon conhecido tem.",
            objetivo: "Cuidar do ovo até ele chocar.",
            recompensa: { pokecoins: 500, xp: 100, itens: ["berry"] }
        },
        {
            titulo: "O Treinador Perdido",
            categoria: "🔎 Investigação",
            historia: "Um treinador novato se perdeu na floresta e não consegue achar o caminho de volta. O celular dele está sem bateria e ele está com o Pokémon ferido. Você é a única esperança.",
            objetivo: "Encontrar o treinador e levá-lo de volta à cidade.",
            recompensa: { pokecoins: 300, xp: 80, itens: ["pocao"] }
        },
        {
            titulo: "A Briga dos Lendários",
            categoria: "⚔️ Batalha",
            historia: "Dois Pokémon lendários estão brigando no céu, causando uma tempestade. Você precisa intervir e acalmá-los antes que a cidade seja destruída.",
            objetivo: "Intervir na briga e acalmar os lendários.",
            recompensa: { pokecoins: 800, xp: 200, itens: ["great"] }
        }
    ];

    const missao = missoesDiarias[Math.floor(Math.random() * missoesDiarias.length)];

    const enviado = await sock.sendMessage(from, {
        text: `╭━━━〔 📅 𝐌𝐈𝐒𝐒𝐀̃𝐎 𝐃𝐈𝐀́𝐑𝐈𝐀 〕━━━╮\n┃\n┃ 🟢 *Dificuldade:* Fácil\n┃ 🏷️ *Categoria:* ${missao.categoria}\n┃\n┃ 🌟 *${missao.titulo}*\n┃\n┃ ${missao.historia}\n┃\n┃ 🎯 *Objetivo:* ${missao.objetivo}\n┃\n┃ 🎁 *Recompensa:*\n┃ 💰 ${missao.recompensa.pokecoins} PokéCoins\n┃ ⭐ ${missao.recompensa.xp} XP\n┃ 🎒 ${missao.recompensa.itens.join(', ')}\n┃\n┃ ✍️ *Marque esta mensagem e responda:*\n┃ ✅ *aceitar* ou ❌ *recusar*\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
    }, { quoted: msg });

    db[sender].missaoAtiva = {
        ...missao,
        dificuldade: 'facil',
        hp: 100,
        dano: 15,
        msgId: enviado.key.id,
        aceita: false,
        nomeBoss: "Onix Furioso",
        diaria: true
    };
    salvarEscola(db);
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
