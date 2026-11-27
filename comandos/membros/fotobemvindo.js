// Gerado de index.js (case 'fotobemvindo', linha 6046)
export default {
  nomes: ["fotobemvindo","setwelcome","fotoboasvindas"],
  async executar(__x) {
    const { downloadContentFromMessage, fs, WELCOME_IMAGE_PATH, msg, sock, from } = Object.assign({}, __x.utils, __x);
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

              fs.writeFileSync(WELCOME_IMAGE_PATH, buffer);

              await sock.sendMessage(from, { text: 'Foto de boas-vindas atualizada com sucesso!' }, { quoted: msg });
            } catch (err) {
              console.error('Erro ao salvar foto de boas-vindas:', err);
              await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao salvar a mídia.' }, { quoted: msg });
            }
          }
          return
    }
  }
};
