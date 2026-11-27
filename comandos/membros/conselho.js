// Gerado de index.js (case 'conselho', linha 14690)
export default {
  nomes: ["conselho"],
  async executar(__x) {
    const { sortear, CONSELHOS, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const conselho = sortear(CONSELHOS);
            await sock.sendMessage(from, {
              text: '╭━━━〔 💡 𝐂𝐎𝐍𝐒𝐄𝐋𝐇𝐎 💡 〕━━━╮\n' +
                    '┃\n' +
                    '┃ "' + conselho + '"\n' +
                    '┃\n' +
                    '┃ 💜 Confia!\n' +
                    '┃\n' +
                    '╰━━━━━━━━━━━━━━━━━━╯'
            }, { quoted: msg });
          }
          return
    }
  }
};
