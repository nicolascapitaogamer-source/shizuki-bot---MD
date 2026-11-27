// Gerado de index.js (case 'topmembros', linha 9421)
export default {
  nomes: ["topmembros"],
  async executar(__x) {
    const { getAdminFlag, carregarJSON, FILE_STATS, isGroup, from, sender, isDono, sock, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) return
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }
            const stats = carregarJSON(FILE_STATS);
            const ranking = gm.participants
              .map(p => ({ id: p.id, msgs: (stats[p.id] && stats[p.id].mensagens) || 0 }))
              .sort((a, b) => b.msgs - a.msgs)
              .slice(0, 10);
            if (!ranking.length) { await sock.sendMessage(from, { text: 'ℹ️ Ninguém tem estatística ainda!' }, { quoted: msg }); return }
            let txt = `╭━━━〔 🏆 𝐓𝐎𝐏 𝐌𝐄𝐌𝐁𝐑𝐎𝐒 〕━━━╮\n┃\n`;
            const medalhas = ['🥇', '🥈', '🥉'];
            const mentions = [];
            ranking.forEach((r, i) => {
              const med = medalhas[i] || `${i + 1}️⃣`;
              txt += `┃ ${med} @${r.id.split('@')[0]} ➜ *${r.msgs} msgs*\n`;
              mentions.push(r.id);
            });
            txt += `┃\n┃ 💜 Parabéns aos tagarelas!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`;
            await sock.sendMessage(from, { text: txt, mentions }, { quoted: msg });
          }
          return
    }
  }
};
