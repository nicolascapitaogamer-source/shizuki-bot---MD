// Gerado de index.js (case 'estrangular', linha 11595)
export default {
  nomes: ["estrangular"],
  async executar(__x) {
    const { montarAcao, montarFrase, enviarAcao, msg, sock, from, sender, CONF } = Object.assign({}, __x.utils, __x);
    {
{
            const ctxAc = msg.message.extendedTextMessage?.contextInfo;
            const quemRecebeu = ctxAc?.mentionedJid?.[0] || ctxAc?.participant;
            if (!quemRecebeu) {
              await sock.sendMessage(from, { text: '⚠️ Marque alguém com @!\n\nEx: !estrangular @pessoa' }, { quoted: msg });
              return
            }
            if (sender === quemRecebeu) {
              await sock.sendMessage(from, { text: '😅 Você não pode fazer isso consigo mesmo(a)!' }, { quoted: msg });
              return
            }
              const textoAc = montarAcao('💀', '𝐄𝐒𝐓𝐑𝐀𝐍𝐆𝐔𝐋𝐀𝐑', montarFrase('💀 {A} estrangulou {B} sem piedade.', sender, quemRecebeu), '🌸 ' + CONF.nomeBot + ' 🌸');
            await enviarAcao(sock, from, msg, 'estrangular', textoAc, [quemRecebeu, sender]);
          }
          return
    }
  }
};
