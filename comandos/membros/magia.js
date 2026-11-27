// Gerado de index.js (case 'magia', linha 13949)
export default {
  nomes: ["magia"],
  async executar(__x) {
    const { carregarArena, chaveArena, MAGIAS_ARENA, salvarArena, shizukiUser, salvarShizuki, from, sock, msg, sender, args } = Object.assign({}, __x.utils, __x);
    {
{
            const dbMg = carregarArena();
            const chvMg = chaveArena(from);
            const m = dbMg[chvMg];
            if (!m || m.finalizada) { await sock.sendMessage(from, { text: '❌ Nenhum duelo rolando!' }, { quoted: msg }); return }
            if ((m.vez === 1 && m.j1 !== sender) || (m.vez === 2 && m.j2 !== sender)) { await sock.sendMessage(from, { text: '⏳ Não é sua vez!' }, { quoted: msg }); return }
            const nomeMg = args.join(' ').toLowerCase().trim();
            const apelidos = {
              'sopro': 'gelo', 'congelante': 'gelo', 'gelo': 'gelo',
              'nevoa': 'veneno', 'toxica': 'veneno', 'tóxica': 'veneno', 'veneno': 'veneno', 'venenosa': 'veneno',
              'drenar': 'sombra', 'vida': 'sombra', 'sombra': 'sombra',
              'lamina': 'vento', 'lâmina': 'vento', 'ventania': 'vento', 'vento': 'vento',
              'fogo': 'fogo', 'raio': 'raio', 'cura': 'cura'
            };
            const chaveMagia = apelidos[nomeMg] || nomeMg;
            const mag = MAGIAS_ARENA[chaveMagia];
            if (!mag) {
              let lista = '📜 *Magias disponíveis:*\n\n';
              for (const k in MAGIAS_ARENA) {
                const M = MAGIAS_ARENA[k];
                lista += M.emoji + ' *' + M.nome + '* — ' + (M.dano ? 'Dano ' + M.dano : M.cura ? 'Cura ' + M.cura : 'Escudo') + ' (Mana ' + (M.mana || 0) + ')\n';
              }
              lista += '\n💡 Use: *!magia <nome>* (só a primeira palavra, ex: *!magia raio* ou *!magia gelo*)';
              await sock.sendMessage(from, { text: lista }, { quoted: msg });
              return
            }
            const meuCd = m.vez === 1 ? m.cd1 : m.cd2;
            if (meuCd[nomeMg] && meuCd[nomeMg] > m.turno) {
              await sock.sendMessage(from, { text: '⏳ Magia em cooldown! Volta no turno *' + meuCd[nomeMg] + '*.' }, { quoted: msg });
              return
            }
            meuCd[nomeMg] = m.turno + mag.cd;
            let textoMag = '';
            if (mag.cura) {
              if (m.vez === 1) m.hp1 = Math.min(100, m.hp1 + mag.cura);
              else m.hp2 = Math.min(100, m.hp2 + mag.cura);
              textoMag = mag.emoji + ' @' + sender.split('@')[0] + ' usou *' + mag.nome + '* e recuperou *' + mag.cura + ' HP*!';
            } else if (mag.escudo) {
              if (m.vez === 1) m.escudo1 = true;
              else m.escudo2 = true;
              textoMag = mag.emoji + ' @' + sender.split('@')[0] + ' ativou *' + mag.nome + '*! Próximo ataque: *0 dano*!';
            } else {
              const danoMg = mag.dano || Math.floor(Math.random() * 20) + 10;
              let danoAplicado = danoMg;
              if (m.vez === 1) {
                if (m.defender2) { danoAplicado = Math.floor(danoMg / 2); m.defender2 = false; }
                if (m.escudo2) { danoAplicado = 0; m.escudo2 = false; }
                m.hp2 = Math.max(0, m.hp2 - danoAplicado);
              } else {
                if (m.defender1) { danoAplicado = Math.floor(danoMg / 2); m.defender1 = false; }
                if (m.escudo1) { danoAplicado = 0; m.escudo1 = false; }
                m.hp1 = Math.max(0, m.hp1 - danoAplicado);
              }
              textoMag = mag.emoji + ' @' + sender.split('@')[0] + ' usou *' + mag.nome + '*!\n💥 Dano: *' + danoAplicado + '*';
            }
            const nomeAlvo = m.vez === 1 ? m.j2 : m.j1;
            const nomeMeu = sender;
            const hpAlvo = m.vez === 1 ? m.hp2 : m.hp1;
            const hpMeu = m.vez === 1 ? m.hp1 : m.hp2;
            if (hpAlvo <= 0) {
              m.finalizada = true;
              salvarArena(dbMg);
              const uV = shizukiUser(sender);
              const uP = shizukiUser(nomeAlvo);
              uV.reais += m.valor;
              uP.reais -= m.valor;
              uV.ultimaArena = Date.now();
              uP.ultimaArena = Date.now();
              salvarShizuki(sender, uV);
              salvarShizuki(nomeAlvo, uP);
              delete dbMg[chvMg];
              salvarArena(dbMg);
              await sock.sendMessage(from, {
                text: '╭━━━〔 🏆 𝐕𝐈𝐓𝐎́𝐑𝐈𝐀 🏆 〕━━━╮\n┃\n┃ 🥇 Vencedor: @' + sender.split('@')[0] + '\n┃ 💰 Prêmio: *R$ ' + m.valor + '*\n┃\n┃ 💀 Perdedor: @' + nomeAlvo.split('@')[0] + '\n┃\n┃ ✨ Finalização: *' + mag.nome + '*\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [sender, nomeAlvo]
              }, { quoted: msg });
              return
            }
            m.vez = m.vez === 1 ? 2 : 1;
            m.turno += 1;
            salvarArena(dbMg);
            await sock.sendMessage(from, {
              text: '╭━━━〔 ✨ ' + mag.nome.toUpperCase() + ' ✨ 〕━━━╮\n┃\n┃ ' + textoMag + '\n┃\n┃ ❤️ @' + m.j1.split('@')[0] + ': *' + m.hp1 + '/100*\n┃ ❤️ @' + m.j2.split('@')[0] + ': *' + m.hp2 + '/100*\n┃\n┃ 🎯 Vez de @' + (m.vez === 1 ? m.j1 : m.j2).split('@')[0] + '!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [m.j1, m.j2]
            }, { quoted: msg });
          }
          return
    }
  }
};
