const menuState = new Map();

const designPrincipal = `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
┃    🎮 𝐂𝐄𝐍𝐓𝐑𝐀𝐋 𝐏𝐎𝐊𝐄́𝐌𝐎𝐍 🎮    ┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
┃
┃ Escolha uma seção marcando esta 
┃ mensagem e respondendo o número:
┃
┃ 1️⃣ 🏫 *Escola Pokémon*
┃ 2️⃣ ⚔️ *Batalhas & Capturas*
┃ 3️⃣ 🐾 *Meu Parceiro*
┃ 4️⃣ 🎒 *Mochila & Itens*
┃ 5️⃣ 🏆 *Ranking & Porcentagens*
┃ 6️⃣ 👹 *Missões & Bosses*
┃ 7️⃣ 🏫 *Atividades Escolares*
┃
┃ 🔙 *0* - Voltar ao Menu Principal
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;

const subEscola = `╭━━━〔 🏫 𝐄𝐒𝐂𝐎𝐋𝐀 𝐏𝐎𝐊𝐄́𝐌𝐎𝐍 〕━━━╮
┃
┃ 📖 *Bem-vindo ao campus!*
┃
┃ 🎓 *!escolapokemon* ➜ Ficha do aluno
┃ 🧠 *!medo* ➜ Analisar seu medo
┃ 📝 *!prova* ➜ Fazer prova (Nota)
┃ ⏱️ *!recreio* ➜ Pausa (Eventos)
┃ 📚 *!biblioteca* ➜ Estudar (+ Nota)
┃ 🎓 *!aulapokemon* ➜ Escolher aulas
┃
┃ 🔙 *0* - Voltar ao Menu Principal
┃
╰━━━━━━━━━━━━━━━━━━━━━━━╯`;

const subBatalhas = `╭━━━〔 ⚔️ 𝐁𝐀𝐓𝐀𝐋𝐇𝐀𝐒 & 𝐂𝐀𝐏𝐓𝐔𝐑𝐀𝐒 〕━━━╮
┃
┃ 🌿 *A vida selvagem te aguarda!*
┃
┃ 🎯 *!capturar <nome>* - Capturar
┃ ⚔️ *!batalhapokemon @pessoa [pos]*
┃ 🥊 *!ataque1 / !ataque2 / !ataque3*
┃ 🏳️ *!desistir* - Fugir da batalha
┃
┃ 🔒 *ADMs:*
┃ ✅ *!ativarspawn*
┃ ❌ *!desativarspawn*
┃
┃ 🔙 *0* - Voltar ao Menu Principal
┃
╰━━━━━━━━━━━━━━━━━━━━━━━╯`;

const subParceiro = `╭━━━〔 🐾 𝐌𝐄𝐔 𝐏𝐀𝐑𝐂𝐄𝐈𝐑𝐎 〕━━━╮
┃
┃ 💜 *O elo entre vocês é especial.*
┃
┃ 🐾 *!parceiro* - Ver status/amizade
┃ 🍖 *!alimentar <nome>* - Alimentar
┃ 🔄 *!trocarpokebola <id>* - Definir padrão
┃
┃ 🔙 *0* - Voltar ao Menu Principal
┃
╰━━━━━━━━━━━━━━━━━━━━━━━╯`;

const subMochila = `╭━━━〔 🎒 𝐌𝐎𝐂𝐇𝐈𝐋𝐀 & 𝐈𝐓𝐄𝐍𝐒 〕━━━╮
┃
┃ 🧃 *Tudo o que você precisa.*
┃
┃ 🎒 *!pokemon* - Ver seu perfil
┃ 🏪 *!lojapokebola* - Comprar pokébolas
┃ 🛒 *!lojapokemon* - Comprar comidas
┃ 📊 *!porcentagem* - Chance de aparição
┃
┃ 🔙 *0* - Voltar ao Menu Principal
┃
╰━━━━━━━━━━━━━━━━━━━━━━━╯`;

const subRanking = `╭━━━〔 🏆 𝐑𝐀𝐍𝐊𝐈𝐍𝐆 & 𝐏𝐎𝐑𝐂𝐄𝐍𝐓𝐀𝐆𝐄𝐍𝐒 〕━━━╮
┃
┃ 🥇 *Quem é o melhor treinador?*
┃
┃ 📊 *!rankpokemon* - Top 10 treinadores
┃ 🌟 *!lendarios* - Ver spawn lendário
┃ 🎉 *!eventopokemon* - Eventos ativos
┃ 🎁 *!premios* - Resgatar recompensas
┃
┃ 🔙 *0* - Voltar ao Menu Principal
┃
╰━━━━━━━━━━━━━━━━━━━━━━━╯`;

const subMissoes = `╭━━━〔 👹 𝐌𝐈𝐒𝐒𝐎̃𝐄𝐒 & 𝐁𝐎𝐒𝐒𝐄𝐒 〕━━━╮
┃
┃ 🌋 *Enfrente os Pokémons "Fora da Lei"!*
┃
┃ 📜 *MISSÕES:*
┃ 🎯 *!missao*
┃ 📅 *!missaodiaria*
┃
┃ 📖 *DIÁRIO:*
┃ 📋 *!minhamissao*
┃ ❌ *!abandonarmissao*
┃ 📚 *!historicomissoes*
┃
┃ ⚔️ *COMBATE:*
┃ 👹 *!missao* (medo < 10%)
┃ 🐾 *!parceiro*
┃
┃ 🔙 *0* - Voltar ao Menu Principal
┃
╰━━━━━━━━━━━━━━━━━━━━━━━╯`;

const subAtividades = `╭━━━〔 🏫 𝐀𝐓𝐈𝐕𝐈𝐃𝐀𝐃𝐄𝐒 〕━━━╮
┃
┃ 📖 *Atividades da escola!*
┃
┃ 🏋️ *!treinoescolar* - Treinar parceiro
┃ 🚌 *!excursao* - Excursão
┃ 🎒 *!clubepokemon* - Clube Pokémon
┃ ⛺ *!campoescolar* - Acampamento
┃ 🏆 *!competicao* - Competição
┃
┃ 🔙 *0* - Voltar ao Menu Principal
┃
╰━━━━━━━━━━━━━━━━━━━━━━━╯`;

async function abrirMenuPokemon(sock, from, msg, sender) {
    const enviado = await sock.sendMessage(from, { text: designPrincipal }, { quoted: msg });
    menuState.set(getNumeroLimpo(sender), { secao: 'principal', msgId: enviado.key.id });
}

function getNumeroLimpo(id) {
  return String(id || '').split('@')[0];
}

async function tratarMenuPokemon(sock, msg, from, sender, text, stanzaId) {
    if (!menuState.has(getNumeroLimpo(sender))) return false;
    const estado = menuState.get(getNumeroLimpo(sender));
    
    if (stanzaId !== estado.msgId) return false;

    const t = text.trim();
    if (!['0','1','2','3','4','5','6','7'].includes(t)) return false;

    if (t === '0') {
        const enviado = await sock.sendMessage(from, { text: designPrincipal }, { quoted: msg });
        menuState.set(getNumeroLimpo(sender), { secao: 'principal', msgId: enviado.key.id });
        return true;
    }

    if (estado.secao === 'principal') {
        let novoMenu = '', novaSecao = '';
        if (t === '1') { novoMenu = subEscola; novaSecao = 'escola'; }
        if (t === '2') { novoMenu = subBatalhas; novaSecao = 'batalhas'; }
        if (t === '3') { novoMenu = subParceiro; novaSecao = 'parceiro'; }
        if (t === '4') { novoMenu = subMochila; novaSecao = 'mochila'; }
        if (t === '5') { novoMenu = subRanking; novaSecao = 'ranking'; }
        if (t === '6') { novoMenu = subMissoes; novaSecao = 'missoes'; }
        if (t === '7') { novoMenu = subAtividades; novaSecao = 'atividades'; }

        if (novoMenu) {
            const enviado = await sock.sendMessage(from, { text: novoMenu }, { quoted: msg });
            menuState.set(getNumeroLimpo(sender), { secao: novaSecao, msgId: enviado.key.id });
            return true;
        }
    } else {
        const enviado = await sock.sendMessage(from, { text: designPrincipal }, { quoted: msg });
        menuState.set(getNumeroLimpo(sender), { secao: 'principal', msgId: enviado.key.id });
        return true;
    }
    return false;
}

export { abrirMenuPokemon, tratarMenuPokemon };
