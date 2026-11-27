// Gerado de index.js (case 'legendabv', linha 7161)
export default {
  nomes: ["legendabv"],
  async executar(__x) {
    const { getAdminFlag, bvLegenda, carregarBoasVindas, salvarBoasVindas, isGroup, sock, from, msg, sender, isDono, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas admins do grupo!' }, { quoted: msg });
              return
            }
            const texto = args.join(' ').trim();
            if (!texto) {
              const atual = bvLegenda(from);
              await sock.sendMessage(from, {
                text: `📝 *Legenda atual:*\n\n${atual}\n\n💡 Use: *!legendabv <texto>*\nMarque *@{user}* pra mencionar quem entrou.`
              }, { quoted: msg });
              return
            }
            const db = carregarBoasVindas();
            if (!db[from]) db[from] = {};
            db[from].legenda = texto;
            salvarBoasVindas(db);
            await sock.sendMessage(from, {
              text: `✅ *Legenda de boas-vindas atualizada!*\n\n📝 ${texto}`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
