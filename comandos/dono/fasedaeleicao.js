// Gerado de index.js (case 'fasedaeleicao', linha 13472)
export default {
  nomes: ["fasedaeleicao"],
  async executar(__x) {
    const { carregarEleicao, isDono, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono!' }, { quoted: msg }); return }
            const dbFE = carregarEleicao();
            const fase = dbFE.fase || 'nenhuma';
            const candsFE = Object.values(dbFE.candidatos || {});
            const votosFE = Object.keys(dbFE.votos || {}).length;
            await sock.sendMessage(from, {
              text: '╭━━━〔 📊 𝐅𝐀𝐒𝐄 𝐀𝐓𝐔𝐀𝐋 📊 〕━━━╮\n┃\n┃ 📊 Fase: *' + fase.toUpperCase() + '*\n┃ 👥 Candidatos: *' + candsFE.length + '*\n┃ 🗳️ Votos: *' + votosFE + '*\n┃\n╰━━━━━━━━━━━━━━━━━━╯'
            }, { quoted: msg });
          }
          return
    }
  }
};
