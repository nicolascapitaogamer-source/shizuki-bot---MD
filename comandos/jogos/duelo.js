// Gerado de index.js (case 'duelo', linha 14824)
export default {
  nomes: ["duelo"],
  async executar(__x) {
    const { dueloJogos, isGroup, sock, from, msg, sender } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const ctxD = msg.message.extendedTextMessage?.contextInfo;
            const alvoD = ctxD?.mentionedJid?.[0];
            if (!alvoD) { await sock.sendMessage(from, { text: '⚠️ Marque alguém!\n\nEx: *!duelo @pessoa*' }, { quoted: msg }); return }
            if (alvoD === sender) { await sock.sendMessage(from, { text: '😅 Não pode duelar sozinho!' }, { quoted: msg }); return }
            if (dueloJogos.has(from)) { await sock.sendMessage(from, { text: '⚠️ Já tem um duelo rolando!' }, { quoted: msg }); return }
            const jogador1 = sender;
            const jogador2 = alvoD;
            dueloJogos.set(from, {
              j1: jogador1,
              j2: jogador2,
              fase: 'preparando',
              criadoEm: Date.now(),
              vencedor: null
            });
            await sock.sendMessage(from, {
              text: '╭━━━〔 🔫 𝐃𝐔𝐄𝐋𝐎 🔫 〕━━━╮\n┃\n┃ 👤 @' + jogador1.split('@')[0] + ' vs @' + jogador2.split('@')[0] + '\n┃\n┃ 🎯 Prepare-se!\n┃ ⏰ Mande *!atirar* o mais\n┃    rápido possível!\n┃\n┃ 🔫 3... 2... 1...\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [jogador1, jogador2]
            }, { quoted: msg });
            // Libera o !atirar depois de 3 segundos
            setTimeout(() => {
              const jogo = dueloJogos.get(from);
              if (jogo && jogo.fase === 'preparando') {
                jogo.fase = 'atirando';
                dueloJogos.set(from, jogo);
              }
            }, 3000);
          }
          return
    }
  }
};
