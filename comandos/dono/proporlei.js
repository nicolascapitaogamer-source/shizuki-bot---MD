// Gerado de index.js (case 'proporlei', linha 13649)
export default {
  nomes: ["proporlei"],
  async executar(__x) {
    const { carregarPresidente, carregarLeis, proximoIdLei, salvarLeis, sock, from, msg, sender, isDono, args } = Object.assign({}, __x.utils, __x);
    {
{
            const dbP = carregarPresidente();
            if (!dbP.atual) { await sock.sendMessage(from, { text: '❌ Nenhum presidente eleito!' }, { quoted: msg }); return }
            if (dbP.atual.jid !== sender && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o presidente pode propor leis!' }, { quoted: msg }); return }
            const textoL = args.join(' ').trim();
            if (!textoL) { await sock.sendMessage(from, { text: '⚠️ Use: *!proporlei <texto>*' }, { quoted: msg }); return }
            const dbL = carregarLeis();
            const idL = proximoIdLei(dbL);
            dbL[idL] = { id: idL, presidente: sender, texto: textoL, status: 'pendente', criadoEm: Date.now() };
            salvarLeis(dbL);
            await sock.sendMessage(from, {
              text: '╭━━━〔 ⚖️ 𝐋𝐄𝐈 𝐏𝐑𝐎𝐏𝐎𝐒𝐓𝐀 ⚖️ 〕━━━╮\n┃\n┃ ✅ Lei registrada!\n┃\n┃ 📜 ID: *' + idL + '*\n┃ 👤 Por: @' + sender.split('@')[0] + '\n┃ 📝 "' + textoL + '"\n┃\n┃ 💡 Aguardando aprovação do dono!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
