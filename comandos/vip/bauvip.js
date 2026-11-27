// Gerado de index.js (case 'bauvip', linha 7693)
export default {
  nomes: ["bauvip","baúvip"],
  async executar(__x) {
    const { eVIP, vipDB, shizukiUser, salvarShizuki, pokeUser, salvarPokeUser, salvarVipDB, sender, isDono, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!eVIP(sender) && !isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas VIPs podem abrir o baú!' }, { quoted: msg });
              return
            }
            const db = vipDB();
            db.cooldownsBau = db.cooldownsBau || {};
            const ultimo = db.cooldownsBau[sender] || 0;
            const passou = Date.now() - ultimo;
            const SEMANA = 7 * 86400000;
            if (passou < SEMANA) {
              const resta = SEMANA - passou;
              const diasR = Math.floor(resta / 86400000);
              const horasR = Math.floor((resta % 86400000) / 3600000);
              await sock.sendMessage(from, { text: `⏳ Você já abriu o baú essa semana!\n\n💎 Volta em: *${diasR}d ${horasR}h*` }, { quoted: msg });
              return
            }

            const premios = [
              { tipo: 'reais', valor: 500, texto: '💵 *R$ 500,00*' },
              { tipo: 'pokecoins', valor: 100, texto: '🪙 *100 Pokécoins*' },
              { tipo: 'pokebola', valor: 'ultra', qtd: 1, texto: '🔵 *1 Ultra Ball*' },
              { tipo: 'pokebola', valor: 'master', qtd: 1, texto: '🟣 *1 Master Ball* (RARO!)', raro: true },
              { tipo: 'cosmetico', valor: 'berry', qtd: 5, texto: '🍖 *5 Berries*' }
            ];
            // 70% comum, 30% raro
            const rolagem = Math.random();
            let escolhido;
            if (rolagem < 0.7) {
              const comuns = premios.filter(p => !p.raro);
              escolhido = comuns[Math.floor(Math.random() * comuns.length)];
            } else {
              escolhido = premios.find(p => p.raro) || premios[0];
            }

            // Aplica o prêmio
            if (escolhido.tipo === 'reais') {
              const u = shizukiUser(sender);
              u.reais += escolhido.valor;
              salvarShizuki(sender, u);
            } else if (escolhido.tipo === 'pokecoins') {
              const u = pokeUser(sender);
              u.pokecoins += escolhido.valor;
              salvarPokeUser(sender, u);
            } else if (escolhido.tipo === 'pokebola') {
              const u = pokeUser(sender);
              u.pokebolas[escolhido.valor] = (u.pokebolas[escolhido.valor] || 0) + escolhido.qtd;
              salvarPokeUser(sender, u);
            } else if (escolhido.tipo === 'cosmetico') {
              const u = pokeUser(sender);
              u.cosmeticos[escolhido.valor] = (u.cosmeticos[escolhido.valor] || 0) + escolhido.qtd;
              salvarPokeUser(sender, u);
            }

            db.cooldownsBau[sender] = Date.now();
            salvarVipDB(db);

            await sock.sendMessage(from, {
              text: `╭━━━〔 🎁 𝐁𝐀𝐔́ 𝐕𝐈𝐏 🎁 〕━━━╮\n┃\n` +
                    `┃ ✨ Você abriu o baú!\n┃\n` +
                    `┃ 🎉 Prêmio: ${escolhido.texto}\n┃\n` +
                    `┃ ⏰ Volta em 7 dias!\n` +
                    `┃\n╰━━━━━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
