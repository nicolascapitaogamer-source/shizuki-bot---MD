// Gerado de index.js (case 'acenar', linha 11485)
export default {
  nomes: ["acenar"],
  async executar(__x) {
    const { montarAcao, montarFrase, enviarAcao, msg, sock, from, sender, CONF } = Object.assign({}, __x.utils, __x);
    {
{
            const ctxAc = msg.message.extendedTextMessage?.contextInfo;
            const quemRecebeu = ctxAc?.mentionedJid?.[0] || ctxAc?.participant;
            if (!quemRecebeu) {
              await sock.sendMessage(from, { text: '⚠️ Marque alguém com @!\n\nEx: !acenar @pessoa' }, { quoted: msg });
              return
            }
            if (sender === quemRecebeu) {
              await sock.sendMessage(from, { text: '😅 Você não pode fazer isso consigo mesmo(a)!' }, { quoted: msg });
              return
            }
              const textoAc = montarAcao('👋', '𝐀𝐂𝐄𝐍𝐀𝐑', montarFrase('👋 {A} acenou pra {B} com um sorriso fofo.', sender, quemRecebeu), '🌸 ' + CONF.nomeBot + ' 🌸');
            await enviarAcao(sock, from, msg, 'acenar', textoAc, [quemRecebeu, sender]);
          }
          return
    }
  }
};
