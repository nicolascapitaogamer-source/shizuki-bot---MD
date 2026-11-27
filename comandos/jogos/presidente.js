// Gerado de index.js (case 'presidente', linha 13613)
export default {
  nomes: ["presidente"],
  async executar(__x) {
    const { carregarPresidente, from, sock, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const dbPr = carregarPresidente();
            const gruposPr = dbPr.grupos || {};
            if (!gruposPr[from]) { await sock.sendMessage(from, { text: 'ℹ️ Nenhum presidente eleito neste grupo ainda!' }, { quoted: msg }); return }
            const p = gruposPr[from];
            const resta = p.expiraEm - Date.now();
            const dias = Math.max(0, Math.floor(resta / 86400000));
            await sock.sendMessage(from, {
              text: '╭━━━〔 👑 𝐏𝐑𝐄𝐒𝐈𝐃𝐄𝐍𝐓𝐄 👑 〕━━━╮\n┃\n┃ 👤 Presidente: @' + p.jid.split('@')[0] + '\n┃ 📅 Mandato restante: *' + dias + ' dias*\n┃ 🗳️ Eleito com: *' + p.votos + '* votos\n┃\n┃ 💜 Liderando o Shizuki City!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [p.jid]
            }, { quoted: msg });
          }
          return
    }
  }
};
