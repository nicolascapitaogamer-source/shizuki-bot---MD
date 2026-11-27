// Gerado de index.js (case 'meusfilhos', linha 10017)
export default {
  nomes: ["meusfilhos","filhos"],
  async executar(__x) {
    const { shizukiUser, sender, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);
            const filhos = u.filhos || [];
            if (!filhos.length) { await sock.sendMessage(from, { text: '👶 Você não tem filhos ainda!' }, { quoted: msg }); return }
            let txt = `╭━━━〔 👶 𝐌𝐄𝐔𝐒 𝐅𝐈𝐋𝐇𝐎𝐒 〕━━━╮\n┃\n┃ 💜 Você tem *${filhos.length}/5 filhos*:\n┃\n`;
            const mentions = [];
            filhos.forEach(f => {
              txt += `┃ 👶 @${f.split('@')[0]}\n`;
              mentions.push(f);
            });
            txt += `┃\n╰━━━━━━━━━━━━━━━━━━╯`;
            await sock.sendMessage(from, { text: txt, mentions }, { quoted: msg });
          }
          return
    }
  }
};
