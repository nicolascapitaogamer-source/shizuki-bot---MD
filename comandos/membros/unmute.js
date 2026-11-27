// Gerado de index.js (case 'unmute', linha 12827)
export default {
  nomes: ["unmute","desmutar"],
  async executar(__x) {
    const { getAdminFlag, carregarJSON, FILE_MUTES, salvarJSON, isGroup, sock, from, msg, sender } = Object.assign({}, __x.utils, __x);
    {
if (!isGroup) {
            await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
            return
          }

          try {
            const groupMetadata = await globalThis.__getGroupMetadata(from);
            const participants = groupMetadata.participants;

            const senderAdmin = getAdminFlag(participants, sender);

            if (!senderAdmin) {
              await sock.sendMessage(from, { text: '🚫 Apenas administradores do grupo podem desmutar membros!' }, { quoted: msg });
              return
            }

            let targetUser = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                             msg.message.extendedTextMessage?.contextInfo?.participant;

            if (!targetUser) {
              await sock.sendMessage(from, { text: '⚠️ Marque a pessoa com @ ou responda à mensagem para desmutar.' }, { quoted: msg });
              return
            }

            let mutes = carregarJSON(FILE_MUTES);
            if (mutes[from] && mutes[from][targetUser]) {
              delete mutes[from][targetUser];
              salvarJSON(FILE_MUTES, mutes);

              await sock.sendMessage(from, {
                text: `🔊 @${targetUser.split('@')[0]} você não esta mais mutado, esta livre! 🕊️✨`,
                mentions: [targetUser]
              });
            } else {
              await sock.sendMessage(from, { text: 'ℹ️ Este membro não está mutado.' }, { quoted: msg });
            }

          } catch (err) {
            console.error('Erro no comando !unmute:', err);
            await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao desmutar o membro.' }, { quoted: msg });
          }
          return
    }
  }
};
