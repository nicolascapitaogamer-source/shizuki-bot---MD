import { getAluno, salvarEscola, carregarEscola } from './escola_core.js';
import fs from 'fs';

const pokePath = './pokemon_users.json';

// ============ 1. INICIAR EXCLUSÃO ============
export async function iniciarExclusao(sock, msg, from, sender) {
    const dbPoke = JSON.parse(fs.readFileSync(pokePath, 'utf8'));
    const user = dbPoke[sender];
    
    if (!user || !user.time || user.time.length === 0) {
        await sock.sendMessage(from, { text: '❌ Você não tem nenhum Pokémon pra soltar!' }, { quoted: msg });
        return;
    }

    let lista = '';
    user.time.forEach((p, i) => {
        const rarEmoji = p.raridade === 'lendario' ? '🟡' : p.raridade === 'raro' ? '🔵' : p.raridade === 'incomum' ? '🟢' : '⚪';
        lista += `┃ ${i + 1}️⃣ ${rarEmoji} *${p.nome}* (Nv.${p.nivel || 1})\n`;
    });

    const enviado = await sock.sendMessage(from, {
        text: `╭━━━〔 🍃 𝐄𝐗𝐂𝐋𝐔𝐈𝐑 𝐏𝐎𝐊𝐄́𝐌𝐎𝐍 〕━━━╮\n┃\n┃ 🌿 *Qual Pokémon você quer soltar* \n┃ *na floresta?*\n┃\n${lista}┃\n┃ ⚠️ *Isso é permanente! O Pokémon* \n┃ *não voltará mais.*\n┃\n┃ ✍️ *Marque esta mensagem e responda* \n┃ *com o número do Pokémon.*\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━╯`
    }, { quoted: msg });

    // Salva o ID da mensagem no JSON da escola
    const db = carregarEscola();
    db[sender].excluindoPokemon = { msgIdLista: enviado.key.id };
    salvarEscola(db);
}

// ============ 2. PROCESSAR ESCOLHA DO POKÉMON ============
export async function processarExclusao(sock, msg, from, sender, text, stanzaId) {
    const db = carregarEscola();
    const aluno = db[sender];
    
    if (!aluno || !aluno.excluindoPokemon || !aluno.excluindoPokemon.msgIdLista) return false;
    if (aluno.excluindoPokemon.msgIdLista !== stanzaId) return false;

    const num = parseInt(text.trim());
    const dbPoke = JSON.parse(fs.readFileSync(pokePath, 'utf8'));
    const user = dbPoke[sender];
    
    if (isNaN(num) || num < 1 || num > user.time.length) {
        await sock.sendMessage(from, { text: '❌ Número inválido! Marque a mensagem e responda com o número do Pokémon.' }, { quoted: msg });
        return true;
    }

    const pokemon = user.time[num - 1];

    // Salva o Pokémon escolhido
    db[sender].excluindoPokemon.pokemonIndex = num - 1;
    db[sender].excluindoPokemon.pokemonNome = pokemon.nome;
    db[sender].excluindoPokemon.msgIdLista = null; // Limpa a lista

    // Manda a confirmação
    const enviado = await sock.sendMessage(from, {
        text: `╭━━━〔 ⚠️ 𝐂𝐎𝐍𝐅𝐈𝐑𝐌𝐀𝐑 〕━━━╮\n┃\n┃ 🐾 *Pokémon:* ${pokemon.nome} (Nv.${pokemon.nivel || 1})\n┃\n┃ ❓ *Tem certeza que quer soltar* \n┃ *o ${pokemon.nome} na floresta?*\n┃\n┃ ✅ *sim* — Soltar na floresta\n┃ ❌ *não* — Cancelar\n┃\n┃ ✍️ *Marque esta mensagem e responda* \n┃ *sim ou não.*\n┃\n╰━━━━━━━━━━━━━━━━━━━━━╯`
    }, { quoted: msg });

    db[sender].excluindoPokemon.msgIdConfirmacao = enviado.key.id;
    salvarEscola(db);
    return true;
}

// ============ 3. CONFIRMAR EXCLUSÃO ============
export async function confirmarExclusao(sock, msg, from, sender, text, stanzaId) {
    const db = carregarEscola();
    const aluno = db[sender];
    
    if (!aluno || !aluno.excluindoPokemon || !aluno.excluindoPokemon.msgIdConfirmacao) return false;
    if (aluno.excluindoPokemon.msgIdConfirmacao !== stanzaId) return false;

    const resposta = text.trim().toLowerCase();
    if (resposta !== 'sim' && resposta !== 'não' && resposta !== 'nao') {
        await sock.sendMessage(from, { text: '❌ Responda *sim* ou *não*.' }, { quoted: msg });
        return true;
    }

    if (resposta === 'não' || resposta === 'nao') {
        delete db[sender].excluindoPokemon;
        salvarEscola(db);
        await sock.sendMessage(from, { text: '✅ *Exclusão cancelada.* O Pokémon continua com você.' }, { quoted: msg });
        return true;
    }

    // Confirma a exclusão
    const dbPoke = JSON.parse(fs.readFileSync(pokePath, 'utf8'));
    const user = dbPoke[sender];
    const idx = aluno.excluindoPokemon.pokemonIndex;
    const pokemon = user.time[idx];

    // Remove o Pokémon
    user.time.splice(idx, 1);
    fs.writeFileSync(pokePath, JSON.stringify(dbPoke, null, 2));

    delete db[sender].excluindoPokemon;
    salvarEscola(db);

    await sock.sendMessage(from, {
        text: `╭━━━〔 🍃 𝐏𝐎𝐊𝐄́𝐌𝐎𝐍 𝐒𝐎𝐋𝐓𝐎 〕━━━╮\n┃\n┃ 🌿 *${pokemon.nome} foi solto na floresta!*\n┃\n┃ 🐾 _Ele olhou pra você uma última_ \n┃ _vez antes de desaparecer nas árvores._\n┃\n┃ 💜 _"Adeus, amigo..."_\n┃\n┃ 💡 _Você pode capturar outro Pokémon_ \n┃ _quando aparecer._\n┃\n╰━━━━━━━━━━━━━━━━━━━━━╯`
    }, { quoted: msg });
    return true;
}
