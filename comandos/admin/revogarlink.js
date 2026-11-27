// Gerado de index.js (case 'revogarlink', linha 14531)
export default {
  nomes: ["revogarlink"],
  async executar(__x) {
    const { getAdminFlag, isGroup, sock, from, msg, sender, isDono } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gmRv = await globalThis.__getGroupMetadata(from);
            const ehAdmRv = !!getAdminFlag(gmRv.participants, sender);
            if (!ehAdmRv && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }
            try {
              await sock.groupRevokeInvite(from);
              await sock.sendMessage(from, {
                text: '╭━━━〔 🔗 𝐋𝐈𝐍𝐊 𝐑𝐄𝐕𝐎𝐆𝐀𝐃𝐎 🔗 〕━━━╮\n┃\n┃ ✅ Link revogado!\n┃ 👑 Por: @' + sender.split('@')[0] + '\n┃\n┃ 💡 Use *!novolink* pra gerar novo!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [sender]
              }, { quoted: msg });
            } catch (e) {
              await sock.sendMessage(from, { text: '❌ Não consegui revogar. O bot precisa ser admin!' }, { quoted: msg });
            }
          }
          return
    }
  }
};
