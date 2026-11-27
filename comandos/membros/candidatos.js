// Gerado de index.js (case 'candidatos', linha 13282)
export default {
  nomes: ["candidatos"],
  async executar(__x) {
    const { carregarEleicao, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const dbE = carregarEleicao();
            const cands = dbE.candidatos || {};
            const lista = Object.values(cands);
            if (!lista.length) {
              await sock.sendMessage(from, { text: 'ℹ️ Nenhum candidato ainda. Use *!candidatar* pra participar!' }, { quoted: msg });
              return
            }
            let txt = '╭━━━〔 🗳️ 𝐂𝐀𝐍𝐃𝐈𝐃𝐀𝐓𝐎𝐒 🗳️ 〕━━━╮\n┃\n┃ 👥 Total: *' + lista.length + ' candidato(s)*\n┃\n';
            const mencs = [];
            for (const c of lista) {
              txt += '┣━━━〔 📊 ' + String(c.id).padStart(3, '0') + ' 〕━━━\n';
              const jidC = Object.keys(cands).find(k => cands[k].id === c.id) || '';
              txt += '┃ 👤 @' + jidC.split('@')[0] + '\n';
              txt += '┃ 👥 Grupo: ' + (c.grupoNome || 'grupo') + '\n';
              txt += '┃ 📝 Propostas: *' + c.propostas.length + '/4*\n┃\n';
              mencs.push(Object.keys(cands).find(k => cands[k].id === c.id));
            }
            txt += '┃ 💡 Use: *!votar <id>*\n┃\n╰━━━━━━━━━━━━━━━━━━╯';
            await sock.sendMessage(from, { text: txt, mentions: mencs }, { quoted: msg });
          }
          return
    }
  }
};
