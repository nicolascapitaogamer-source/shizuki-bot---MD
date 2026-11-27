// Gerado de index.js (case 'ferias', linha 10103)
export default {
  nomes: ["ferias","férias"],
  async executar(__x) {
    const { shizukiUser, salvarShizuki, sender, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);
            if (!u.emprego) { await sock.sendMessage(from, { text: '❌ Você precisa ter emprego!' }, { quoted: msg }); return }
            if (u.ferias && Date.now() < u.ferias) {
              const resta = Math.ceil((u.ferias - Date.now()) / 86400000);
              await sock.sendMessage(from, { text: `🏖️ Você já tá de férias!\n\n⏰ Volta em: *${resta} dia(s)*` }, { quoted: msg });
              return
            }
            u.reais += 500;
            u.ferias = Date.now() + 2 * 86400000;
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `╭━━━〔 🏖️ 𝐅𝐄́𝐑𝐈𝐀𝐒! 〕━━━╮\n┃\n┃ 💜 Você tirou férias!\n┃\n┃ ⏰ Duração: *2 dias*\n┃ 💰 Bônus: *+R$ 500*\n┃\n┃ 🎉 Aproveite o descanso!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
