// Gerado de index.js (case 'investir', linha 10138)
export default {
  nomes: ["investir"],
  async executar(__x) {
    const { shizukiUser, formatarReais, salvarShizuki, sender, args, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);
            const valor = parseInt(args[0] || '0', 10);
            if (!valor || valor < 100) { await sock.sendMessage(from, { text: '⚠️ Mínimo: *R$ 100*\n\nEx: `!investir 500`' }, { quoted: msg }); return }
            if (valor > u.reais) { await sock.sendMessage(from, { text: `💸 Saldo insuficiente!\n\n💰 Você tem: *${formatarReais(u.reais)}*` }, { quoted: msg }); return }
            u.reais -= valor;
            u.investido = (u.investido || 0) + valor;
            u.ultimoRendimento = u.ultimoRendimento || Date.now();
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `╭━━━〔 📈 𝐈𝐍𝐕𝐄𝐒𝐓𝐈𝐌𝐄𝐍𝐓𝐎 〕━━━╮\n┃\n┃ 💜 Você investiu *${formatarReais(valor)}*!\n┃\n┃ ⏰ Rendimento: *+1%/dia*\n┃ 📊 Total investido: *${formatarReais(u.investido)}*\n┃\n┃ 🕊️ Bons lucros!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
