// Gerado de index.js (case 'rmaniversario', linha 13813)
export default {
  nomes: ["rmaniversario"],
  async executar(__x) {
    const { shizukiUser, salvarShizuki, isGroup, sock, from, msg, sender } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const uR = shizukiUser(sender);
            if (!uR.aniversarioGrupos || !uR.aniversarioGrupos.includes(from)) {
              await sock.sendMessage(from, { text: 'ℹ️ Você não tem aniversário registrado neste grupo!' }, { quoted: msg });
              return
            }
            uR.aniversarioGrupos = uR.aniversarioGrupos.filter(g => g !== from);
            salvarShizuki(sender, uR);
            await sock.sendMessage(from, {
              text: '🗑️ *Aniversário removido deste grupo!*\n\n💜 O bot não vai mais avisar aqui.\n📊 Grupos restantes: *' + uR.aniversarioGrupos.length + '*',
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
