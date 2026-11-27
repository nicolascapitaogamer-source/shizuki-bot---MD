// Gerado de index.js (case 'comprarcosmetico', linha 6474)
export default {
  nomes: ["comprarcosmetico"],
  async executar(__x) {
    const { pokeUser, acharCosmetico, __isCriadorInfinito, salvarPokeUser, sender, args, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = pokeUser(sender);
            const id = (args[0] || '').toLowerCase();
            const qtd = parseInt(args[1] || '1', 10);
            const item = acharCosmetico(id);

            if (!item) {
              await sock.sendMessage(from, { text: '⚠️ Item inválido! Use *!lojapokemon* pra ver a lista.\n\nIDs: `berry`, `pokefood`, `pocao`, `pocaomax`' }, { quoted: msg });
              return
            }
            if (!qtd || qtd < 1 || qtd > 99) {
              await sock.sendMessage(from, { text: '⚠️ Quantidade inválida! Use entre 1 e 99.' }, { quoted: msg });
              return
            }
            const total = item.preco * qtd;
            if (!__isCriadorInfinito(sender) && u.pokecoins < total) {
              await sock.sendMessage(from, { text: `💸 Saldo insuficiente!\n\n💵 Você tem *${u.pokecoins}* Pokécoins e precisa de *${total}*.` }, { quoted: msg });
              return
            }
            if (!__isCriadorInfinito(sender)) u.pokecoins -= total;
            u.cosmeticos[id] = (u.cosmeticos[id] || 0) + qtd;
            salvarPokeUser(sender, u);

            await sock.sendMessage(from, {
              text: `✅ *COMPRA REALIZADA!*\n\n🛒 Você comprou *${qtd}x ${item.nome}*\n💵 Gasto: *-${total}* Pokécoins\n💰 Saldo: *${u.pokecoins}* Pokécoins`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
