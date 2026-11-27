// Gerado de index.js (case 'advertidos', linha 9088)
export default {
  nomes: ["advertidos","listaradv"],
  async executar(__x) {
    const { getAdminFlag, carregarJSON, FILE_ADVS, isGroup, sock, from, msg, sender, isDono } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }
            const advs = carregarJSON(FILE_ADVS);
            const doGrupo = advs[from] || {};
            const ids = Object.keys(doGrupo);
            if (!ids.length) {
              await sock.sendMessage(from, { text: '✅ Nenhum membro com advertência!' }, { quoted: msg });
              return
            }
            let txt = `╭━━━〔 ⚠️ 𝐀𝐃𝐕𝐄𝐑𝐓𝐈𝐃𝐎𝐒 ⚠️ 〕━━━╮\n┃\n`;
            ids.forEach(j => {
              const qtd = doGrupo[j];
              const emoji = qtd >= 2 ? '🔴' : qtd >= 1 ? '🟡' : '⚪';
              txt += `┃ ${emoji} @${j.split('@')[0]} ➜ *${qtd}/3*\n`;
            });
            txt += `┃\n╰━━━━━━━━━━━━━━━━━━╯`;
            await sock.sendMessage(from, { text: txt, mentions: ids }, { quoted: msg });
          }
          return
    }
  }
};
