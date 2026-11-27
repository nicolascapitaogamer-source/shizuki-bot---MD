// Gerado de index.js (case 'rankingshizuki', linha 7134)
export default {
  nomes: ["rankingshizuki","rankshizuki"],
  async executar(__x) {
    const { rankingShizuki, formatarReais, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const lista = rankingShizuki(10);
            if (!lista.length) {
              await sock.sendMessage(from, { text: 'ℹ️ Ninguém no ranking ainda!' }, { quoted: msg });
              return
            }
            const medalhas = ['🥇', '🥈', '🥉'];
            let texto = `╭━━━〔 🏆 𝐑𝐀𝐍𝐊𝐈𝐍𝐆 𝐒𝐇𝐈𝐙𝐔𝐊𝐈 🏆 〕━━━╮\n┃\n`;
            lista.forEach((x, i) => {
              const medalha = medalhas[i] || `${i + 1}️⃣`;
              texto += `┃ ${medalha} @${x.jid.split('@')[0]} ➜ *${formatarReais(x.reais)}*\n`;
            });
            texto += `╰━━━━━━━━━━━━━━━━━━━━━━━━╯`;
            await sock.sendMessage(from, {
              text: texto,
              mentions: lista.map(x => x.jid)
            }, { quoted: msg });
          }
          return
    }
  }
};
