// Gerado de index.js (case 'frase', linha 9533)
export default {
  nomes: ["frase"],
  async executar(__x) {
    const { getAdminFlag, isGroup, from, sender, isDono, sock, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) return
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }
            const txt = args.join(' ').trim();
            if (!txt) { await sock.sendMessage(from, { text: '⚠️ Use: `!frase <texto>`' }, { quoted: msg }); return }
            await sock.sendMessage(from, {
              text: `✨ *Frase do dia:* ✨\n\n_"${txt}"_\n\n💜 Compartilhe com alguém!`
            }, { quoted: msg });
          }
          return
    }
  }
};
