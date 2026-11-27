// Gerado de index.js (case 'trocarpokebola', linha 7491)
export default {
  nomes: ["trocarpokebola"],
  async executar(__x) {
    const { pokeUser, acharPokebola, salvarPokeUser, args, sender, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const id = (args[0] || '').toLowerCase();
            const u = pokeUser(sender);
            const bola = acharPokebola(id);
            if (!bola) {
              await sock.sendMessage(from, { text: '⚠️ Pokébola inválida! Use: `!trocarpokebola <id>`\n\nIDs: `pokebola`, `great`, `ultra`, `master`' }, { quoted: msg });
              return
            }
            if ((u.pokebolas[id] || 0) <= 0) {
              await sock.sendMessage(from, { text: `❌ Você não tem *${bola.nome}*!` }, { quoted: msg });
              return
            }
            u.pokebolaPadrao = id;
            salvarPokeUser(sender, u);
            await sock.sendMessage(from, {
              text: `✅ *Pokébola padrão definida!*\n\n🎯 Agora você usa *${bola.nome}* nas capturas.`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
