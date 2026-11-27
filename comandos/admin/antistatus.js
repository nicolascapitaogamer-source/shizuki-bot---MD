// Gerado de index.js (case 'antistatus', linha 9554)
export default {
  nomes: ["antistatus"],
  async executar(__x) {
    const { getAdminFlag, carregarJSON, salvarJSON, isGroup, from, sender, isDono, sock, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) return
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }
            const db = carregarJSON('./antistatus.json');
            db[from] = db[from] || {};
            const sub = (args[0] || '').toLowerCase();
            if (sub === 'on') db[from].ativo = true;
            else if (sub === 'off') db[from].ativo = false;
            else db[from].ativo = !db[from].ativo;
            salvarJSON('./antistatus.json', db);
            await sock.sendMessage(from, {
              text: db[from].ativo
                ? `╭━━━〔 📸 𝐀𝐍𝐓𝐈-𝐒𝐓𝐀𝐓𝐔𝐒 〕━━━╮\n┃\n┃ ✅ *ATIVADO!*\n┃\n┃ 🚨 Quem postar status marcando\n┃ o grupo será *banido* e o\n┃ post será *apagado*.\n┃\n┃ 🛡️ Admins e líderes ficam livres.\n┃\n╰━━━━━━━━━━━━━━━━━━⬣`
                : `╭━━━〔 📸 𝐀𝐍𝐓𝐈-𝐒𝐓𝐀𝐓𝐔𝐒 〕━━━╮\n┃\n┃ ❌ *DESATIVADO!*\n┃\n┃ 📸 Status liberados neste grupo.\n┃\n╰━━━━━━━━━━━━━━━━━━⬣`
            }, { quoted: msg });
          }
          return
    }
  }
};
