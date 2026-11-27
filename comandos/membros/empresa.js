// Gerado de index.js (case 'empresa', linha 10174)
export default {
  nomes: ["empresa"],
  async executar(__x) {
    const { shizukiUser, formatarReais, salvarShizuki, sender, args, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);
            const nome = args.join(' ').trim();
            if (!nome) { await sock.sendMessage(from, { text: '⚠️ Use: `!empresa <nome>`\n\nEx: `!empresa Tech Solutions`' }, { quoted: msg }); return }
            if (u.empresa) { await sock.sendMessage(from, { text: `❌ Você já tem empresa: *${u.empresa.nome}*` }, { quoted: msg }); return }
            if (u.reais < 5000) { await sock.sendMessage(from, { text: `💸 Precisa de *${formatarReais(5000)}*!\n\n💰 Você tem: *${formatarReais(u.reais)}*` }, { quoted: msg }); return }
            u.reais -= 5000;
            u.empresa = { nome, desde: Date.now() };
            u.ultimaEmpresa = Date.now();
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `╭━━━〔 🏢 𝐄𝐌𝐏𝐑𝐄𝐒𝐀 𝐂𝐑𝐈𝐀𝐃𝐀! 〕━━━╮\n┃\n┃ 💜 Parabéns, @${sender.split('@')[0]}!\n┃\n┃ 🏢 Empresa: *${nome}*\n┃ 💰 Investimento: *${formatarReais(5000)}*\n┃ 📈 Renda diária: *${formatarReais(1500)}*\n┃\n┃ 🕊️ Agora é patrão!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
