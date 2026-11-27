// Gerado de index.js (case 'add', linha 9380)
export default {
  nomes: ["add"],
  async executar(__x) {
    const { getAdminFlag, isGroup, from, sender, isDono, sock, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) return
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }
            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;
            if (!alvo) { await sock.sendMessage(from, { text: '⚠️ Marque a pessoa!\n\nEx: `!add @pessoa`' }, { quoted: msg }); return }
            try {
              await sock.groupParticipantsUpdate(from, [alvo], 'add');
              await sock.sendMessage(from, {
                text: `╭━━━〔 ➕ 𝐌𝐄𝐌𝐁𝐑𝐎 𝐀𝐃𝐈𝐂𝐈𝐎𝐍𝐀𝐃𝐎 〕━━━╮\n┃\n┃ 💜 @${alvo.split('@')[0]}\n┃ ✅ Foi adicionado(a) com sucesso!\n┃\n┃ 🕊️ Bem-vindo(a) ao grupo!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                mentions: [alvo]
              }, { quoted: msg });
            } catch (e) {
              await sock.sendMessage(from, { text: '❌ Não consegui adicionar. O bot precisa ser admin e a pessoa precisa estar nos contatos dele.' }, { quoted: msg });
            }
          }
          return
    }
  }
};
