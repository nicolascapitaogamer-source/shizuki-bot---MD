// Gerado de index.js (case 'nomegp', linha 14412)
export default {
  nomes: ["nomegp"],
  async executar(__x) {
    const { getAdminFlag, isGroup, sock, from, msg, sender, isDono, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gmN = await globalThis.__getGroupMetadata(from);
            const ehAdmN = !!getAdminFlag(gmN.participants, sender);
            if (!ehAdmN && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }
            const novoNome = args.join(' ').trim();
            if (!novoNome) { await sock.sendMessage(from, { text: '⚠️ Use: *!nomegp <nome>*' }, { quoted: msg }); return }
            if (novoNome.length > 25) { await sock.sendMessage(from, { text: '⚠️ Nome muito longo! Máx 25 chars.' }, { quoted: msg }); return }
            const nomeAntigo = gmN.subject;
            try {
              await sock.groupUpdateSubject(from, novoNome);
              await sock.sendMessage(from, {
                text: '╭━━━〔 ✏️ 𝐍𝐎𝐌𝐄 𝐀𝐋𝐓𝐄𝐑𝐀𝐃𝐎 ✏️ 〕━━━╮\n┃\n┃ 📛 Antes: ' + nomeAntigo + '\n┃ 📛 Agora: ' + novoNome + '\n┃ 👑 Por: @' + sender.split('@')[0] + '\n┃\n┃ 💜 Ficou top!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [sender]
              }, { quoted: msg });
            } catch (e) {
              await sock.sendMessage(from, { text: '❌ Não consegui mudar. O bot precisa ser admin!' }, { quoted: msg });
            }
          }
          return
    }
  }
};
