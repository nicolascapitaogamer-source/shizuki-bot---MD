// Gerado de index.js (case 'menubrincadeiras', linha 9812)
export default {
  nomes: ["menubrincadeiras"],
  async executar(__x) {
    const { getPrefixo, fs, MENU_IMAGE_PATH, from, sender, sock, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const prefixoAtual = getPrefixo(from);
            const menuBrincadeiras =
              '╭─────────────────────╮\n\n' +
              '🌷 Oii @' + sender.split('@')[0] + '! Eu sou a *Shizuki* 🌸\n' +
              '✨ Bora se divertir um pouco? (๑>ᴗ<๑)\n\n' +
              '╭─〔 🎮 *MENU BRINCADEIRAS* 〕━━━━⬣\n' +
              '┃\n' +
              '┃ 💋 *AÇÕES*\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'beijo @pessoa\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'abraço @pessoa\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'comer @pessoa\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'gozar @pessoa\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'matar @pessoa\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'cafune @pessoa\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'colinho @pessoa\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'socar @pessoa\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'chutar @pessoa\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'esfaquear @pessoa\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'bater @pessoa\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'dancar @pessoa\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'cantar @pessoa\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'lamber @pessoa\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'morder @pessoa\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'acenar @pessoa\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'piscar @pessoa\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'cuspir @pessoa\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'empurrar @pessoa\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'pisar @pessoa\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'estrangular @pessoa\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'queimar @pessoa\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'envenenar @pessoa\n' +
              '┃ 🪻◗ ' + prefixoAtual + 'explodir @pessoa\n' +
              '┃\n' +
              '┃ 🎯 *JOGOS*\n' +
              '┃ 🌷◗ ' + prefixoAtual + 'quiz\n' +
              '┃ 🌷◗ ' + prefixoAtual + 'jogodavelha @pessoa\n' +
              '┃ 🌷◗ ' + prefixoAtual + 'forca @pessoa\n' +
              '┃ 🌷◗ ' + prefixoAtual + 'memoria @pessoa\n' +
              '┃ 🌷◗ ' + prefixoAtual + 'duelo @pessoa\n' +
              '┃\n' +
              '┃ 🏆 *RANKINGS*\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'ranklinda\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'ranklindo\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'rankbebado\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'rankfiel\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'rankputa\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'rankgay\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'rankcorno\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'rankotaku\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'rankpobre\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'rankrico\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'rankfeio\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'rankgostosa\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'rankgostoso\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'rankgado\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'rankpau\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'rankbct\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'rankburro\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'rankinteligente\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'rankchato\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'rankengracado\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'ranksortudo\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'rankazarado\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'ranklouco\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'ranksafado\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'rankromantico\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'rankmaluco\n' +
              '┃ 🍭◗ ' + prefixoAtual + 'rankchifrudo\n' +
              '┃\n' +
              '┃ 📊 *PORCENTAGENS*\n' +
              '┃ 🎀◗ ' + prefixoAtual + 'ship @pessoa\n' +
              '┃ 🎀◗ ' + prefixoAtual + 'corno @pessoa\n' +
              '┃ 🎀◗ ' + prefixoAtual + 'gay @pessoa\n' +
              '┃ 🎀◗ ' + prefixoAtual + 'gostosa @pessoa\n' +
              '┃ 🎀◗ ' + prefixoAtual + 'gostoso @pessoa\n' +
              '┃ 🎀◗ ' + prefixoAtual + 'feio @pessoa\n' +
              '┃ 🎀◗ ' + prefixoAtual + 'bonito @pessoa\n' +
              '┃ 🎀◗ ' + prefixoAtual + 'rico @pessoa\n' +
              '┃ 🎀◗ ' + prefixoAtual + 'pobre @pessoa\n' +
              '┃ 🎀◗ ' + prefixoAtual + 'gado @pessoa\n' +
              '┃ 🎀◗ ' + prefixoAtual + 'safado @pessoa\n' +
              '┃ 🎀◗ ' + prefixoAtual + 'chato @pessoa\n' +
              '┃ 🎀◗ ' + prefixoAtual + 'louco @pessoa\n' +
              '┃ 🎀◗ ' + prefixoAtual + 'sortudo @pessoa\n' +
              '┃ 🎀◗ ' + prefixoAtual + 'azarado @pessoa\n' +
              '┃ 🎀◗ ' + prefixoAtual + 'pau @pessoa\n' +
              '┃ 🎀◗ ' + prefixoAtual + 'bunda @pessoa\n' +
              '┃ 🎀◗ ' + prefixoAtual + 'chifre @pessoa\n' +
              '┃ 🎀◗ ' + prefixoAtual + 'inteligente @pessoa\n' +
              '┃ 🎀◗ ' + prefixoAtual + 'burro @pessoa\n' +
              '┃\n' +
              '╰━━━━━━━━━━━━━━━━━━⬣\n' +
              '╰─────────────────────╯';

            if (fs.existsSync(MENU_IMAGE_PATH)) {
              try {
                await sock.sendMessage(from, { image: fs.readFileSync(MENU_IMAGE_PATH), caption: menuBrincadeiras, mentions: [sender] }, { quoted: msg });
              } catch (e) {
                await sock.sendMessage(from, { text: menuBrincadeiras, mentions: [sender] }, { quoted: msg });
              }
            } else {
              await sock.sendMessage(from, { text: menuBrincadeiras, mentions: [sender] }, { quoted: msg });
            }
          }
          return
    }
  }
};
