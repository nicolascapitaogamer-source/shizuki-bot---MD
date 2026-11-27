// Gerado de index.js (case 'darmandato', linha 13712)
export default {
  nomes: ["darmandato"],
  async executar(__x) {
    const { carregarPresidente, salvarPresidente, isDono, sock, from, msg, pushName, sender } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono!' }, { quoted: msg }); return }
            const ctxDM = msg.message.extendedTextMessage?.contextInfo;
            const alvoDM = ctxDM?.mentionedJid?.[0] || ctxDM?.participant;
            if (!alvoDM) { await sock.sendMessage(from, { text: '⚠️ Marque a pessoa!\n\nEx: !darmandato @pessoa' }, { quoted: msg }); return }
            const dbDM = carregarPresidente();
            dbDM.grupos = dbDM.grupos || {};
            dbDM.grupos[from] = { jid: alvoDM, nome: pushName, votos: 0, eleitoEm: Date.now(), expiraEm: Date.now() + 7 * 24 * 3600000, dadoPor: sender };
            dbDM.historico = dbDM.historico || [];
            dbDM.historico.push(dbDM.atual);
            salvarPresidente(dbDM);
            await sock.sendMessage(from, {
              text: '╭━━━〔 🎁 𝐌𝐀𝐍𝐃𝐀𝐓𝐎 𝐂𝐎𝐍𝐂𝐄𝐃𝐈𝐃𝐎 🎁 〕━━━╮\n┃\n┃ 👤 Novo Presidente: @' + alvoDM.split('@')[0] + '\n┃ 📅 Mandato: 7 dias\n┃ 👑 Por: dono\n┃\n┃ 💜 Boa sorte, presidente!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [alvoDM]
            }, { quoted: msg });
          }
          return
    }
  }
};
