// Gerado de index.js (case 'comer', linha 6136)
export default {
  nomes: ["comer"],
  async executar(__x) {
    const { msg, sock, from, sender } = Object.assign({}, __x.utils, __x);
    {
{
            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const quem = ctx?.mentionedJid?.[0] || ctx?.participant;
            if (!quem) { await sock.sendMessage(from, { text: '⚠️ Marque alguém! Ex: !comer @pessoa' }, { quoted: msg }); return }
            if (sender === quem) { await sock.sendMessage(from, { text: '😳 Comer a si mesmo(a)?' }, { quoted: msg }); return }
            const texto = '╭─────────────────────╮\n   🍆 SENTA E GEME 🍑\n╰─────────────────────╯\n\n💜 @' + sender.split('@')[0] + '\n🔥 Comeu bem gostoso, mas usou proteção!\n🥵 @' + quem.split('@')[0] + ' ficou arrepiado(a) e pedindo mais~\n\n╰━━━━━━━━━━━━━━━━━━⬣';
            try { const fs2 = await import('fs'); if (fs2.existsSync('./gifs/comer')) { const arqs = fs2.readdirSync('./gifs/comer'); if (arqs.length > 0) { const video = fs2.readFileSync('./gifs/comer/' + arqs[0]); await sock.sendMessage(from, { video, gifPlayback: true, caption: texto, mentions: [sender, quem] }, { quoted: msg }); return } } } catch (e) {}
            await sock.sendMessage(from, { text: texto, mentions: [sender, quem] }, { quoted: msg });
          }
          return
    }
  }
};
