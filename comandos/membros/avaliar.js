// Gerado de index.js (case 'avaliar', linha 13570)
export default {
  nomes: ["avaliar"],
  async executar(__x) {
    const { carregarPresidente, salvarPresidente, args, sock, from, msg, sender } = Object.assign({}, __x.utils, __x);
    {
{
            const subAv = (args[0] || '').toLowerCase();
            if (subAv !== 'sim' && subAv !== 'nao' && subAv !== 'não') {
              await sock.sendMessage(from, { text: '⚠️ Use: *!avaliar sim* ou *!avaliar nao*' }, { quoted: msg });
              return
            }
            const dbAv = carregarPresidente();
            const gruposAv = dbAv.grupos || {};
            const pAv = gruposAv[from];
            if (!pAv || !pAv.avaliacao) {
              await sock.sendMessage(from, { text: 'ℹ️ Não tem avaliação aberta neste grupo!' }, { quoted: msg });
              return
            }
            if (pAv.avaliacao.votaram.includes(sender)) {
              await sock.sendMessage(from, { text: '❌ Você já avaliou!' }, { quoted: msg });
              return
            }
            const vAv = subAv === 'nao' || subAv === 'não' ? 'nao' : 'sim';
            pAv.avaliacao[vAv] += 1;
            pAv.avaliacao.votaram.push(sender);
            salvarPresidente(dbAv);
            await sock.sendMessage(from, {
              text: '✅ Você avaliou com *' + vAv.toUpperCase() + '*!\n\n' +
                    '📊 Parcial: SIM ' + pAv.avaliacao.sim + ' | NÃO ' + pAv.avaliacao.nao,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
