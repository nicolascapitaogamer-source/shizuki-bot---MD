// Gerado de index.js (case 'antiimagem', linha 9680)
export default {
  nomes: ["antiimagem"],
  async executar(__x) {
    const { getAdminFlag, carregarJSON, salvarJSON, isGroup, from, sender, isDono, sock, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) return
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }
            const db = carregarJSON('./antiimagem.json');
            db[from] = db[from] || {};
            const sub = (args[0] || '').toLowerCase();
            if (sub === 'on') db[from].ativo = true;
            else if (sub === 'off') db[from].ativo = false;
            else db[from].ativo = !db[from].ativo;
            salvarJSON('./antiimagem.json', db);
            await sock.sendMessage(from, {
              text: db[from].ativo
                ? `╭━━━〔 🖼️ 𝐀𝐍𝐓𝐈-𝐈𝐌𝐀𝐆𝐄𝐌 〕━━━╮\n┃\n┃ ✅ *Ativado~* ✨\n┃\n┃ 🖼️ Imagens serão *deletadas*!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
                : `╭━━━〔 🖼️ 𝐀𝐍𝐓𝐈-𝐈𝐌𝐀𝐆𝐄𝐌 〕━━━╮\n┃\n┃ 💤 *Desativado~*\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
          }
          return
    }
  }
};
