// Gerado de index.js (case 'alugarcasa', linha 7430)
export default {
  nomes: ["alugarcasa"],
  async executar(__x) {
    const { shizukiUser, formatarReais, salvarShizuki, sender, args, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);
            const id = (args[0] || '').toLowerCase();
            const alugueis = { barraco: 50, simples: 200, media: 500, mansao: 1500, palacio: 5000 };
            const bonus = { barraco: 5, simples: 10, media: 15, mansao: 25, palacio: 40 };
            const nomes = { barraco: 'Barraco', simples: 'Casa Simples', media: 'Casa Média', mansao: 'Mansão', palacio: 'Palácio' };
            const emojis = { barraco: '🏚️', simples: '🏠', media: '🏡', mansao: '🏘️', palacio: '🏰' };
            if (!alugueis[id]) {
              await sock.sendMessage(from, { text: '⚠️ Casa inválida! Use *!casas* pra ver a lista.' }, { quoted: msg });
              return
            }
            if (u.casa && u.casa.expira && Date.now() < u.casa.expira) {
              await sock.sendMessage(from, { text: `❌ Você já tem aluguel ativo!\n\n⏳ Expira em: *${new Date(u.casa.expira).toLocaleString('pt-BR')}*` }, { quoted: msg });
              return
            }
            if (u.reais < alugueis[id]) {
              await sock.sendMessage(from, { text: `💸 Precisa de *${formatarReais(alugueis[id])}*!` }, { quoted: msg });
              return
            }
            u.reais -= alugueis[id];
            u.casa = { tipo: id, alugadaEm: Date.now(), expira: Date.now() + 7 * 86400000 };
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `🏠 *CASA ALUGADA!*\n\n${emojis[id]} Você alugou uma *${nomes[id]}* por 7 dias!\n✨ Bônus: *+${bonus[id]}%*\n⏳ Expira em 7 dias\n💰 Saldo: *${formatarReais(u.reais)}*`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
