// Gerado de index.js (case 'antifake', linha 9596)
export default {
  nomes: ["antifake"],
  async executar(__x) {
    const { getAdminFlag, carregarJSON, salvarJSON, isGroup, from, sender, isDono, sock, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) return
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }
            const db = carregarJSON('./antifake.json');
            db[from] = db[from] || {};
            const sub = (args[0] || '').toLowerCase();
            if (sub === 'on') db[from].ativo = true;
            else if (sub === 'off') db[from].ativo = false;
            else db[from].ativo = !db[from].ativo;
            salvarJSON('./antifake.json', db);
            await sock.sendMessage(from, {
              text: db[from].ativo
                ? `╭━━━〔 🚫 𝐀𝐍𝐓𝐈-𝐅𝐀𝐊𝐄 〕━━━╮\n┃\n┃ ✅ *Ativado~* ✨\n┃\n┃ 🚫 Números fake serão\n┃    *removidos* na entrada!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
                : `╭━━━〔 🚫 𝐀𝐍𝐓𝐈-𝐅𝐀𝐊𝐄 〕━━━╮\n┃\n┃ 💤 *Desativado~*\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
          }
          return
    }
  }
};
