// Gerado de index.js (case 'propostas', linha 13382)
export default {
  nomes: ["propostas"],
  async executar(__x) {
    const { carregarPropostas, isDono, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono!' }, { quoted: msg }); return }
            const dbPend = carregarPropostas();
            const pendentes = Object.values(dbPend).filter(p => p.status === 'pendente');
            if (!pendentes.length) {
              await sock.sendMessage(from, { text: '✅ Nenhuma proposta pendente!' }, { quoted: msg });
              return
            }
            let txt = '╭━━━〔 📋 𝐏𝐑𝐎𝐏𝐎𝐒𝐓𝐀𝐒 𝐏𝐄𝐍𝐃𝐄𝐍𝐓𝐄𝐒 📋 〕━━━╮\n┃\n┃ 👥 Total: *' + pendentes.length + '*\n┃\n';
            const mencsP = [];
            for (const p of pendentes) {
              txt += '┃ 📜 *' + p.id + '* — @' + p.candidato.split('@')[0] + '\n┃    "' + p.texto.slice(0, 60) + '"\n┃\n';
              mencsP.push(p.candidato);
            }
            txt += '┃ 💡 Use: *!aprovarproposta <id>*\n┃         *!rejeitarproposta <id>*\n┃\n╰━━━━━━━━━━━━━━━━━━╯';
            await sock.sendMessage(from, { text: txt, mentions: mencsP }, { quoted: msg });
          }
          return
    }
  }
};
