// Gerado de index.js (case 'vipprotecao', linha 13141)
export default {
  nomes: ["vipprotecao"],
  async executar(__x) {
    const { eVIP, __NUM_DONO, shizukiUser, salvarShizuki, formatarReais, sender, isDono, sock, from, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!eVIP(sender) && !isDono) {
              await sock.sendMessage(from, {
                text: '╭━━━〔 🚫 𝐒𝐎́ 𝐕𝐈𝐏 🚫 〕━━━╮\n┃\n┃ 😢 Você não é VIP!\n┃\n┃ 💎 A proteção VIP é um\n┃    benefício exclusivo.\n┃\n┃ 💌 Fale com o *' + __NUM_DONO + '*\n┃    pra adquirir o seu!\n┃\n╰━━━━━━━━━━━━━━━━━━╯'
              }, { quoted: msg });
              return
            }

            const sub = (args[0] || '').toLowerCase();
            const u = shizukiUser(sender);
            const agora = Date.now();

            if (sub === 'status') {
              const protecaoAtiva = u.vipprotecao && u.vipprotecao.expira > agora;
              if (protecaoAtiva) {
                const resta = u.vipprotecao.expira - agora;
                const h = Math.floor(resta / 3600000);
                const m = Math.floor((resta % 3600000) / 60000);
                const expDate = new Date(u.vipprotecao.expira).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
                await sock.sendMessage(from, {
                  text: '╭━━━〔 🛡️ 𝐒𝐓𝐀𝐓𝐔𝐒 𝐕𝐈𝐏 🛡️ 〕━━━╮\n┃\n┃ 👤 @' + sender.split('@')[0] + '\n┃\n┃ 🛡️ Proteção: *ATIVA*\n┃ ⏰ Expira em: *' + h + 'h ' + m + 'min*\n┃ 📅 Expira em: *' + expDate + '*\n┃\n┃ 💎 Você tá protegido(a)!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                  mentions: [sender]
                }, { quoted: msg });
              } else {
                await sock.sendMessage(from, {
                  text: '╭━━━〔 🛡️ 𝐒𝐓𝐀𝐓𝐔𝐒 𝐕𝐈𝐏 🛡️ 〕━━━╮\n┃\n┃ 👤 @' + sender.split('@')[0] + '\n┃\n┃ 🛡️ Proteção: *INATIVA*\n┃\n┃ 💡 Use *!vipprotecao* pra ativar!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                  mentions: [sender]
                }, { quoted: msg });
              }
              return
            }

            const protecaoAtiva = u.vipprotecao && u.vipprotecao.expira > agora;
            let texto = '';
            if (!protecaoAtiva) {
              u.vipprotecao = { expira: agora + 24 * 3600000, ativadaEm: agora };
              salvarShizuki(sender, u);
              texto = '╭━━━〔 🛡️ 𝐏𝐑𝐎𝐓𝐄𝐂̧𝐀̃𝐎 𝐕𝐈𝐏 🛡️ 〕━━━╮\n┃\n┃ ✨ Proteção ativada com sucesso!\n┃\n┃ 🛡️ Status: *ATIVADA*\n┃ ⏰ Expira em: *24 horas*\n┃ 💰 Custo: *GRÁTIS* (1ª ativação)\n┃\n┃ 💎 Protegido contra:\n┃    ┣ ❌ !roubar\n┃    ┣ ❌ !assaltar\n┃    ┗ ❌ !sequestrar\n┃\n┃ 👑 Aproveite, chefe!\n┃\n╰━━━━━━━━━━━━━━━━━━╯';
            } else {
              if (u.reais < 30) {
                await sock.sendMessage(from, {
                  text: '╭━━━〔 💸 𝐒𝐄𝐌 𝐒𝐀𝐋𝐃𝐎 💸 〕━━━╮\n┃\n┃ 😢 Você não tem R$ 30,00\n┃    pra renovar!\n┃\n┃ 💰 Seu saldo: *' + formatarReais(u.reais) + '*\n┃ 💵 Precisa: *R$ 30,00*\n┃\n┃ 💡 Trabalha mais, chefe!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                  mentions: [sender]
                }, { quoted: msg });
                return
              }
              u.reais -= 30;
              u.vipprotecao = { expira: agora + 24 * 3600000, ativadaEm: agora };
              salvarShizuki(sender, u);
              texto = '╭━━━〔 🛡️ 𝐑𝐄𝐍𝐎𝐕𝐀𝐂̧𝐀̃𝐎 𝐕𝐈𝐏 🛡️ 〕━━━╮\n┃\n┃ 🔄 Proteção renovada!\n┃\n┃ 🛡️ Status: *ATIVADA*\n┃ ⏰ Expira em: *24 horas*\n┃ 💰 Custo: *R$ 30,00*\n┃ 💵 Saldo: *' + formatarReais(u.reais) + '*\n┃\n┃ 💎 Protegido contra:\n┃    ┣ ❌ !roubar\n┃    ┣ ❌ !assaltar\n┃    ┗ ❌ !sequestrar\n┃\n┃ 👑 Boa, chefe!\n┃\n╰━━━━━━━━━━━━━━━━━━╯';
            }
            await sock.sendMessage(from, { text: texto, mentions: [sender] }, { quoted: msg });
          }
          return
    }
  }
};
