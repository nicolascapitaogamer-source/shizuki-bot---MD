// Gerado de index.js (case 'cancelarduelo', linha 14878)
export default {
  nomes: ["cancelarduelo"],
  async executar(__x) {
    const { getAdminFlag, dueloJogos, isGroup, sock, from, msg, sender, isDono } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gmCD = await globalThis.__getGroupMetadata(from);
            const ehAdmCD = !!getAdminFlag(gmCD.participants, sender);
            const jogoCD = dueloJogos.get(from);
            if (!jogoCD) { await sock.sendMessage(from, { text: 'ℹ️ Não tem duelo rolando!' }, { quoted: msg }); return }
            const ehJogador = sender === jogoCD.j1 || sender === jogoCD.j2;
            if (!ehAdmCD && !isDono && !ehJogador) { await sock.sendMessage(from, { text: '🚫 Apenas admins ou jogadores!' }, { quoted: msg }); return }
            dueloJogos.delete(from);
            await sock.sendMessage(from, { text: '🛑 Duelo cancelado!' }, { quoted: msg });
          }
          return
    }
  }
};
