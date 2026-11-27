// Gerado de index.js (case 'fakechat', linha 9514)
export default {
  nomes: ["fakechat"],
  async executar(__x) {
    const { getAdminFlag, isGroup, from, sender, isDono, sock, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) return
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }
            const txt = args.join(' ').trim();
            if (!txt) { await sock.sendMessage(from, { text: '⚠️ Use: `!fakechat <texto>`\n\nEx: `!fakechat Oi, tudo bem?`' }, { quoted: msg }); return }
            await sock.sendMessage(from, {
              text: `╭━━━〔 💬 𝐅𝐀𝐊𝐄 𝐂𝐇𝐀𝐓 〕━━━╮\n┃\n` +
                    `┃ 👤 @${sender.split('@')[0]}\n┃\n` +
                    `┃ 💬 _${txt}_\n┃\n` +
                    `┃ 💜 Feito com carinho~\n┃\n` +
                    `╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
