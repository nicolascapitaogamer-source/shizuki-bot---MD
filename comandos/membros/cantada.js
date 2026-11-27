// Gerado de index.js (case 'cantada', linha 14705)
export default {
  nomes: ["cantada"],
  async executar(__x) {
    const { sortear, CANTADAS_ORIGINAIS, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const cantada = sortear(CANTADAS_ORIGINAIS);
            await sock.sendMessage(from, {
              text: '╭━━━〔 💘 𝐂𝐀𝐍𝐓𝐀𝐃𝐀 💘 〕━━━╮\n' +
                    '┃\n' +
                    '┃ "' + cantada + '"\n' +
                    '┃\n' +
                    '┃ 💜 Usa com moderação!\n' +
                    '┃\n' +
                    '╰━━━━━━━━━━━━━━━━━━╯'
            }, { quoted: msg });
          }
          return
    }
  }
};
