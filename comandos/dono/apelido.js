// Gerado de index.js (case 'apelido', linha 7762)
export default {
  nomes: ["apelido"],
  async executar(__x) {
    const { eVIP, apelidoDe, vipDB, salvarVipDB, sender, isDono, sock, from, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!eVIP(sender) && !isDono) {
              await sock.sendMessage(from, { text: '🚫 Só VIPs podem definir apelido!' }, { quoted: msg });
              return
            }
            const novo = args.join(' ').trim();
            if (!novo) {
              const atual = apelidoDe(sender);
              await sock.sendMessage(from, {
                text: `🏷️ *SEU APELIDO*\n\n` +
                      (atual ? `👑 『 ${atual} 』\n\n` : `❌ Nenhum apelido definido.\n\n`) +
                      `💡 Definir: *!apelido <texto>*\n💡 Remover: *!rmapelido*`
              }, { quoted: msg });
              return
            }
            if (novo.length > 20) {
              await sock.sendMessage(from, { text: '⚠️ Máximo de 20 caracteres!' }, { quoted: msg });
              return
            }
            const db = vipDB();
            db.vips = db.vips || {};
            db.vips[sender] = db.vips[sender] || { desde: Date.now(), expira: null };
            db.vips[sender].apelido = novo;
            salvarVipDB(db);
            await sock.sendMessage(from, {
              text: `🏷️ *APELIDO DEFINIDO!*\n\n✨ Agora o bot vai te chamar de:\n\n👑 『 ${novo} 』\n\n💎 Aproveite seu privilégio VIP!`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
