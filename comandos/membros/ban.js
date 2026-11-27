// Gerado de index.js (case 'ban', linha 13038)
export default {
  nomes: ["ban","kick"],
  async executar(__x) {
    const { isGroup, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg }); return }
            
            const alvo = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || msg.message?.extendedTextMessage?.contextInfo?.participant;
            if (!alvo) { await sock.sendMessage(from, { text: '❌ Marque ou responda alguém.' }, { quoted: msg }); return }

            try {
              await sock.groupParticipantsUpdate(from, [alvo], 'remove');
              await sock.sendMessage(from, { text: `🚫 *Usuário removido.*\n\n> @${alvo.split('@')[0]}, você foi removido(a) do grupo. Respeite as regras!`, mentions: [alvo] });
            } catch (err) {
              console.error('Erro no comando !ban:', err);
              await sock.sendMessage(from, { text: '❌ Ocorreu um erro. Certifique-se de que o bot é ADM.' }, { quoted: msg });
            }
          }
          return
    }
  }
};
