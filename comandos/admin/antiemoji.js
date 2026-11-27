// Gerado de index.js (case 'antiemoji', linha 9722)
export default {
  nomes: ["antiemoji"],
  async executar(__x) {
    const { getAdminFlag, carregarJSON, salvarJSON, isGroup, from, sender, isDono, sock, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) return
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }
            const db = carregarJSON('./antiemoji.json');
            db[from] = db[from] || {};
            const sub = (args[0] || '').toLowerCase();
            if (sub === 'on') db[from].ativo = true;
            else if (sub === 'off') db[from].ativo = false;
            else db[from].ativo = !db[from].ativo;
            salvarJSON('./antiemoji.json', db);
            await sock.sendMessage(from, {
              text: db[from].ativo
                ? `╭━━━〔 😀 𝐀𝐍𝐓𝐈-𝐄𝐌𝐎𝐉𝐈 〕━━━╮\n┃\n┃ ✅ *Ativado~* ✨\n┃\n┃ 😀 Emojis serão *deletados*!\n┃\n┃ 💜 Só admins podem usar~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
                : `╭━━━〔 😀 𝐀𝐍𝐓𝐈-𝐄𝐌𝐎𝐉𝐈 〕━━━╮\n┃\n┃ 💤 *Desativado~*\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
          }
          return
    }
  }
};
