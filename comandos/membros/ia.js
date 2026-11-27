// Gerado de index.js (case 'ia', linha 15051)
export default {
  nomes: ["ia","shizuki"],
  async executar(__x) {
    const { chamarGroq, args, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const textoIA = args.join(' ').trim();
            if (!textoIA) {
              await sock.sendMessage(from, { text: '🌸 Use: *!ia <sua mensagem>*\nEx: !ia qual é o seu nome?' }, { quoted: msg });
              return
            }

            await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } });
            
            const respostaIA = await chamarGroq(textoIA);
            
            if (respostaIA) {
              await sock.sendMessage(from, { text: '🌸 *Shizuki:* ' + respostaIA }, { quoted: msg });
            } else {
              await sock.sendMessage(from, { text: '⚠️ Ocorreu um erro ao falar com a IA. Tente novamente mais tarde.' }, { quoted: msg });
            }
          }
          return
    }
  }
};
