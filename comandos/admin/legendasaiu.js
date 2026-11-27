// Gerado de index.js (case 'legendasaiu', linha 9491)
export default {
  nomes: ["legendasaiu","setlegendasaida"],
  async executar(__x) {
    const { getAdminFlag, carregarJSON, salvarJSON, isGroup, from, sender, isDono, sock, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) return
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }
            const db = carregarJSON('./saidas.json');
            const txt = args.join(' ').trim();
            if (!txt) {
              const atual = db[from] || '_não definida_';
              await sock.sendMessage(from, {
                text: `╭━━━〔 📝 𝐋𝐄𝐆𝐄𝐍𝐃𝐀 𝐒𝐀𝐈́𝐃𝐀 〕━━━╮\n┃\n┃ 💜 Legenda atual:\n┃\n┃ _${atual}_\n┃\n┃ 💡 Use: *!legendasaiu <texto>*\n┃ 💜 Use *@user* pra mencionar\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
              return
            }
            db[from] = txt;
            salvarJSON('./saidas.json', db);
            await sock.sendMessage(from, {
              text: `╭━━━〔 📝 𝐋𝐄𝐆𝐄𝐍𝐃𝐀 𝐒𝐀𝐋𝐕𝐀 〕━━━╮\n┃\n┃ 💜 Legenda de saída salva!\n┃\n┃ 📝 _${txt}_\n┃\n┃ 🕊️ Toda vez que alguém sair,\n┃    o bot vai usar essa msg~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
          }
          return
    }
  }
};
