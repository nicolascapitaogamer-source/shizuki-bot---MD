// Gerado de index.js (case 'promover', linha 12090)
export default {
  nomes: ["promover","promote"],
  async executar(__x) {
    const { getAdminFlag, isGroup, sock, from, msg, sender, isDono } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) {
              await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
              return
            }
            try {
              const gmPro = await globalThis.__getGroupMetadata(from);
              const partPro = gmPro.participants;
              const senderAdmPro = getAdminFlag(partPro, sender);
              if (!senderAdmPro && !isDono) {
                await sock.sendMessage(from, { text: '🚫 Apenas administradores do grupo podem promover membros!' }, { quoted: msg });
                return
              }
              const ctxPro = msg.message.extendedTextMessage?.contextInfo;
              const alvoPro = ctxPro?.mentionedJid?.[0] || ctxPro?.participant;
              if (!alvoPro) {
                await sock.sendMessage(from, { text: '⚠️ Marque a pessoa com @ ou responda à mensagem dela para promover.\n\nEx: `!promover @pessoa`' }, { quoted: msg });
                return
              }
              if (getAdminFlag(partPro, alvoPro)) {
                await sock.sendMessage(from, { text: `👑 @${alvoPro.split('@')[0]} já é administrador(a) do grupo!`, mentions: [alvoPro] }, { quoted: msg });
                return
              }
              await sock.groupParticipantsUpdate(from, [alvoPro], 'promote');
              await sock.sendMessage(from, {
                text: `🎉 *PROMOÇÃO!* 🎉\n\n` +
                      `👤 @${alvoPro.split('@')[0]} acaba de subir de cargo!\n` +
                      `👑 Agora é *administrador(a)* do grupo\n` +
                      `🛡️ Promovido(a) por: @${sender.split('@')[0]}\n\n` +
                      `Use seus poderes com sabedoria! ✨`,
                mentions: [alvoPro, sender]
              });
            } catch (err) {
              console.error('Erro no comando !promover:', err);
              await sock.sendMessage(from, { text: '❌ Não consegui promover. Verifique se o bot é ADM do grupo!' }, { quoted: msg });
            }
          }
          return
    }
  }
};
