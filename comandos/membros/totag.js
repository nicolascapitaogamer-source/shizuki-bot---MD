// Gerado de index.js (case 'totag', linha 11716)
export default {
  nomes: ["totag","hidetag"],
  async executar(__x) {
    const { getAdminFlag, isGroup, sock, from, msg, sender, args } = Object.assign({}, __x.utils, __x);
    {
if (!isGroup) {
            await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
            return
          }

          try {
            const gmTag = await globalThis.__getGroupMetadata(from);
            const partTag = gmTag.participants;
            const senderAdminTag = getAdminFlag(partTag, sender);

            if (!senderAdminTag) {
              await sock.sendMessage(from, { text: '🚫 Apenas administradores do grupo podem usar este comando!' }, { quoted: msg });
              return
            }

            const qTag = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            const textoTag = qTag?.conversation || qTag?.extendedTextMessage?.text || args.join(' ');

            if (!textoTag) {
              await sock.sendMessage(from, { text: '⚠️ Marque uma mensagem de texto ou escreva o texto. Ex: `!totag reunião agora`' }, { quoted: msg });
              return
            }

            await sock.sendMessage(from, {
              text: textoTag,
              mentions: partTag.map(p => p.id)
            });
          } catch (err) {
            console.error('Erro no comando !totag:', err);
            await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao marcar todos.' }, { quoted: msg });
          }
          return
    }
  }
};
