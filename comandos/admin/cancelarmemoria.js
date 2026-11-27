// Gerado de index.js (case 'cancelarmemoria', linha 14813)
export default {
  nomes: ["cancelarmemoria"],
  async executar(__x) {
    const { getAdminFlag, memoriaJogos, isGroup, sock, from, msg, sender, isDono } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gmcM = await globalThis.__getGroupMetadata(from);
            const ehAdmCM = !!getAdminFlag(gmcM.participants, sender);
            if (!ehAdmCM && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }
            if (!memoriaJogos.has(from)) { await sock.sendMessage(from, { text: 'ℹ️ Não tem jogo da memória rolando!' }, { quoted: msg }); return }
            memoriaJogos.delete(from);
            await sock.sendMessage(from, { text: '🛑 Jogo da memória cancelado!' }, { quoted: msg });
          }
          return
    }
  }
};
