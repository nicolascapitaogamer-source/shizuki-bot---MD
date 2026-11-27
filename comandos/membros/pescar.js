// Gerado de index.js (case 'pescar', linha 10215)
export default {
  nomes: ["pescar"],
  async executar(__x) {
    const { shizukiUser, checarCooldown, salvarShizuki, formatarReais, sender, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);
            const cd = checarCooldown(u.ultimoPescar, 5 * 60 * 1000);
            if (!cd.ok) { await sock.sendMessage(from, { text: `⏰ Aguarde *${cd.minutos} min* pra pescar de novo!` }, { quoted: msg }); return }
            const peixes = [
              { nome: 'Sardinha', emoji: '🐟', valor: 20, chance: 40 },
              { nome: 'Tilápia', emoji: '🐠', valor: 50, chance: 30 },
              { nome: 'Piranha', emoji: '🐡', valor: 100, chance: 15 },
              { nome: 'Tubarão', emoji: '🦈', valor: 250, chance: 10 },
              { nome: 'Baleia', emoji: '🐋', valor: 500, chance: 5 }
            ];
            let r = Math.random() * 100, acum = 0, peixe = peixes[0];
            for (const p of peixes) { acum += p.chance; if (r <= acum) { peixe = p; break; } }
            u.reais += peixe.valor;
            u.ultimoPescar = Date.now();
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `╭━━━〔 🎣 𝐏𝐄𝐒𝐂𝐀𝐑𝐈𝐀 〕━━━╮\n┃\n┃ 💜 Você foi pescar!\n┃\n┃ ${peixe.emoji} Peixe: *${peixe.nome}*\n┃ 💰 Venda: *${formatarReais(peixe.valor)}*\n┃\n┃ 🕊️ Bom trabalho~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
