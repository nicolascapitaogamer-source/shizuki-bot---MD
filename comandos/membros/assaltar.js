// Gerado de index.js (case 'assaltar', linha 10360)
export default {
  nomes: ["assaltar"],
  async executar(__x) {
    const { shizukiUser, checarCooldown, salvarShizuki, formatarReais, carregarJSON, FILE_ADVS, salvarJSON, sender, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);
            const cd = checarCooldown(u.ultimoAssaltar, 30 * 60 * 1000);
            if (!cd.ok) { await sock.sendMessage(from, { text: `⏰ Aguarde *${cd.minutos} min*!` }, { quoted: msg }); return }
            const locais = [
              { nome: '🏚️ Casa abandonada', min: 100, max: 500, chance: 30 },
              { nome: '🏪 Loja de bairro', min: 500, max: 2000, chance: 40 },
              { nome: '🏦 Banco pequeno', min: 2000, max: 5000, chance: 20 },
              { nome: '🏛️ Banco Central', min: 5000, max: 15000, chance: 10 }
            ];
            let r = Math.random() * 100, acum = 0, local = locais[0];
            for (const l of locais) { acum += l.chance; if (r <= acum) { local = l; break; } }
            u.ultimoAssaltar = Date.now();
            if (Math.random() < 0.5) {
              const ganho = local.min + Math.floor(Math.random() * (local.max - local.min));
              u.reais += ganho;
              salvarShizuki(sender, u);
              await sock.sendMessage(from, {
                text: `╭━━━〔 🏦 𝐀𝐒𝐒𝐀𝐋𝐓𝐎! 〕━━━╮\n┃\n┃ 💜 Você assaltou:\n┃ ${local.nome}\n┃\n┃ 💰 Levou: *${formatarReais(ganho)}*\n┃\n┃ 🕊️ Foge antes da polícia!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                mentions: [sender]
              }, { quoted: msg });
            } else {
              u.reais = Math.max(0, u.reais - 50);
              let advs = carregarJSON(FILE_ADVS);
              if (!advs[from]) advs[from] = {};
              if (!advs[from][sender]) advs[from][sender] = 0;
              advs[from][sender] += 1;
              salvarJSON(FILE_ADVS, advs);
              salvarShizuki(sender, u);
              await sock.sendMessage(from, {
                text: `╭━━━〔 🚨 𝐅𝐔𝐆𝐈𝐔! 〕━━━╮\n┃\n┃ 💔 Você tentou assaltar:\n┃ ${local.nome}\n┃\n┃ 💰 Perdeu: *R$ 50*\n┃ ⚠️ +1 advertência\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                mentions: [sender]
              }, { quoted: msg });
            }
          }
          return
    }
  }
};
