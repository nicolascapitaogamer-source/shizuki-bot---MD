// Gerado de index.js (case 'rejeitarproposta', linha 13437)
export default {
  nomes: ["rejeitarproposta"],
  async executar(__x) {
    const { carregarPropostas, salvarPropostas, isDono, sock, from, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono!' }, { quoted: msg }); return }
            const idR = args[0];
            if (!idR) { await sock.sendMessage(from, { text: '⚠️ Use: *!rejeitarproposta <id>*' }, { quoted: msg }); return }
            const idRf = idR.startsWith('#') ? idR : '#' + idR.padStart(3, '0');
            const dbRP = carregarPropostas();
            if (!dbRP[idRf]) { await sock.sendMessage(from, { text: '❌ Proposta ' + idRf + ' não encontrada!' }, { quoted: msg }); return }
            dbRP[idRf].status = 'rejeitada';
            dbRP[idRf].rejeitadaEm = Date.now();
            salvarPropostas(dbRP);
            await sock.sendMessage(from, {
              text: '╭━━━〔 ❌ 𝐏𝐑𝐎𝐏𝐎𝐒𝐓𝐀 𝐑𝐄𝐉𝐄𝐈𝐓𝐀𝐃𝐀 ❌ 〕━━━╮\n┃\n┃ 📜 Proposta: *' + dbRP[idRf].id + '*\n┃ 👤 De: @' + dbRP[idRf].candidato.split('@')[0] + '\n┃\n┃ 📝 "' + dbRP[idRf].texto.slice(0, 80) + '"\n┃\n┃ ❌ Status: *REJEITADA*\n┃ 👑 Por: dono\n┃\n┃ 💜 Tenta outra próxima vez!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [dbRP[idRf].candidato]
            }, { quoted: msg });
          }
          return
    }
  }
};
