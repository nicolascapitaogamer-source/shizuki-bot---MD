// Gerado de index.js (case 'emprestar', linha 10489)
export default {
  nomes: ["emprestar"],
  async executar(__x) {
    const { shizukiUser, formatarReais, salvarShizuki, isGroup, msg, sock, from, sender, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) return
            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;
            if (!alvo) { await sock.sendMessage(from, { text: '⚠️ Marque a pessoa!\n\nEx: `!emprestar @pessoa 500`' }, { quoted: msg }); return }
            if (alvo === sender) { await sock.sendMessage(from, { text: '😅 Não pode emprestar pra si mesmo!' }, { quoted: msg }); return }
            const valor = parseInt(args.find(a => /^\d+$/.test(a)) || '0', 10);
            if (!valor || valor < 100) { await sock.sendMessage(from, { text: '⚠️ Mínimo: *R$ 100*\n\nEx: `!emprestar @pessoa 500`' }, { quoted: msg }); return }
            const u = shizukiUser(sender);
            if (valor > u.reais) { await sock.sendMessage(from, { text: `💸 Saldo insuficiente!\n\n💰 Você tem: *${formatarReais(u.reais)}*` }, { quoted: msg }); return }
            const uAlvo = shizukiUser(alvo);
            u.reais -= valor;
            uAlvo.reais += valor;
            uAlvo.divida = (uAlvo.divida || 0) + Math.floor(valor * 1.1);
            salvarShizuki(sender, u);
            salvarShizuki(alvo, uAlvo);
            await sock.sendMessage(from, {
              text: `╭━━━〔 💸 𝐄𝐌𝐏𝐑𝐄́𝐒𝐓𝐈𝐌𝐎 〕━━━╮\n┃\n┃ 💜 Você emprestou *${formatarReais(valor)}*\n┃    para @${alvo.split('@')[0]}!\n┃\n┃ ⏰ Prazo: *7 dias*\n┃ 💰 Devolução: *${formatarReais(Math.floor(valor * 1.1))}*\n┃\n┃ 🕊️ Cobre na data!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [alvo]
            }, { quoted: msg });
          }
          return
    }
  }
};
