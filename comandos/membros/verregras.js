// Gerado de index.js (case 'verregras', linha 14611)
export default {
  nomes: ["verregras"],
  async executar(__x) {
    const { carregarJSON, isGroup, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const dbRegras = carregarJSON('./regras.json');
            const txtRegras = dbRegras[from];
            if (!txtRegras) {
              await sock.sendMessage(from, { text: '📜 Nenhuma regra definida!\n\n💡 Use: *!regras <texto>* pra definir.' }, { quoted: msg });
              return
            }
            await sock.sendMessage(from, {
              text: '╭━━━〔 📜 𝐑𝐄𝐆𝐑𝐀𝐒 𝐃𝐎 𝐆𝐑𝐔𝐏𝐎 📜 〕━━━╮\n┃\n' + txtRegras.split('\n').map(l => '┃ ' + l).join('\n') + '\n┃\n╰━━━━━━━━━━━━━━━━━━╯'
            }, { quoted: msg });
          }
          return
    }
  }
};
