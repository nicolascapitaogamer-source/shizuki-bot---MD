// Gerado de index.js (case 'take', linha 11295)
export default {
  nomes: ["take"],
  async executar(__x) {
    const { downloadContentFromMessage, criarStickerTk, criarSticker, msg, sock, from, pushName } = Object.assign({}, __x.utils, __x);
    {
{
            const ctxTk = msg.message.extendedTextMessage?.contextInfo;
            const alvoTk = ctxTk?.quotedMessage || msg.message;
            const figTk = alvoTk.stickerMessage;

            if (!figTk) {
              await sock.sendMessage(from, { text: '⚠️ Marque uma figurinha com *!take* pra colocar sua marca!' }, { quoted: msg });
              return
            }

            try {
              const nomeAutor = pushName || 'Anônimo';
              const streamTk = await downloadContentFromMessage(figTk, 'sticker');
              let bufTk = Buffer.from([]);
              for await (const chunk of streamTk) {
                bufTk = Buffer.concat([bufTk, chunk]);
              }

              const packTk = nomeAutor;
              const autorTk = '';

              // ═══ Só usa ffmpeg se for ANIMADA de verdade ═══
              // Verifica pelo mimetype E pelo isAnimated
              // Detecta animação verificando o byte ANIM no header do webp
              const isAnimTk = figTk.isAnimated === true ||
                (bufTk && bufTk.length > 12 && bufTk.toString('ascii', 0, 4) === 'RIFF' && bufTk.toString('ascii', 8, 12) === 'WEBP' &&
                 (bufTk.toString('ascii', 12, 16) === 'VP8X' || bufTk.toString('ascii', 12, 16) === 'VP8 ' || bufTk.toString('ascii', 12, 16) === 'VP8L') &&
                 bufTk.includes(Buffer.from('ANIM')));

              let novaFig;
              // ═══ Aplica marca em qualquer figurinha (estática ou animada) SEM ffmpeg ═══
              try {
                novaFig = await criarStickerTk(bufTk, isAnimTk, packTk, autorTk);
              } catch (eMarca) {
                console.log('Erro ao aplicar marca:', eMarca.message);
                // Se falhar, tenta usar criarSticker normal
                novaFig = await criarSticker(bufTk, isAnimTk, packTk, autorTk);
              }

              await sock.sendMessage(from, { sticker: novaFig }, { quoted: msg });
              await sock.sendMessage(from, { text: '✅ Figurinha com sua marca: *' + nomeAutor + '*' }, { quoted: msg });
            } catch (errTk) {
              console.error('Erro no take:', errTk);
              await sock.sendMessage(from, { text: '❌ Não consegui processar a figurinha.' }, { quoted: msg });
            }
          }
          return
    }
  }
};
