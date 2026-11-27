// Gerado de index.js (case 'novolink', linha 14513)
export default {
  nomes: ["novolink"],
  async executar(__x) {
    const { getAdminFlag, isGroup, sock, from, msg, sender, isDono } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gmNv = await globalThis.__getGroupMetadata(from);
            const ehAdmNv = !!getAdminFlag(gmNv.participants, sender);
            if (!ehAdmNv && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }
            try {
              const novoLink = await sock.groupInviteCode(from);
              await sock.sendMessage(from, {
                text: '╭━━━〔 🔗 𝐍𝐎𝐕𝐎 𝐋𝐈𝐍𝐊 🔗 〕━━━╮\n┃\n┃ ✅ Link gerado!\n┃\n┃ 🔗 https://chat.whatsapp.com/' + novoLink + '\n┃ 👑 Por: @' + sender.split('@')[0] + '\n┃\n┃ ⚠️ Compartilhe com cuidado!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [sender]
              }, { quoted: msg });
            } catch (e) {
              await sock.sendMessage(from, { text: '❌ Não consegui gerar. O bot precisa ser admin!' }, { quoted: msg });
            }
          }
          return
    }
  }
};
