// Gerado de index.js (case 'meupirata', linha 7992)
export default {
  nomes: ["meupirata"],
  async executar(__x) {
    const { pirataUser, sender, acharIlha, xpProximoNivel, ITENS_LOJA, FRUTAS, HAKIS, RACAS, TRIPULANTES, pushName, tituloNivel, fmtNum, barraProgresso, CONF, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = pirataUser(sender);
            const ilha = acharIlha(u.ilhaAtual);
            const xpNec = xpProximoNivel(u.nivel);
            const xpPct = Math.floor((u.xp / xpNec) * 100);
            const arma = u.armaEquipada ? (ITENS_LOJA[u.armaEquipada]?.nome || u.armaEquipada) : 'Nenhuma';
            const armadura = u.armaduraEquipada ? (ITENS_LOJA[u.armaduraEquipada]?.nome || u.armaduraEquipada) : 'Nenhuma';
            const frutaNome = u.fruta ? (FRUTAS.find(f => f.id === u.fruta)?.nome || u.fruta) : 'Nenhuma';
            const hakiNome = u.haki ? (HAKIS.find(h => h.id === u.haki)?.nome || u.haki) : 'Nenhum';
            const racaNome = u.raca ? (RACAS.find(r => r.id === u.raca)?.nome || u.raca) : 'Nenhuma';

            let listaTrip = '';
            if (u.tripulacao.length === 0) {
            } else {
              u.tripulacao.forEach((t, i) => {
                const trip = TRIPULANTES.find(x => x.id === t.id) || t;
                listaTrip += '│  ' + (i+1) + '. ' + trip.emoji + ' ' + trip.nome + ' (Nv.' + trip.nivel + ')\n';
              });
            }

            let txt = '╔══════════════════════════════╗\n' +
                      '║   🏴‍☠️  𝐅𝐈𝐂𝐇𝐀  𝐃𝐎  𝐏𝐈𝐑𝐀𝐓𝐀  🏴‍☠️   ║\n' +
                      '╚══════════════════════════════╝\n\n' +
                      '╭─❖ 👤 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐂̧𝐎̃𝐄𝐒 ❖─╮\n│\n' +
                      '│  👤 Nome: ' + pushName + '\n' +
                      '│  🏆 Nível: ' + u.nivel + '\n' +
                      '│  ⭐ Título: ' + tituloNivel(u.nivel) + '\n' +
                      '│  💀 Procurado: ' + fmtNum(u.reputacao) + '\n' +
                      '│  🏝️ Ilha: ' + ilha.emoji + ' ' + ilha.nome + '\n│\n' +
                      '╰─────────────────────╯\n\n' +
                      '╭─❖ ⚔️ 𝐀𝐓𝐑𝐈𝐁𝐔𝐓𝐎𝐒 ❖─╮\n│\n' +
                      '│  ❤️ HP: ' + barraProgresso(u.hp, u.hpMax) + '\n' +
                      '│  ⚡ Energia: ' + barraProgresso(u.energia, u.energiaMax) + '\n' +
                      '│  ⭐ XP: ' + barraProgresso(u.xp, xpNec) + '\n' +
                      '│  💪 Força: ' + u.forca + '\n' +
                      '│  🗡️ Combate: ' + u.combate + '\n' +
                      '│  🛡️ Defesa: ' + u.defesa + '\n│\n' +
                      '╰─────────────────────╯\n\n' +
                      '╭─❖ 🎁 𝐄𝐐𝐔𝐈𝐏𝐀𝐌𝐄𝐍𝐓𝐎𝐒 ❖─╮\n│\n' +
                      '│  🗡️ Arma: ' + arma + '\n' +
                      '│  🛡️ Armadura: ' + armadura + '\n' +
                      '│  🍇 Fruta: ' + frutaNome + '\n' +
                      '│  🥋 Haki: ' + hakiNome + '\n' +
                      '│  🧬 Raça: ' + racaNome + '\n│\n' +
                      '╰─────────────────────╯\n\n' +
                      '╭─❖ ⚓ 𝐓𝐑𝐈𝐏𝐔𝐋𝐀𝐂̧𝐀̃𝐎 (' + u.tripulacao.length + '/8) ❖─╮\n│\n' +
                      listaTrip +
                      '│\n╰─────────────────────╯\n\n' +
                      '🌸 ' + CONF.nomeBot + ' 🌸';

            await sock.sendMessage(from, { text: txt, mentions: [sender] }, { quoted: msg });
          }
          return
    }
  }
};
