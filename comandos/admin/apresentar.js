// Gerado de index.js (case 'apresentar', linha 9446)
export default {
  nomes: ["apresentar"],
  async executar(__x) {
    const { getAdminFlag, isGroup, from, sender, isDono, sock, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) return
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }
            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;
            if (!alvo) { await sock.sendMessage(from, { text: '⚠️ Marque a pessoa!\n\nEx: `!apresentar @pessoa`' }, { quoted: msg }); return }
            await sock.sendMessage(from, {
              text: `╭━━━〔 🎀 𝐀𝐏𝐑𝐄𝐒𝐄𝐍𝐓𝐀𝐂̧𝐀̃𝐎 〕━━━╮\n┃\n` +
                    `┃ 💜 Todos, atenção!\n┃\n` +
                    `┃ 👤 @${alvo.split('@')[0]} acabou de\n┃    chegar no grupo! 🎉\n┃\n` +
                    `┃ 🕊️ Sejam gentis e digam oi!\n┃\n` +
                    `╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [alvo]
            }, { quoted: msg });
          }
          return
    }
  }
};
