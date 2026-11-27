// Gerado de index.js (case 'gp', linha 7264)
export default {
  nomes: ["gp"],
  async executar(__x) {
    const { getAdminFlag, isGroup, sock, from, msg, sender, isDono, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas admins do grupo!' }, { quoted: msg });
              return
            }
            const sub = (args[0] || '').toLowerCase();
            if (sub !== 'a' && sub !== 'f') {
              await sock.sendMessage(from, { text: '⚠️ Use:\n• *!gp f* → fechar o grupo\n• *!gp a* → abrir o grupo' }, { quoted: msg });
              return
            }
            try {
              if (sub === 'f') {
                await sock.groupSettingUpdate(from, 'announcement');
                await sock.sendMessage(from, { text: '🔒 *GRUPO FECHADO!*\n\nSó admins podem falar agora.' });
              } else {
                await sock.groupSettingUpdate(from, 'not_announcement');
                await sock.sendMessage(from, { text: '🔓 *GRUPO ABERTO!*\n\nTodos podem falar agora.' });
              }
            } catch (e) {
              await sock.sendMessage(from, { text: '❌ Não consegui alterar. Verifique se o bot é admin!' }, { quoted: msg });
            }
          }
          return
    }
  }
};
