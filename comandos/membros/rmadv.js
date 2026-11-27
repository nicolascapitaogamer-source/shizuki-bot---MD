// Gerado de index.js (case 'rmadv', linha 12971)
export default {
  nomes: ["rmadv","unadv","remadv"],
  async executar(__x) {
    const { getAdminFlag, carregarJSON, FILE_ADVS, salvarJSON, isGroup, sock, from, msg, sender } = Object.assign({}, __x.utils, __x);
    {
if (!isGroup) {
            await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
            return
          }

          try {
            const groupMetadata = await globalThis.__getGroupMetadata(from);
            const participants = groupMetadata.participants;

            const senderAdmin = getAdminFlag(participants, sender);

            if (!senderAdmin) {
              await sock.sendMessage(from, { text: '🚫 Apenas administradores do grupo podem remover advertências!' }, { quoted: msg });
              return
            }

            const ctxRm = msg.message.extendedTextMessage?.contextInfo;
            const targetUser = ctxRm?.mentionedJid?.[0] || ctxRm?.participant;

            if (!targetUser) {
              await sock.sendMessage(from, { text: '⚠️ Marque a pessoa com @ ou responda à mensagem para remover a advertência.' }, { quoted: msg });
              return
            }

            let advs = carregarJSON(FILE_ADVS);
            if (!advs[from] || !advs[from][targetUser] || advs[from][targetUser] <= 0) {
              await sock.sendMessage(from, { text: 'ℹ️ Essa pessoa não tem advertências!' }, { quoted: msg });
              return
            }

            const antesRm = advs[from][targetUser];
            advs[from][targetUser] -= 1;
            const depoisRm = advs[from][targetUser];

            if (depoisRm <= 0) {
              delete advs[from][targetUser];
            }

            if (advs[from + '_motivos'] && advs[from + '_motivos'][targetUser] && advs[from + '_motivos'][targetUser].length > 0) {
              advs[from + '_motivos'][targetUser].pop();
            }

            salvarJSON(FILE_ADVS, advs);

            await sock.sendMessage(from, {
              text: '╭━━━〔 ✅ 𝐀𝐃𝐕𝐄𝐑𝐓𝐄̂𝐍𝐂𝐈𝐀 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐀 ✅ 〕━━━╮\n' +
                    '┃\n' +
                    '┃ 👤 𝐌𝐞𝐦𝐛𝐫𝐨: @' + targetUser.split('@')[0] + '\n' +
                    '┃ 📊 𝐀𝐧𝐭𝐞𝐬: ' + antesRm + '/3\n' +
                    '┃ 📊 𝐀𝐠𝐨𝐫𝐚: ' + depoisRm + '/3\n' +
                    '┃ 👮 𝐑𝐞𝐦𝐨𝐯𝐢𝐝𝐚 𝐩𝐨𝐫: @' + sender.split('@')[0] + '\n' +
                    '┃\n' +
                    (depoisRm > 0 ? '┃ 💜 Mais uma chance!\n' : '┃ 💜 Histórico zerado!\n') +
                    '┃\n' +
                    '╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [targetUser, sender]
            });

          } catch (err) {
            console.error('Erro no comando !rmadv:', err);
            await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao remover a advertência.' }, { quoted: msg });
          }
          return
    }
  }
};
