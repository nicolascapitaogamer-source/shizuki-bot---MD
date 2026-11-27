// Gerado de index.js (case 'batalhapokemon', linha 6647)
export default {
  nomes: ["batalhapokemon"],
  async executar(__x) {
    const { pokeUser, pokeBatalhaDB, chaveBatalha, salvarPokeBatalha, emojiRaridade, isGroup, sock, from, msg, sender } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const alvo = ctx?.mentionedJid?.[0];

            if (!alvo) {
              await sock.sendMessage(from, { text: '⚠️ Marque alguém! Ex: !batalhapokemon @pessoa' }, { quoted: msg });
              return
            }
            if (alvo === sender) {
              await sock.sendMessage(from, { text: '🤨 Você não pode batalhar consigo mesmo!' }, { quoted: msg });
              return
            }

            const u1 = pokeUser(sender);
            const u2 = pokeUser(alvo);
            if (u1.time.length === 0) { await sock.sendMessage(from, { text: '❌ Você não tem pokémons!' }, { quoted: msg }); return }
            if (u2.time.length === 0) { await sock.sendMessage(from, { text: '❌ Essa pessoa não tem pokémons!' }, { quoted: msg }); return }

            const db = pokeBatalhaDB();
            db[chaveBatalha(from)] = {
              j1: sender, j2: alvo,
              p1: null, p2: null,
              fase: 'escolha1',
              inicio: Date.now()
            };
            salvarPokeBatalha(db);

            let lista1 = '';
            u1.time.forEach((p, i) => { lista1 += `┃ ${i + 1}. ${emojiRaridade(p.raridade)} ${p.nome} (Nv.${p.nivel})\n`; });

            await sock.sendMessage(from, {
              text: `╭━━━〔 ⚔️ 𝐁𝐀𝐓𝐀𝐋𝐇𝐀 〕━━━╮\n┃\n` +
                    `┃ 👤 @${sender.split('@')[0]} desafiou @${alvo.split('@')[0]}!\n┃\n` +
                    `┃ 🎒 *@${sender.split('@')[0]}, escolha seu pokémon:*\n` +
                    `┃\n${lista1}┃\n` +
                    `┃ 💡 Use: *!escolher <nome>*\n` +
                    `┃\n┃ 💡 Use: *!balada normal* ou *!balada vip*\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender, alvo]
            }, { quoted: msg });
          }
          return

          return
    }
  }
};
