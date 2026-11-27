// Gerado de index.js (case 'comprarcasa', linha 7400)
export default {
  nomes: ["comprarcasa"],
  async executar(__x) {
    const { shizukiUser, formatarReais, salvarShizuki, sender, args, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);
            const id = (args[0] || '').toLowerCase();
            const casas = { barraco: 500, simples: 2000, media: 5000, mansao: 15000, palacio: 50000 };
            const bonus = { barraco: 5, simples: 10, media: 15, mansao: 25, palacio: 40 };
            const nomes = { barraco: 'Barraco', simples: 'Casa Simples', media: 'Casa Média', mansao: 'Mansão', palacio: 'Palácio' };
            const emojis = { barraco: '🏚️', simples: '🏠', media: '🏡', mansao: '🏘️', palacio: '🏰' };
            if (!casas[id]) {
              await sock.sendMessage(from, { text: '⚠️ Casa inválida! Use *!casas* pra ver a lista.' }, { quoted: msg });
              return
            }
            if (u.casa && u.casa.tipo === id && u.casa.permanente) {
              await sock.sendMessage(from, { text: '❌ Você já tem essa casa!' }, { quoted: msg });
              return
            }
            if (u.reais < casas[id]) {
              await sock.sendMessage(from, { text: `💸 Precisa de *${formatarReais(casas[id])}*!\n\n💰 Você tem: *${formatarReais(u.reais)}*` }, { quoted: msg });
              return
            }
            u.reais -= casas[id];
            u.casa = { tipo: id, compradaEm: Date.now(), permanente: true };
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `🏠 *CASA COMPRADA!*\n\n${emojis[id]} Você agora tem uma *${nomes[id]}*!\n✨ Bônus: *+${bonus[id]}%* em trabalhos\n💰 Saldo: *${formatarReais(u.reais)}*`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
