// Gerado de index.js (case 'mapa', linha 8047)
export default {
  nomes: ["mapa"],
  async executar(__x) {
    const { pirataUser, sender, ILHAS, CONF, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = pirataUser(sender);
            let txt = '╔══════════════════════════════╗\n' +
                      '║   🗺️  𝐌𝐀𝐏𝐀  𝐃𝐎  𝐌𝐔𝐍𝐃𝐎  🗺️      ║\n' +
                      '╚══════════════════════════════╝\n\n';

            ILHAS.forEach(il => {
              const liberada = u.nivel >= il.nivelMin;
              txt += '╭─❖ ' + il.emoji + ' 𝐈𝐋𝐇𝐀 ❖─╮\n│\n';
              txt += '│  ' + il.nome + '\n';
              txt += '│  ' + (liberada ? '✅ Liberada' : '🔒 Bloqueada') + ' | Nv. ' + il.nivelMin + '+\n';
              txt += '│  👹 Boss: ' + il.boss + '\n';
              txt += '│  ' + (u.ilhaAtual === il.id ? '📍 Você está aqui' : '') + '\n';
              txt += '╰─────────────────────╯\n\n';
            });

            txt += '🌸 ' + CONF.nomeBot + ' 🌸';
            await sock.sendMessage(from, { text: txt, mentions: [sender] }, { quoted: msg });
          }
          return
    }
  }
};
