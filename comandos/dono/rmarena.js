// Gerado de index.js (case 'rmarena', linha 14067)
export default {
  nomes: ["rmarena"],
  async executar(__x) {
    const { eVIP, carregarArena, chaveArena, salvarArena, isDono, sender, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono && !eVIP(sender)) { await sock.sendMessage(from, { text: '🚫 Apenas o dono e VIPs!' }, { quoted: msg }); return }
            const dbRm = carregarArena();
            const chvRm = chaveArena(from);
            if (!dbRm[chvRm]) { await sock.sendMessage(from, { text: 'ℹ️ Não tem duelo rolando aqui!' }, { quoted: msg }); return }
            delete dbRm[chvRm];
            salvarArena(dbRm);
            await sock.sendMessage(from, { text: '🛑 Duelo finalizado com sucesso!' }, { quoted: msg });
          }
          return
    }
  }
};
