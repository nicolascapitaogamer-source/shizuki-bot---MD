// Gerado de index.js (case 'defender', linha 13929)
export default {
  nomes: ["defender"],
  async executar(__x) {
    const { carregarArena, chaveArena, salvarArena, from, sock, msg, sender } = Object.assign({}, __x.utils, __x);
    {
{
            const dbD = carregarArena();
            const chvD = chaveArena(from);
            const d = dbD[chvD];
            if (!d || d.finalizada) { await sock.sendMessage(from, { text: '❌ Nenhum duelo rolando!' }, { quoted: msg }); return }
            if ((d.vez === 1 && d.j1 !== sender) || (d.vez === 2 && d.j2 !== sender)) { await sock.sendMessage(from, { text: '⏳ Não é sua vez!' }, { quoted: msg }); return }
            if (d.vez === 1) d.defender1 = true;
            else d.defender2 = true;
            const nomeD = d.vez === 1 ? d.j1 : d.j2;
            d.vez = d.vez === 1 ? 2 : 1;
            d.turno += 1;
            salvarArena(dbD);
            await sock.sendMessage(from, {
              text: '╭━━━〔 🛡️ 𝐃𝐄𝐅𝐄𝐒𝐀 🛡️ 〕━━━╮\n┃\n┃ @' + nomeD.split('@')[0] + ' se defendeu!\n┃ 🛡️ Próximo ataque: *-50%*\n┃\n┃ ❤️ @' + d.j1.split('@')[0] + ': *' + d.hp1 + '/100*\n┃ ❤️ @' + d.j2.split('@')[0] + ': *' + d.hp2 + '/100*\n┃\n┃ 🎯 Vez de @' + (d.vez === 1 ? d.j1 : d.j2).split('@')[0] + '!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [d.j1, d.j2]
            }, { quoted: msg });
          }
          return
    }
  }
};
