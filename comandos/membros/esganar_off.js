// Gerado de index.js (case 'esganar_off', linha 11580)
export default {
  nomes: ["esganar_off"],
  async executar(__x) {
    const { montarAcao, montarFrase, enviarAcao, msg, sender, sock, from, CONF } = Object.assign({}, __x.utils, __x);
    {
{
            const ctxAc = msg.message.extendedTextMessage?.contextInfo;
            const quemRecebeu = ctxAc?.mentionedJid?.[0] || ctxAc?.participant;
            if (!quemRecebeu) {
              return
            }
            if (sender === quemRecebeu) {
              await sock.sendMessage(from, { text: '😅 Você não pode fazer isso consigo mesmo(a)!' }, { quoted: msg });
              return
            }
              const textoAc = montarAcao('😤', '𝐄𝐒𝐆𝐀𝐍𝐀𝐑', montarFrase('😤 {A} esganou {B} até quase faltar ar!', sender, quemRecebeu), '🌸 ' + CONF.nomeBot + ' 🌸');
            await enviarAcao(sock, from, msg, 'esganar', textoAc, [quemRecebeu, sender]);
          }
          return
    }
  }
};
