export default {
  nomes: ['darvip'],
  async executar({ sock, from, msg, args, isDono, utils }) {
    if (!isDono) {
      await sock.sendMessage(from, { text: '🚫 Apenas o dono pode dar VIP!' }, { quoted: msg });
      return;
    }
    const ctx = msg.message.extendedTextMessage?.contextInfo;
    const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;
    if (!alvo) {
      await sock.sendMessage(from, { text: '⚠️ Marque a pessoa!\n\nEx: `!darvip @pessoa 30`' }, { quoted: msg });
      return;
    }
    const dias = parseInt(args.find(a => /^\d+$/.test(a)) || '30', 10);
    const db = utils.vipDB();
    db.vips = db.vips || {};
    db.vips[alvo] = { desde: Date.now(), expira: Date.now() + dias * 86400000 };
    utils.salvarVipDB(db);
    await sock.sendMessage(from, {
      text: `💎 *VIP CONCEDIDO!* 💎\n\n👤 @${alvo.split('@')[0]}\n⏳ Duração: *${dias} dia(s)*\n📅 Expira: *${new Date(db.vips[alvo].expira).toLocaleDateString('pt-BR')}*`,
      mentions: [alvo]
    }, { quoted: msg });
  }
};
