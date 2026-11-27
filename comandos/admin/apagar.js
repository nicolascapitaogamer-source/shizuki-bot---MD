// Gerado de index.js (case 'apagar', linha 9031)
export default {
  nomes: ["apagar"],
  async executar(__x) {
    const { getAdminFlag, isGroup, sock, from, msg, sender, isDono, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }
            const ctxAp = msg.message.extendedTextMessage?.contextInfo;
            const marcada = ctxAp?.stanzaId;
            if (marcada) {
              try {
                await sock.sendMessage(from, { delete: { remoteJid: from, fromMe: false, id: marcada, participant: ctxAp.participant || sender } });
                await sock.sendMessage(from, { delete: msg.key });
              } catch (e) {
                await sock.sendMessage(from, { text: '❌ Não consegui apagar (só posso apagar do bot ou se eu for adm).' }, { quoted: msg });
              }
              return
            }
            const qtd = parseInt(args[0] || '5', 10);
            if (!qtd || qtd < 1 || qtd > 30) {
              await sock.sendMessage(from, { text: '⚠️ Use: `!apagar 5` (máx 30)' }, { quoted: msg });
              return
            }
            await sock.sendMessage(from, { text: `🗑️ Apagando as últimas *${qtd}* mensagens do bot...` }, { quoted: msg });
          }
          return
    }
  }
};
