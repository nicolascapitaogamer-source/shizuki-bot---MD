// Gerado de index.js (case 'boss', linha 8282)
export default {
  nomes: ["boss"],
  async executar(__x) {
    const { pirataUser, sender, acharIlha, sock, from, msg, ITENS_LOJA, FRUTAS, xpProximoNivel, salvarPirata, pushName, CONF } = Object.assign({}, __x.utils, __x);
    {
{
            const u = pirataUser(sender);
            const ilha = acharIlha(u.ilhaAtual);
            if (!ilha) { await sock.sendMessage(from, { text: '❌ Ilha inválida!' }, { quoted: msg }); return }
            if (u.energia < 30) { await sock.sendMessage(from, { text: '⚡ Precisa de 30 energia pro boss! Use *!dormir*.' }, { quoted: msg }); return }
            if (u.hp <= 0) { await sock.sendMessage(from, { text: '💀 Você está morto! Use *!dormir* pra recuperar HP.' }, { quoted: msg }); return }
            if (u.bossesDerrotados && u.bossesDerrotados.includes(ilha.id)) {
              await sock.sendMessage(from, { text: '👑 Você já derrotou o boss *' + ilha.boss + '* dessa ilha!' }, { quoted: msg });
              return
            }

            // Boss é MUITO forte
            const boss = {
              nome: ilha.boss,
              forca: ilha.nivelMin * 6 + 50,
              defesa: ilha.nivelMin * 3 + 30,
              hp: 200 + ilha.nivelMin * 15
            };

            let pForca = u.forca + u.combate;
            let pDefesa = u.defesa;
            if (u.armaEquipada) pForca += (ITENS_LOJA[u.armaEquipada]?.forca || 0);
            if (u.armaduraEquipada) pDefesa += (ITENS_LOJA[u.armaduraEquipada]?.defesa || 0);
            if (u.fruta) { const fr = FRUTAS.find(f => f.id === u.fruta); if (fr && fr.bonus) { pForca += (fr.bonus.forca || 0); pDefesa += (fr.bonus.defesa || 0); } }

            let pHp = u.hp;
            let iHp = boss.hp;
            let rodadas = '';
            let turno = 1;

            while (pHp > 0 && iHp > 0 && turno <= 20) {
              const danoP = Math.max(5, Math.floor((pForca * 1.5 - boss.defesa) * (0.8 + Math.random() * 0.4)));
              const critico = Math.random() < 0.2;
              const danoFinal = critico ? Math.floor(danoP * 1.8) : danoP;
              iHp -= danoFinal;
              rodadas += '⚔️ Você ataca! (-' + danoFinal + (critico ? ' CRÍTICO!' : '') + ')\n';
              if (iHp <= 0) { rodadas += '👑 BOSS DERROTADO!\n'; break; }
              rodadas += '   👹 ' + boss.nome + ': ' + Math.max(0, iHp) + '/' + boss.hp + '\n\n';

              const danoI = Math.max(5, Math.floor((boss.forca - pDefesa) * (0.8 + Math.random() * 0.4)));
              pHp -= danoI;
              rodadas += '👹 ' + boss.nome + ' ataca! (-' + danoI + ')\n';
              if (pHp <= 0) { rodadas += '💀 VOCÊ CAIU!\n'; break; }
              rodadas += '   ❤️ Você: ' + Math.max(0, pHp) + '/' + u.hpMax + '\n\n';
              turno++;
            }

            u.energia -= 30;
            u.hp = Math.max(0, pHp);

            if (iHp <= 0) {
              // VITÓRIA ÉPICA
              const xpGanha = ilha.xpBase * 5;
              const ouroGanha = ilha.ouroBase * 5;
              const repGanha = Math.floor(xpGanha / 5);
              u.xp += xpGanha;
              u.ouro += ouroGanha;
              u.reputacao += repGanha;
              u.bossesDerrotados = u.bossesDerrotados || [];
              u.bossesDerrotados.push(ilha.id);

              let subiuNivel = false;
              while (u.xp >= xpProximoNivel(u.nivel)) {
                u.xp -= xpProximoNivel(u.nivel);
                u.nivel += 1;
                u.hpMax += 10;
                u.hp = u.hpMax;
                u.forca += 3;
                u.combate += 2;
                u.defesa += 2;
                subiuNivel = true;
              }
              salvarPirata(sender, u);

              let txtFinal = '╔══════════════════════════════╗\n' +
                             '║   👑  𝐁𝐎𝐒𝐒  𝐃𝐄𝐑𝐑𝐎𝐓𝐀𝐃𝐎!  👑       ║\n' +
                             '╚══════════════════════════════╝\n\n' +
                             '🏴‍☠️ *' + pushName + '* derrotou *' + boss.nome + '*!\n\n' +
                             '╭─❖ 🔥 𝐑𝐎𝐔𝐍𝐃𝐒 ❖─╮\n│\n' +
                             rodadas.replace(/\n/g, '\n│  ') + '│\n╰─────────────────────╯\n\n' +
                             '╭─❖ 🎁 𝐑𝐄𝐂𝐎𝐌𝐏𝐄𝐍𝐒𝐀𝐒 ❖─╮\n│\n' +
                             '│  ⭐ +' + xpGanha + ' XP (MUITO!)\n' +
                             '│  💰 +' + ouroGanha + ' berries\n' +
                             '│  💀 +' + repGanha + ' procurado\n';
              if (subiuNivel) txtFinal += '│  🎉 SUBIU PRA NÍVEL ' + u.nivel + '!\n';
              txtFinal += '│\n╰─────────────────────╯\n\n' +
                          '❤️ HP: ' + u.hp + '/' + u.hpMax + '\n' +
                          '⚡ Energia: ' + u.energia + '/' + u.energiaMax + '\n\n' +
                          '🌸 ' + CONF.nomeBot + ' 🌸';

              await sock.sendMessage(from, { text: txtFinal, mentions: [sender] }, { quoted: msg });
            } else {
              // DERROTA
              const perdaRep = Math.floor(u.reputacao * 0.15);
              const perdaOuro = Math.floor(u.ouro * 0.25);
              u.reputacao = Math.max(0, u.reputacao - perdaRep);
              u.ouro = Math.max(0, u.ouro - perdaOuro);
              const morreu = u.hp <= 0;
              if (morreu) { u.hp = 0; }
              salvarPirata(sender, u);

              let txtDerrota = '╔══════════════════════════════╗\n' +
                               '║   💀  𝐃𝐄𝐑𝐑𝐎𝐓𝐀  💀              ║\n' +
                               '╚══════════════════════════════╝\n\n' +
                               '╭─❖ 💔 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎 ❖─╮\n│\n' +
                               '│  💔 Você perdeu pro boss *' + boss.nome + '*!\n' +
                               '│  📉 -' + perdaRep + ' procurado\n' +
                               '│  💰 -' + perdaOuro + ' berries\n';
              if (morreu) txtDerrota += '│  💀 *VOCÊ MORREU!*\n│  💡 Use *!dormir* pra recuperar\n';
              txtDerrota += '│\n╰─────────────────────╯\n\n';
              txtDerrota += '🌸 ' + CONF.nomeBot + ' 🌸';

              await sock.sendMessage(from, { text: txtDerrota, mentions: [sender] }, { quoted: msg });
            }
          }
          return
    }
  }
};
