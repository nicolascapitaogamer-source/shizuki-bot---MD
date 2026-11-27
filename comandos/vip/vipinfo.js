// Gerado de index.js (case 'vipinfo', linha 7665)
export default {
  nomes: ["vipinfo"],
  async executar(__x) {
    const { nomeExibicao, eVIP, vipDB, diasRestantesVip, apelidoDe, sender, pushName, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const nomeU = nomeExibicao(sender, pushName);
            const isV = eVIP(sender);
            if (!isV) {
              await sock.sendMessage(from, {
                text: `💎 *STATUS VIP*\n\n👤 ${nomeU}\n❌ *Não é VIP*\n\n💡 Fale com o dono pra adquirir!`
              }, { quoted: msg });
              return
            }
            const db = vipDB();
            const info = db.vips[sender];
            const dias = diasRestantesVip(sender);
            const ap = apelidoDe(sender);
            await sock.sendMessage(from, {
              text: `╭━━━〔 💎 𝐒𝐓𝐀𝐓𝐔𝐒 𝐕𝐈𝐏 💎 〕━━━╮\n┃\n` +
                    `┃ 👤 Nome: *${nomeU}*\n` +
                    `┃ 💎 Status: *VIP ATIVO* ✅\n` +
                    `┃ ⏳ Expira em: *${dias} dia(s)*\n` +
                    `┃ 📅 Data: *${new Date(info.expira).toLocaleDateString('pt-BR')}*\n` +
                    (ap ? `┃ 🏷️ Apelido: *${ap}*\n` : '') +
                    `┃\n╰━━━━━━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
