// Gerado de index.js (case 'presidentes', linha 13746)
export default {
  nomes: ["presidentes"],
  async executar(__x) {
    const { carregarPresidente, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const dbHs = carregarPresidente();
            const hist = dbHs.historico || [];
            if (!hist.length) { await sock.sendMessage(from, { text: 'ℹ️ Nenhum presidente no histórico!' }, { quoted: msg }); return }
            let txtHs = '╭━━━〔 📚 𝐇𝐈𝐒𝐓𝐎́𝐑𝐈𝐂𝐎 📚 〕━━━╮\n┃\n';
            const meds = ['🥇', '🥈', '🥉'];
            const mencs = [];
            hist.slice(-10).forEach((p, i) => {
              txtHs += '┃ ' + (meds[i] || '•') + ' @' + p.jid.split('@')[0] + '\n┃    🗳️ ' + (p.votos || 0) + ' votos\n┃\n';
              mencs.push(p.jid);
            });
            txtHs += '┃ 💜 Total: *' + hist.length + '*\n┃\n╰━━━━━━━━━━━━━━━━━━╯';
            await sock.sendMessage(from, { text: txtHs, mentions: mencs }, { quoted: msg });
          }
          return
    }
  }
};
