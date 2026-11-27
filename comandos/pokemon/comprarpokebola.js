// Gerado de index.js (case 'comprarpokebola', linha 6443)
export default {
  nomes: ["comprarpokebola"],
  async executar(__x) {
    const { pokeUser, acharPokebola, __isCriadorInfinito, salvarPokeUser, sender, args, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = pokeUser(sender);
            const id = (args[0] || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const qtd = parseInt(args[1] || '1', 10);
            const bola = acharPokebola(id);

            if (!bola) {
              await sock.sendMessage(from, { text: '⚠️ Pokébola inválida! Use *!lojapokebola* pra ver a lista.\n\nIDs: `pokebola`, `great`, `ultra`, `master`' }, { quoted: msg });
              return
            }
            if (!qtd || qtd < 1 || qtd > 99) {
              await sock.sendMessage(from, { text: '⚠️ Quantidade inválida! Use entre 1 e 99.' }, { quoted: msg });
              return
            }
            const total = bola.preco * qtd;
            if (!__isCriadorInfinito(sender) && u.pokecoins < total) {
              await sock.sendMessage(from, { text: `💸 Saldo insuficiente!\n\n💵 Você tem *${u.pokecoins}* Pokécoins e precisa de *${total}*.` }, { quoted: msg });
              return
            }
            if (!__isCriadorInfinito(sender)) u.pokecoins -= total;
            u.pokebolas[id] = (u.pokebolas[id] || 0) + qtd;
            salvarPokeUser(sender, u);

            await sock.sendMessage(from, {
              text: `✅ *COMPRA REALIZADA!*\n\n🛒 Você comprou *${qtd}x ${bola.nome}*\n💵 Gasto: *-${total}* Pokécoins\n💰 Saldo: *${u.pokecoins}* Pokécoins`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
