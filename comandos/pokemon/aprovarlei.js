// Gerado de index.js (case 'aprovarlei', linha 13778)
export default {
  nomes: ["aprovarlei"],
  async executar(__x) {
    const { carregarLeis, salvarLeis, isDono, sock, from, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono!' }, { quoted: msg }); return }
            const idAL = args[0];
            if (!idAL) { await sock.sendMessage(from, { text: '⚠️ Use: *!aprovarlei <id>*' }, { quoted: msg }); return }
            const idALf = idAL.startsWith('#') ? idAL : '#' + idAL.padStart(3, '0');
            const dbAL = carregarLeis();
            if (!dbAL[idALf]) { await sock.sendMessage(from, { text: '❌ Lei ' + idALf + ' não encontrada!' }, { quoted: msg }); return }
            dbAL[idALf].status = 'aprovada';
            dbAL[idALf].aprovadaEm = Date.now();
            salvarLeis(dbAL);
            await sock.sendMessage(from, {
              text: '╭━━━〔 ✅ 𝐋𝐄𝐈 𝐀𝐏𝐑𝐎𝐕𝐀𝐃𝐀 ✅ 〕━━━╮\n┃\n┃ 📜 Lei: *' + dbAL[idALf].id + '*\n┃ 👤 Por: @' + dbAL[idALf].presidente.split('@')[0] + '\n┃ 📝 "' + dbAL[idALf].texto.slice(0, 80) + '"\n┃\n┃ ✅ Status: *EM VIGOR*\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [dbAL[idALf].presidente]
            }, { quoted: msg });
          }
          return
    }
  }
};
