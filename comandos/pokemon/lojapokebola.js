// Gerado de index.js (case 'lojapokebola', linha 6393)
export default {
  nomes: ["lojapokebola"],
  async executar(__x) {
    const { pokeUser, __isCriadorInfinito, POKE_DATA, sender, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = pokeUser(sender);
            let texto =
              `╭━━━━〔 🔴 𝐋𝐎𝐉𝐀 𝐃𝐄 𝐏𝐎𝐊𝐄́𝐁𝐎𝐋𝐀𝐒 🔴 〕━━━━╮\n` +
              `┃\n` +
              `┃ 💰 *Seu saldo:* ${__isCriadorInfinito(sender) ? '∞' : u.pokecoins} Pokécoins\n` +
              `┃\n` +
              `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
              `╭━━━〔 🛒 𝐏𝐑𝐎𝐃𝐔𝐓𝐎𝐒 〕━━━╮\n┃\n`;
            POKE_DATA.pokebolas.forEach(b => {
              texto += `┃ ${b.id === 'pokebola' ? '🔴' : b.id === 'great' ? '🔵' : b.id === 'ultra' ? '🟡' : '🟣'} *${b.nome}*\n`;
              texto += `┃    💵 Preço: *${b.preco}* Pokécoins\n`;
              texto += `┃    🎯 Bônus de captura: *+${b.bonus}%*\n┃\n`;
            });
            texto +=
              `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
              `💡 Para comprar: *!comprarpokebola <id> <qtd>*\n` +
              `Ex: *!comprarpokebola great 3*`;
            await sock.sendMessage(from, { text: texto, mentions: [sender] }, { quoted: msg });
          }
          return
    }
  }
};
