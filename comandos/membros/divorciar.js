// Gerado de index.js (case 'divorciar', linha 9959)
export default {
  nomes: ["divorciar","divorcio"],
  async executar(__x) {
    const { shizukiUser, salvarShizuki, formatarReais, sender, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);
            if (!u.casado) { await sock.sendMessage(from, { text: '❌ Você não é casado(a)!' }, { quoted: msg }); return }
            const ex = u.casado;
            const uEx = shizukiUser(ex);

            // Divide bens
            const bensTotal = (u.reais || 0) + (uEx.reais || 0);
            const metade = Math.floor(bensTotal / 2);
            u.reais = metade;
            uEx.reais = metade;
            u.casado = null;
            uEx.casado = null;
            salvarShizuki(sender, u);
            salvarShizuki(ex, uEx);

            await sock.sendMessage(from, {
              text: `╭━━━〔 💔 𝐃𝐈𝐕𝐎́𝐑𝐂𝐈𝐎 〕━━━╮\n┃\n┃ 💔 Você se divorciou de\n┃    @${ex.split('@')[0]}...\n┃\n┃ 💰 Bens divididos:\n┃    *${formatarReais(metade)}* cada\n┃\n┃ 😢 Fim de um casamento.\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [ex]
            }, { quoted: msg });
          }
          return
    }
  }
};
