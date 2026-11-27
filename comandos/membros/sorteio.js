// Gerado de index.js (case 'sorteio', linha 7237)
export default {
  nomes: ["sorteio"],
  async executar(__x) {
    const { getAdminFlag, isGroup, sock, from, msg, sender, isDono, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas admins do grupo!' }, { quoted: msg });
              return
            }
            const premio = args.join(' ').trim();
            if (!premio) {
              await sock.sendMessage(from, { text: '⚠️ Informe o prêmio!\n\nEx: `!sorteio 200 reais`' }, { quoted: msg });
              return
            }
            const membros = gm.participants.filter(p => !p.id.includes(sock.user?.id?.split('@')[0] || '___'));
            if (membros.length === 0) {
              await sock.sendMessage(from, { text: '❌ Sem membros pra sortear!' }, { quoted: msg });
              return
            }
            const sorteado = membros[Math.floor(Math.random() * membros.length)];
            await sock.sendMessage(from, {
              text: `🎉 *SORTEIO!* 🎉\n\n🏆 O vencedor foi:\n\n👤 @${sorteado.id.split('@')[0]}\n\n🎁 Prêmio: *${premio}*\n\n💜 Parabéns!`,
              mentions: [sorteado.id]
            }, { quoted: msg });
          }
          return
    }
  }
};
