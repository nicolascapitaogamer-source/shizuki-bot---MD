// Gerado de index.js (case 'banco', linha 10452)
export default {
  nomes: ["banco"],
  async executar(__x) {
    const { shizukiUser, formatarReais, salvarShizuki, sender, args, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);
            const sub = (args[0] || '').toLowerCase();
            const valor = parseInt(args[1] || '0', 10);

            if (sub === 'depositar' || sub === 'dep') {
              if (!valor || valor < 1) { await sock.sendMessage(from, { text: '⚠️ Use: `!banco depositar <valor>`' }, { quoted: msg }); return }
              if (valor > u.reais) { await sock.sendMessage(from, { text: `💸 Saldo insuficiente!\n\n💰 Você tem: *${formatarReais(u.reais)}*` }, { quoted: msg }); return }
              u.reais -= valor;
              u.banco = (u.banco || 0) + valor;
              u.ultimoRendBanco = u.ultimoRendBanco || Date.now();
              salvarShizuki(sender, u);
              await sock.sendMessage(from, {
                text: `╭━━━〔 🏦 𝐃𝐄𝐏𝐎́𝐒𝐈𝐓𝐎 〕━━━╮\n┃\n┃ 💜 Você depositou *${formatarReais(valor)}*\n┃\n┃ 🏦 No banco: *${formatarReais(u.banco)}*\n┃ 💰 Em mãos: *${formatarReais(u.reais)}*\n┃\n┃ 🕊️ Rende 1%/dia~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                mentions: [sender]
              }, { quoted: msg });
            } else if (sub === 'sacar' || sub === 'saque') {
              if (!valor || valor < 1) { await sock.sendMessage(from, { text: '⚠️ Use: `!banco sacar <valor>`' }, { quoted: msg }); return }
              if (valor > (u.banco || 0)) { await sock.sendMessage(from, { text: `💸 Você só tem *${formatarReais(u.banco || 0)}* no banco!` }, { quoted: msg }); return }
              u.banco -= valor;
              u.reais += valor;
              salvarShizuki(sender, u);
              await sock.sendMessage(from, {
                text: `╭━━━〔 🏦 𝐒𝐀𝐐𝐔𝐄 〕━━━╮\n┃\n┃ 💜 Você sacou *${formatarReais(valor)}*\n┃\n┃ 🏦 No banco: *${formatarReais(u.banco)}*\n┃ 💰 Em mãos: *${formatarReais(u.reais)}*\n┃\n┃ 🕊️ Pronto!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                mentions: [sender]
              }, { quoted: msg });
            } else {
              const banco = u.banco || 0;
              await sock.sendMessage(from, {
                text: `╭━━━〔 🏦 𝐁𝐀𝐍𝐂𝐎 〕━━━╮\n┃\n┃ 💜 Bem-vindo ao banco!\n┃\n┃ 💰 Em mãos: *${formatarReais(u.reais)}*\n┃ 🏦 Guardado: *${formatarReais(banco)}*\n┃ 📈 Rendimento: *+1%/dia*\n┃\n┃ 💡 Use: !banco depositar <valor>\n┃ 💡 Use: !banco sacar <valor>\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                mentions: [sender]
              }, { quoted: msg });
            }
          }
          return
    }
  }
};
