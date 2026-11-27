// Gerado de index.js (case 'matar', linha 11097)
export default {
  nomes: ["matar","kill"],
  async executar(__x) {
    const { montarAcao, montarFrase, FRASE_MATAR, enviarAcao, msg, sock, from, sender } = Object.assign({}, __x.utils, __x);
    {
{
            const ctxMt = msg.message.extendedTextMessage?.contextInfo;
            const quemRecebeu = ctxMt?.mentionedJid?.[0] || ctxMt?.participant;
            if (!quemRecebeu) {
              await sock.sendMessage(from, { text: '⚠️ Marque alguém com @ ou responda à mensagem de quem você quer eliminar!\n\nEx: `!matar @pessoa`' }, { quoted: msg });
              return
            }
            if (sender === quemRecebeu) {
              await sock.sendMessage(from, { text: '☠️ Calma! Você não pode eliminar a si mesmo(a). A vida vale a pena!' }, { quoted: msg });
              return
            }
            const textoMt = montarAcao('💀', '𝐌𝐀𝐓𝐀𝐑', montarFrase(FRASE_MATAR, sender, quemRecebeu), '🪦 Descanse em paz...');
            await enviarAcao(sock, from, msg, 'matar', textoMt, [quemRecebeu, sender]);
          }
          return
    }
  }
};
