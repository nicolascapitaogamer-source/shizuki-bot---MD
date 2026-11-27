// Gerado de index.js (case 'leispendentes', linha 13763)
export default {
  nomes: ["leispendentes"],
  async executar(__x) {
    const { carregarLeis, isDono, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono!' }, { quoted: msg }); return }
            const dbLP = carregarLeis();
            const pends = Object.values(dbLP).filter(l => l.status === 'pendente');
            if (!pends.length) { await sock.sendMessage(from, { text: '✅ Nenhuma lei pendente!' }, { quoted: msg }); return }
            let txtLP = '╭━━━〔 ⚖️ 𝐋𝐄𝐈𝐒 𝐏𝐄𝐍𝐃𝐄𝐍𝐓𝐄𝐒 ⚖️ 〕━━━╮\n┃\n┃ 👥 Total: *' + pends.length + '*\n┃\n';
            for (const l of pends) {
              txtLP += '┃ 📜 *' + l.id + '* — @' + l.presidente.split('@')[0] + '\n┃    "' + l.texto.slice(0, 60) + '"\n┃\n';
            }
            txtLP += '┃ 💡 Use: *!aprovarlei <id>*\n┃         *!rejeitarlei <id>*\n┃\n╰━━━━━━━━━━━━━━━━━━╯';
            await sock.sendMessage(from, { text: txtLP }, { quoted: msg });
          }
          return
    }
  }
};
