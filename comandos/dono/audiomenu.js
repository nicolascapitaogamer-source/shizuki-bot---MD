// Gerado de index.js (case 'audiomenu', linha 6080)
export default {
  nomes: ["audiomenu","setaudiomenu"],
  async executar(__x) {
    const { downloadContentFromMessage, fs, MENU_AUDIO_PATH, isDono, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) {
              await sock.sendMessage(from, { text: `🚫 Apenas o dono pode definir o áudio do menu!` }, { quoted: msg });
              return
            }

            const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            const targetMsg = quotedMsg || msg.message;

            const isAudio = targetMsg?.audioMessage;

            if (!isAudio) {
              await sock.sendMessage(from, { text: 'Marque um áudio!' }, { quoted: msg });
              return
            }

            try {
              const stream = await downloadContentFromMessage(isAudio, 'audio');

              let buffer = Buffer.from([]);
              for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
              }

              fs.writeFileSync(MENU_AUDIO_PATH, buffer);

              await sock.sendMessage(from, { text: 'audio atualizado com sucesso' }, { quoted: msg });
            } catch (err) {
              console.error('Erro ao salvar áudio do menu:', err);
              await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao salvar o áudio.' }, { quoted: msg });
            }
          }
          return
    }
  }
};
