// Gerado de index.js (case 'pokemon', linha 6345)
export default {
  nomes: ["pokemon"],
  async executar(__x) {
    const { pokeUser, emojiRaridade, badgeVip, __isCriadorInfinito, sender, pushName, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = pokeUser(sender);
            const nomeUser = pushName || sender.split('@')[0];
            const time = u.time || [];

            let listaTime = '';
            if (time.length === 0) {
              listaTime = '┃  💭 _Nenhum pokémon ainda..._\n┃  💡 Use !capturar quando aparecer um!\n';
            } else {
              time.forEach((p, i) => {
                const felEmoji = p.felicidade >= 70 ? '😊' : p.felicidade >= 40 ? '😐' : '😢';
                listaTime += `┃  ${i + 1}️⃣ ${emojiRaridade(p.raridade)} *${p.nome}* (Nv.${p.nivel})\n`;
                listaTime += `┃     ❤️ ${p.hp}/${p.hpMax} · ⚔️ ${p.ataque} · 🛡️ ${p.defesa}\n`;
                listaTime += `┃     ${felEmoji} Felicidade: ${p.felicidade}/100\n`;
              });
            }

            const texto =
              `╭━━━━〔 🎒 𝐏𝐄𝐑𝐅𝐈𝐋 𝐏𝐎𝐊𝐄́𝐌𝐎𝐍 🎒 〕━━━━╮\n` +
              `┃\n` +
              `┃ 👤 Treinador: *${nomeUser}${(typeof badgeVip === 'function' && badgeVip(sender)) ? ' 💎 VIP' : ''}*\n` + // BADGE VIP
              `┃ 💰 Pokécoins: *${__isCriadorInfinito(sender) ? '∞' : u.pokecoins}*\n` +
              `┃ 🎯 Capturas: *${u.capturas}*\n` +
              `┃ 🏆 Vitórias: *${u.vitorias}*\n` +
              `┃ 💀 Derrotas: *${u.derrotas}*\n` +
              `┃\n` +
              `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
              `╭━━━〔 🐾 𝐒𝐄𝐔 𝐓𝐈𝐌𝐄 (${time.length}/4) 〕━━━╮\n` +
              listaTime +
              `╰━━━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
              `╭━━━〔 🎒 𝐈𝐓𝐄𝐍𝐒 〕━━━╮\n` +
              `┃\n` +
              `┃ 🔴 Pokébola: *${u.pokebolas.pokebola}*\n` +
              `┃ 🔵 Great Ball: *${u.pokebolas.great}*\n` +
              `┃ 🟡 Ultra Ball: *${u.pokebolas.ultra}*\n` +
              `┃ 🟣 Master Ball: *${u.pokebolas.master}*\n` +
              `┃\n` +
              `┃ 🍇 Berry: *${u.cosmeticos.berry}*\n` +
              `┃ 🍖 Pokéfood: *${u.cosmeticos.pokefood}*\n` +
              `┃ 🧪 Poção: *${u.cosmeticos.pocao}*\n` +
              `┃ 💊 Poção Máx: *${u.cosmeticos.pocaomax}*\n` +
              `┃\n` +
              `╰━━━━━━━━━━━━━━━━━━━━━━━━╯`;
            await sock.sendMessage(from, { text: texto, mentions: [sender] }, { quoted: msg });
          }
          return
    }
  }
};
