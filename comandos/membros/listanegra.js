// Gerado de index.js (case 'listanegra', linha 15007)
export default {
  nomes: ["listanegra"],
  async executar(__x) {
    const { carregarListaNegra, isGroup, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const dbLNL = carregarListaNegra();
            const listaAtual = dbLNL[from] || [];
            if (listaAtual.length === 0) {
              await sock.sendMessage(from, { text: '╭━━━〔 📋 𝐋𝐈𝐒𝐓𝐀 𝐍𝐄𝐆𝐑𝐀 📋 〕━━━╮\n┃\n┃ ✅ Nenhum número na lista negra!\n┃\n┃ 💜 Tá tudo limpo~\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
              return
            }
            let txtLN = '╭━━━〔 📋 𝐋𝐈𝐒𝐓𝐀 𝐍𝐄𝐆𝐑𝐀 📋 〕━━━╮\n┃\n┃ 📊 Total: *' + listaAtual.length + ' números*\n┃\n';
            listaAtual.forEach((n, i) => {
              txtLN += '┃ ' + (i + 1) + '️⃣ ' + n + '\n';
            });
            txtLN += '┃\n┃ 💜 Esses números estão banidos\n┃    de entrar no grupo!\n┃\n╰━━━━━━━━━━━━━━━━━━╯';
            await sock.sendMessage(from, { text: txtLN }, { quoted: msg });
          }
          return
    }
  }
};
