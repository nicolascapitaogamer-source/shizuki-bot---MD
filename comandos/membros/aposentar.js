// Gerado de index.js (case 'aposentar', linha 10193)
export default {
  nomes: ["aposentar","aposentadoria"],
  async executar(__x) {
    const { shizukiUser, salvarShizuki, formatarReais, sender, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);
            if (u.aposentado) { await sock.sendMessage(from, { text: '❌ Você já tá aposentado!' }, { quoted: msg }); return }
            if (!u.emprego) { await sock.sendMessage(from, { text: '❌ Você precisa ter emprego pra se aposentar!' }, { quoted: msg }); return }
            u.aposentado = true;
            u.emprego = null;
            u.ultimaAposentadoria = Date.now();
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `╭━━━〔 👴 𝐀𝐏𝐎𝐒𝐄𝐍𝐓𝐀𝐃𝐎! 〕━━━╮\n┃\n┃ 💜 Parabéns pela carreira!\n┃\n┃ 📊 Você se aposentou\n┃ 💰 Aposentadoria: *${formatarReais(300)}/dia*\n┃\n┃ 🕊️ Descanse, guerreiro(a)!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
