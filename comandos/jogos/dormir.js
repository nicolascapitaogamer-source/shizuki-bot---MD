// Gerado de index.js (case 'dormir', linha 7010)
export default {
  nomes: ["dormir"],
  async executar(__x) {
    const { shizukiUser, checarCooldown, SHIZUKI_DATA, salvarShizuki, sender, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);
            const cd = checarCooldown(u.ultimoSono, SHIZUKI_DATA.cooldownDormir);
            if (!cd.ok) {
              const h = Math.floor(cd.minutos / 60);
              const m = cd.minutos % 60;
              await sock.sendMessage(from, { text: `😴 Você já dormiu!\n\nAguarde *${h}h ${m}min* pra dormir de novo.` }, { quoted: msg });
              return
            }
            u.energia = 100;
            u.ultimoSono = Date.now();
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `╭━━━〔 😴 𝐃𝐎𝐑𝐌𝐈𝐍𝐃𝐎 😴 〕━━━╮\n┃\n┃ 💤 Zzz...\n┃ ⚡ Energia: *100/100*\n┃\n┃ ⏰ Próximo sono em 8h\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
