// Gerado de index.js (case 'atacar', linha 13876)
export default {
  nomes: ["atacar"],
  async executar(__x) {
    const { carregarArena, chaveArena, calcularDanoArena, salvarArena, shizukiUser, salvarShizuki, from, sock, msg, sender } = Object.assign({}, __x.utils, __x);
    {
{
            const dbA = carregarArena();
            const chvA = chaveArena(from);
            const a = dbA[chvA];
            if (!a || a.finalizada) { await sock.sendMessage(from, { text: '❌ Nenhum duelo rolando!' }, { quoted: msg }); return }
            if ((a.vez === 1 && a.j1 !== sender) || (a.vez === 2 && a.j2 !== sender)) { await sock.sendMessage(from, { text: '⏳ Não é sua vez!' }, { quoted: msg }); return }
            const dano = calcularDanoArena();
            let danoFinal = dano;
            if (a.vez === 1) {
              if (a.defender2) { danoFinal = Math.floor(dano / 2); a.defender2 = false; }
              if (a.escudo2) { danoFinal = 0; a.escudo2 = false; }
              a.hp2 = Math.max(0, a.hp2 - danoFinal);
            } else {
              if (a.defender1) { danoFinal = Math.floor(dano / 2); a.defender1 = false; }
              if (a.escudo1) { danoFinal = 0; a.escudo1 = false; }
              a.hp1 = Math.max(0, a.hp1 - danoFinal);
            }
            const nomeAtk = a.vez === 1 ? a.j1 : a.j2;
            const nomeDef = a.vez === 1 ? a.j2 : a.j1;
            const hpAtk = a.vez === 1 ? a.hp1 : a.hp2;
            const hpDef = a.vez === 1 ? a.hp2 : a.hp1;
            if (hpDef <= 0) {
              a.finalizada = true;
              salvarArena(dbA);
              const venc = nomeAtk;
              const perd = nomeDef;
              const uV = shizukiUser(venc);
              const uP = shizukiUser(perd);
              uV.reais += a.valor;
              uP.reais -= a.valor;
              uV.ultimaArena = Date.now();
              uP.ultimaArena = Date.now();
              salvarShizuki(venc, uV);
              salvarShizuki(perd, uP);
              delete dbA[chvA];
              salvarArena(dbA);
              await sock.sendMessage(from, {
                text: '╭━━━〔 🏆 𝐕𝐈𝐓𝐎́𝐑𝐈𝐀 🏆 〕━━━╮\n┃\n┃ 🥇 Vencedor: @' + venc.split('@')[0] + '\n┃ 💰 Prêmio: *R$ ' + a.valor + '*\n┃\n┃ 💀 Perdedor: @' + perd.split('@')[0] + '\n┃\n┃ ⚔️ Dano final: *' + danoFinal + '*\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [venc, perd]
              }, { quoted: msg });
              return
            }
            a.vez = a.vez === 1 ? 2 : 1;
            a.turno += 1;
            salvarArena(dbA);
            await sock.sendMessage(from, {
              text: '╭━━━〔 ⚔️ 𝐓𝐔𝐑𝐍𝐎 ' + a.turno + ' ⚔️ 〕━━━╮\n┃\n┃ ⚔️ @' + nomeAtk.split('@')[0] + ' atacou!\n┃ 💥 Dano: *' + danoFinal + '*\n┃\n┃ ❤️ @' + nomeDef.split('@')[0] + ': *' + hpDef + '/100*\n┃ ❤️ @' + nomeAtk.split('@')[0] + ': *' + hpAtk + '/100*\n┃\n┃ 🎯 Vez de @' + nomeDef.split('@')[0] + '!\n┃\n┃ ┣ 🗡️ !atacar\n┃ ┣ 🛡️ !defender\n┃ ┣ ✨ !magia <nome>\n┃ ┗ 🏳️ !desistir\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [nomeAtk, nomeDef]
            }, { quoted: msg });
          }
          return
    }
  }
};
