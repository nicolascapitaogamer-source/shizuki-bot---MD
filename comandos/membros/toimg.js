// Gerado de index.js (case 'toimg', linha 11787)
export default {
  nomes: ["toimg","toimage"],
  async executar(__x) {
    const { downloadContentFromMessage, stickerParaPng, msg, sock, from } = Object.assign({}, __x.utils, __x);
    {
{
            const qToImg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            const figuraToImg = qToImg?.stickerMessage;
            if (!figuraToImg) {
              await sock.sendMessage(from, { text: '⚠️ Marque uma figurinha com !toimg' }, { quoted: msg });
              return
            }
            try {
              const streamToImg = await downloadContentFromMessage(figuraToImg, 'sticker');
              let bufToImg = Buffer.from([]);
              for await (const chunk of streamToImg) bufToImg = Buffer.concat([bufToImg, chunk]);
              const pngToImg = await stickerParaPng(bufToImg);
              await sock.sendMessage(from, { image: pngToImg, caption: '🖼️ Sua figurinha virou foto!' }, { quoted: msg });
            } catch (err) {
              console.error('Erro no toimg:', err);
              await sock.sendMessage(from, { text: '❌ Não consegui converter. Figurinhas animadas ainda não são suportadas.' }, { quoted: msg });
            }
          }
          return
    }
  }
};
