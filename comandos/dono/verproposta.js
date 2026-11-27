// Gerado de index.js (case 'verproposta', linha 13402)
export default {
  nomes: ["verproposta"],
  async executar(__x) {
    const { carregarPropostas, isDono, sock, from, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono!' }, { quoted: msg }); return }
            const idV = args[0];
            if (!idV) { await sock.sendMessage(from, { text: '⚠️ Use: *!verproposta <id>*' }, { quoted: msg }); return }
            const idVf = idV.startsWith('#') ? idV : '#' + idV.padStart(3, '0');
            const dbVP = carregarPropostas();
            const pV = dbVP[idVf];
            if (!pV) { await sock.sendMessage(from, { text: '❌ Proposta ' + idVf + ' não encontrada!' }, { quoted: msg }); return }
            const gP = pV.grupo ? (await globalThis.__getGroupMetadata(pV.grupo).catch(() => ({ subject: 'Grupo' }))).subject : 'Grupo';
            await sock.sendMessage(from, {
              text: '╭━━━〔 👁️ 𝐃𝐄𝐓𝐀𝐋𝐇𝐄𝐒 👁️ 〕━━━╮\n┃\n┃ 📜 ID: *' + pV.id + '*\n┃ 👤 Candidato: @' + pV.candidato.split('@')[0] + '\n┃ 👥 Grupo: ' + gP + '\n┃ 📅 Status: *' + pV.status + '*\n┃\n┃ 📝 Proposta:\n┃ "' + pV.texto + '"\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [pV.candidato]
            }, { quoted: msg });
          }
          return
    }
  }
};
