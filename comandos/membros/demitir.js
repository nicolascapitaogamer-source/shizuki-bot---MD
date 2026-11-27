// Gerado de index.js (case 'demitir', linha 10088)
export default {
  nomes: ["demitir","demissao"],
  async executar(__x) {
    const { shizukiUser, acharEmprego, salvarShizuki, formatarReais, sender, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);
            if (!u.emprego) { await sock.sendMessage(from, { text: '❌ Você já tá desempregado!' }, { quoted: msg }); return }
            const empAntigo = acharEmprego(u.emprego);
            u.emprego = null;
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `╭━━━〔 🚪 𝐃𝐄𝐌𝐈𝐓𝐈𝐃𝐎 〕━━━╮\n┃\n┃ 💔 Você pediu demissão...\n┃\n┃ 📊 Cargo anterior: *${empAntigo ? empAntigo.nome : 'Desconhecido'}*\n┃ 💰 Saldo: *${formatarReais(u.reais)}*\n┃\n┃ 🕊️ Agora você tá desempregado!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
