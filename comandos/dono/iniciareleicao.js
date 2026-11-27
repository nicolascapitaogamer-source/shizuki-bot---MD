// Gerado de index.js (case 'iniciareleicao', linha 13455)
export default {
  nomes: ["iniciareleicao"],
  async executar(__x) {
    const { carregarEleicao, salvarEleicao, isDono, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono!' }, { quoted: msg }); return }
            const dbIE = carregarEleicao();
            if (dbIE.fase === 'votacao') { await sock.sendMessage(from, { text: '⚠️ Já tem uma votação em andamento!' }, { quoted: msg }); return }
            const candsIE = Object.values(dbIE.candidatos || {});
            if (!candsIE.length) { await sock.sendMessage(from, { text: '❌ Nenhum candidato se registrou ainda!' }, { quoted: msg }); return }
            dbIE.fase = 'votacao';
            dbIE.iniciadaEm = Date.now();
            dbIE.votos = {};
            salvarEleicao(dbIE);
            await sock.sendMessage(from, {
              text: '╭━━━〔 🚀 𝐄𝐋𝐄𝐈𝐂̧𝐀̃𝐎 𝐈𝐍𝐈𝐂𝐈𝐀𝐃𝐀 🚀 〕━━━╮\n┃\n┃ 📊 Fase: *VOTAÇÃO*\n┃ 👥 Candidatos: *' + candsIE.length + '*\n┃\n┃ 💡 Use: *!votar <id>*\n┃ 📋 Veja: *!candidatos*\n┃\n╰━━━━━━━━━━━━━━━━━━╯'
            }, { quoted: msg });
          }
          return
    }
  }
};
