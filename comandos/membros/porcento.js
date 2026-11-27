// Gerado de index.js (case 'porcento', linha 14662)
export default {
  nomes: ["porcento"],
  async executar(__x) {
    const { args, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const pergunta = args.join(' ').trim();
            if (!pergunta) {
              await sock.sendMessage(from, { text: '⚠️ Use: *!porcento <pergunta>*\n\nEx: *!porcento Eu vou passar de ano?*' }, { quoted: msg });
              return
            }
            const pct = Math.floor(Math.random() * 101);
            let frasePct = '💜 Na fé, vai dar certo!';
            if (pct >= 80) frasePct = '🎉 Com certeza absoluta!';
            else if (pct >= 60) frasePct = '✨ Tá no caminho certo!';
            else if (pct >= 40) frasePct = '🤔 Mais ou menos, hein...';
            else if (pct >= 20) frasePct = '😬 Difícil, mas não impossível!';
            else frasePct = '💀 Esquece, não vai rolar.';
            await sock.sendMessage(from, {
              text: '╭━━━〔 📊 𝐏𝐎𝐑𝐂𝐄𝐍𝐓𝐎 📊 〕━━━╮\n' +
                    '┃\n' +
                    '┃ ❓ "' + pergunta + '"\n' +
                    '┃\n' +
                    '┃ 📊 Resultado: *' + pct + '%*\n' +
                    '┃\n' +
                    '┃ ' + frasePct + '\n' +
                    '┃\n' +
                    '╰━━━━━━━━━━━━━━━━━━╯'
            }, { quoted: msg });
          }
          return
    }
  }
};
