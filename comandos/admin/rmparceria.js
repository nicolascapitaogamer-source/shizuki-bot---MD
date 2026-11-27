// Gerado de index.js (case 'rmparceria', linha 9255)
export default {
  nomes: ["rmparceria"],
  async executar(__x) {
    const { getAdminFlag, carregarJSON, salvarJSON, isGroup, from, sender, config, isDono, sock, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) return
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            const ehLider = (config.lideres || []).some(l => l && String(l).split('@')[0] === sender.split('@')[0]);
            if (!ehAdm && !ehLider && !isDono) {
              await sock.sendMessage(from, {
                text: `╭━━━〔 🚫 𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎 〕━━━╮\n┃\n┃ 💔 Apenas *admins*, *líderes*\n┃    e o *dono* podem usar isso!\n┃\n┃ 🕊️ Peça ajuda a um deles~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
              return
            }

            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;
            if (!alvo) {
              await sock.sendMessage(from, { text: '⚠️ *Oops!* Marque a pessoa!\n\n💡 Ex: *!rmparceria @pessoa*' }, { quoted: msg });
              return
            }

            const db = carregarJSON('./parcerias.json');
            if (!db[from] || !db[from].parceiros || !db[from].parceiros[alvo]) {
              await sock.sendMessage(from, {
                text: `╭━━━〔 💔 𝐒𝐄𝐌 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀 〕━━━╮\n┃\n┃ 💜 Essa pessoa não tem\n┃    parceria neste grupo~\n┃\n┃ 🕊️ Use *!addparceria* pra criar!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
              return
            }
            delete db[from].parceiros[alvo];
            salvarJSON('./parcerias.json', db);

            await sock.sendMessage(from, {
              text: `╭━━━〔 🤝 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐀 〕━━━╮\n┃\n┃ 💜 Até logo, @${alvo.split('@')[0]}!\n┃\n┃ ❌ A parceria foi removida\n┃    com sucesso. ✨\n┃\n┃ 🕊️ Agora você não tem mais\n┃    parceria neste grupo~\n┃\n┃ 💌 Se quiser voltar, é só\n┃    falar com um adm!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [alvo]
            }, { quoted: msg });
          }
          return
    }
  }
};
