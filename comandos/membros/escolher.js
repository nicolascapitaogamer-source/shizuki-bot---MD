// Gerado de index.js (case 'escolher', linha 15120)
export default {
  nomes: ["escolher"],
  async executar(__x) {
    const { pokeBatalhaDB, chaveBatalha, pokeUser, salvarPokeBatalha, emojiRaridade, isGroup, from, sock, msg, args, sender } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) return
            const db = pokeBatalhaDB();
            const bt = db[chaveBatalha(from)];
            if (!bt) { await sock.sendMessage(from, { text: '❌ Nenhuma batalha aguardando escolha!' }, { quoted: msg }); return }

            const nomePoke = args.join(' ').trim().toLowerCase();
            if (!nomePoke) { await sock.sendMessage(from, { text: '⚠️ Diga o nome do pokémon! Ex: !escolher pikachu' }, { quoted: msg }); return }

            const u1 = pokeUser(bt.j1);
            const u2 = pokeUser(bt.j2);

            if (bt.fase === 'escolha1' && sender === bt.j1) {
              const poke = u1.time.find(p => p.nome.toLowerCase() === nomePoke);
              if (!poke) { await sock.sendMessage(from, { text: '❌ Você não tem esse pokémon!' }, { quoted: msg }); return }
              bt.p1 = { ...poke };
              bt.fase = 'escolha2';
              salvarPokeBatalha(db);

              let lista2 = '';
              u2.time.forEach((p, i) => { lista2 += `┃ ${i + 1}. ${emojiRaridade(p.raridade)} ${p.nome} (Nv.${p.nivel})\n`; });

              await sock.sendMessage(from, {
                text: `╭━━━〔 ⚔️ 𝐁𝐀𝐓𝐀𝐋𝐇𝐀 〕━━━╮\n┃\n` +
                      `┃ ✅ @${bt.j1.split('@')[0]} escolheu *${poke.nome}*!\n┃\n` +
                      `┃ 🎒 *@${bt.j2.split('@')[0]}, escolha seu pokémon:*\n` +
                      `┃\n${lista2}┃\n` +
                      `┃ 💡 Use: *!escolher <nome>*\n` +
                      `┃\n┃ 💡 Use: *!balada normal* ou *!balada vip*\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯`,
                mentions: [bt.j1, bt.j2]
              }, { quoted: msg });
            } else if (bt.fase === 'escolha2' && sender === bt.j2) {
              const poke = u2.time.find(p => p.nome.toLowerCase() === nomePoke);
              if (!poke) { await sock.sendMessage(from, { text: '❌ Você não tem esse pokémon!' }, { quoted: msg }); return }
              bt.p2 = { ...poke };
              bt.fase = 'luta';
              bt.vez = 1;
              bt.turno = 1;
              salvarPokeBatalha(db);

              await sock.sendMessage(from, {
                text: `╭━━━〔 ⚔️ 𝐁𝐀𝐓𝐀𝐋𝐇𝐀 𝐈𝐍𝐈𝐂𝐈𝐀𝐃𝐀 〕━━━╮\n┃\n` +
                      `┃ 👤 @${bt.j1.split('@')[0]}\n┃ ${emojiRaridade(bt.p1.raridade)} *${bt.p1.nome}* (Nv.${bt.p1.nivel})\n┃ ❤️ ${bt.p1.hp}/${bt.p1.hpMax}\n┃\n` +
                      `┃ 🆚\n┃\n` +
                      `┃ 👤 @${bt.j2.split('@')[0]}\n┃ ${emojiRaridade(bt.p2.raridade)} *${bt.p2.nome}* (Nv.${bt.p2.nivel})\n┃ ❤️ ${bt.p2.hp}/${bt.p2.hpMax}\n┃\n` +
                      `╰━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                      `🎯 @${bt.j1.split('@')[0]} começa! Use *!ataque1*, *!ataque2* ou *!ataque3*`,
                mentions: [bt.j1, bt.j2]
              }, { quoted: msg });
            } else {
              await sock.sendMessage(from, { text: '⏳ Não é sua vez de escolher ou a batalha não tá nessa fase!' }, { quoted: msg });
            }
          }
          return
    }
  }
};
