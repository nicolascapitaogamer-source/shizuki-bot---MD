// Gerado de index.js (case 'removerpresidente', linha 13697)
export default {
  nomes: ["removerpresidente"],
  async executar(__x) {
    const { carregarPresidente, salvarPresidente, isDono, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono!' }, { quoted: msg }); return }
            const dbRP = carregarPresidente();
            if (!dbRP.atual) { await sock.sendMessage(from, { text: '❌ Nenhum presidente eleito!' }, { quoted: msg }); return }
            const exRP = dbRP.atual;
            dbRP.atual = null;
            salvarPresidente(dbRP);
            await sock.sendMessage(from, {
              text: '╭━━━〔 👑 𝐏𝐑𝐄𝐒𝐈𝐃𝐄𝐍𝐓𝐄 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐎 👑 〕━━━╮\n┃\n┃ 👤 Ex-presidente: @' + exRP.jid.split('@')[0] + '\n┃ 📅 Removido pelo dono\n┃\n┃ 🗳️ Novas eleições em breve!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [exRP.jid]
            }, { quoted: msg });
          }
          return
    }
  }
};
