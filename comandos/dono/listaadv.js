// Gerado de index.js (case 'listaadv', linha 11884)
export default {
  nomes: ["listaadv","listadv"],
  async executar(__x) {
    const { getAdminFlag, carregarJSON, FILE_ADVS, isGroup, sock, from, msg, sender, isDono } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) {
              await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
              return
            }
            try {
              const gmLista = await globalThis.__getGroupMetadata(from);
              const admLista = getAdminFlag(gmLista.participants, sender);
              if (!admLista && !isDono) {
                await sock.sendMessage(from, { text: '🚫 Apenas administradores do grupo podem usar este comando!' }, { quoted: msg });
                return
              }
              const ctxLista = msg.message.extendedTextMessage?.contextInfo;
              const alvoLista = ctxLista?.mentionedJid?.[0] || ctxLista?.participant;
              if (!alvoLista) {
                await sock.sendMessage(from, { text: '⚠️ Marque a pessoa com @ ou responda à mensagem dela.' }, { quoted: msg });
                return
              }
              const advsLista = carregarJSON(FILE_ADVS);
              const qtdAdv = advsLista[from]?.[alvoLista] || 0;
              const textoLista =
                `📋 *LISTA DE ADVERTÊNCIAS*\n\n` +
                `👤 *Membro:* @${alvoLista.split('@')[0]}\n` +
                `⚠️ *Advertências:* [${qtdAdv}/3]\n\n` +
                (qtdAdv === 0 ? `✅ Essa pessoa não tem advertências.` : `📢 Faltam ${3 - qtdAdv} para ser removido(a) do grupo.`);
              await sock.sendMessage(from, { text: textoLista, mentions: [alvoLista] }, { quoted: msg });
            } catch (err) {
              console.error('Erro no comando !listaadv:', err);
              await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao consultar as advertências.' }, { quoted: msg });
            }
          }
          return
    }
  }
};
