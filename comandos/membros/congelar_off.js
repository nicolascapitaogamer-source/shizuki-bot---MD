// Gerado de index.js (case 'congelar_off', linha 11627)
export default {
  nomes: ["congelar_off"],
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
              const textoAc = montarAcao('🧊', '𝐂𝐎𝐍𝐆𝐄𝐋𝐀𝐑', montarFrase('🧊 {A} congelou {B} em um bloco de gelo.', sender, quemRecebeu), '🌸 ' + CONF.nomeBot + ' 🌸');
            await enviarAcao(sock, from, msg, 'congelar', textoAc, [quemRecebeu, sender]);
          }
          return
    }
  }
};
