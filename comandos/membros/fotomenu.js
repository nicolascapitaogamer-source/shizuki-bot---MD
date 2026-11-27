// Gerado de index.js (case 'fotomenu', linha 6011)
export default {
  nomes: ["fotomenu","setmenu"],
  async executar(__x) {
    const { downloadContentFromMessage, fs, MENU_IMAGE_PATH, msg, sock, from } = Object.assign({}, __x.utils, __x);
    {
{
            const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            const targetMsg = quotedMsg || msg.message;

            const isImage = targetMsg?.imageMessage;
            const isVideo = targetMsg?.videoMessage;

            if (!isImage && !isVideo) {
              await sock.sendMessage(from, { text: 'Marque uma foto ou vídeo!' }, { quoted: msg });
              return
            }

            try {
              const type = isImage ? 'image' : 'video';
              const mediaMessage = isImage || isVideo;
              const stream = await downloadContentFromMessage(mediaMessage, type);

              let buffer = Buffer.from([]);
              for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
              }

              fs.writeFileSync(MENU_IMAGE_PATH, buffer);

              await sock.sendMessage(from, { text: 'Foto do menu atualizada com sucesso!' }, { quoted: msg });
            } catch (err) {
              console.error('Erro ao salvar foto do menu:', err);
              await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao salvar a mídia.' }, { quoted: msg });
            }
          }
          return
    }
  }
};
