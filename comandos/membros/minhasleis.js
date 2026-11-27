// Gerado de index.js (case 'minhasleis', linha 13667)
export default {
  nomes: ["minhasleis"],
  async executar(__x) {
    const { carregarLeis, sender, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const dbML = carregarLeis();
            const minhas = Object.values(dbML).filter(l => l.presidente === sender);
            if (!minhas.length) { await sock.sendMessage(from, { text: '📝 Você não propôs nenhuma lei ainda!' }, { quoted: msg }); return }
            let txtML = '╭━━━〔 ⚖️ 𝐌𝐈𝐍𝐇𝐀𝐒 𝐋𝐄𝐈𝐒 ⚖️ 〕━━━╮\n┃\n┃ 👤 @' + sender.split('@')[0] + '\n┃ 📊 Total: *' + minhas.length + '*\n┃\n';
            for (const l of minhas) {
              const em = l.status === 'aprovada' ? '✅' : l.status === 'rejeitada' ? '❌' : '⏳';
              txtML += '┃ ' + em + ' *' + l.id + '* — ' + l.status + '\n┃    "' + l.texto.slice(0, 60) + '"\n┃\n';
            }
            txtML += '╰━━━━━━━━━━━━━━━━━━╯';
            await sock.sendMessage(from, { text: txtML, mentions: [sender] }, { quoted: msg });
          }
          return
    }
  }
};
