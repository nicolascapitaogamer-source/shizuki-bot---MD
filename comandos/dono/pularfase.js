// Gerado de index.js (case 'pularfase', linha 13639)
export default {
  nomes: ["pularfase"],
  async executar(__x) {
    const { carregarEleicao, salvarEleicao, isDono, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono!' }, { quoted: msg }); return }
            const dbPf = carregarEleicao();
            if (dbPf.fase === 'votacao') { dbPf.fase = 'encerrada'; }
            else { dbPf.fase = 'votacao'; dbPf.votos = dbPf.votos || {}; }
            salvarEleicao(dbPf);
            await sock.sendMessage(from, { text: '⏭️ Fase pulada! Nova fase: *' + dbPf.fase + '*' }, { quoted: msg });
          }
          return
    }
  }
};
