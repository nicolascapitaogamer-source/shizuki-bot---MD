// Gerado de index.js (case 'editarmenu', linha 6270)
export default {
  nomes: ["editarmenu"],
  async executar(__x) {
    const { carregarJSON, salvarJSON, isDono, sock, from, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
    if (!isDono) {
      await sock.sendMessage(from, { text: '🚫 Apenas o Dono pode editar menus!' }, { quoted: msg });
      return
    }

    const menuAlvo = (args[0] || '').toLowerCase().trim();
    const dbMenus = carregarJSON('./menus_design.json');

    if (!menuAlvo) {
      await sock.sendMessage(from, {
        text: `╭━━━〔 ✏️ 𝐄𝐃𝐈𝐓𝐀𝐑 𝐌𝐄𝐍𝐔 〕━━━╮\n┃\n┃ 🛠️ *Como usar:*\n┃ ➜ {p}editarmenu <nome_do_menu>\n┃\n┃ 📋 *Menus disponíveis:*\n┃ ➜ menu\n┃ ➜ menuadm\n┃ ➜ menudono\n┃ ➜ menushizuki\n┃ ➜ menupokemon\n┃\n┃ 💡 *Exemplo:*\n┃ ➜ {p}editarmenu menuadm\n┃ _E depois MARQUE a mensagem com o novo texto._\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━╯`
      }, { quoted: msg });
      return
    }

    const ctxInfo = msg.message?.extendedTextMessage?.contextInfo
                 || msg.message?.imageMessage?.contextInfo
                 || msg.message?.videoMessage?.contextInfo
                 || msg.message?.documentMessage?.contextInfo
                 || msg.message?.audioMessage?.contextInfo
                 || null;

    const quotedMsg = ctxInfo?.quotedMessage || null;

    let novoDesign = '';

    if (quotedMsg) {
      novoDesign =
        quotedMsg.conversation ||
        quotedMsg.extendedTextMessage?.text ||
        quotedMsg.imageMessage?.caption ||
        quotedMsg.videoMessage?.caption ||
        quotedMsg.documentMessage?.caption ||
        quotedMsg.audioMessage?.caption ||
        '';
    }

    novoDesign = (novoDesign || '')
      .replace(/^\uFEFF/, '')
      .replace(/\r\n/g, '\n')
      .replace(/[\u200B-\u200D\u2060]/g, '')
      .trim();

    if (!quotedMsg) {
      await sock.sendMessage(from, {
        text: `╭━━━〔 ✏️ 𝐄𝐃𝐈𝐓𝐀𝐑 𝐌𝐄𝐍𝐔 〕━━━╮\n┃\n┃ 📝 *Menu selecionado:* ${menuAlvo}\n┃\n┃ ━━━━━━━━━━━━━━━━━━━━━━━━\n┃\n┃ ⚠️ *Você não marcou nenhuma mensagem!*\n┃\n┃ 💬 *Como fazer:*\n┃ 1️⃣ Escreva o novo design\n┃ 2️⃣ Envie no grupo\n┃ 3️⃣ MARQUE ele e rode:\n┃    {p}editarmenu ${menuAlvo}\n┃\n┃ 💡 _Use {p} para o prefixo._\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━╯`
      }, { quoted: msg });
      return
    }

    if (!novoDesign) {
      await sock.sendMessage(from, {
        text: `╭━━━〔 ✏️ 𝐄𝐃𝐈𝐓𝐀𝐑 𝐌𝐄𝐍𝐔 〕━━━╮\n┃\n┃ 📝 *Menu selecionado:* ${menuAlvo}\n┃\n┃ ━━━━━━━━━━━━━━━━━━━━━━━━\n┃\n┃ ❌ *A mensagem marcada não tem texto!*\n┃\n┃ 💬 _Marque uma mensagem de TEXTO_\n┃ _com o novo design._\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━╯`
      }, { quoted: msg });
      return
    }

    try {
      dbMenus[menuAlvo] = novoDesign;
      salvarJSON('./menus_design.json', dbMenus);

      const preview = novoDesign.split('\n').slice(0, 3).join('\n');
      const totalLinhas = novoDesign.split('\n').length;

      await sock.sendMessage(from, {
        text: `╭━━━〔 ✅ 𝐌𝐄𝐍𝐔 𝐀𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐃𝐎 〕━━━╮\n┃\n┃ 📝 *Menu:* ${menuAlvo}\n┃ 📊 *Linhas:* ${totalLinhas}\n┃ 🔄 *Status:* Salvo com sucesso!\n┃\n┃ ━━━━━━━━━━━━━━━━━━━━━━━━\n┃\n┃ 👁️ *Preview:*\n┃ ${preview.split('\n').join('\n┃ ')}\n┃\n┃ ━━━━━━━━━━━━━━━━━━━━━━━━\n┃\n┃ 💡 _Teste com ${menuAlvo === 'menu' ? '{p}menu' : '{p}' + menuAlvo}_\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━╯`
      }, { quoted: msg });
    } catch (err) {
      console.error('Erro ao editar menu:', err);
      await sock.sendMessage(from, { text: '❌ Erro ao salvar o design.' }, { quoted: msg });
    }
  }
  return
    }
  }
};
