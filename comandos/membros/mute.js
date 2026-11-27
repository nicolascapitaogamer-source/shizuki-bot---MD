// Gerado de index.js (case 'mute', linha 12773)
export default {
  nomes: ["mute","mutar"],
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
              await sock.sendMessage(from, { text: '🚫 Apenas administradores do grupo podem mutar membros!' }, { quoted: msg });
              return
            }

            let targetUser = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                             msg.message.extendedTextMessage?.contextInfo?.participant;

            if (!targetUser) {
              await sock.sendMessage(from, { text: '⚠️ Marque a pessoa com @ ou responda à mensagem para mutar.' }, { quoted: msg });
              return
            }

            const targetAdmin = getAdminFlag(participants, targetUser);
            if (targetAdmin) {
              await sock.sendMessage(from, { text: '🛡️ Administradores do grupo não podem ser mutados!' }, { quoted: msg });
              return
            }

            let mutes = carregarJSON(FILE_MUTES);
            if (!mutes[from]) mutes[from] = {};
            mutes[from][targetUser] = true;
            salvarJSON(FILE_MUTES, mutes);

            const mensagemMute = 
              `🔇 *VOCÊ FOI MUTADO(A)!* 🔇\n\n` +
              `👤 *Membro:* @${targetUser.split('@')[0]}\n\n` +
              `⚠️ *AVISO CRÍTICO:* Você está proibido(a) de mandar qualquer mensagem neste grupo.\n` +
              `🚫 *Se enviar qualquer mensagem enquanto estiver mutado(a), você será BANIDO(A) AUTOMATICAMENTE!*`;

            await sock.sendMessage(from, {
              text: mensagemMute,
              mentions: [targetUser]
            });

          } catch (err) {
            console.error('Erro no comando !mute:', err);
            await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao mutar o membro.' }, { quoted: msg });
          }
          return
    }
  }
};
