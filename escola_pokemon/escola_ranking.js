import { getAluno, salvarEscola, carregarEscola, getParceiro } from './escola_core.js';
import fs from 'fs';

const pokePath = './pokemon_users.json';

// ============ RANKING DE TREINADORES ============
const rankGrupoPath = './pokemon_ranking_grupos.json';

export async function rankPokemon(sock, msg, from, sender) {
    try {
        if (!fs.existsSync(rankGrupoPath)) {
            fs.writeFileSync(rankGrupoPath, '{}');
        }
        const dbRank = JSON.parse(fs.readFileSync(rankGrupoPath, 'utf8'));
        const grupo = dbRank[from] || {};

        const treinadores = Object.entries(grupo).map(([jid, u]) => ({
            jid,
            capturas: u.capturas || 0,
            vitorias: u.vitorias || 0
        }));

        if (treinadores.length === 0) {
            await sock.sendMessage(from, { text: '❌ Nenhum treinador registrado neste grupo ainda. Use !capturar pra começar!' }, { quoted: msg });
            return;
        }

        treinadores.sort((a, b) => (b.vitorias - a.vitorias) || (b.capturas - a.capturas));
        const top10 = treinadores.slice(0, 10);
        const mencoes = top10.map(t => t.jid);

        const p1 = top10[0], p2 = top10[1], p3 = top10[2];
        const resto = top10.slice(3);

        let texto = `╭━━━〔 🏆 𝐑𝐀𝐍𝐊𝐈𝐍𝐆 𝐃𝐎 𝐆𝐑𝐔𝐏𝐎 〕━━━╮\n┃\n`;
        
        if (p1) texto += `┃ 🥇 *1º Lugar:* @${p1.jid.split('@')[0]}\n┃    🏆 ${p1.vitorias} vitórias · 🎯 ${p1.capturas} capturas\n┃\n`;
        if (p2) texto += `┃ 🥈 *2º Lugar:* @${p2.jid.split('@')[0]}\n┃    🏆 ${p2.vitorias} vitórias · 🎯 ${p2.capturas} capturas\n┃\n`;
        if (p3) texto += `┃ 🥉 *3º Lugar:* @${p3.jid.split('@')[0]}\n┃    🏆 ${p3.vitorias} vitórias · 🎯 ${p3.capturas} capturas\n┃\n`;

        if (resto.length > 0) {
            texto += `┃ ━━━━━━━━━━━━━━━━━━━━━━━━\n┃\n┃ 📊 *Outros treinadores:*\n┃\n`;
            resto.forEach((t, i) => {
                texto += `┃ ${i + 4}️⃣ @${t.jid.split('@')[0]} - ${t.vitorias}V / ${t.capturas}C\n`;
            });
        }

        texto += `┃\n┃ 💡 _Continue batalhando pra subir!_\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━╯`;

        await sock.sendMessage(from, { text: texto, mentions: mencoes }, { quoted: msg });
    } catch (e) {
        await sock.sendMessage(from, { text: '❌ Erro ao gerar o ranking.' }, { quoted: msg });
    }
}

// ============ SPAWN LENDÁRIO ============
export async function lendarios(sock, msg, from, sender) {
    const raridades = {
        lendario: { emoji: '🟡', chance: '2%' },
        mitico: { emoji: '🟣', chance: '0.5%' }
    };
    await sock.sendMessage(from, {
        text: `╭━━━〔 🌟 𝐒𝐏𝐀𝐖𝐍 𝐋𝐄𝐍𝐃𝐀́𝐑𝐈𝐎 〕━━━╮\n┃\n┃ 🟡 *Lendários:* ${raridades.lendario.chance}\n┃ 🟣 *Míticos:* ${raridades.mitico.chance}\n┃\n┃ 💡 _Os lendários aparecem no spawn_\n┃ _automático quando o ADM ativa._\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━╯`
    }, { quoted: msg });
}

// ============ EVENTOS ATIVOS ============
export async function eventoPokemon(sock, msg, from, sender) {
    // Aqui a gente pode ler de um arquivo de eventos ativos (se existir)
    const temEvento = false; // Placeholder
    if (!temEvento) {
        await sock.sendMessage(from, {
            text: `╭━━━〔 🎉 𝐄𝐕𝐄𝐍𝐓𝐎𝐒 〕━━━╮\n┃\n┃ 😴 *Nenhum evento ativo agora.*\n┃\n┃ 💡 _Fique de olho no grupo!_\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯`
        }, { quoted: msg });
    }
}

// ============ PRÊMIOS ============
export async function premios(sock, msg, from, sender) {
    const aluno = getAluno(sender);
    await sock.sendMessage(from, {
        text: `╭━━━〔 🎁 𝐏𝐑𝐄̂𝐌𝐈𝐎𝐒 〕━━━╮\n┃\n┃ 🏅 *Suas conquistas:*\n┃\n┃ 📊 Nota na escola: ${aluno.nota.toFixed(1)}\n┃ 🧠 Medo: ${aluno.medo}%\n┃\n┃ 💡 _Complete missões pra ganhar prêmios!_\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯`
    }, { quoted: msg });
}
