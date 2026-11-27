// Gerado de index.js (case 'empurrar', linha 11548)
export default {
  nomes: ["empurrar"],
  async executar(__x) {
    const { montarAcao, montarFrase, enviarAcao, msg, sock, from, sender, CONF } = Object.assign({}, __x.utils, __x);
    {
{
            const ctxAc = msg.message.extendedTextMessage?.contextInfo;
            const quemRecebeu = ctxAc?.mentionedJid?.[0] || ctxAc?.participant;
            if (!quemRecebeu) {
              await sock.sendMessage(from, { text: '⚠️ Marque alguém com @!\n\nEx: !empurrar @pessoa' }, { quoted: msg });
              return
            }
            if (sender === quemRecebeu) {
              await sock.sendMessage(from, { text: '😅 Você não pode fazer isso consigo mesmo(a)!' }, { quoted: msg });
              return
            }
              const textoAc = montarAcao('🤜', '𝐄𝐌𝐏𝐔𝐑𝐑𝐀𝐑', montarFrase('🤜 {A} empurrou {B} sem dó.', sender, quemRecebeu), '🌸 ' + CONF.nomeBot + ' 🌸');
            await enviarAcao(sock, from, msg, 'empurrar', textoAc, [quemRecebeu, sender]);
          }
          return
    }
  }
};
