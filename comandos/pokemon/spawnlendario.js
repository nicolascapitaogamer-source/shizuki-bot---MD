// Gerado de index.js (case 'spawnlendario', linha 15072)
export default {
  nomes: ["spawnlendario"],
  async executar(__x) {
    const { pokeSpawnDB, sortearPokemon, salvarPokeSpawn, emojiRaridade, spritePokemon, isDono, sock, from, msg, isGroup } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono pode usar este comando!' }, { quoted: msg });
              return
            }
            if (!isGroup) {
              await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
              return
            }

            const dbSpawn = pokeSpawnDB();
            if (!dbSpawn[from] || !dbSpawn[from].ativo) {
              await sock.sendMessage(from, { text: '⚠️ O spawn automático não está ativado neste grupo!\nUse: !ativarspawn' }, { quoted: msg });
              return
            }

            // Sorteia apenas Lendário ou Mítico
            const raridades = ['lendario', 'mitico'];
            const raridadeSorteada = raridades[Math.floor(Math.random() * raridades.length)];
            const poke = sortearPokemon(raridadeSorteada);

            dbSpawn[from].atual = { id: poke.id, nome: poke.nome, raridade: poke.raridade };
            dbSpawn[from].criadoEm = Date.now();
            dbSpawn[from].ultimoSpawn = Date.now();
            salvarPokeSpawn(dbSpawn);

            const rarEmoji = emojiRaridade(poke.raridade);
            const url = spritePokemon(poke.id);
            const texto =
              `╭━━━〔 👑 рқҗ’рқҗҸрқҗҖрқҗ–рқҗҚ рқҗӢрқҗ„рқҗҶрқҗ„рқҗҚрқҗғрқҗҖМҒрқҗ‘рқҗҲрқҗҺ 〕━━━╮\n┃\n` +
              `┃ 🌟 O DONO INVOCU UM POKÉMON!\n┃\n` +
              `┃ ${rarEmoji} *${poke.nome}*\n` +
              `┃ 📊 Raridade: *${poke.raridade.toUpperCase()}*\n┃\n` +
              `┃ ⏳ Vocês têm *3 minutos* pra capturar!\n` +
              `┃ ⚡ Use: *!capturar ${poke.nome}*\n┃\n` +
              `┃ 💎 Quem for mais rápido, leva!\n` +
              `┃\n┃ 💡 Use: *!balada normal* ou *!balada vip*\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯`;

            try {
              await sock.sendMessage(from, { image: { url }, caption: texto });
            } catch (e) {
              await sock.sendMessage(from, { text: texto });
            }
          }
          return
    }
  }
};
