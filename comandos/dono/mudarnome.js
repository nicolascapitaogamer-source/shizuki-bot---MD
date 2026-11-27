// Gerado de index.js (case 'mudarnome', linha 10033)
export default {
  nomes: ["mudarnome"],
  async executar(__x) {
    const { eVIP, vipDB, salvarVipDB, sender, isDono, sock, from, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!eVIP(sender) && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas VIPs podem usar isso!' }, { quoted: msg }); return }
            const novo = args.join(' ').trim();
            if (!novo) { await sock.sendMessage(from, { text: '⚠️ Use: `!mudarnome <novo nome>`' }, { quoted: msg }); return }
            if (novo.length > 50) { await sock.sendMessage(from, { text: '⚠️ Máximo de 50 caracteres!' }, { quoted: msg }); return }

            const db = vipDB();
            db.vips = db.vips || {};
            db.vips[sender] = db.vips[sender] || { desde: Date.now(), expira: null };
            db.vips[sender].apelido = novo;
            salvarVipDB(db);
            await sock.sendMessage(from, {
              text: `╭━━━〔 ✏️ 𝐍𝐎𝐌𝐄 𝐌𝐔𝐃𝐀𝐃𝐎! 〕━━━╮\n┃\n┃ 💜 Seu novo nome é:\n┃\n┃ 👑 『 ${novo} 』\n┃\n┃ 🕊️ Atualizado~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
