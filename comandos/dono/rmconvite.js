// Gerado de index.js (case 'rmconvite', linha 14294)
export default {
  nomes: ["rmconvite"],
  async executar(__x) {
    const { eVIP, carregarConvites, salvarConvites, isDono, sender, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono && !eVIP(sender)) { await sock.sendMessage(from, { text: '🚫 Apenas o dono e VIPs!' }, { quoted: msg }); return }
            const dbRC = carregarConvites();
            let removido = false;
            for (const id in dbRC) {
              if (dbRC[id].de === sender || dbRC[id].grupo === from) {
                delete dbRC[id];
                removido = true;
              }
            }
            if (!removido) { await sock.sendMessage(from, { text: 'ℹ️ Nenhum convite pendente!' }, { quoted: msg }); return }
            salvarConvites(dbRC);
            await sock.sendMessage(from, {
              text: '╭━━━〔 🗑️ 𝐂𝐎𝐍𝐕𝐈𝐓𝐄 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐎 🗑️ 〕━━━╮\n┃\n┃ ✅ Convite(s) cancelado(s)!\n┃\n┃ 👤 @' + sender.split('@')[0] + '\n┃ 👥 Grupo: ' + (from.split('@')[0]) + '\n┃\n┃ 💜 Pode convidar de novo!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
