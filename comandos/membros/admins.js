// Gerado de index.js (case 'admins', linha 11751)
export default {
  nomes: ["admins","adms"],
  async executar(__x) {
    const { isGroup, sock, from, msg, args, sender } = Object.assign({}, __x.utils, __x);
    {
if (!isGroup) {
            await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
            return
          }

          try {
            const gmAdm = await globalThis.__getGroupMetadata(from);
            const listaAdm = gmAdm.participants.filter(p => p.admin).map(p => p.id);

            if (listaAdm.length === 0) {
              await sock.sendMessage(from, { text: 'ℹ️ Não encontrei administradores neste grupo.' }, { quoted: msg });
              return
            }

            const qAdm = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            const motivo = args.join(' ') || qAdm?.conversation || qAdm?.extendedTextMessage?.text || '';

            const textoAdm =
              `🚨 *CHAMANDO OS ADMS!* 🚨\n\n` +
              `👤 *Pedido por:* @${sender.split('@')[0]}\n` +
              (motivo ? `💬 *Motivo:* ${motivo}\n` : '') +
              `\n` +
              listaAdm.map(j => `🛡️ @${j.split('@')[0]}`).join('\n');

            await sock.sendMessage(from, {
              text: textoAdm,
              mentions: [...listaAdm, sender]
            }, { quoted: msg });
          } catch (err) {
            console.error('Erro no comando !admins:', err);
            await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao chamar os admins.' }, { quoted: msg });
          }
          return
    }
  }
};
