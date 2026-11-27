// Gerado de index.js (case 'pedirnamoro', linha 7030)
export default {
  nomes: ["pedirnamoro"],
  async executar(__x) {
    const { shizukiUser, msg, sock, from, sender } = Object.assign({}, __x.utils, __x);
    {
{
            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const alvo = ctx?.mentionedJid?.[0];
            if (!alvo) {
              await sock.sendMessage(from, { text: '⚠️ Marque alguém!\n\nEx: `!pedirnamoro @pessoa`' }, { quoted: msg });
              return
            }
            if (alvo === sender) {
              await sock.sendMessage(from, { text: '😅 Você não pode namorar consigo mesmo!' }, { quoted: msg });
              return
            }
            const uEu = shizukiUser(sender);
            const uAlvo = shizukiUser(alvo);
            if (uEu.namorando) {
              await sock.sendMessage(from, { text: `❌ Você já está namorando @${uEu.namorando.split('@')[0]}!\n\nUse *!terminar* primeiro.`, mentions: [uEu.namorando] }, { quoted: msg });
              return
            }
            if (uAlvo.namorando) {
              await sock.sendMessage(from, { text: `❌ @${alvo.split('@')[0]} já está namorando!`, mentions: [alvo] }, { quoted: msg });
              return
            }

            const enviado = await sock.sendMessage(from, {
              text: `💜 *PEDIDO DE NAMORO!* 💜\n\n` +
                    `👤 @${sender.split('@')[0]} está pedindo @${alvo.split('@')[0]} em namoro!\n\n` +
                    `💌 @${alvo.split('@')[0]}, você aceita?\n\n` +
                    `✍️ Responda *SIM* ou *NÃO* marcando esta mensagem.\n` +
                    `⏰ Você tem 2 minutos.`,
              mentions: [sender, alvo]
            }, { quoted: msg });

            const stanzaId = enviado?.key?.id;
            const pedidosPendentes = globalThis.__pedidosNamoro || (globalThis.__pedidosNamoro = new Map());
            pedidosPendentes.set(stanzaId, {
              de: sender,
              para: alvo,
              timer: setTimeout(async () => {
                if (pedidosPendentes.has(stanzaId)) {
                  pedidosPendentes.delete(stanzaId);
                  try {
                    await sock.sendMessage(from, {
                      text: `⏰ @${alvo.split('@')[0]} não respondeu a tempo...\n\n💔 O pedido expirou.`,
                      mentions: [alvo]
                    });
                  } catch (e) {}
                }
              }, 120000)
            });
          }
          return
    }
  }
};
