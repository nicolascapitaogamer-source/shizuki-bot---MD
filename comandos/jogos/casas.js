// Gerado de index.js (case 'casas', linha 7379)
export default {
  nomes: ["casas","lojacasa"],
  async executar(__x) {
    const { shizukiUser, formatarReais, sender, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);
            const casas = [
              { id: 'barraco', nome: 'Barraco', emoji: '🏚️', preco: 500, aluguel: 50, bonus: 5 },
              { id: 'simples', nome: 'Casa Simples', emoji: '🏠', preco: 2000, aluguel: 200, bonus: 10 },
              { id: 'media', nome: 'Casa Média', emoji: '🏡', preco: 5000, aluguel: 500, bonus: 15 },
              { id: 'mansao', nome: 'Mansão', emoji: '🏘️', preco: 15000, aluguel: 1500, bonus: 25 },
              { id: 'palacio', nome: 'Palácio', emoji: '🏰', preco: 50000, aluguel: 5000, bonus: 40 }
            ];
            let texto = `╭━━━〔 🏠 𝐋𝐎𝐉𝐀 𝐃𝐄 𝐂𝐀𝐒𝐀𝐒 🏠 〕━━━╮\n┃\n┃ 💰 Saldo: *${formatarReais(u.reais)}*\n┃\n`;
            casas.forEach(c => {
              texto += `┃ ${c.emoji} *${c.nome}*\n`;
              texto += `┃    💵 ${formatarReais(c.preco)} | ✨ +${c.bonus}%\n`;
              texto += `┃    🔑 Aluguel: ${formatarReais(c.aluguel)} (7d)\n┃\n`;
            });
            texto += `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n💡 Comprar: *!comprarcasa <id>*\n💡 Alugar: *!alugarcasa <id>*\nEx: *!comprarcasa mansao*`;
            await sock.sendMessage(from, { text: texto, mentions: [sender] }, { quoted: msg });
          }
          return
    }
  }
};
