// Gerado de index.js (case 'regras', linha 9057)
export default {
  nomes: ["regras"],
  async executar(__x) {
    const { getAdminFlag, carregarJSON, salvarJSON, isGroup, sock, from, msg, sender, isDono, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }

            const db = carregarJSON('./regras.json');
            const txt = args.join(' ').trim();
            try { const __fm = await sock.groupMetadata(from); const __d = String(__fm.desc || '').trim(); if (!txt && __d) db[from] = __d; } catch (e) {}

            if (!txt) {
              if (db[from]) {
                await sock.sendMessage(from, {
                  text: `╭━━━〔 📜 𝐑𝐄𝐆𝐑𝐀𝐒 𝐃𝐎 𝐆𝐑𝐔𝐏𝐎 〕━━━╮\n┃\n${db[from].split('\n').map(l => '┃ ' + l).join('\n')}\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
                }, { quoted: msg });
              } else {
                await sock.sendMessage(from, { text: '📜 Nenhuma regra definida!\n\n💡 Use: `!regras <texto>` pra definir.' }, { quoted: msg });
              }
              return
            }

            db[from] = txt;
            salvarJSON('./regras.json', db);
            await sock.sendMessage(from, {
              text: `╭━━━〔 ✅ 𝐑𝐄𝐆𝐑𝐀𝐒 𝐒𝐀𝐋𝐕𝐀𝐒 〕━━━╮\n┃\n${txt.split('\n').map(l => '┃ ' + l).join('\n')}\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
          }
          return
    }
  }
};
