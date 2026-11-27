// Gerado de index.js (case 'atirar', linha 14856)
export default {
  nomes: ["atirar"],
  async executar(__x) {
    const { dueloJogos, isGroup, sock, from, msg, sender } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const jogo = dueloJogos.get(from);
            if (!jogo) { await sock.sendMessage(from, { text: '❌ Não tem duelo rolando!' }, { quoted: msg }); return }
            if (jogo.fase === 'preparando') { await sock.sendMessage(from, { text: '⏳ Calma! Aguarde o 3... 2... 1...' }, { quoted: msg }); return }
            if (jogo.fase === 'finalizado') { await sock.sendMessage(from, { text: '❌ Esse duelo já acabou!' }, { quoted: msg }); return }
            if (sender !== jogo.j1 && sender !== jogo.j2) { await sock.sendMessage(from, { text: '❌ Você não tá nesse duelo!' }, { quoted: msg }); return }
            // Quem atirou primeiro vence
            jogo.vencedor = sender;
            jogo.fase = 'finalizado';
            dueloJogos.set(from, jogo);
            const perdedor = sender === jogo.j1 ? jogo.j2 : jogo.j1;
            await sock.sendMessage(from, {
              text: '╭━━━〔 💀 𝐌𝐎𝐑𝐓𝐎 💀 〕━━━╮\n┃\n┃ 🏆 @' + sender.split('@')[0] + ' venceu!\n┃\n┃ 💀 @' + perdedor.split('@')[0] + ' morreu\n┃\n┃ 🎯 Foi mais rápido!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [sender, perdedor]
            }, { quoted: msg });
            // Remove o duelo depois de 5 segundos
            setTimeout(() => dueloJogos.delete(from), 5000);
          }
          return
    }
  }
};
