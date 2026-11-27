// Gerado de index.js (case 'blacklist', linha 10845)
export default {
  nomes: ["blacklist"],
  async executar(__x) {
    const { getAdminFlag, carregarJSON, FILE_BLACKLIST, salvarJSON, isGroup, from, sender, isDono, sock, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) return
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg });
              return
            }

            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;
            if (!alvo) {
              await sock.sendMessage(from, {
                text: `╭━━━〔 🚫 𝐁𝐋𝐀𝐂𝐊𝐋𝐈𝐒𝐓 〕━━━╮\n┃\n┃ 💜 Como usar:\n┃\n┃ 📝 *!blacklist @pessoa*\n┃    ➜ Bane a pessoa do bot\n┃\n┃ 📝 *!blacklist @pessoa off*\n┃    ➜ Remove da blacklist\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
              return
            }

            const sub = (args.find(a => a.toLowerCase() === 'off') || '').toLowerCase();
            const db = carregarJSON(FILE_BLACKLIST);
            db[from] = db[from] || [];

            if (sub === 'off') {
              const idx = db[from].indexOf(alvo);
              if (idx === -1) {
                await sock.sendMessage(from, { text: `ℹ️ @${alvo.split('@')[0]} não está na blacklist.`, mentions: [alvo] }, { quoted: msg });
                return
              }
              db[from].splice(idx, 1);
              salvarJSON(FILE_BLACKLIST, db);
              await sock.sendMessage(from, {
                text: `╭━━━〔 ✅ 𝐁𝐋𝐀𝐂𝐊𝐋𝐈𝐒𝐓 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐎 〕━━━╮\n┃\n┃ 💜 @${alvo.split('@')[0]} foi removido(a)\n┃    da blacklist!\n┃\n┃ 🕊️ Agora pode usar o bot\n┃    novamente~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                mentions: [alvo]
              }, { quoted: msg });
            } else {
              if (db[from].includes(alvo)) {
                await sock.sendMessage(from, { text: `ℹ️ @${alvo.split('@')[0]} já está na blacklist!`, mentions: [alvo] }, { quoted: msg });
                return
              }
              db[from].push(alvo);
              salvarJSON(FILE_BLACKLIST, db);
              await sock.sendMessage(from, {
                text: `╭━━━〔 🚫 𝐁𝐋𝐀𝐂𝐊𝐋𝐈𝐒𝐓 〕━━━╮\n┃\n┃ 💔 @${alvo.split('@')[0]} foi adicionado(a)\n┃    à blacklist!\n┃\n┃ 🚫 Você não pode mais usar\n┃    o bot neste grupo.\n┃\n┃ 💌 Espere algum adm remover~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                mentions: [alvo]
              }, { quoted: msg });
            }
          }
          return
    }
  }
};
