// Gerado de index.js (case 'navegar', linha 8095)
export default {
  nomes: ["navegar"],
  async executar(__x) {
    const { pirataUser, sender, args, sock, from, msg, ILHAS, salvarPirata, CONF } = Object.assign({}, __x.utils, __x);
    {
{
            const u = pirataUser(sender);
            const destNome = args.join(' ').trim().toLowerCase();
            if (!destNome) {
              await sock.sendMessage(from, { text: '⚠️ Use: *!navegar <nome da ilha>*\n\nEx: *!navegar Alabasta*' }, { quoted: msg });
              return
            }
            const ilDest = ILHAS.find(i => i.nome.toLowerCase().includes(destNome) || i.id === destNome);
            if (!ilDest) { await sock.sendMessage(from, { text: '❌ Ilha não encontrada!' }, { quoted: msg }); return }
            if (u.ilhaAtual === ilDest.id) { await sock.sendMessage(from, { text: '📍 Você já está nessa ilha!' }, { quoted: msg }); return }
            if (u.nivel < ilDest.nivelMin) { await sock.sendMessage(from, { text: '🔒 Você precisa ser nível *' + ilDest.nivelMin + '* pra ir nessa ilha!\n\n💡 Seu nível: *' + u.nivel + '*' }, { quoted: msg }); return }
            if (u.energia < 20) { await sock.sendMessage(from, { text: '⚡ Energia insuficiente! Use *!dormir* ou *!meditar*.' }, { quoted: msg }); return }

            // Se tiver barco, gasta menos energia
            const custoEnergia = u.barco ? Math.floor(20 * 0.5) : 20;
            u.energia -= custoEnergia;
            u.ilhaAtual = ilDest.id;
            salvarPirata(sender, u);

            await sock.sendMessage(from, {
              text: '╔══════════════════════════════╗\n' +
                    '║   🌊  𝐍𝐀𝐕𝐄𝐆𝐀𝐍𝐃𝐎...  🌊        ║\n' +
                    '╚══════════════════════════════╝\n\n' +
                    '🎯 Destino: ' + ilDest.emoji + ' *' + ilDest.nome + '*\n' +
                    '⚡ Energia gasta: *-' + custoEnergia + '*\n' +
                    '⚡ Energia restante: *' + u.energia + '/' + u.energiaMax + '*\n\n' +
                    '🏝️ *Você chegou em ' + ilDest.nome + '!*\n' +
                    '👹 Boss: ' + ilDest.boss + '\n\n' +
                    '🌸 ' + CONF.nomeBot + ' 🌸',
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
