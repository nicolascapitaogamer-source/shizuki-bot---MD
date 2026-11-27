// Gerado de index.js (case 'arena', linha 13830)
export default {
  nomes: ["arena"],
  async executar(__x) {
    const { eVIP, carregarArena, chaveArena, shizukiUser, ARENA_COOLDOWN, salvarArena, sender, isDono, sock, from, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!eVIP(sender) && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas VIP pode criar arena!' }, { quoted: msg }); return }
            const dbAr = carregarArena();
            const chvAr = chaveArena(from);
            if (dbAr[chvAr] && !dbAr[chvAr].finalizada) { await sock.sendMessage(from, { text: '⚠️ Já tem um duelo rolando aqui!' }, { quoted: msg }); return }
            const ctxAr = msg.message.extendedTextMessage?.contextInfo;
            const alvoAr = ctxAr?.mentionedJid?.[0] || ctxAr?.participant;
            if (!alvoAr) { await sock.sendMessage(from, { text: '⚠️ Marque alguém!\n\nEx: *!arena @pessoa 5000*' }, { quoted: msg }); return }
            if (alvoAr === sender) { await sock.sendMessage(from, { text: '😅 Você não pode duelar consigo mesmo!' }, { quoted: msg }); return }
            const valorAr = parseInt(args.find(a => /^\d+$/.test(a)) || '0', 10);
            if (!valorAr || valorAr < 40 || valorAr > 999) { await sock.sendMessage(from, { text: '⚠️ Valor inválido! Mínimo: *40* Máximo: *999*' }, { quoted: msg }); return }
            const uAr1 = shizukiUser(sender);
            const uAr2 = shizukiUser(alvoAr);
            if (uAr1.reais < valorAr) { await sock.sendMessage(from, { text: '💸 Você não tem *R$ ' + valorAr + '*!' }, { quoted: msg }); return }
            if (uAr2.reais < valorAr) { await sock.sendMessage(from, { text: '💸 @' + alvoAr.split('@')[0] + ' não tem *R$ ' + valorAr + '*!', mentions: [alvoAr] }, { quoted: msg }); return }
            const agoraAr = Date.now();
            if (uAr1.ultimaArena && agoraAr - uAr1.ultimaArena < ARENA_COOLDOWN) {
              const resta = Math.ceil((ARENA_COOLDOWN - (agoraAr - uAr1.ultimaArena)) / 60000);
              await sock.sendMessage(from, { text: '⏰ Aguarde *' + resta + ' min* pra duelar de novo!' }, { quoted: msg });
              return
            }
            dbAr[chvAr] = {
              j1: sender,
              j2: alvoAr,
              hp1: 100, hp2: 100,
              vez: 1,
              turno: 1,
              valor: valorAr,
              defender1: false, defender2: false,
              escudo1: false, escudo2: false,
              cd1: {}, cd2: {},
              criadoEm: agoraAr,
              finalizada: false,
              stanzaId: null
            };
            salvarArena(dbAr);
            const msgEnviado = await sock.sendMessage(from, {
              text: '╭━━━〔 ⚔️ 𝐀𝐑𝐄𝐍𝐀 𝐕𝐈𝐏 ⚔️ 〕━━━╮\n┃\n┃ 💎 @' + sender.split('@')[0] + ' desafiou @' + alvoAr.split('@')[0] + '!\n┃\n┃ 💰 Aposta: *R$ ' + valorAr + '*\n┃ ⚔️ Luta até a morte!\n┃\n┃ 🎯 @' + alvoAr.split('@')[0] + ', aceita?\n┃    ┣ ✅ Marque esta mensagem\n┃    ┃    e responda *sim*\n┃    ┗ ❌ Ou responda *nao*\n┃\n┃ ⏰ 2 minutos pra responder\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [sender, alvoAr]
            }, { quoted: msg });
            dbAr[chvAr].stanzaId = msgEnviado?.key?.id;
            salvarArena(dbAr);
          }
          return
    }
  }
};
