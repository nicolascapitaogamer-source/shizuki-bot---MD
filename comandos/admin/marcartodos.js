// Gerado de index.js (case 'marcartodos', linha 9011)
export default {
  nomes: ["marcartodos"],
  async executar(__x) {
    const { getAdminFlag, isGroup, sock, from, msg, sender, isDono, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }
            const txt = args.join(' ').trim();
            if (!txt) {
              await sock.sendMessage(from, { text: '⚠️ Escreva o texto!\n\nEx: `!marcartodos Reunião hoje às 20h`' }, { quoted: msg });
              return
            }
            const ids = gm.participants.map(p => p.id);
            let listaMencoes = ids.map(id => '@' + id.split('@')[0]).join(' ');
            await sock.sendMessage(from, {
              text: `📢 *𝐌𝐀𝐑𝐂𝐀𝐍𝐃𝐎 𝐓𝐎𝐃𝐎𝐒!* 📢\n\n${txt}\n\n${listaMencoes}`,
              mentions: ids
            }, { quoted: msg });
          }
          return
    }
  }
};
