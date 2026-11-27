// Gerado de index.js (case 'bl', linha 8969)
export default {
  nomes: ["bl"],
  async executar(__x) {
    const { getAdminFlag, modDB, FILE_BLACKLIST, salvarModDB, isGroup, sock, from, msg, sender, isDono } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }

            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;
            if (!alvo) {
              await sock.sendMessage(from, { text: '⚠️ Marque a pessoa!\n\nEx: `!blacklist @pessoa`' }, { quoted: msg });
              return
            }

            const db = modDB(FILE_BLACKLIST);
            db[from] = db[from] || [];
            const idx = db[from].indexOf(alvo);

            if (idx >= 0) {
              db[from].splice(idx, 1);
              salvarModDB(FILE_BLACKLIST, db);
              await sock.sendMessage(from, {
                text: `✅ *REMOVIDO DA BLACKLIST!*\n\n👤 @${alvo.split('@')[0]} pode usar o bot novamente.`,
                mentions: [alvo]
              }, { quoted: msg });
            } else {
              db[from].push(alvo);
              salvarModDB(FILE_BLACKLIST, db);
              await sock.sendMessage(from, {
                text: `🚫 *BLACKLIST!*\n\n👤 @${alvo.split('@')[0]} foi banido(a) do bot neste grupo.\n\n💜 Nenhum comando vai funcionar pra ele(a).`,
                mentions: [alvo]
              }, { quoted: msg });
            }
          }
          return
    }
  }
};
