// Gerado de index.js (case 'arranhar_off', linha 11533)
export default {
  nomes: ["arranhar_off"],
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
              const textoAc = montarAcao('🐱', '𝐀𝐑𝐑𝐀𝐍𝐇𝐀𝐑', montarFrase('🐱 {A} arranhou {B} igual gato bravo!', sender, quemRecebeu), '🌸 ' + CONF.nomeBot + ' 🌸');
            await enviarAcao(sock, from, msg, 'arranhar', textoAc, [quemRecebeu, sender]);
          }
          return
    }
  }
};
