// Gerado de index.js (case 'capturar', linha 6577)
export default {
  nomes: ["capturar"],
  async executar(__x) {
    const { pokeUser, pokeSpawnDB, escolherPokebola, tentarCapturaMelhorada, acharPokebola, criarPokemonInstancia, salvarPokeUser, salvarPokeSpawn, emojiRaridade, sender, args, from, sock, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = pokeUser(sender);
            const nomePoke = (args.join(' ') || '').trim().toLowerCase();
            const db = pokeSpawnDB();
            const spawn = db[from];

            if (!spawn || !spawn.atual || Date.now() - spawn.criadoEm > 3 * 60 * 1000) {
              await sock.sendMessage(from, { text: '❌ Nenhum pokémon selvagem por aqui agora!' }, { quoted: msg });
              return
            }
            if (!nomePoke) {
              await sock.sendMessage(from, { text: `⚠️ Diga o nome! Ex: \`!capturar ${spawn.atual.nome}\`` }, { quoted: msg });
              return
            }
            if (nomePoke !== spawn.atual.nome.toLowerCase()) {
              await sock.sendMessage(from, { text: `❌ Esse não é o pokémon atual! É um *${spawn.atual.nome}*.` }, { quoted: msg });
              return
            }
            if (u.time.length >= 4) {
              await sock.sendMessage(from, { text: '⚠️ Seu time já tem 4 pokémons! Não dá pra capturar mais.' }, { quoted: msg });
              return
            }
            // Escolhe a melhor bola disponível
            let bolaId = escolherPokebola(sender); // CAPTURA MELHORADA
            if (!bolaId) {
              await sock.sendMessage(from, { text: '🔴 Você não tem nenhuma pokébola!\n\nCompre em *!lojapokebola*.' }, { quoted: msg });
              return
            }
            u.pokebolas[bolaId] -= 1;
            const res = tentarCapturaMelhorada(spawn.atual.raridade, bolaId);
            const bolaNome = acharPokebola(bolaId).nome;

            if (res.ok) {
              const spawnInfo = spawn.atual; // CORRIGIDO
              const poke = criarPokemonInstancia({
                id: spawnInfo.id,
                nome: spawnInfo.nome,
                raridade: spawnInfo.raridade
              });
              u.time.push(poke);
              u.capturas += 1;
              salvarPokeUser(sender, u);

              delete db[from].atual;
              db[from].ultimoSpawn = Date.now();
              salvarPokeSpawn(db);

              await sock.sendMessage(from, {
                text: `╭━━━〔 🎊 𝐂𝐀𝐏𝐓𝐔𝐑𝐀𝐃𝐎! 🎊 〕━━━╮\n┃\n` +
                      `┃ 💜 Parabéns @${sender.split('@')[0]}!\n┃\n` +
                      `┃ ${emojiRaridade(spawnInfo.raridade)} *${spawnInfo.nome}*\n` +
                      `┃ 📊 Raridade: *${spawnInfo.raridade}*\n` +
                      `┃ ⭐ Nível: *1*\n` +
                      `┃ 🔴 Pokébola: *${bolaNome}*\n┃\n` +
                      `┃ 🎯 Capturas totais: *${u.capturas}*\n┃\n` +
                      `╰━━━━━━━━━━━━━━━━━━━━━━━━╯`,
                mentions: [sender]
              }, { quoted: msg });
            } else {
              salvarPokeUser(sender, u);
              const motivo = res.motivo === 'fugiu' ? '🏃 O pokémon *fugiu*!' : `📉 Chance era de *${res.chance}%* e falhou!`;
              await sock.sendMessage(from, {
                text: `${motivo}\n\n🔴 Você perdeu 1x *${bolaNome}*.\n💡 Tente de novo com uma pokébola melhor!`,
                mentions: [sender]
              }, { quoted: msg });
            }
          }
          return
    }
  }
};
