// Gerado de index.js (case 'linkgp', linha 7215)
export default {
  nomes: ["linkgp","linkgrupo"],
  async executar(__x) {
    const { getAdminFlag, isGroup, sock, from, msg, sender, isDono } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas admins do grupo!' }, { quoted: msg });
              return
            }
            try {
              const code = await sock.groupInviteCode(from);
              if (!code) throw new Error('Sem código');
              await sock.sendMessage(from, {
                text: `🔗 *LINK DO GRUPO*\n\n👥 ${gm.subject}\n🔗 https://chat.whatsapp.com/${code}`,
                mentions: [sender]
              }, { quoted: msg });
            } catch (e) {
              await sock.sendMessage(from, { text: '❌ Não consegui pegar o link. Verifique se o bot é admin!' }, { quoted: msg });
            }
          }
          return
    }
  }
};
