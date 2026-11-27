// Gerado de index.js (case 'lutar', linha 8132)
export default {
  nomes: ["lutar"],
  async executar(__x) {
    const { pirataUser, sender, acharIlha, sock, from, msg, args, CONF, ITENS_LOJA, xpProximoNivel, salvarPirata, pushName } = Object.assign({}, __x.utils, __x);
    {
{
            const u = pirataUser(sender);
            const ilha = acharIlha(u.ilhaAtual);
            if (!ilha) { await sock.sendMessage(from, { text: '❌ Ilha inválida!' }, { quoted: msg }); return }

            const alvoNome = args.join(' ').trim().toLowerCase();
            if (!alvoNome) {
              // Mostra inimigos disponíveis
              let txt = '╔══════════════════════════════╗\n' +
                        '║   ⚔️  𝐈𝐍𝐈𝐌𝐈𝐆𝐎𝐒  𝐃𝐈𝐒𝐏𝐎𝐍𝐈́𝐕𝐄𝐈𝐒  ⚔️   ║\n' +
                        '╚══════════════════════════════╝\n\n' +
                        '🏝️ Ilha: ' + ilha.emoji + ' *' + ilha.nome + '*\n\n' +
                        '╭─❖ 👹 𝐄𝐒𝐂𝐎𝐋𝐇𝐀 ❖─╮\n│\n';
              ilha.inimigos.forEach((ini, i) => {
                txt += '│  ' + (i+1) + '. ' + ini + '\n';
              });
              txt += '│\n╰─────────────────────╯\n\n';
              txt += '💡 Use: *!lutar <nome do inimigo>*\n\n';
              txt += '🌸 ' + CONF.nomeBot + ' 🌸';
              await sock.sendMessage(from, { text: txt, mentions: [sender] }, { quoted: msg });
              return
            }

            // Acha o inimigo
            const iniNome = ilha.inimigos.find(i => i.toLowerCase().includes(alvoNome));
            if (!iniNome) { await sock.sendMessage(from, { text: '❌ Inimigo não encontrado nessa ilha!' }, { quoted: msg }); return }
            if (u.energia < 10) { await sock.sendMessage(from, { text: '⚡ Energia insuficiente! Use *!dormir* ou *!meditar*.' }, { quoted: msg }); return }
            if (u.hp <= 0) { await sock.sendMessage(from, { text: '💀 Você está morto! Use *!dormir* pra recuperar HP.' }, { quoted: msg }); return }

            // Stats do inimigo (baseado na ilha)
            const nivelIni = ilha.nivelMin + Math.floor(Math.random() * 5);
            const inimigo = {
              nome: iniNome,
              forca: Math.floor(ilha.nivelMin * 3 + Math.random() * 20),
              defesa: Math.floor(ilha.nivelMin * 1.5 + Math.random() * 10),
              hp: Math.floor(50 + ilha.nivelMin * 5)
            };

            // Cria cópia do player pra batalha
            let pForca = u.forca + u.combate;
            let pDefesa = u.defesa;
            if (u.armaEquipada) pForca += (ITENS_LOJA[u.armaEquipada]?.forca || 0);
            if (u.armaduraEquipada) pDefesa += (ITENS_LOJA[u.armaduraEquipada]?.defesa || 0);

            let pHp = u.hp;
            let iHp = inimigo.hp;
            let rodadas = '';
            let turno = 1;

            // Loop de batalha (máximo 10 rodadas)
            while (pHp > 0 && iHp > 0 && turno <= 10) {
              // Player ataca
              const danoP = Math.max(5, Math.floor((pForca * 1.5 - inimigo.defesa) * (0.8 + Math.random() * 0.4)));
              const critico = Math.random() < 0.15;
              const danoFinal = critico ? Math.floor(danoP * 1.5) : danoP;
              iHp -= danoFinal;
              rodadas += '⚔️ Você ataca! (-' + danoFinal + (critico ? ' CRÍTICO!' : '') + ')\n';
              if (iHp <= 0) { rodadas += '👹 DERROTADO!\n'; break; }
              rodadas += '   👹 Inimigo: ' + Math.max(0, iHp) + '/' + inimigo.hp + '\n\n';

              // Inimigo ataca
              const danoI = Math.max(3, Math.floor((inimigo.forca - pDefesa) * (0.8 + Math.random() * 0.4)));
              pHp -= danoI;
              rodadas += '👹 Inimigo ataca! (-' + danoI + ')\n';
              if (pHp <= 0) { rodadas += '💀 VOCÊ CAIU!\n'; break; }
              rodadas += '   ❤️ Você: ' + Math.max(0, pHp) + '/' + u.hpMax + '\n\n';
              turno++;
            }

            u.energia -= 10;
            u.hp = Math.max(0, pHp);

            if (iHp <= 0) {
              // VITÓRIA
              const xpGanha = ilha.xpBase + Math.floor(Math.random() * 50);
              const ouroGanha = ilha.ouroBase + Math.floor(Math.random() * 30);
              const repGanha = Math.floor(xpGanha / 10);
              u.xp += xpGanha;
              u.ouro += ouroGanha;
              u.reputacao += repGanha;
              // Chance de subir stats
              const subiuForca = Math.random() < 0.3;
              const subiuCombate = Math.random() < 0.3;
              const subiuDefesa = Math.random() < 0.2;
              if (subiuForca) u.forca += 1;
              if (subiuCombate) u.combate += 1;
              if (subiuDefesa) u.defesa += 1;

              // Verifica level up
              let subiuNivel = false;
              while (u.xp >= xpProximoNivel(u.nivel)) {
                u.xp -= xpProximoNivel(u.nivel);
                u.nivel += 1;
                u.hpMax += 10;
                u.hp = u.hpMax;
                u.forca += 2;
                u.combate += 1;
                u.defesa += 1;
                subiuNivel = true;
              }
              salvarPirata(sender, u);

              let txtFinal = '╔══════════════════════════════╗\n' +
                             '║   ⚔️  𝐁𝐀𝐓𝐀𝐋𝐇𝐀  ⚔️              ║\n' +
                             '╚══════════════════════════════╝\n\n' +
                             '🏴‍☠️ *' + pushName + '* vs 👹 *' + iniNome + '*\n\n' +
                             '╭─❖ 🔥 𝐑𝐎𝐔𝐍𝐃𝐒 ❖─╮\n│\n' +
                             rodadas.replace(/\n/g, '\n│  ') + '│\n╰─────────────────────╯\n\n' +
                             '╭─❖ 🎁 𝐑𝐄𝐂𝐎𝐌𝐏𝐄𝐍𝐒𝐀𝐒 ❖─╮\n│\n' +
                             '│  ⭐ +' + xpGanha + ' XP\n' +
                             '│  💰 +' + ouroGanha + ' berries\n' +
                             '│  💀 +' + repGanha + ' procurado\n';
              if (subiuForca) txtFinal += '│  💪 +1 Força\n';
              if (subiuCombate) txtFinal += '│  🗡️ +1 Combate\n';
              if (subiuDefesa) txtFinal += '│  🛡️ +1 Defesa\n';
              if (subiuNivel) txtFinal += '│  🎉 SUBIU PRA NÍVEL ' + u.nivel + '!\n';
              txtFinal += '│\n╰─────────────────────╯\n\n' +
                          '❤️ HP: ' + u.hp + '/' + u.hpMax + '\n' +
                          '⚡ Energia: ' + u.energia + '/' + u.energiaMax + '\n\n' +
                          '🌸 ' + CONF.nomeBot + ' 🌸';

              await sock.sendMessage(from, { text: txtFinal, mentions: [sender] }, { quoted: msg });
            } else {
              // DERROTA
              const perdaRep = Math.floor(u.reputacao * 0.1);
              const perdaOuro = Math.floor(u.ouro * 0.2);
              u.reputacao = Math.max(0, u.reputacao - perdaRep);
              u.ouro = Math.max(0, u.ouro - perdaOuro);
              const morreu = u.hp <= 0;
              if (morreu) { u.hp = 0; }
              salvarPirata(sender, u);

              let txtDerrota = '╔══════════════════════════════╗\n' +
                               '║   💀  𝐃𝐄𝐑𝐑𝐎𝐓𝐀  💀              ║\n' +
                               '╚══════════════════════════════╝\n\n' +
                               '╭─❖ 💔 𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎 ❖─╮\n│\n' +
                               '│  💔 Você perdeu pra *' + iniNome + '*!\n' +
                               '│  📉 -' + perdaRep + ' procurado\n' +
                               '│  💰 -' + perdaOuro + ' berries\n';
              if (morreu) txtDerrota += '│  💀 *VOCÊ MORREU!*\n│  💡 Use *!dormir* pra recuperar\n';
              else txtDerrota += '│  ❤️ HP restante: ' + u.hp + '/' + u.hpMax + '\n';
              txtDerrota += '│\n╰─────────────────────╯\n\n';
              txtDerrota += '🌸 ' + CONF.nomeBot + ' 🌸';

              await sock.sendMessage(from, { text: txtDerrota, mentions: [sender] }, { quoted: msg });
            }
          }
          return
    }
  }
};
