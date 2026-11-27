// Gerado de index.js (case 'ilha', linha 8069)
export default {
  nomes: ["ilha"],
  async executar(__x) {
    const { pirataUser, sender, acharIlha, sock, from, msg, CONF } = Object.assign({}, __x.utils, __x);
    {
{
            const u = pirataUser(sender);
            const ilha = acharIlha(u.ilhaAtual);
            if (!ilha) { await sock.sendMessage(from, { text: '❌ Ilha inválida!' }, { quoted: msg }); return }

            let txt = '╔══════════════════════════════╗\n' +
                      '║   ' + ilha.emoji + '  𝐈𝐋𝐇𝐀  𝐀𝐓𝐔𝐀𝐋  ' + ilha.emoji + '     ║\n' +
                      '╚══════════════════════════════╝\n\n' +
                      '📍 *' + ilha.nome + '*\n' +
                      '🏆 Nível mínimo: ' + ilha.nivelMin + '+\n' +
                      '⭐ XP base: ' + ilha.xpBase + '\n' +
                      '💰 Ouro base: ' + ilha.ouroBase + '\n\n' +
                      '╭─❖ 👹 𝐈𝐍𝐈𝐌𝐈𝐆𝐎𝐒 ❖─╮\n│\n';
            ilha.inimigos.forEach((ini, i) => {
              txt += '│  ' + (i+1) + '. ' + ini + '\n';
            });
            txt += '│\n╰─────────────────────╯\n\n';
            txt += '╭─❖ 👑 𝐁𝐎𝐒𝐒 ❖─╮\n│\n│  ' + ilha.boss + '\n│\n╰─────────────────────╯\n\n';
            txt += '💡 Use: *!lutar <inimigo>* ou *!boss*\n\n';
            txt += '🌸 ' + CONF.nomeBot + ' 🌸';

            await sock.sendMessage(from, { text: txt, mentions: [sender] }, { quoted: msg });
          }
          return
    }
  }
};
