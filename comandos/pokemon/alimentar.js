// Gerado de index.js (case 'alimentar', linha 6505)
export default {
  nomes: ["alimentar"],
  async executar(__x) {
    const { pokeUser, acharCosmetico, ajustarFelicidade, salvarPokeUser, sender, args, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = pokeUser(sender);
            const nomePoke = (args.join(' ') || '').trim().toLowerCase();

            if (!nomePoke) {
              await sock.sendMessage(from, { text: '⚠️ Diga qual pokémon quer alimentar!\n\nEx: `!alimentar Pikachu`' }, { quoted: msg });
              return
            }
            const poke = u.time.find(p => p.nome.toLowerCase() === nomePoke);
            if (!poke) {
              await sock.sendMessage(from, { text: `❌ Você não tem *${nomePoke}* no seu time!\n\nUse *!pokemon* pra ver seu time.` }, { quoted: msg });
              return
            }
            // Acha a melhor comida disponível
            let usado = null;
            for (const id of ['pocaomax', 'pocao', 'pokefood', 'berry']) {
              if ((u.cosmeticos[id] || 0) > 0) { usado = id; break; }
            }
            if (!usado) {
              await sock.sendMessage(from, { text: '🍽️ Você não tem nenhuma comida!\n\nCompre em *!lojapokemon*.' }, { quoted: msg });
              return
            }
            const item = acharCosmetico(usado);
            u.cosmeticos[usado] -= 1;
            ajustarFelicidade(poke, item.felicidade);
            if (item.hp > 0) poke.hp = Math.min(poke.hpMax, poke.hp + item.hp);
            poke.ultimaRefeicao = Date.now();
            salvarPokeUser(sender, u);

            await sock.sendMessage(from, {
              text: `🍽️ *${poke.nome}* comeu *${item.nome}*!\n\n` +
                    `😊 Felicidade: *+${item.felicidade}* ➜ ${poke.felicidade}/100\n` +
                    (item.hp > 0 ? `❤️ HP: *+${item.hp}* ➜ ${poke.hp}/${poke.hpMax}\n` : '') +
                    `\n💜 Que carinho!`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
