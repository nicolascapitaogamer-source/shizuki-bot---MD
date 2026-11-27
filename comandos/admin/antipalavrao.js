// Gerado de index.js (case 'antipalavrao', linha 9638)
export default {
  nomes: ["antipalavrao"],
  async executar(__x) {
    const { getAdminFlag, carregarJSON, salvarJSON, isGroup, from, sender, isDono, sock, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) return
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }
            const db = carregarJSON('./antipalavrao.json');
            db[from] = db[from] || {};
            const sub = (args[0] || '').toLowerCase();
            if (sub === 'on') db[from].ativo = true;
            else if (sub === 'off') db[from].ativo = false;
            else db[from].ativo = !db[from].ativo;
            salvarJSON('./antipalavrao.json', db);
            await sock.sendMessage(from, {
              text: db[from].ativo
                ? `╭━━━〔 🤬 𝐀𝐍𝐓𝐈-𝐏𝐀𝐋𝐀𝐕𝐑𝐀̃𝐎 〕━━━╮\n┃\n┃ ✅ *Ativado~* ✨\n┃\n┃ 🤬 Palavrões serão *deletados*!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
                : `╭━━━〔 🤬 𝐀𝐍𝐓𝐈-𝐏𝐀𝐋𝐀𝐕𝐑𝐀̃𝐎 〕━━━╮\n┃\n┃ 💤 *Desativado~*\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
          }
          return
    }
  }
};
