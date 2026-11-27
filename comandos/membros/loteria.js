// Gerado de index.js (case 'loteria', linha 10294)
export default {
  nomes: ["loteria"],
  async executar(__x) {
    const { shizukiUser, carregarJSON, salvarJSON, salvarShizuki, formatarReais, sender, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);
            if (u.reais < 10) { await sock.sendMessage(from, { text: '💸 Precisa de *R$ 10*!' }, { quoted: msg }); return }
            const db = carregarJSON('./loteria.json');
            const num = Math.floor(Math.random() * 90000) + 10000;
            db[sender] = { numero: num, compradoEm: Date.now() };
            salvarJSON('./loteria.json', db);
            u.reais -= 10;
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `╭━━━〔 🎟️ 𝐁𝐈𝐋𝐇𝐄𝐓𝐄 𝐂𝐎𝐌𝐏𝐑𝐀𝐃𝐎! 〕━━━╮\n┃\n┃ 💜 Você comprou um bilhete!\n┃\n┃ 🎟️ Número: *${num}*\n┃ 💰 Custo: *${formatarReais(10)}*\n┃\n┃ 🕊️ Sorteio à meia-noite!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
