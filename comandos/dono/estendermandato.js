// Gerado de index.js (case 'estendermandato', linha 13731)
export default {
  nomes: ["estendermandato"],
  async executar(__x) {
    const { carregarPresidente, salvarPresidente, isDono, sock, from, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono!' }, { quoted: msg }); return }
            const diasE = parseInt(args[0], 10);
            if (!diasE || diasE < 1) { await sock.sendMessage(from, { text: '⚠️ Use: *!estendermandato <dias>*' }, { quoted: msg }); return }
            const dbEM = carregarPresidente();
            if (!dbEM.atual) { await sock.sendMessage(from, { text: '❌ Nenhum presidente eleito!' }, { quoted: msg }); return }
            if (dbEM.grupos && dbEM.grupos[from]) {
              dbEM.grupos[from].expiraEm = (dbEM.grupos[from].expiraEm || Date.now()) + diasE * 86400000;
            }
            salvarPresidente(dbEM);
            await sock.sendMessage(from, { text: '⏰ Mandato estendido em *' + diasE + ' dias*!' }, { quoted: msg });
          }
          return
    }
  }
};
