// Gerado de index.js (case 'menubaixar', linha 11251)
export default {
  nomes: ["menubaixar"],
  async executar(__x) {
    const { getPrefixo, fs, MENU_IMAGE_PATH, from, sender, sock, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const prefixoAtual = getPrefixo(from);
            const menuBaixar =
              '╭─────────────────────╮\n\n' +
              '🌷 Oii @' + sender.split('@')[0] + '! Eu sou a *Shizuki* 🌸\n' +
              '✨ O que deseja baixar hoje? (๑>ᴗ<๑)\n\n' +
              '╭─〔 ⬇️ *MENU BAIXAR* 〕━━━━⬣\n' +
              '┃\n' +
              '┃ 🎵 *MÚSICA & VÍDEO*\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'play <nome>\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'playvideo <nome>\n' +
              '┃\n' +
              '┃ 📸 *REDES SOCIAIS*\n' +
              '┃ 🌷◗ ' + prefixoAtual + 'instagram <link>\n' +
              '┃ 🌷◗ ' + prefixoAtual + 'tiktok <link>\n' +
              '┃ 🌷◗ ' + prefixoAtual + 'pinterest <pesquisa>\n' +
              '┃\n' +
              '┃ 🎨 *FIGURINHAS & MÍDIA*\n' +
              '┃ 🍭◗ ' + prefixoAtual + 's (figurinha)\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'brat <texto>\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'toimg\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'take\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'figsom (marque um vídeo)\n' +
              '┃\n' +
              '╰━━━━━━━━━━━━━━━━━━⬣\n' +
              '╰─────────────────────╯';

            if (fs.existsSync(MENU_IMAGE_PATH)) {
              try {
                await sock.sendMessage(from, { image: fs.readFileSync(MENU_IMAGE_PATH), caption: menuBaixar, mentions: [sender] }, { quoted: msg });
              } catch (e) {
                await sock.sendMessage(from, { text: menuBaixar, mentions: [sender] }, { quoted: msg });
              }
            } else {
              await sock.sendMessage(from, { text: menuBaixar, mentions: [sender] }, { quoted: msg });
            }
          }
          return
    }
  }
};
