// Gerado de index.js (case 'descgp', linha 14434)
export default {
  nomes: ["descgp"],
  async executar(__x) {
    const { getAdminFlag, isGroup, sock, from, msg, sender, isDono, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gmD = await globalThis.__getGroupMetadata(from);
            const ehAdmD = !!getAdminFlag(gmD.participants, sender);
            if (!ehAdmD && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }
            const novaDesc = args.join(' ').trim();
            if (!novaDesc) { await sock.sendMessage(from, { text: '⚠️ Use: *!descgp <texto>*' }, { quoted: msg }); return }
            try {
              await sock.groupUpdateDescription(from, novaDesc);
              await sock.sendMessage(from, {
                text: '╭━━━〔 📝 𝐃𝐄𝐒𝐂𝐑𝐈𝐂̧𝐀̃𝐎 📝 〕━━━╮\n┃\n┃ ✅ Descrição atualizada!\n┃\n┃ 📝 "' + novaDesc.slice(0, 80) + '"\n┃ 👑 Por: @' + sender.split('@')[0] + '\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
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
