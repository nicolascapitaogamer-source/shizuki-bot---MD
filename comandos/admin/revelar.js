// Gerado de index.js (case 'revelar', linha 11344)
export default {
  nomes: ["revelar"],
  async executar(__x) {
    const { getAdminFlag, normalizeMessageContent, downloadContentFromMessage, isGroup, from, sender, isDono, sock, msg, CONF } = Object.assign({}, __x.utils, __x);
    {
{
            // ═══ Só adm/líder/dono pode usar ═══
            if (isGroup) {
              const gmRev = await globalThis.__getGroupMetadata(from);
              const ehAdmRev = !!getAdminFlag(gmRev.participants, sender);
              if (!ehAdmRev && !isDono) {
                await sock.sendMessage(from, {
                  text: '╭━━━〔 🚫 𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎 🚫 〕━━━╮\n┃\n┃ 💔 Apenas *admins*, *líderes*\n┃    e o *dono* podem usar!\n┃\n╰─────────────────────────────╯'
                }, { quoted: msg });
                return
              }
            }

            const ctxRv = msg.message.extendedTextMessage?.contextInfo;
            const alvoRv = ctxRv?.quotedMessage;
            const msgOriginal = msg.message;

            let midiaRv = null;
            let tipoRv = null;

            // ═══ USA normalizeMessageContent pra desembrulhar ═══
            const fontes = [alvoRv, msgOriginal].filter(Boolean);
            for (const fonte of fontes) {
              try {
                const normalizado = normalizeMessageContent(fonte);
                if (normalizado?.imageMessage) { midiaRv = normalizado.imageMessage; tipoRv = 'image'; break; }
                if (normalizado?.videoMessage) { midiaRv = normalizado.videoMessage; tipoRv = 'video'; break; }
                // Fallback: tenta pelo viewOnce direto
                if (fonte?.viewOnceMessageV2?.message?.imageMessage) { midiaRv = fonte.viewOnceMessageV2.message.imageMessage; tipoRv = 'image'; break; }
                if (fonte?.viewOnceMessageV2?.message?.videoMessage) { midiaRv = fonte.viewOnceMessageV2.message.videoMessage; tipoRv = 'video'; break; }
                if (fonte?.viewOnceMessage?.message?.imageMessage) { midiaRv = fonte.viewOnceMessage.message.imageMessage; tipoRv = 'image'; break; }
                if (fonte?.viewOnceMessage?.message?.videoMessage) { midiaRv = fonte.viewOnceMessage.message.videoMessage; tipoRv = 'video'; break; }
              } catch (eN) {
                console.log('Erro normalize:', eN.message);
              }
            }

            if (!midiaRv) {
              await sock.sendMessage(from, { text: '⚠️ Marque uma foto ou vídeo de *visualização única* com *!revelar*!' }, { quoted: msg });
              return
            }

            try {
              const streamRv = await downloadContentFromMessage(midiaRv, tipoRv);
              let bufRv = Buffer.from([]);
              for await (const chunk of streamRv) {
                bufRv = Buffer.concat([bufRv, chunk]);
              }

              const donoMidia = ctxRv?.participant || ctxRv?.mentionedJid?.[0] || sender;

              let legendaRv = '╔══════════════════════════════╗\n' +
                              '║  😈  𝐀𝐂𝐇𝐎𝐔  𝐐𝐔𝐄  𝐄𝐑𝐀  𝐒𝐄𝐆𝐑𝐄𝐃𝐎?  😈  ║\n' +
                              '╚══════════════════════════════╝\n\n' +
                              '🔥 *VISUALIZAÇÃO ÚNICA REVELADA!*\n\n' +
                              '   👤 @' + donoMidia.split('@')[0] + '\n' +
                              '   👁️ Revelada por @' + sender.split('@')[0] + '\n\n' +
                              '   💬 _"Peguei tudo, safadinho(a)!"_\n\n' +
                              '🌸 ' + CONF.nomeBot + ' 🌸';

              if (tipoRv === 'image') {
                await sock.sendMessage(from, { image: bufRv, caption: legendaRv, mentions: [donoMidia, sender] }, { quoted: msg });
              } else {
                await sock.sendMessage(from, { video: bufRv, caption: legendaRv, mentions: [donoMidia, sender] }, { quoted: msg });
              }
            } catch (errRv) {
              console.error('Erro no revelar:', errRv);
              await sock.sendMessage(from, { text: '❌ Não consegui revelar. Talvez já tenha sido vista?' }, { quoted: msg });
            }
          }
          return
    }
  }
};
