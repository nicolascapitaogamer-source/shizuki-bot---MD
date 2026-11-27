// Gerado de index.js (case 'antiflood', linha 8939)
export default {
  nomes: ["antiflood"],
  async executar(__x) {
    const { getAdminFlag, modDB, FILE_ANTIFLOOD, salvarModDB, isGroup, sock, from, msg, sender, isDono, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }

            const db = modDB(FILE_ANTIFLOOD);
            db[from] = db[from] || {};
            const sub = (args[0] || '').toLowerCase();

            if (sub === 'on') db[from].ativo = true;
            else if (sub === 'off') db[from].ativo = false;
            else db[from].ativo = !db[from].ativo;

            salvarModDB(FILE_ANTIFLOOD, db);

            if (db[from].ativo) {
              await sock.sendMessage(from, {
                text: `╭━━━〔 🌊 𝐀𝐍𝐓𝐈-𝐅𝐋𝐎𝐎𝐃 〕━━━╮\n┃\n┃ ✅ *ATIVADO!*\n┃\n┃ 🚫 5 mensagens em 5 segundos = flood.\n┃ ⚠️ Autor ganha *+1 adv* e\n┃    é *silenciado por 5 min*.\n┃ 👑 Adms e dono estão livres.\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
            } else {
              await sock.sendMessage(from, {
                text: `╭━━━〔 🌊 𝐀𝐍𝐓𝐈-𝐅𝐋𝐎𝐎𝐃 〕━━━╮\n┃\n┃ ❌ *DESATIVADO!*\n┃\n┃ 💜 Agora todos podem mandar\n┃    mensagens livremente.\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
            }
          }
          return
    }
  }
};
