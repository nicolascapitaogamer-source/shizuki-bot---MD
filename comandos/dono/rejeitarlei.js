// Gerado de index.js (case 'rejeitarlei', linha 13796)
export default {
  nomes: ["rejeitarlei"],
  async executar(__x) {
    const { carregarLeis, salvarLeis, isDono, sock, from, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono!' }, { quoted: msg }); return }
            const idRL = args[0];
            if (!idRL) { await sock.sendMessage(from, { text: '⚠️ Use: *!rejeitarlei <id>*' }, { quoted: msg }); return }
            const idRLf = idRL.startsWith('#') ? idRL : '#' + idRL.padStart(3, '0');
            const dbRL = carregarLeis();
            if (!dbRL[idRLf]) { await sock.sendMessage(from, { text: '❌ Lei ' + idRLf + ' não encontrada!' }, { quoted: msg }); return }
            dbRL[idRLf].status = 'rejeitada';
            dbRL[idRLf].rejeitadaEm = Date.now();
            salvarLeis(dbRL);
            await sock.sendMessage(from, {
              text: '╭━━━〔 ❌ 𝐋𝐄𝐈 𝐑𝐄𝐉𝐄𝐈𝐓𝐀𝐃𝐀 ❌ 〕━━━╮\n┃\n┃ 📜 Lei: *' + dbRL[idRLf].id + '*\n┃ 👤 Por: @' + dbRL[idRLf].presidente.split('@')[0] + '\n┃ 📝 "' + dbRL[idRLf].texto.slice(0, 80) + '"\n┃\n┃ ❌ Status: *REJEITADA*\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [dbRL[idRLf].presidente]
            }, { quoted: msg });
          }
          return
    }
  }
};
