// Gerado de index.js (case 'streak', linha 11222)
export default {
  nomes: ["streak","sequencia"],
  async executar(__x) {
    const { carregarJSON, FILE_STREAK, dataBR, msg, sender, sock, from } = Object.assign({}, __x.utils, __x);
    {
{
            const alvo = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
                         msg.message.extendedTextMessage?.contextInfo?.participant ||
                         sender;

            const streaks = carregarJSON(FILE_STREAK);
            const d = streaks[alvo] || { dias: 0, ultimo: null, recorde: 0 };
            const ativo = d.ultimo === dataBR(0) || d.ultimo === dataBR(-1);
            const diasAtuais = ativo ? d.dias : 0;
            const emoji = diasAtuais >= 30 ? '👑' : diasAtuais >= 7 ? '🔥' : diasAtuais >= 1 ? '✨' : '💤';

            const textoStreak =
              `╭───〔 ${emoji} 𝐒𝐓𝐑𝐄𝐀𝐊 〕───╮\n` +
              `│\n` +
              `│  🕶️ 𝐍𝐨𝐦𝐞 ➜ 『 @${alvo.split('@')[0]} 』\n` +
              `│  🔥 𝐒𝐞𝐪𝐮𝐞̂𝐧𝐜𝐢𝐚 ➜ ${diasAtuais} dia(s)\n` +
              `│  🏆 𝐑𝐞𝐜𝐨𝐫𝐝𝐞 ➜ ${d.recorde} dia(s)\n` +
              `│\n` +
              `╰───────────────────╯\n` +
              (diasAtuais === 0 ? `\n💤 Sem sequência ativa. Use o bot hoje para começar!` : `\n✅ Use o bot todo dia para não perder a sequência!`);

            await sock.sendMessage(from, {
              text: textoStreak,
              mentions: [alvo]
            }, { quoted: msg });
          }
          return
    }
  }
};
