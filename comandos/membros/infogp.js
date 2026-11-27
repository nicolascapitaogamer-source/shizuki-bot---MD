// Gerado de index.js (case 'infogp', linha 9402)
export default {
  nomes: ["infogp","infogrupo"],
  async executar(__x) {
    const { isGroup, from, sock, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) return
            const gm = await globalThis.__getGroupMetadata(from);
            const criado = gm.creation ? new Date(gm.creation * 1000).toLocaleDateString('pt-BR') : 'Desconhecido';
            const admins = gm.participants.filter(p => p.admin).length;
            await sock.sendMessage(from, {
              text: `╭━━━〔 📋 𝐈𝐍𝐅𝐎 𝐃𝐎 𝐆𝐑𝐔𝐏𝐎 〕━━━╮\n┃\n` +
                    `┃ 👥 *${gm.subject}*\n┃\n` +
                    `┃ 🆔 ID: *${from.split('@')[0]}*\n` +
                    `┃ 👤 Membros: *${gm.participants.length}*\n` +
                    `┃ 👑 Admins: *${admins}*\n` +
                    `┃ 📅 Criado em: *${criado}*\n┃\n` +
                    `┃ 💜 É isso aí~\n┃\n` +
                    `╰━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
          }
          return
    }
  }
};
