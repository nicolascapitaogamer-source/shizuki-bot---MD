// Gerado de index.js (case 'minerar', linha 10239)
export default {
  nomes: ["minerar"],
  async executar(__x) {
    const { shizukiUser, checarCooldown, salvarShizuki, formatarReais, sender, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);
            const cd = checarCooldown(u.ultimoMinerar, 10 * 60 * 1000);
            if (!cd.ok) { await sock.sendMessage(from, { text: `⏰ Aguarde *${cd.minutos} min* pra minerar de novo!` }, { quoted: msg }); return }
            const ganho = 50 + Math.floor(Math.random() * 451);
            const nomes = ['🪨 Pedra', '⚙️ Ferro', '🥇 Ouro', '💎 Diamante'];
            let minerio;
            if (ganho < 100) minerio = nomes[0];
            else if (ganho < 200) minerio = nomes[1];
            else if (ganho < 350) minerio = nomes[2];
            else minerio = nomes[3];
            u.reais += ganho;
            u.ultimoMinerar = Date.now();
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `╭━━━〔 ⛏️ 𝐌𝐈𝐍𝐄𝐑𝐀𝐂̧𝐀̃𝐎 〕━━━╮\n┃\n┃ 💜 Você foi minerar!\n┃\n┃ ${minerio}\n┃ 💰 Venda: *${formatarReais(ganho)}*\n┃\n┃ 🕊️ Bom trabalho~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
