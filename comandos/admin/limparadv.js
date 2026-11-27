// Gerado de index.js (case 'limparadv', linha 14373)
export default {
  nomes: ["limparadv"],
  async executar(__x) {
    const { getAdminFlag, carregarJSON, FILE_ADVS, salvarJSON, isGroup, sock, from, msg, sender, isDono } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gmL = await globalThis.__getGroupMetadata(from);
            const ehAdmL = !!getAdminFlag(gmL.participants, sender);
            if (!ehAdmL && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }
            const ctxL = msg.message.extendedTextMessage?.contextInfo;
            const alvoL = ctxL?.mentionedJid?.[0] || ctxL?.participant;
            if (!alvoL) { await sock.sendMessage(from, { text: '⚠️ Marque a pessoa!\n\nEx: *!limparadv @pessoa*' }, { quoted: msg }); return }

            let advsL = carregarJSON(FILE_ADVS);
            if (!advsL[from] || !advsL[from][alvoL] || advsL[from][alvoL] <= 0) {
              await sock.sendMessage(from, { text: 'ℹ️ Essa pessoa não tem advertências!' }, { quoted: msg });
              return
            }

            const antesL = advsL[from][alvoL];
            delete advsL[from][alvoL];
            if (advsL[from + '_motivos'] && advsL[from + '_motivos'][alvoL]) {
              delete advsL[from + '_motivos'][alvoL];
            }
            salvarJSON(FILE_ADVS, advsL);

            await sock.sendMessage(from, {
              text: '╭━━━〔 🧹 𝐀𝐃𝐕𝐄𝐑𝐓𝐄̂𝐍𝐂𝐈𝐀𝐒 𝐋𝐈𝐌𝐏𝐀𝐒 🧹 〕━━━╮\n' +
                    '┃\n' +
                    '┃ 👤 𝐌𝐞𝐦𝐛𝐫𝐨: @' + alvoL.split('@')[0] + '\n' +
                    '┃ 📊 𝐀𝐧𝐭𝐞𝐬: ' + antesL + '/3\n' +
                    '┃ 📊 𝐀𝐠𝐨𝐫𝐚: 0/3\n' +
                    '┃ 👮 𝐋𝐢𝐦𝐩𝐚𝐝𝐚𝐬 𝐩𝐨𝐫: @' + sender.split('@')[0] + '\n' +
                    '┃\n' +
                    '┃ 💜 Histórico zerado!\n' +
                    '┃\n' +
                    '╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [alvoL, sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
