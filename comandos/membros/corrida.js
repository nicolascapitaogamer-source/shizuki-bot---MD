// Gerado de index.js (case 'corrida', linha 10261)
export default {
  nomes: ["corrida"],
  async executar(__x) {
    const { shizukiUser, formatarReais, desgastarVeiculo, salvarShizuki, sender, args, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);
            const cavalo = parseInt(args[0] || '0', 10);
            const valor = parseInt(args[1] || '0', 10);
            if (!cavalo || cavalo < 1 || cavalo > 5) { await sock.sendMessage(from, { text: '⚠️ Use: `!corrida <1-5> <valor>`\n\nEx: `!corrida 3 100`' }, { quoted: msg }); return }
            if (!valor || valor < 10) { await sock.sendMessage(from, { text: '⚠️ Valor mínimo: *R$ 10*' }, { quoted: msg }); return }
            if (valor > u.reais) { await sock.sendMessage(from, { text: `💸 Saldo insuficiente!\n\n💰 Você tem: *${formatarReais(u.reais)}*` }, { quoted: msg }); return }
            const vencedor = Math.floor(Math.random() * 5) + 1;
            // ═══ Desgasta o veículo (5%) ═══
            const veicCorrida = desgastarVeiculo(u, sender, 5);
            if (vencedor === cavalo) {
              u.reais += valor * 2;
              salvarShizuki(sender, u);
              await sock.sendMessage(from, {
                text: `╭━━━〔 🏇 𝐂𝐎𝐑𝐑𝐈𝐃𝐀! 〕━━━╮\n┃\n┃ 💜 Você apostou *${formatarReais(valor)}* no *cavalo ${cavalo}*!\n┃\n┃ 🏁 Vencedor: *cavalo ${vencedor}* 🏆\n┃ 💰 Ganhou: *${formatarReais(valor * 3)}*\n┃\n` +
                (veicCorrida ? `┃ ${veicCorrida.emoji} ${veicCorrida.nome}: ${veicCorrida.vida}%\n┃\n` : '') +
                `┃ 🕊️ Que sorte!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                mentions: [sender]
              }, { quoted: msg });
            } else {
              u.reais -= valor;
              salvarShizuki(sender, u);
              await sock.sendMessage(from, {
                text: `╭━━━〔 🏇 𝐂𝐎𝐑𝐑𝐈𝐃𝐀 〕━━━╮\n┃\n┃ 💜 Você apostou *${formatarReais(valor)}* no *cavalo ${cavalo}*!\n┃\n┃ 🏁 Vencedor: *cavalo ${vencedor}*\n┃ 💔 Você perdeu...\n┃\n` +
                (veicCorrida ? `┃ ${veicCorrida.emoji} ${veicCorrida.nome}: ${veicCorrida.vida}%\n┃\n` : '') +
                `┃\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                mentions: [sender]
              }, { quoted: msg });
            }
          }
          return
    }
  }
};
