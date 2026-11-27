// Gerado de index.js (case 'resgatar', linha 10155)
export default {
  nomes: ["resgatar"],
  async executar(__x) {
    const { shizukiUser, salvarShizuki, formatarReais, sender, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);
            if (!u.investido || u.investido <= 0) { await sock.sendMessage(from, { text: '❌ Você não tem investimento!' }, { quoted: msg }); return }
            const tempoPassado = Date.now() - (u.ultimoRendimento || Date.now());
            const diasRend = Math.floor(tempoPassado / 86400000);
            const rendimento = Math.floor(u.investido * 0.01 * Math.max(1, diasRend));
            const total = u.investido + rendimento;
            u.reais += total;
            u.investido = 0;
            u.ultimoRendimento = Date.now();
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `╭━━━〔 💰 𝐑𝐄𝐒𝐆𝐀𝐓𝐄 〕━━━╮\n┃\n┃ 💜 Você resgatou!\n┃\n┃ 📊 Investido: *${formatarReais(total - rendimento)}*\n┃ 📈 Rendimento: *${formatarReais(rendimento)}*\n┃ 💰 Total: *${formatarReais(total)}*\n┃\n┃ 🕊️ Bom lucro~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
