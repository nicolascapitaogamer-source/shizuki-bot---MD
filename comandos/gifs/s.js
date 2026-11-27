// Gerado de index.js (case 's', linha 11419)
export default {
  nomes: ["s","sticker","figurinha"],
  async executar(__x) {
    const { downloadContentFromMessage, criarSticker, montarMarca, sortearFrase, msg, sock, from, isGroup, pushName, sender } = Object.assign({}, __x.utils, __x);
    {
{
            const ctxS = msg.message.extendedTextMessage?.contextInfo;
            const alvoMsg = ctxS?.quotedMessage || msg.message;
            const imgS = alvoMsg.imageMessage;
            const vidS = alvoMsg.videoMessage;

            if (!imgS && !vidS) {
              await sock.sendMessage(from, { text: '⚠️ Marque uma foto ou vídeo curto com !s' }, { quoted: msg });
              return
            }

            if (vidS && vidS.seconds > 10) {
              await sock.sendMessage(from, { text: '⚠️ O vídeo pode ter no máximo 10 segundos!' }, { quoted: msg });
              return
            }

            try {
              const stream = await downloadContentFromMessage(imgS || vidS, imgS ? 'image' : 'video');
              let bufferS = Buffer.from([]);
              for await (const chunk of stream) {
                bufferS = Buffer.concat([bufferS, chunk]);
              }

              const figurinha = await criarSticker(bufferS, !!vidS, ...(await montarMarca(sock, from, isGroup, pushName)));
              await sock.sendMessage(from, { text: `@${sender.split('@')[0]} ${sortearFrase()}`, mentions: [sender] }, { quoted: msg });
              await sock.sendMessage(from, { sticker: figurinha }, { quoted: msg });
            } catch (err) {
              console.error('Erro ao criar figurinha:', err);
              await sock.sendMessage(from, { text: '❌ Não consegui criar a figurinha.' }, { quoted: msg });
            }
          }
          return
    }
  }
};
