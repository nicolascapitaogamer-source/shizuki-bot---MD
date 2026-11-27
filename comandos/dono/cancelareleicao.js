// Gerado de index.js (case 'cancelareleicao', linha 13628)
export default {
  nomes: ["cancelareleicao"],
  async executar(__x) {
    const { carregarEleicao, salvarEleicao, isDono, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono!' }, { quoted: msg }); return }
            const dbCn = carregarEleicao();
            dbCn.fase = 'nenhuma';
            dbCn.votos = {};
            salvarEleicao(dbCn);
            await sock.sendMessage(from, { text: '🛑 Eleição cancelada!' }, { quoted: msg });
          }
          return
    }
  }
};
