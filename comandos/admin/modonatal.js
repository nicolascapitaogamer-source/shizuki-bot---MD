// Gerado de index.js (case 'modonatal', linha 9768)
export default {
  nomes: ["modonatal"],
  async executar(__x) {
    const { getAdminFlag, carregarJSON, salvarJSON, isGroup, from, sender, isDono, sock, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) return
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }
            const db = carregarJSON('./modonatal.json');
            db[from] = db[from] || {};
            const sub = (args[0] || '').toLowerCase();
            if (sub === 'on') db[from].ativo = true;
            else if (sub === 'off') db[from].ativo = false;
            else db[from].ativo = !db[from].ativo;
            salvarJSON('./modonatal.json', db);
            await sock.sendMessage(from, {
              text: db[from].ativo
                ? `╭━━━〔 🎄 𝐌𝐎𝐃𝐎 𝐍𝐀𝐓𝐀𝐋 〕━━━╮\n┃\n┃ ✅ *Ativado~* ✨\n┃\n┃ 🎄 Tema natalino ativo!\n┃ 🎅 Feliz Natal~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
                : `╭━━━〔 🎄 𝐌𝐎𝐃𝐎 𝐍𝐀𝐓𝐀𝐋 〕━━━╮\n┃\n┃ 💤 *Desativado~*\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
          }
          return
    }
  }
};
