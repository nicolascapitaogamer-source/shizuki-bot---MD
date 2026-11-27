// Gerado de index.js (case 'vender', linha 10808)
export default {
  nomes: ["vender","vendercarro"],
  async executar(__x) {
    const { shizukiUser, salvarShizuki, formatarReais, sender, args, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);
            const sub = (args[0] || '').toLowerCase();
            const itens = {
              carro: { nome: 'Carro', emoji: '🚗', venda: 2400 },
              moto: { nome: 'Moto', emoji: '🏍️', venda: 1200 },
              celular: { nome: 'Celular', emoji: '📱', venda: 640 },
              notebook: { nome: 'Notebook', emoji: '💻', venda: 1600 },
              anel: { nome: 'Anel', emoji: '💍', venda: 400 },
              relogio: { nome: 'Relógio', emoji: '⌚', venda: 960 },
              coroa: { nome: 'Coroa', emoji: '👑', venda: 4000 },
              trofeu: { nome: 'Troféu', emoji: '🏆', venda: 640 }
            };

            if (!sub) {
              await sock.sendMessage(from, { text: '⚠️ Use: `!vender <item>`\n\nEx: `!vender carro`' }, { quoted: msg });
              return
            }
            const item = itens[sub];
            if (!item) { await sock.sendMessage(from, { text: '⚠️ Item inválido!' }, { quoted: msg }); return }
            if (!(u.itens || []).includes(sub)) { await sock.sendMessage(from, { text: `❌ Você não tem *${item.nome}*!` }, { quoted: msg }); return }

            const idx = u.itens.indexOf(sub);
            u.itens.splice(idx, 1);
            u.reais += item.venda;
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `╭━━━〔 💰 𝐕𝐄𝐍𝐃𝐀! 〕━━━╮\n┃\n┃ 💜 Você vendeu!\n┃\n┃ ${item.emoji} *${item.nome}*\n┃ 💰 Recebeu: *${formatarReais(item.venda)}*\n┃\n┃ 🕊️ Bom negócio~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
