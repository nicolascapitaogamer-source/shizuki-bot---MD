// Gerado de index.js (case 'queimar', linha 11611)
export default {
  nomes: ["queimar"],
  async executar(__x) {
    const { montarAcao, montarFrase, enviarAcao, msg, sock, from, sender, CONF } = Object.assign({}, __x.utils, __x);
    {
{
            const ctxAc = msg.message.extendedTextMessage?.contextInfo;
            const quemRecebeu = ctxAc?.mentionedJid?.[0] || ctxAc?.participant;
            if (!quemRecebeu) {
              await sock.sendMessage(from, { text: '⚠️ Marque alguém com @!\n\nEx: !queimar @pessoa' }, { quoted: msg });
              return
            }
            if (sender === quemRecebeu) {
              await sock.sendMessage(from, { text: '😅 Você não pode fazer isso consigo mesmo(a)!' }, { quoted: msg });
              return
            }
              const textoAc = montarAcao('🔥', '𝐐𝐔𝐄𝐈𝐌𝐀𝐑', montarFrase('🔥 {A} queimou {B}! Chamem os bombeiros!', sender, quemRecebeu), '🌸 ' + CONF.nomeBot + ' 🌸');
            await enviarAcao(sock, from, msg, 'queimar', textoAc, [quemRecebeu, sender]);
          }
          return
    }
  }
};
