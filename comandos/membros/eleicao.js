// Gerado de index.js (case 'eleicao', linha 13485)
export default {
  nomes: ["eleicao"],
  async executar(__x) {
    const { carregarEleicao, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const dbEl2 = carregarEleicao();
            const fase2 = dbEl2.fase || 'nenhuma';
            if (fase2 === 'nenhuma') { await sock.sendMessage(from, { text: 'ℹ️ Nenhuma eleição em andamento!' }, { quoted: msg }); return }
            const cands2 = Object.values(dbEl2.candidatos || {});
            const votos2 = Object.keys(dbEl2.votos || {}).length;
            await sock.sendMessage(from, {
              text: '╭━━━〔 🗳️ 𝐄𝐋𝐄𝐈𝐂̧𝐀̃𝐎 𝐒𝐇𝐈𝐙𝐔𝐊𝐈 🗳️ 〕━━━╮\n┃\n┃ 📊 Fase: *' + fase2.toUpperCase() + '*\n┃ 👥 Candidatos: *' + cands2.length + '*\n┃ 🗳️ Votos totais: *' + votos2 + '*\n┃\n┃ 💡 Use: *!votar <id>*\n┃ 📋 Veja: *!candidatos*\n┃\n╰━━━━━━━━━━━━━━━━━━╯'
            }, { quoted: msg });
          }
          return
    }
  }
};
