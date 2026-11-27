// Gerado de index.js (case 'aniversario', linha 7357)
export default {
  nomes: ["aniversario","meuaniversario"],
  async executar(__x) {
    const { shizukiUser, salvarShizuki, args, sock, from, msg, sender, isGroup } = Object.assign({}, __x.utils, __x);
    {
{
            const data = (args[0] || '').trim();
            if (!/^\d{1,2}\/\d{1,2}$/.test(data)) {
              await sock.sendMessage(from, { text: '⚠️ Use: `!aniversario DD/MM`\nEx: `!aniversario 25/12`' }, { quoted: msg });
              return
            }
            const u = shizukiUser(sender);
            u.aniversario = data;
            u.aniversarioGrupos = u.aniversarioGrupos || [];
            if (isGroup && !u.aniversarioGrupos.includes(from)) {
              u.aniversarioGrupos.push(from);
            }
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `🎂 *Aniversário salvo!*\n\n📅 Você faz aniversário em *${data}*\n👥 Grupos registrados: *${u.aniversarioGrupos.length}*\n\n💜 O bot vai avisar nesses grupos no dia!`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
