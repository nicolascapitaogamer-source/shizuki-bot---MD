// Gerado de index.js (case 'segundotrabalho', linha 10123)
export default {
  nomes: ["segundotrabalho","bico"],
  async executar(__x) {
    const { shizukiUser, salvarShizuki, formatarReais, sender, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);
            if (u.energia < 10) { await sock.sendMessage(from, { text: '😴 Sem energia!\n\nUse *!dormir*.' }, { quoted: msg }); return }
            const ganho = 50 + Math.floor(Math.random() * 101);
            u.reais += ganho;
            u.energia -= 10;
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `╭━━━〔 💵 𝐁𝐈𝐂𝐎 𝐅𝐄𝐈𝐓𝐎! 〕━━━╮\n┃\n┃ 💜 Você fez um bico!\n┃\n┃ 💰 Ganhou: *${formatarReais(ganho)}*\n┃ ⚡ Energia: *-10*\n┃\n┃ 🕊️ Renda extra~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
