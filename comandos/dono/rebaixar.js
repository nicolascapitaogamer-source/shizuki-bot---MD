// Gerado de index.js (case 'rebaixar', linha 12131)
export default {
  nomes: ["rebaixar","demote"],
  async executar(__x) {
    const { getAdminFlag, isGroup, sock, from, msg, sender, isDono } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) {
              await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
              return
            }
            try {
              const gmReb = await globalThis.__getGroupMetadata(from);
              const partReb = gmReb.participants;
              const senderAdmReb = getAdminFlag(partReb, sender);
              if (!senderAdmReb && !isDono) {
                await sock.sendMessage(from, { text: '🚫 Apenas administradores do grupo podem rebaixar membros!' }, { quoted: msg });
                return
              }
              const ctxReb = msg.message.extendedTextMessage?.contextInfo;
              const alvoReb = ctxReb?.mentionedJid?.[0] || ctxReb?.participant;
              if (!alvoReb) {
                await sock.sendMessage(from, { text: '⚠️ Marque o adm com @ ou responda à mensagem dele para rebaixar.\n\nEx: `!rebaixar @pessoa`' }, { quoted: msg });
                return
              }
              const _nR = j => (j || "").split(":")[0].split("@")[0]; const infoReb = partReb.find(p => [p.id, p.lid, p.jid, p.phoneNumber].filter(Boolean).map(_nR).includes(_nR(alvoReb)));
              if (!infoReb?.admin) {
                await sock.sendMessage(from, { text: `ℹ️ @${alvoReb.split('@')[0]} não é administrador(a) do grupo.`, mentions: [alvoReb] }, { quoted: msg });
                return
              }
              if (infoReb.admin === 'superadmin') {
                await sock.sendMessage(from, { text: '👑 O criador do grupo não pode ser rebaixado!' }, { quoted: msg });
                return
              }
              await sock.groupParticipantsUpdate(from, [infoReb.id], 'demote');
              await sock.sendMessage(from, {
                text: `📉 *REBAIXAMENTO!* 📉\n\n` +
                      `👤 @${alvoReb.split('@')[0]} perdeu a coroa!\n` +
                      `🛡️ Não é mais *administrador(a)* do grupo\n` +
                      `👮 Ação feita por: @${sender.split('@')[0]}\n\n` +
                      `Quem sabe numa próxima... 😔`,
                mentions: [alvoReb, sender]
              });
            } catch (err) {
              console.error('Erro no comando !rebaixar:', err);
              await sock.sendMessage(from, { text: '❌ Não consegui rebaixar. Verifique se o bot é ADM do grupo!' }, { quoted: msg });
            }
          }
          return
    }
  }
};
