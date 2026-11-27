// Gerado de index.js (case 'menuvip', linha 7532)
export default {
  nomes: ["menuvip"],
  async executar(__x) {
    const { getPrefixo, fs, MENU_IMAGE_PATH, from, sender, sock, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const prefixoAtual = getPrefixo(from);
            const menuVip =
              '╭─────────────────────╮\n\n' +
              '🌷 Oii @' + sender.split('@')[0] + '! Eu sou a *Shizuki* 🌸\n' +
              '✨ Área exclusiva *VIP* liberada! (๑>ᴗ<๑)\n\n' +
              '╭─〔 💎 *MENU VIP* 〕━━━━⬣\n' +
              '┃\n' +
              '┃ 👑 *COMANDOS VIP*\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'vipinfo\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'bauvip\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'apelido <texto>\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'rmapelido\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'vipprotecao\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'figanime <qtd>\n' +
              '┃\n' +
              '┃ 🏴 *FACÇÕES*\n' +
              '┃ 🌷◗ ' + prefixoAtual + 'cla criar <nome>\n' +
              '┃ 🌷◗ ' + prefixoAtual + 'cla convidar @pessoa\n' +
              '┃ 🌷◗ ' + prefixoAtual + 'cla info\n' +
              '┃ 🌷◗ ' + prefixoAtual + 'cla membros\n' +
              '┃ 🌷◗ ' + prefixoAtual + 'cla sair\n' +
              '┃ 🌷◗ ' + prefixoAtual + 'cla depositar <valor>\n' +
              '┃ 🌷◗ ' + prefixoAtual + 'cla caixa\n' +
              '┃ 🌷◗ ' + prefixoAtual + 'cla guerra <id> <valor>\n' +
              '┃ 🌷◗ ' + prefixoAtual + 'cla ranking\n' +
              '┃ 🌷◗ ' + prefixoAtual + 'cla dissolver\n' +
              '┃\n' +
              '┃ ⚔️ *ARENA VIP*\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'arena @pessoa <valor>\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'atacar\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'defender\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'magia <nome>\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'lojaarena\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'comprararmadura <id>\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'desistir\n' +
              '┃\n' +
              '╰━━━━━━━━━━━━━━━━━━⬣\n' +
              '╰─────────────────────╯';

            if (fs.existsSync(MENU_IMAGE_PATH)) {
              try {
                await sock.sendMessage(from, { image: fs.readFileSync(MENU_IMAGE_PATH), caption: menuVip, mentions: [sender] }, { quoted: msg });
              } catch (e) {
                await sock.sendMessage(from, { text: menuVip, mentions: [sender] }, { quoted: msg });
              }
            } else {
              await sock.sendMessage(from, { text: menuVip, mentions: [sender] }, { quoted: msg });
            }
          }
          return
    }
  }
};
