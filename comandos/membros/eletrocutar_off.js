// Gerado de index.js (case 'eletrocutar_off', linha 11642)
export default {
  nomes: ["eletrocutar_off"],
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
              const textoAc = montarAcao('⚡', '𝐄𝐋𝐄𝐓𝐑𝐎𝐂𝐔𝐓𝐀𝐑', montarFrase('⚡ {A} deu um choque em {B}! Que faísca!', sender, quemRecebeu), '🌸 ' + CONF.nomeBot + ' 🌸');
            await enviarAcao(sock, from, msg, 'eletrocutar', textoAc, [quemRecebeu, sender]);
          }
          return
    }
  }
};
