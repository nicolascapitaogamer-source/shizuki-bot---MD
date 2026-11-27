// Gerado de index.js (case 'resultado', linha 13600)
export default {
  nomes: ["resultado"],
  async executar(__x) {
    const { carregarPresidente, from, sock, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const dbRes = carregarPresidente();
            const gruposRes = dbRes.grupos || {};
            if (!gruposRes[from]) { await sock.sendMessage(from, { text: 'ℹ️ Nenhum presidente eleito neste grupo ainda!' }, { quoted: msg }); return }
            const atual = gruposRes[from];
            await sock.sendMessage(from, {
              text: '╭━━━〔 🏆 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎 🏆 〕━━━╮\n┃\n┃ 👑 NOVO PRESIDENTE:\n┃    @' + atual.jid.split('@')[0] + '\n┃ 🗳️ Votos: *' + atual.votos + '*\n┃ 📅 Mandato: 7 dias\n┃\n┃ 💜 Parabéns, presidente!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [atual.jid]
            }, { quoted: msg });
          }
          return
    }
  }
};
