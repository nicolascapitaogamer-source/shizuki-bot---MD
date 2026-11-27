// Gerado de index.js (case 'lojaarena', linha 5239)
export default {
  nomes: ["lojaarena"],
  async executar(__x) {
    const { ARMADURAS_ARENA, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            let txt = '╭━━━〔 🛡️ 𝐋𝐎𝐉𝐀 𝐃𝐀 𝐀𝐑𝐄𝐍𝐀 〕━━━╮\n┃\n';
            for (const [id, a] of Object.entries(ARMADURAS_ARENA)) { txt += '┃ 🛡️ *' + a.nome + '* ➜ +' + a.defesa + ' Def | ' + a.preco + ' moedas\n'; }
            txt += '┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n💡 *Use !comprararmadura <id>*';
            await sock.sendMessage(from, { text: txt }, { quoted: msg });
          }
          return
    }
  }
};
