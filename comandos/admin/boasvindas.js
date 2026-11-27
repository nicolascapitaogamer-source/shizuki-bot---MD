// Gerado de index.js (case 'boasvindas', linha 7189)
export default {
  nomes: ["boasvindas"],
  async executar(__x) {
    const { getAdminFlag, carregarBoasVindas, salvarBoasVindas, isGroup, sock, from, msg, sender, isDono } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas admins do grupo!' }, { quoted: msg });
              return
            }
            const db = carregarBoasVindas();
            if (!db[from]) db[from] = {};
            db[from].ativo = !db[from].ativo;
            salvarBoasVindas(db);
            if (db[from].ativo) {
              await sock.sendMessage(from, {
                text: `✅ *Boas-vindas ATIVADAS neste grupo!*\n\n💜 Quando alguém entrar, o bot manda a mensagem.\n📝 Use *!legendabv* pra personalizar.`
              }, { quoted: msg });
            } else {
              await sock.sendMessage(from, {
                text: `❌ *Boas-vindas DESATIVADAS neste grupo!*\n\n💤 O bot não vai mais avisar quem entrar.`
              }, { quoted: msg });
            }
          }
          return
    }
  }
};
