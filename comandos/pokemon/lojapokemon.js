// Gerado de index.js (case 'lojapokemon', linha 6416)
export default {
  nomes: ["lojapokemon"],
  async executar(__x) {
    const { pokeUser, __isCriadorInfinito, POKE_DATA, sender, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = pokeUser(sender);
            let texto =
              `╭━━━━〔 🛒 𝐋𝐎𝐉𝐀 𝐏𝐎𝐊𝐄́𝐌𝐎𝐍 🛒 〕━━━━╮\n` +
              `┃\n` +
              `┃ 💰 *Seu saldo:* ${__isCriadorInfinito(sender) ? '∞' : u.pokecoins} Pokécoins\n` +
              `┃\n` +
              `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
              `╭━━━〔 🍖 𝐂𝐎𝐌𝐈𝐃𝐀𝐒 𝐄 𝐏𝐎𝐂̧𝐎̃𝐄𝐒 〕━━━╮\n┃\n`;
            POKE_DATA.cosmeticos.forEach(c => {
              texto += `┃ 🎁 *${c.nome}*\n`;
              texto += `┃    💵 Preço: *${c.preco}* Pokécoins\n`;
              if (c.felicidade > 0) texto += `┃    😊 Felicidade: *+${c.felicidade}*\n`;
              if (c.hp > 0) texto += `┃    ❤️ HP: *+${c.hp}*\n`;
              texto += `┃\n`;
            });
            texto +=
              `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
              `💡 Para comprar: *!comprarcosmetico <id> <qtd>*\n` +
              `Ex: *!comprarcosmetico berry 5*\n\n` +
              `💡 Para alimentar: *!alimentar <nome do pokémon>*\n` +
              `Ex: *!alimentar Pikachu*`;
            await sock.sendMessage(from, { text: texto, mentions: [sender] }, { quoted: msg });
          }
          return
    }
  }
};
