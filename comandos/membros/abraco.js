// Gerado de index.js (case 'abraço', linha 11079)
export default {
  nomes: ["abraço","abraco","abracar","abraçar"],
  async executar(__x) {
    const { montarAcao, montarFrase, FRASE_ABRACO, enviarAcao, msg, sock, from, sender } = Object.assign({}, __x.utils, __x);
    {
{
            const ctxAb = msg.message.extendedTextMessage?.contextInfo;
            const quemRecebeu = ctxAb?.mentionedJid?.[0] || ctxAb?.participant;
            if (!quemRecebeu) {
              await sock.sendMessage(from, { text: '⚠️ Marque alguém com @ ou responda à mensagem de quem você quer abraçar!\n\nEx: `!abraço @pessoa`' }, { quoted: msg });
              return
            }
            if (sender === quemRecebeu) {
              await sock.sendMessage(from, { text: '🤗 Você se abraçou bem forte! Mas um abraço de outra pessoa é melhor, marque alguém!' }, { quoted: msg });
              return
            }
            const textoAb = montarAcao('🤗', '𝐀𝐁𝐑𝐀𝐂̧𝐎', montarFrase(FRASE_ABRACO, sender, quemRecebeu), '💜 Abraço é sempre bom demais!');
            await enviarAcao(sock, from, msg, 'abraco', textoAb, [quemRecebeu, sender]);
          }
          return
    }
  }
};
