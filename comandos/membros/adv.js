// Gerado de index.js (case 'adv', linha 12872)
export default {
  nomes: ["adv","advertir"],
  async executar(__x) {
    const { getAdminFlag, carregarJSON, FILE_ADVS, salvarJSON, isGroup, sock, from, msg, sender, args } = Object.assign({}, __x.utils, __x);
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
              await sock.sendMessage(from, { text: '🚫 Apenas administradores do grupo podem aplicar advertências!' }, { quoted: msg });
              return
            }

            const ctxAdv = msg.message.extendedTextMessage?.contextInfo;
            const targetUser = ctxAdv?.mentionedJid?.[0] || ctxAdv?.participant;

            if (!targetUser) {
              await sock.sendMessage(from, { text: '⚠️ Marque a pessoa com @ ou responda à mensagem para aplicar a advertência.' }, { quoted: msg });
              return
            }

            const targetAdmin = getAdminFlag(participants, targetUser);
            if (targetAdmin) {
              await sock.sendMessage(from, { text: '🛡️ Administradores do grupo não podem receber advertências!' }, { quoted: msg });
              return
            }

            // Pega o motivo (tudo que vem depois do @ ou da resposta)
            let motivo = args.join(' ').trim();
            if (ctxAdv?.mentionedJid && ctxAdv.mentionedJid[0]) {
              motivo = motivo.replace(new RegExp('@' + ctxAdv.mentionedJid[0].split('@')[0], 'g'), '').trim();
            }
            if (!motivo) motivo = 'Não informado';

            let advs = carregarJSON(FILE_ADVS);
            if (!advs[from]) advs[from] = {};
            if (!advs[from][targetUser]) advs[from][targetUser] = 0;
            if (!advs[from + '_motivos']) advs[from + '_motivos'] = {};
            if (!advs[from + '_motivos'][targetUser]) advs[from + '_motivos'][targetUser] = [];

            advs[from][targetUser] += 1;
            const totalAdvs = advs[from][targetUser];

            // Salva o motivo no histórico
            advs[from + '_motivos'][targetUser].push({
              motivo: motivo,
              por: sender,
              data: Date.now()
            });
            salvarJSON(FILE_ADVS, advs);

            if (totalAdvs >= 3) {
              delete advs[from][targetUser];
              salvarJSON(FILE_ADVS, advs);

              await sock.sendMessage(from, {
                text: '╭━━━〔 🚨 𝐋𝐈𝐌𝐈𝐓𝐄 𝐀𝐓𝐈𝐍𝐆𝐈𝐃𝐎 🚨 〕━━━╮\n' +
                      '┃\n' +
                      '┃ 👤 𝐌𝐞𝐦𝐛𝐫𝐨: @' + targetUser.split('@')[0] + '\n' +
                      '┃ 📝 𝐌𝐨𝐭𝐢𝐯𝐨: ' + motivo + '\n' +
                      '┃ 📊 𝐂𝐨𝐧𝐭𝐚𝐠𝐞𝐦: 3/3\n' +
                      '┃ 👮 𝐀𝐩𝐥𝐢𝐜𝐚𝐝𝐚 𝐩𝐨𝐫: @' + sender.split('@')[0] + '\n' +
                      '┃\n' +
                      '┃ 🛑 O membro foi removido!\n' +
                      '┃\n' +
                      '╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [targetUser, sender]
              });

              await sock.groupParticipantsUpdate(from, [targetUser], 'remove');
            } else {
              const faltam = 3 - totalAdvs;
              await sock.sendMessage(from, {
                text: '╭━━━〔 ⚠️ 𝐀𝐃𝐕𝐄𝐑𝐓𝐄̂𝐍𝐂𝐈𝐀 ⚠️ 〕━━━╮\n' +
                      '┃\n' +
                      '┃ 👤 𝐌𝐞𝐦𝐛𝐫𝐨: @' + targetUser.split('@')[0] + '\n' +
                      '┃ 📝 𝐌𝐨𝐭𝐢𝐯𝐨: ' + motivo + '\n' +
                      '┃ 📊 𝐂𝐨𝐧𝐭𝐚𝐠𝐞𝐦: ' + totalAdvs + '/3\n' +
                      '┃ 👮 𝐀𝐩𝐥𝐢𝐜𝐚𝐝𝐚 𝐩𝐨𝐫: @' + sender.split('@')[0] + '\n' +
                      '┃\n' +
                      '┃ ⚠️ Mais ' + faltam + ' e você será removido!\n' +
                      '┃\n' +
                      '╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [targetUser, sender]
              });
            }

          } catch (err) {
            console.error('Erro no comando !adv:', err);
            await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao aplicar a advertência. Verifique se o bot é administrador do grupo!' }, { quoted: msg });
          }
          return
    }
  }
};
