// Gerado de index.js (case 'reiniciar', linha 12330)
export default {
  nomes: ["reiniciar","restart"],
  async executar(__x) {
    const { fs, FILE_RESTART, isDono, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono e os líderes podem reiniciar o bot!' }, { quoted: msg });
              return
            }
            const tsRei = Number(msg.messageTimestamp);
            if (tsRei && Date.now() / 1000 - tsRei > 60) return

            fs.writeFileSync(FILE_RESTART, JSON.stringify({ chat: from, texto: '✅ *Bot reiniciado com sucesso!*\n\nVoltei mais forte e pronto pra ação! 💜' }));
            await sock.sendMessage(from, { text: '🔄 *Reiniciando o bot...*\n\nVolto em alguns segundinhos! ⏳' }, { quoted: msg });
            setTimeout(() => process.exit(42), 1500);
          }
          return
    }
  }
};
