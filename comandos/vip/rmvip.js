export default {
  nomes: ['rmvip'],
  async executar({ sock, from, msg, isDono, utils }) {
    if (!isDono) {
      await sock.sendMessage(from, { text: '🚫 Apenas o dono pode remover VIP!' }, { quoted: msg });
      return;
    }
    const ctx = msg.message.extendedTextMessage?.contextInfo;
    const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;
    if (!alvo) {
      await sock.sendMessage(from, { text: '⚠️ Marque a pessoa!\n\nEx: `!rmvip @pessoa`' }, { quoted: msg });
      return;
    }
    const db = utils.vipDB();
    if (!db.vips || !db.vips[alvo]) {
      await sock.sendMessage(from, { text: '❌ Essa pessoa não é VIP.' }, { quoted: msg });
      return;
    }
    delete db.vips[alvo];
    utils.salvarVipDB(db);
    await sock.sendMessage(from, {
      text: `❌ *VIP REMOVIDO!*\n\n👤 @${alvo.split('@')[0]} não é mais VIP.\n\n💔 Sentiremos sua falta...`,
      mentions: [alvo]
    }, { quoted: msg });
  }
};
