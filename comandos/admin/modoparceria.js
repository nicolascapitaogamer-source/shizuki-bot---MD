// Gerado de index.js (case 'modoparceria', linha 9169)
export default {
  nomes: ["modoparceria"],
  async executar(__x) {
    const { getAdminFlag, carregarJSON, salvarJSON, isGroup, from, sender, isDono, sock, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) return
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) {
              await sock.sendMessage(from, {
                text: `╭━━━〔 🚫 𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎 〕━━━╮\n┃\n┃ 💔 Apenas *admins*, *líderes*\n┃    e o *dono* podem usar isso!\n┃\n┃ 🕊️ Peça ajuda a um deles~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
              return
            }

            const db = carregarJSON('./parcerias.json');
            db[from] = db[from] || { ativo: false, parceiros: {} };
            const sub = (args[0] || '').toLowerCase();

            if (sub === 'on') db[from].ativo = true;
            else if (sub === 'off') db[from].ativo = false;
            else db[from].ativo = !db[from].ativo;

            salvarJSON('./parcerias.json', db);

            if (sub === 'on' || (!sub && db[from].ativo)) {
              await sock.sendMessage(from, {
                text: `╭━━━〔 🤝 𝐌𝐎𝐃𝐎 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀 〕━━━╮\n┃\n┃ 💜 *Ativado com sucesso~* ✨\n┃\n┃ 🔗 Agora só quem tem parceria\n┃    pode compartilhar links aqui!\n┃\n┃ 💡 Use: *!addparceria @pessoa <qtd>*\n┃\n┃ 🕊️ Tudo pronto pra começar~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
            } else if (sub === 'off' || (!sub && !db[from].ativo)) {
              await sock.sendMessage(from, {
                text: `╭━━━〔 🤝 𝐌𝐎𝐃𝐎 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀 〕━━━╮\n┃\n┃ 💤 *Desativado~*\n┃\n┃ 🔗 Agora todos podem\n┃    mandar links livremente! 🕊️\n┃\n┃ 💜 O modo parceria deu\n┃    uma pausa neste grupo~\n┃\n┃ ✨ Até a próxima!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
            } else {
              const status = db[from].ativo ? '✅ Ativo' : '❌ Desativado';
              await sock.sendMessage(from, {
                text: `╭━━━〔 🤝 𝐌𝐎𝐃𝐎 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀 〕━━━╮\n┃\n┃ 🔘 Status: *${status}* 💜\n┃\n┃ 🔗 Só quem tem parceria\n┃    pode compartilhar links~\n┃\n┃ 💡 Use: *!modoparceria on/off*\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
            }
          }
          return
    }
  }
};
