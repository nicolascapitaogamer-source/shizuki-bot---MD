// Gerado de index.js (case 'sorte', linha 14720)
export default {
  nomes: ["sorte"],
  async executar(__x) {
    const { sortear, SORTE_DIA, sock, from, sender, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const sorte = sortear(SORTE_DIA);
            await sock.sendMessage(from, {
              text: '╭━━━〔 🍀 𝐒𝐎𝐑𝐓𝐄 𝐃𝐎 𝐃𝐈𝐀 🍀 〕━━━╮\n' +
                    '┃\n' +
                    '┃ @' + sender.split('@')[0] + '\n' +
                    '┃\n' +
                    '┃ ' + sorte + '\n' +
                    '┃\n' +
                    '╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
