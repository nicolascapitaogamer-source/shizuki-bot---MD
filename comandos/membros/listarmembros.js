// Gerado de index.js (case 'listarmembros', linha 14584)
export default {
  nomes: ["listarmembros"],
  async executar(__x) {
    const { isGroup, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gmLi = await globalThis.__getGroupMetadata(from);
            const total = gmLi.participants.length;
            const adminsLi = gmLi.participants.filter(p => p.admin);
            const naoAdmins = gmLi.participants.filter(p => !p.admin);
            let txtLi = '╭━━━〔 📋 𝐋𝐈𝐒𝐓𝐀 𝐃𝐄 𝐌𝐄𝐌𝐁𝐑𝐎𝐒 📋 〕━━━╮\n┃\n┃ 📊 Total: *' + total + '* membros\n┃ 👑 Admins: *' + adminsLi.length + '*\n┃\n';
            const mencsLi = [];
            txtLi += '┣━━━〔 👑 𝐀𝐃𝐌𝐈𝐍𝐒 〕━━━\n┃\n';
            for (const a of adminsLi) {
              const emoji = a.admin === 'superadmin' ? '👑' : '🛡️';
              txtLi += '┃ ' + emoji + ' @' + a.id.split('@')[0] + '\n';
              mencsLi.push(a.id);
            }
            txtLi += '┃\n┣━━━〔 👥 𝐌𝐄𝐌𝐁𝐑𝐎𝐒 〕━━━\n┃\n';
            const limLi = Math.min(naoAdmins.length, 20);
            for (let i = 0; i < limLi; i++) {
              txtLi += '┃ 👤 @' + naoAdmins[i].id.split('@')[0] + '\n';
              mencsLi.push(naoAdmins[i].id);
            }
            if (naoAdmins.length > 20) txtLi += '┃ ... +' + (naoAdmins.length - 20) + ' membros\n';
            txtLi += '┃\n╰━━━━━━━━━━━━━━━━━━╯';
            await sock.sendMessage(from, { text: txtLi, mentions: mencsLi }, { quoted: msg });
          }
          return
    }
  }
};
