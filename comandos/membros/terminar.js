// Gerado de index.js (case 'terminar', linha 7082)
export default {
  nomes: ["terminar"],
  async executar(__x) {
    const { shizukiUser, salvarShizuki, sender, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);
            if (!u.namorando) {
              await sock.sendMessage(from, { text: '❌ Você não está namorando!' }, { quoted: msg });
              return
            }
            const ex = u.namorando;
            const uEx = shizukiUser(ex);
            u.namorando = null;
            uEx.namorando = null;
            salvarShizuki(sender, u);
            salvarShizuki(ex, uEx);
            await sock.sendMessage(from, {
              text: `💔 *FIM DE NAMORO*\n\nVocê e @${ex.split('@')[0]} terminaram...\n\n😢 Um relacionamento a menos.`,
              mentions: [ex]
            }, { quoted: msg });
          }
          return
    }
  }
};
