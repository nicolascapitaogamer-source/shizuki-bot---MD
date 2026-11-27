// Gerado de index.js (case 'gozar', linha 6148)
export default {
  nomes: ["gozar"],
  async executar(__x) {
    const { msg, sock, from, sender } = Object.assign({}, __x.utils, __x);
    {
{
            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const quem = ctx?.mentionedJid?.[0] || ctx?.participant;
            if (!quem) { await sock.sendMessage(from, { text: '⚠️ Marque alguém! Ex: !gozar @pessoa' }, { quoted: msg }); return }
            if (sender === quem) { await sock.sendMessage(from, { text: '😳 Impossível!' }, { quoted: msg }); return }
            const texto = '╭─────────────────────╮\n   💦 JATO PRESSIONADO 💦\n╰─────────────────────╯\n\n💜 @' + sender.split('@')[0] + '\n🥵 Melou tudo!\n🚿 Vai lavar essa cara, @' + quem.split('@')[0] + '!\n\n╰━━━━━━━━━━━━━━━━━━⬣';
            try { const fs2 = await import('fs'); if (fs2.existsSync('./gifs/gozar')) { const arqs = fs2.readdirSync('./gifs/gozar'); if (arqs.length > 0) { const video = fs2.readFileSync('./gifs/gozar/' + arqs[0]); await sock.sendMessage(from, { video, gifPlayback: true, caption: texto, mentions: [sender, quem] }, { quoted: msg }); return } } } catch (e) {}
            await sock.sendMessage(from, { text: texto, mentions: [sender, quem] }, { quoted: msg });
          }
          return
    }
  }
};
