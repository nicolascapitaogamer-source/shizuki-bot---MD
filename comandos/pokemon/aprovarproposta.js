// Gerado de index.js (case 'aprovarproposta', linha 13419)
export default {
  nomes: ["aprovarproposta"],
  async executar(__x) {
    const { carregarPropostas, salvarPropostas, isDono, sock, from, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono!' }, { quoted: msg }); return }
            const idA = args[0];
            if (!idA) { await sock.sendMessage(from, { text: '⚠️ Use: *!aprovarproposta <id>*' }, { quoted: msg }); return }
            const idAf = idA.startsWith('#') ? idA : '#' + idA.padStart(3, '0');
            const dbAP = carregarPropostas();
            if (!dbAP[idAf]) { await sock.sendMessage(from, { text: '❌ Proposta ' + idAf + ' não encontrada!' }, { quoted: msg }); return }
            dbAP[idAf].status = 'aprovada';
            dbAP[idAf].aprovadaEm = Date.now();
            salvarPropostas(dbAP);
            await sock.sendMessage(from, {
              text: '╭━━━〔 ✅ 𝐏𝐑𝐎𝐏𝐎𝐒𝐓𝐀 𝐀𝐏𝐑𝐎𝐕𝐀𝐃𝐀 ✅ 〕━━━╮\n┃\n┃ 📜 Proposta: *' + dbAP[idAf].id + '*\n┃ 👤 De: @' + dbAP[idAf].candidato.split('@')[0] + '\n┃\n┃ 📝 "' + dbAP[idAf].texto.slice(0, 80) + '"\n┃\n┃ ✅ Status: *APROVADA*\n┃ 👑 Por: dono\n┃\n┃ 💜 Boa sorte na eleição!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [dbAP[idAf].candidato]
            }, { quoted: msg });
          }
          return
    }
  }
};
