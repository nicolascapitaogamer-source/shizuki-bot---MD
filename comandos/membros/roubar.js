// Gerado de index.js (case 'roubar', linha 10311)
export default {
  nomes: ["roubar"],
  async executar(__x) {
    const { shizukiUser, checarCooldown, salvarShizuki, formatarReais, carregarJSON, FILE_ADVS, salvarJSON, isGroup, sender, msg, sock, from } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) return
            const u = shizukiUser(sender);
            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;
            if (!alvo) { await sock.sendMessage(from, { text: '⚠️ Marque a pessoa!\n\nEx: `!roubar @pessoa`' }, { quoted: msg }); return }
            const uAlvoProt = shizukiUser(alvo);
            if (uAlvoProt.vipprotecao && uAlvoProt.vipprotecao.expira > Date.now()) {
              const resta = uAlvoProt.vipprotecao.expira - Date.now();
              const h = Math.floor(resta / 3600000);
              const m = Math.floor((resta % 3600000) / 60000);
              await sock.sendMessage(from, {
                text: '╭━━━〔 🛡️ 𝐁𝐋𝐎𝐐𝐔𝐄𝐀𝐃𝐎 🛡️ 〕━━━╮\n┃\n┃ 😈 @' + sender.split('@')[0] + ' tentou te roubar!\n┃\n┃ 🛡️ Mas a proteção VIP bloqueou!\n┃\n┃ 💎 @' + alvo.split('@')[0] + ' tá protegido(a)!\n┃ ⏰ Proteção restante: *' + h + 'h ' + m + 'min*\n┃\n┃ 💜 Tenta outra hora, parça...\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [alvo, sender]
              }, { quoted: msg });
              return
            }
            if (alvo === sender) { await sock.sendMessage(from, { text: '😅 Não pode roubar a si mesmo!' }, { quoted: msg }); return }
            const cd = checarCooldown(u.ultimoRoubar, 30 * 60 * 1000);
            if (!cd.ok) { await sock.sendMessage(from, { text: `⏰ Aguarde *${cd.minutos} min*!` }, { quoted: msg }); return }
            const uAlvo = shizukiUser(alvo);
            if (uAlvo.reais < 50) { await sock.sendMessage(from, { text: '💸 Essa pessoa tá falida!' }, { quoted: msg }); return }
            u.ultimoRoubar = Date.now();
            if (Math.random() < 0.5) {
              const qtd = Math.min(Math.floor(uAlvo.reais * 0.1), 500);
              const real = Math.max(50, qtd);
              u.reais += real; uAlvo.reais -= real;
              salvarShizuki(sender, u); salvarShizuki(alvo, uAlvo);
              await sock.sendMessage(from, {
                text: `╭━━━〔 💰 𝐑𝐎𝐔𝐁𝐎! 〕━━━╮\n┃\n┃ 💜 Você roubou *${formatarReais(real)}*\n┃    de @${alvo.split('@')[0]}!\n┃\n┃ 😈 Ninguém viu nada...\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                mentions: [alvo]
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
                text: `╭━━━〔 🚨 𝐅𝐔𝐆𝐈𝐔! 〕━━━╮\n┃\n┃ 💔 Você tentou roubar\n┃    @${alvo.split('@')[0]} mas fugiu!\n┃\n┃ 💰 Perdeu: *R$ 50*\n┃ ⚠️ +1 advertência\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                mentions: [alvo]
              }, { quoted: msg });
            }
          }
          return
    }
  }
};
