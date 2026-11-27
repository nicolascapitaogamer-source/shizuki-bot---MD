// Gerado de index.js (case 'cancelarforca', linha 14801)
export default {
  nomes: ["cancelarforca"],
  async executar(__x) {
    const { getAdminFlag, forcaJogos, isGroup, sock, from, msg, sender, isDono } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gmcF = await globalThis.__getGroupMetadata(from);
            const ehAdmCF = !!getAdminFlag(gmcF.participants, sender);
            if (!ehAdmCF && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }
            if (!forcaJogos.has(from)) { await sock.sendMessage(from, { text: 'ℹ️ Não tem jogo da forca rolando!' }, { quoted: msg }); return }
            forcaJogos.delete(from);
            await sock.sendMessage(from, { text: '🛑 Jogo da forca cancelado!' }, { quoted: msg });
          }
          return
    }
  }
};
