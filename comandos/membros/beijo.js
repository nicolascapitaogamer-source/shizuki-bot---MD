// Gerado de index.js (case 'beijo', linha 11059)
export default {
  nomes: ["beijo","beijar"],
  async executar(__x) {
    const { montarAcao, montarFrase, FRASE_BEIJO, enviarAcao, msg, sock, from, sender } = Object.assign({}, __x.utils, __x);
    {
{
            const ctxBj = msg.message.extendedTextMessage?.contextInfo;
            const quemRecebeu = ctxBj?.mentionedJid?.[0] || ctxBj?.participant;
            if (!quemRecebeu) {
              await sock.sendMessage(from, { text: '⚠️ Marque alguém com @ ou responda à mensagem de quem você quer beijar!\n\nEx: `!beijo @pessoa`' }, { quoted: msg });
              return
            }
            if (sender === quemRecebeu) {
              await sock.sendMessage(from, { text: '😳 Beijar a si mesmo(a)? Procure outra pessoa pra esse momento!' }, { quoted: msg });
              return
            }
            const textoBj = montarAcao('💋', '𝐁𝐄𝐈𝐉𝐎', montarFrase(FRASE_BEIJO, sender, quemRecebeu), '😳 Será que vai rolar um clima?');
            await enviarAcao(sock, from, msg, 'beijo', textoBj, [quemRecebeu, sender]);
          }
          return
    }
  }
};
