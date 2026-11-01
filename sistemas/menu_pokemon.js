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
┃
┃ 🔙 *0* - Voltar ao Menu Principal
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;

const subEscola = `╭━━━〔 🏫 𝐄𝐒𝐂𝐎𝐋𝐀 𝐏𝐎𝐊𝐄́𝐌𝐎𝐍 〕━━━╮
┃
┃ 📖 *Bem-vindo ao campus!*
┃
┃ 🎓 *!escolapokemon* - Ficha do aluno
┃ 🧠 *!medo* - Analisar seu medo
┃ 📝 *!prova* - Fazer prova (Nota)
┃ ⏱️ *!intervalo* - Pausa (Eventos)
┃ 📚 *!biblioteca* - Estudar (+ Nota)
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
┃    ➜ Desafiar alguém
┃ 🥊 *!ataque1 / !ataque2 / !ataque3*
┃    ➜ Escolher ataque
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
┃ 🍖 *!alimentar <nome>* - Alimentar
┃ 🔄 *!trocarpokebola <id>* - Definir padrão
┃ 🐾 *!parceiro* - Ver status/amizade
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

async function abrirMenuPokemon(sock, from, msg, sender) {
    const enviado = await sock.sendMessage(from, { text: designPrincipal }, { quoted: msg });
    menuState.set(sender, { secao: 'principal', msgId: enviado.key.id });
}

async function tratarMenuPokemon(sock, msg, from, sender, text, stanzaId) {
    if (!menuState.has(sender)) return false;
    const estado = menuState.get(sender);
    
    if (stanzaId !== estado.msgId) return false;

    const t = text.trim();
    if (!['0','1','2','3','4','5'].includes(t)) return false;

    if (t === '0') {
        const enviado = await sock.sendMessage(from, { text: designPrincipal }, { quoted: msg });
        menuState.set(sender, { secao: 'principal', msgId: enviado.key.id });
        return true;
    }

    if (estado.secao === 'principal') {
        let novoMenu = '', novaSecao = '';
        if (t === '1') { novoMenu = subEscola; novaSecao = 'escola'; }
        if (t === '2') { novoMenu = subBatalhas; novaSecao = 'batalhas'; }
        if (t === '3') { novoMenu = subParceiro; novaSecao = 'parceiro'; }
        if (t === '4') { novoMenu = subMochila; novaSecao = 'mochila'; }
        if (t === '5') { novoMenu = subRanking; novaSecao = 'ranking'; }

        if (novoMenu) {
            const enviado = await sock.sendMessage(from, { text: novoMenu }, { quoted: msg });
            menuState.set(sender, { secao: novaSecao, msgId: enviado.key.id });
            return true;
        }
    } else {
        const enviado = await sock.sendMessage(from, { text: designPrincipal }, { quoted: msg });
        menuState.set(sender, { secao: 'principal', msgId: enviado.key.id });
        return true;
    }
    return false;
}

module.exports = { abrirMenuPokemon, tratarMenuPokemon };
