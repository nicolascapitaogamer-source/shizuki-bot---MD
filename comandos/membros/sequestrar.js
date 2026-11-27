// Gerado de index.js (case 'sequestrar', linha 10398)
export default {
  nomes: ["sequestrar"],
  async executar(__x) {
    const { shizukiUser, checarCooldown, salvarShizuki, formatarReais, carregarJSON, FILE_ADVS, salvarJSON, isGroup, sender, msg, sock, from } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) return
            const u = shizukiUser(sender);
            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;
            if (!alvo) { await sock.sendMessage(from, { text: '⚠️ Marque a pessoa!\n\nEx: `!sequestrar @pessoa`' }, { quoted: msg }); return }
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
            if (alvo === sender) { await sock.sendMessage(from, { text: '😅 Não pode sequestrar a si mesmo!' }, { quoted: msg }); return }
            const cd = checarCooldown(u.ultimoSequestrar, 30 * 60 * 1000);
            if (!cd.ok) { await sock.sendMessage(from, { text: `⏰ Aguarde *${cd.minutos} min*!` }, { quoted: msg }); return }
            const uAlvo = shizukiUser(alvo);
            u.ultimoSequestrar = Date.now();
            if (Math.random() < 0.5) {
              const qtd = Math.min(Math.max(Math.floor(uAlvo.reais * 0.3), 100), 5000);
              const real = Math.max(100, qtd);
              u.reais += real; uAlvo.reais = Math.max(0, uAlvo.reais - real);
              salvarShizuki(sender, u); salvarShizuki(alvo, uAlvo);
              await sock.sendMessage(from, {
                text: `╭━━━〔 😈 𝐒𝐄𝐐𝐔𝐄𝐒𝐓𝐑𝐎! 〕━━━╮\n┃\n┃ 💜 Você sequestrou @${alvo.split('@')[0]}!\n┃\n┃ 💰 Resgate: *${formatarReais(real)}*\n┃\n┃ 🕊️ Solta só se pagarem!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
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
                text: `╭━━━〔 🚨 𝐏𝐑𝐄𝐒𝐎! 〕━━━╮\n┃\n┃ 💔 Você foi pego pela polícia!\n┃\n┃ 💰 Perdeu: *R$ 50*\n┃ ⚠️ +1 advertência\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                mentions: [sender]
              }, { quoted: msg });
            }
          }
          return
    }
  }
};
