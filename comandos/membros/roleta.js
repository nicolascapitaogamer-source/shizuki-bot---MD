// Gerado de index.js (case 'roleta', linha 14645)
export default {
  nomes: ["roleta"],
  async executar(__x) {
    const { sortear, ROLETA_DESTINOS, sock, from, sender, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const destino = sortear(ROLETA_DESTINOS);
            await sock.sendMessage(from, {
              text: '╭━━━〔 🎰 𝐑𝐎𝐋𝐄𝐓𝐀 🎰 〕━━━╮\n' +
                    '┃\n' +
                    '┃ 🎲 Girando...\n' +
                    '┃\n' +
                    '┃ 🎯 Resultado:\n' +
                    '┃ ' + destino + '\n' +
                    '┃\n' +
                    '╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
