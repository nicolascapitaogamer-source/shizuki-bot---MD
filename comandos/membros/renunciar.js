// Gerado de index.js (case 'renunciar', linha 13682)
export default {
  nomes: ["renunciar"],
  async executar(__x) {
    const { carregarPresidente, salvarPresidente, sock, from, msg, sender } = Object.assign({}, __x.utils, __x);
    {
{
            const dbR = carregarPresidente();
            if (!dbR.atual) { await sock.sendMessage(from, { text: '❌ Nenhum presidente eleito!' }, { quoted: msg }); return }
            if (dbR.atual.jid !== sender) { await sock.sendMessage(from, { text: '🚫 Você não é o presidente!' }, { quoted: msg }); return }
            const exP = dbR.atual;
            dbR.atual = null;
            salvarPresidente(dbR);
            await sock.sendMessage(from, {
              text: '╭━━━〔 👑 𝐑𝐄𝐍𝐔́𝐍𝐂𝐈𝐀 👑 〕━━━╮\n┃\n┃ ⚠️ O presidente renunciou!\n┃\n┃ 👤 @' + sender.split('@')[0] + '\n┃ 📅 Saiu do cargo\n┃\n┃ 🗳️ Novas eleições em breve!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
