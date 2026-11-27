// Gerado de index.js (case 'antilink', linha 8910)
export default {
  nomes: ["antilink"],
  async executar(__x) {
    const { getAdminFlag, modDB, FILE_ANTILINK, salvarModDB, isGroup, sock, from, msg, sender, isDono, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }

            const db = modDB(FILE_ANTILINK);
            db[from] = db[from] || {};
            const sub = (args[0] || '').toLowerCase();

            if (sub === 'on') db[from].ativo = true;
            else if (sub === 'off') db[from].ativo = false;
            else db[from].ativo = !db[from].ativo;

            salvarModDB(FILE_ANTILINK, db);

            if (db[from].ativo) {
              await sock.sendMessage(from, {
                text: `╭━━━〔 🔗 𝐀𝐍𝐓𝐈-𝐋𝐈𝐍𝐊 〕━━━╮\n┃\n┃ ✅ *ATIVADO!*\n┃\n┃ 🚫 Links enviados por membros\n┃    serão *deletados*.\n┃\n┃ ⚠️ Autor ganha *+1 adv*.\n┃ 👑 Adms e dono estão livres.\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
            } else {
              await sock.sendMessage(from, {
                text: `╭━━━〔 🔗 𝐀𝐍𝐓𝐈-𝐋𝐈𝐍𝐊 〕━━━╮\n┃\n┃ ❌ *DESATIVADO!*\n┃\n┃ 💜 Agora todos podem mandar links.\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
            }
          }
          return
    }
  }
};
