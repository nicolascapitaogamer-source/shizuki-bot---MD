// Gerado de index.js (case 'explodir', linha 11673)
export default {
  nomes: ["explodir"],
  async executar(__x) {
    const { montarAcao, montarFrase, enviarAcao, msg, sock, from, sender, CONF } = Object.assign({}, __x.utils, __x);
    {
{
            const ctxAc = msg.message.extendedTextMessage?.contextInfo;
            const quemRecebeu = ctxAc?.mentionedJid?.[0] || ctxAc?.participant;
            if (!quemRecebeu) {
              await sock.sendMessage(from, { text: '⚠️ Marque alguém com @!\n\nEx: !explodir @pessoa' }, { quoted: msg });
              return
            }
            if (sender === quemRecebeu) {
              await sock.sendMessage(from, { text: '😅 Você não pode fazer isso consigo mesmo(a)!' }, { quoted: msg });
              return
            }
              const textoAc = montarAcao('💥', '𝐄𝐗𝐏𝐋𝐎𝐃𝐈𝐑', montarFrase('💥 {B} foi explodido(a) por {A}! Kabum!', sender, quemRecebeu), '🌸 ' + CONF.nomeBot + ' 🌸');
            await enviarAcao(sock, from, msg, 'explodir', textoAc, [quemRecebeu, sender]);
          }
          return
    }
  }
};
