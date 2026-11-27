// Gerado de index.js (case 'ataque1', linha 6695)
export default {
  nomes: ["ataque1","ataque2","ataque3"],
  async executar(__x) {
    const { pokeBatalhaDB, chaveBatalha, calcularDano, pokeUser, ganharXp, ajustarFelicidade, salvarPokeUser, salvarPokeBatalha, from, sock, msg, sender, command } = Object.assign({}, __x.utils, __x);
    {
{
            const db = pokeBatalhaDB();
            const bt = db[chaveBatalha(from)];
            if (!bt) { await sock.sendMessage(from, { text: '❌ Nenhuma batalha rolando aqui!' }, { quoted: msg }); return }
            if (bt.fase !== 'luta') { await sock.sendMessage(from, { text: '⚠️ A batalha ainda não começou ou acabou!' }, { quoted: msg }); return }

            const jogadorAtual = bt.vez === 1 ? bt.j1 : bt.j2;
            if (jogadorAtual !== sender) {
              await sock.sendMessage(from, { text: '⏳ Não é sua vez!' }, { quoted: msg });
              return
            }

            // Pega o número real (phoneNumber) de quem tá atacando e de quem tá defendendo
            const gm = await globalThis.__getGroupMetadata(from);
            const getRealJid = (jid) => {
              const p = gm.participants.find(x => x.id === jid || x.lid === jid);
              return p && p.phoneNumber ? p.phoneNumber : jid;
            };

            const realJ1 = getRealJid(bt.j1);
            const realJ2 = getRealJid(bt.j2);

            const atkNum = parseInt(command.replace('ataque', ''), 10);
            const nomesAtaques = ['Investida 💥', 'Golpe Forte 🥊', 'Ataque Especial ✨'];
            const atkMult = [1, 1.4, 1.8][atkNum - 1];
            const precisao = [0.95, 0.75, 0.55][atkNum - 1];

            const atacante = bt.vez === 1 ? bt.p1 : bt.p2;
            const defensor = bt.vez === 1 ? bt.p2 : bt.p1;
            const jAtacante = bt.vez === 1 ? realJ1 : realJ2;
            const jDefensor = bt.vez === 1 ? realJ2 : realJ1;

            let texto = `🥊 @${jAtacante.split('@')[0]} usou *${nomesAtaques[atkNum - 1]}*!\n`;

            if (Math.random() > precisao) {
              texto += `\n💨 ...mas errou o ataque!\n`;
            } else {
              const danoBase = calcularDano(atacante, defensor);
              const dano = Math.floor(danoBase * atkMult);
              defensor.hp = Math.max(0, defensor.hp - dano);
              texto += `\n💥 Dano: *${dano}*\n`;
              texto += `❤️ ${defensor.nome}: *${defensor.hp}/${defensor.hpMax}*\n`;
            }

            if (defensor.hp <= 0) {
              const vencedor = jAtacante;
              const perdedor = jDefensor;
              const uV = pokeUser(bt.vez === 1 ? bt.j1 : bt.j2);
              const uP = pokeUser(bt.vez === 1 ? bt.j2 : bt.j1);
              uV.pokecoins += 50;
              uV.vitorias += 1;
              uP.derrotas += 1;

              const pokeV = uV.time.find(p => p.nome === atacante.nome);
              if (pokeV) ganharXp(pokeV, 80);
              const pokeP = uP.time.find(p => p.nome === defensor.nome);
              if (pokeP) {
                pokeP.ataque = Math.max(5, Math.floor(pokeP.ataque * 0.95));
                pokeP.defesa = Math.max(5, Math.floor(pokeP.defesa * 0.95));
                ajustarFelicidade(pokeP, -10);
              }
              salvarPokeUser(bt.vez === 1 ? bt.j1 : bt.j2, uV);
              salvarPokeUser(bt.vez === 1 ? bt.j2 : bt.j1, uP);
              delete db[chaveBatalha(from)];
              salvarPokeBatalha(db);

              await sock.sendMessage(from, {
                text: texto +
                      `\n╭━━━〔 🏆 𝐅𝐈𝐌 𝐃𝐄 𝐁𝐀𝐓𝐀𝐋𝐇𝐀 〕━━━╮\n┃\n` +
                      `┃ 🥇 Vencedor: @${vencedor.split('@')[0]}\n` +
                      `┃ 💰 Prêmio: *+50* Pokécoins\n` +
                      `┃ ⭐ Seu pokémon ganhou XP!\n┃\n` +
                      `┃ 💀 Perdedor: @${perdedor.split('@')[0]}\n` +
                      `┃ 📉 Perdeu um pouco de status\n` +
                      `┃\n┃ 💡 Use: *!balada normal* ou *!balada vip*\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯`,
                mentions: [vencedor, perdedor]
              }, { quoted: msg });
            } else {
              bt.vez = bt.vez === 1 ? 2 : 1;
              bt.turno += 1;
              db[chaveBatalha(from)] = bt;
              salvarPokeBatalha(db);

              await sock.sendMessage(from, {
                text: texto + `\n🎯 Agora é a vez de @${jDefensor.split('@')[0]}!`,
                mentions: [jDefensor]
              }, { quoted: msg });
            }
          }
          return

          return
    }
  }
};
