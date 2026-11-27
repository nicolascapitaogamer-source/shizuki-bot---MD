// Gerado de index.js (case 'rmaudio', linha 5914)
export default {
  nomes: ["rmaudio","removeraudio"],
  async executar(__x) {
    const { fs, MENU_AUDIO_PATH, isDono, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono pode remover o áudio do menu!' }, { quoted: msg });
              return
            }

            if (fs.existsSync(MENU_AUDIO_PATH)) {
              fs.unlinkSync(MENU_AUDIO_PATH);
              await sock.sendMessage(from, { text: '🔊 Áudio do menu removido com sucesso!' }, { quoted: msg });
            } else {
              await sock.sendMessage(from, { text: 'ℹ️ Não há nenhum áudio configurado para o menu no momento.' }, { quoted: msg });
            }
          }
          return
    }
  }
};
