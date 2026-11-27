// Gerado de index.js (case 'brat', linha 11689)
export default {
  nomes: ["brat"],
  async executar(__x) {
    const { criarBrat, criarSticker, montarMarca, msg, args, sock, from, isGroup, pushName } = Object.assign({}, __x.utils, __x);
    {
{
            const qBrat = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            const textoBrat = (args.join(' ') || qBrat?.conversation || qBrat?.extendedTextMessage?.text || '').trim().toLowerCase();

            if (!textoBrat) {
              await sock.sendMessage(from, { text: '⚠️ Escreva um texto ou marque uma mensagem. Ex: `!brat oi`' }, { quoted: msg });
              return
            }

            if (textoBrat.length > 200) {
              await sock.sendMessage(from, { text: '⚠️ O texto pode ter no máximo 200 caracteres!' }, { quoted: msg });
              return
            }

            try {
              const imgBrat = await criarBrat(textoBrat);
              const figBrat = await criarSticker(imgBrat, false, ...(await montarMarca(sock, from, isGroup, pushName)));
              await sock.sendMessage(from, { sticker: figBrat }, { quoted: msg });
            } catch (err) {
              console.error('Erro ao criar brat:', err);
              await sock.sendMessage(from, { text: '❌ Não consegui criar o brat.' }, { quoted: msg });
            }
          }
          return
    }
  }
};
