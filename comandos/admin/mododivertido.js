// Gerado de index.js (case 'mododivertido', linha 9747)
export default {
  nomes: ["mododivertido"],
  async executar(__x) {
    const { getAdminFlag, carregarJSON, salvarJSON, isGroup, from, sender, isDono, sock, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) return
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }
            const db = carregarJSON('./mododivertido.json');
            db[from] = db[from] || {};
            const sub = (args[0] || '').toLowerCase();
            if (sub === 'on') db[from].ativo = true;
            else if (sub === 'off') db[from].ativo = false;
            else db[from].ativo = !db[from].ativo;
            salvarJSON('./mododivertido.json', db);
            await sock.sendMessage(from, {
              text: db[from].ativo
                ? `╭━━━〔 🎉 𝐌𝐎𝐃𝐎 𝐃𝐈𝐕𝐄𝐑𝐓𝐈𝐃𝐎 〕━━━╮\n┃\n┃ ✅ *Ativado~* ✨\n┃\n┃ 🎉 Reações divertidas ativas!\n┃ 🕊️ Se divirtam~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
                : `╭━━━〔 🎉 𝐌𝐎𝐃𝐎 𝐃𝐈𝐕𝐄𝐑𝐓𝐈𝐃𝐎 〕━━━╮\n┃\n┃ 💤 *Desativado~*\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
          }
          return
    }
  }
};
