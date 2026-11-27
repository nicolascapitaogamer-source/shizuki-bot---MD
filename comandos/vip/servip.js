// Gerado de index.js (case 'servip', linha 13196)
export default {
  nomes: ["servip"],
  async executar(__x) {
    const { vipDB, salvarVipDB, isDono, sock, from, msg, sender } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) {
              await sock.sendMessage(from, {
                text: '╭━━━〔 🚫 𝐀𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐃𝐎 🚫 〕━━━╮\n┃\n┃ 😠 Pera aí! Você não é o meu dono,\n┃    não pode fazer esse comando!\n┃\n┃ 👑 Apenas o *nick dev* pode\n┃    usar isso aqui.\n┃\n╰━━━━━━━━━━━━━━━━━━╯'
              }, { quoted: msg });
              return
            }

            const dbVip = vipDB();
            dbVip.vips = dbVip.vips || {};
            dbVip.vips[sender] = {
              desde: dbVip.vips[sender]?.desde || Date.now(),
              expira: null,
              infinito: true
            };
            salvarVipDB(dbVip);

            await sock.sendMessage(from, {
              text: '╭━━━〔 👑 𝐕𝐈𝐏 𝐈𝐍𝐅𝐈𝐍𝐈𝐓𝐎 👑 〕━━━╮\n' +
                    '┃\n' +
                    '┃ ✨ A realeza foi servida!\n' +
                    '┃\n' +
                    '┃ 👤 Membro: @' + sender.split('@')[0] + '\n' +
                    '┃ 💎 Status: *VIP INFINITO*\n' +
                    '┃ ⏰ Expira em: *NUNCA*\n' +
                    '┃\n' +
                    '┃ 💜 Bem-vindo(a) à realeza!\n' +
                    '┃\n' +
                    '╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
