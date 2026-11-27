// Gerado de index.js (case 'gpinfo', linha 14500)
export default {
  nomes: ["gpinfo"],
  async executar(__x) {
    const { isGroup, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gmI = await globalThis.__getGroupMetadata(from);
            const criado = gmI.creation ? new Date(gmI.creation * 1000).toLocaleDateString('pt-BR') : 'Desconhecido';
            const admins = gmI.participants.filter(p => p.admin).length;
            const membros = gmI.participants.length;
            await sock.sendMessage(from, {
              text: '╭━━━〔 📊 𝐈𝐍𝐅𝐎 𝐃𝐎 𝐆𝐑𝐔𝐏𝐎 📊 〕━━━╮\n┃\n┃ 📛 Nome: ' + gmI.subject + '\n┃ 🆔 ID: ' + from.split('@')[0] + '\n┃ 👥 Membros: ' + membros + '\n┃ 👑 Admins: ' + admins + '\n┃ 📅 Criado: ' + criado + '\n┃\n┃ 💜 Info completa!\n┃\n╰━━━━━━━━━━━━━━━━━━╯'
            }, { quoted: msg });
          }
          return
    }
  }
};
