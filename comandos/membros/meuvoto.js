// Gerado de index.js (case 'meuvoto', linha 13518)
export default {
  nomes: ["meuvoto"],
  async executar(__x) {
    const { carregarEleicao, sender, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const dbMv = carregarEleicao();
            const meuV = (dbMv.votos || {})[sender];
            if (!meuV) { await sock.sendMessage(from, { text: '❌ Você ainda não votou!\n\nUse: *!votar <id>*' }, { quoted: msg }); return }
            await sock.sendMessage(from, {
              text: '╭━━━〔 🗳️ 𝐌𝐄𝐔 𝐕𝐎𝐓𝐎 🗳️ 〕━━━╮\n┃\n┃ ✅ Você votou em: *' + meuV + '*\n┃\n┃ 💜 Escolha registrada!\n┃\n╰━━━━━━━━━━━━━━━━━━╯'
            }, { quoted: msg });
          }
          return
    }
  }
};
