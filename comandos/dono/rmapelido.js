// Gerado de index.js (case 'rmapelido', linha 7794)
export default {
  nomes: ["rmapelido"],
  async executar(__x) {
    const { eVIP, vipDB, salvarVipDB, sender, isDono, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!eVIP(sender) && !isDono) {
              await sock.sendMessage(from, { text: '🚫 Só VIPs!' }, { quoted: msg });
              return
            }
            const db = vipDB();
            if (!db.vips || !db.vips[sender] || !db.vips[sender].apelido) {
              await sock.sendMessage(from, { text: '❌ Você não tem apelido definido.' }, { quoted: msg });
              return
            }
            delete db.vips[sender].apelido;
            salvarVipDB(db);
            await sock.sendMessage(from, { text: '✅ Apelido removido! Agora o bot te chama pelo nome normal.' }, { quoted: msg });
          }
          return
    }
  }
};
