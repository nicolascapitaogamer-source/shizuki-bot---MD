// Gerado de index.js (case 'cuspir', linha 11517)
export default {
  nomes: ["cuspir"],
  async executar(__x) {
    const { montarAcao, montarFrase, enviarAcao, msg, sock, from, sender, CONF } = Object.assign({}, __x.utils, __x);
    {
{
            const ctxAc = msg.message.extendedTextMessage?.contextInfo;
            const quemRecebeu = ctxAc?.mentionedJid?.[0] || ctxAc?.participant;
            if (!quemRecebeu) {
              await sock.sendMessage(from, { text: '⚠️ Marque alguém com @!\n\nEx: !cuspir @pessoa' }, { quoted: msg });
              return
            }
            if (sender === quemRecebeu) {
              await sock.sendMessage(from, { text: '😅 Você não pode fazer isso consigo mesmo(a)!' }, { quoted: msg });
              return
            }
              const textoAc = montarAcao('💦', '𝐂𝐔𝐒𝐏𝐈𝐑', montarFrase('💦 {A} cuspiu em {B}! Que falta de educação.', sender, quemRecebeu), '🌸 ' + CONF.nomeBot + ' 🌸');
            await enviarAcao(sock, from, msg, 'cuspir', textoAc, [quemRecebeu, sender]);
          }
          return
    }
  }
};
